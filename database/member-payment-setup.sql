-- Self-managed hosting: run once in the members database SQL editor.
BEGIN;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles, public.profiles, public.payments, public.earnings TO service_role;
GRANT SELECT ON public.profiles, public.payments, public.earnings TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.provision_member(
  _user_id uuid, _full_name text, _phone text, _email text,
  _referral_code text, _founder boolean DEFAULT false
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _sponsor uuid; _code text;
BEGIN
  PERFORM pg_advisory_xact_lock(704616964);
  SELECT referral_code INTO _code FROM profiles WHERE id = _user_id;
  IF FOUND THEN RETURN _code; END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _user_id AND lower(email) = lower(_email)) THEN
    RAISE EXCEPTION 'Account does not match registration';
  END IF;
  IF NOT _founder THEN
    SELECT id INTO _sponsor FROM profiles WHERE referral_code = upper(trim(_referral_code));
    IF NOT FOUND THEN RAISE EXCEPTION 'Valid identifier code is required'; END IF;
    IF (SELECT count(*) FROM profiles WHERE sponsor_id = _sponsor) >= 3 THEN
      RAISE EXCEPTION 'This identifier code has reached its 3-person limit';
    END IF;
  ELSIF EXISTS (SELECT 1 FROM profiles) THEN
    RAISE EXCEPTION 'Founding account already exists';
  END IF;
  _code := public.generate_referral_code();
  INSERT INTO profiles(id, full_name, phone, email, sponsor_id, referral_code, status, activated_at)
  VALUES (_user_id, trim(_full_name), trim(_phone), lower(_email), _sponsor, _code,
    CASE WHEN _founder THEN 'active' ELSE 'pending' END,
    CASE WHEN _founder THEN now() ELSE NULL END);
  IF _founder THEN INSERT INTO user_roles(user_id, role) VALUES (_user_id, 'admin');
  ELSE INSERT INTO payments(user_id, amount, status) VALUES (_user_id, 100000, 'pending'); END IF;
  RETURN _code;
END;
$$;
REVOKE ALL ON FUNCTION public.provision_member(uuid,text,text,text,text,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.provision_member(uuid,text,text,text,text,boolean) TO service_role;

CREATE OR REPLACE FUNCTION public.director_approve_payment(_payment_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _payment payments%ROWTYPE; _member profiles%ROWTYPE; _ancestor uuid; _level integer := 1;
BEGIN
  SELECT * INTO _payment FROM payments WHERE id = _payment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment not found'; END IF;
  IF _payment.status <> 'pending' THEN RAISE EXCEPTION 'Only pending payments can be approved'; END IF;
  IF nullif(trim(_payment.reference), '') IS NULL THEN RAISE EXCEPTION 'A transaction reference is required before approval'; END IF;
  SELECT * INTO _member FROM profiles WHERE id = _payment.user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Member registration is incomplete'; END IF;
  UPDATE payments SET status = 'approved', approved_at = now() WHERE id = _payment_id;
  IF _member.status = 'active' THEN RETURN; END IF;
  UPDATE profiles SET status = 'active', activated_at = now() WHERE id = _member.id;
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
CREATE OR REPLACE FUNCTION public.approve_payment(_payment_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Only admins can approve payments'; END IF;
  PERFORM public.director_approve_payment(_payment_id);
END;
$$;
REVOKE ALL ON FUNCTION public.approve_payment(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_payment(uuid) TO authenticated;
COMMIT;