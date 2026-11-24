-- Run after company-entry-setup.sql. Preserves existing members and payment history.
BEGIN;
SELECT pg_advisory_xact_lock(704616964);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
REVOKE INSERT, UPDATE, DELETE ON public.payments FROM authenticated, anon;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "members read payment statement" ON public.payments;
CREATE POLICY "members read payment statement" ON public.payments FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.installment_payments_ready()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT true $$;
REVOKE ALL ON FUNCTION public.installment_payments_ready() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.installment_payments_ready() TO service_role;

CREATE OR REPLACE FUNCTION public.submit_member_installment(_user_id uuid, _amount integer, _reference text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _member profiles%ROWTYPE; _reserved bigint; _placeholder uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(704616964);
  SELECT * INTO _member FROM profiles WHERE id = _user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Member registration is incomplete'; END IF;
  IF _member.activated_at IS NOT NULL THEN RAISE EXCEPTION 'Your membership is already fully paid'; END IF;
  IF _amount IS NULL OR _amount <= 0 OR _amount > 100000 THEN RAISE EXCEPTION 'Enter a whole UGX amount between 1 and 100000'; END IF;
  IF nullif(trim(_reference), '') IS NULL THEN RAISE EXCEPTION 'A transaction reference is required'; END IF;
  IF EXISTS (SELECT 1 FROM payments WHERE lower(trim(reference)) = lower(trim(_reference))) THEN
    RAISE EXCEPTION 'This transaction reference has already been submitted';
  END IF;
  SELECT coalesce(sum(amount),0) INTO _reserved FROM payments WHERE user_id = _user_id
    AND (status = 'approved' OR (status = 'pending' AND nullif(trim(reference),'') IS NOT NULL));
  IF _reserved + _amount > 100000 THEN RAISE EXCEPTION 'Amount exceeds your remaining balance including payments awaiting approval'; END IF;
  SELECT id INTO _placeholder FROM payments WHERE user_id = _user_id AND status = 'pending' AND nullif(trim(reference),'') IS NULL LIMIT 1 FOR UPDATE;
  IF _placeholder IS NOT NULL THEN
    UPDATE payments SET amount = _amount, reference = trim(_reference) WHERE id = _placeholder;
  ELSE
    INSERT INTO payments(user_id,amount,status,reference) VALUES (_user_id,_amount,'pending',trim(_reference));
  END IF;
  UPDATE profiles SET status = 'pending' WHERE id = _user_id AND status = 'rejected';
END;
$$;
REVOKE ALL ON FUNCTION public.submit_member_installment(uuid,integer,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_member_installment(uuid,integer,text) TO service_role;

CREATE OR REPLACE FUNCTION public.director_reject_installment(_payment_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(704616964);
  UPDATE payments SET status = 'rejected' WHERE id = _payment_id AND status = 'pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment not found or already handled'; END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.director_reject_installment(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.director_reject_installment(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.director_approve_payment(_payment_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _payment payments%ROWTYPE; _member profiles%ROWTYPE; _ancestor uuid; _level integer := 1; _code text; _paid bigint;
BEGIN
  -- Serialize approvals and registration so two approvals cannot take slot three.
  PERFORM pg_advisory_xact_lock(704616964);
  SELECT * INTO _payment FROM payments WHERE id = _payment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment not found'; END IF;
  IF _payment.status <> 'pending' THEN RAISE EXCEPTION 'Only pending payments can be approved'; END IF;
  IF nullif(trim(_payment.reference), '') IS NULL THEN RAISE EXCEPTION 'A transaction reference is required before approval'; END IF;
  SELECT * INTO _member FROM profiles WHERE id = _payment.user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Member registration is incomplete'; END IF;
  -- Repeat payments never issue another code, consume another slot or credit earnings.
  IF _member.activated_at IS NOT NULL THEN
    UPDATE payments SET status = 'approved', approved_at = now() WHERE id = _payment_id;
    RETURN;
  END IF;
  IF _payment.amount IS NULL OR _payment.amount <= 0 THEN RAISE EXCEPTION 'Payment amount must be positive'; END IF;
  SELECT coalesce(sum(amount),0) INTO _paid FROM payments WHERE user_id = _member.id AND status = 'approved';
  IF _paid + _payment.amount > 100000 THEN RAISE EXCEPTION 'Payment would exceed the full membership amount'; END IF;
  -- Partial installments are recorded, but do not activate or consume referral slots.
  IF _paid + _payment.amount < 100000 THEN
    UPDATE payments SET status = 'approved', approved_at = now() WHERE id = _payment_id;
    RETURN;
  END IF;
  IF _member.company_entry_code IS NOT NULL THEN
    UPDATE company_entry_codes SET used_count = used_count + 1
    WHERE code = _member.company_entry_code AND used_count < 3;
    IF NOT FOUND THEN RAISE EXCEPTION 'Company entry code has reached its 3-approved-member limit; payment remains unapproved'; END IF;
  ELSIF _member.sponsor_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = _member.sponsor_id AND status = 'active' AND activated_at IS NOT NULL) THEN
      RAISE EXCEPTION 'Sponsor must be an approved active member';
    END IF;
    IF (SELECT count(*) FROM profiles WHERE sponsor_id = _member.sponsor_id AND activated_at IS NOT NULL) >= 3 THEN
      RAISE EXCEPTION 'This identifier code has reached its 3-approved-member limit; payment remains unapproved';
    END IF;
  ELSE
    RAISE EXCEPTION 'Member has no valid company entry or sponsor';
  END IF;
  _code := public.generate_referral_code();
  UPDATE profiles SET referral_code = _code, status = 'active', activated_at = now() WHERE id = _member.id;
  UPDATE payments SET status = 'approved', approved_at = now() WHERE id = _payment_id;
  _ancestor := _member.sponsor_id;
  WHILE _ancestor IS NOT NULL AND _level <= 5 LOOP
    INSERT INTO earnings(user_id, source_user_id, level, amount)
    SELECT _ancestor, _member.id, _level, 10000
    WHERE EXISTS(SELECT 1 FROM profiles WHERE id = _ancestor AND status = 'active');
    SELECT sponsor_id INTO _ancestor FROM profiles WHERE id = _ancestor;
    _level := _level + 1;
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.director_approve_payment(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.director_approve_payment(uuid) TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
