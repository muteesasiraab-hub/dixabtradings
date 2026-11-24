-- Install this update in the members database SQL editor. Does not delete accounts.
BEGIN;
SELECT pg_advisory_xact_lock(704616964);
CREATE TABLE IF NOT EXISTS public.company_entry_codes (
  code text PRIMARY KEY CHECK (code = upper(trim(code))),
  used_count integer NOT NULL DEFAULT 0 CHECK (used_count BETWEEN 0 AND 3)
);
GRANT ALL ON public.company_entry_codes TO service_role;
REVOKE ALL ON public.company_entry_codes FROM anon, authenticated;
ALTER TABLE public.company_entry_codes ENABLE ROW LEVEL SECURITY;
INSERT INTO public.company_entry_codes(code) VALUES ('DIXAB-ENTRY') ON CONFLICT DO NOTHING;

-- Convert old pending company registrations without losing already-used slots.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'company_entry_code') THEN
    ALTER TABLE public.profiles ADD COLUMN company_entry_code text REFERENCES public.company_entry_codes(code);
    UPDATE public.profiles SET company_entry_code = 'DIXAB-ENTRY' WHERE sponsor_id IS NULL;
    UPDATE public.company_entry_codes SET used_count = greatest(0, used_count - (
      SELECT count(*)::integer FROM public.profiles
      WHERE company_entry_code = 'DIXAB-ENTRY' AND status <> 'active' AND activated_at IS NULL
    )) WHERE code = 'DIXAB-ENTRY';
  END IF;
END $$;
ALTER TABLE public.profiles ALTER COLUMN referral_code DROP NOT NULL;
UPDATE public.profiles SET referral_code = NULL WHERE status <> 'active' AND activated_at IS NULL;
-- Members cannot change activation, identifiers or the company entry association.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE(full_name, phone) ON public.profiles TO authenticated;
DROP POLICY IF EXISTS "users update own profile" ON public.profiles;
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.provision_member(
  _user_id uuid, _full_name text, _phone text, _email text,
  _referral_code text, _founder boolean DEFAULT false
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _sponsor uuid; _entry text := upper(trim(_referral_code)); _company text; _existing profiles%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(704616964);
  IF _founder THEN RAISE EXCEPTION 'Founding member registration is disabled'; END IF;
  SELECT * INTO _existing FROM profiles WHERE id = _user_id;
  IF FOUND THEN RETURN CASE WHEN _existing.status = 'active' THEN _existing.referral_code ELSE NULL END; END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _user_id AND lower(email) = lower(_email)) THEN
    RAISE EXCEPTION 'Account does not match registration';
  END IF;
  IF EXISTS (SELECT 1 FROM company_entry_codes WHERE code = _entry) THEN
    _company := _entry;
    IF EXISTS (SELECT 1 FROM company_entry_codes WHERE code = _entry AND used_count >= 3) THEN
      RAISE EXCEPTION 'Company entry code has reached its 3-approved-member limit';
    END IF;
  ELSE
    SELECT id INTO _sponsor FROM profiles WHERE referral_code = _entry AND status = 'active' AND activated_at IS NOT NULL;
    IF NOT FOUND THEN RAISE EXCEPTION 'Valid company entry or approved member identifier code is required'; END IF;
    IF (SELECT count(*) FROM profiles WHERE sponsor_id = _sponsor AND activated_at IS NOT NULL) >= 3 THEN
      RAISE EXCEPTION 'This identifier code has reached its 3-approved-member limit';
    END IF;
  END IF;
  INSERT INTO profiles(id, full_name, phone, email, sponsor_id, company_entry_code, referral_code, status)
  VALUES (_user_id, trim(_full_name), trim(_phone), lower(_email), _sponsor, _company, NULL, 'pending');
  INSERT INTO payments(user_id, amount, status) VALUES (_user_id, 100000, 'pending');
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.provision_member(uuid,text,text,text,text,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.provision_member(uuid,text,text,text,text,boolean) TO service_role;

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
