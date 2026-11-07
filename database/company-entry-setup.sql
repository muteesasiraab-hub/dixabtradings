-- Run in the members database SQL editor before resetting membership.
BEGIN;
CREATE TABLE IF NOT EXISTS public.company_entry_codes (
  code text PRIMARY KEY CHECK (code = upper(trim(code))),
  used_count integer NOT NULL DEFAULT 0 CHECK (used_count BETWEEN 0 AND 3)
);
GRANT ALL ON public.company_entry_codes TO service_role;
REVOKE ALL ON public.company_entry_codes FROM anon, authenticated;
ALTER TABLE public.company_entry_codes ENABLE ROW LEVEL SECURITY;
INSERT INTO public.company_entry_codes(code) VALUES ('DIXAB-ENTRY') ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.provision_member(
  _user_id uuid, _full_name text, _phone text, _email text,
  _referral_code text, _founder boolean DEFAULT false
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _sponsor uuid; _code text; _entry text := upper(trim(_referral_code));
BEGIN
  PERFORM pg_advisory_xact_lock(704616964);
  IF _founder THEN RAISE EXCEPTION 'Founding member registration is disabled'; END IF;
  SELECT referral_code INTO _code FROM profiles WHERE id = _user_id;
  IF FOUND THEN RETURN _code; END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _user_id AND lower(email) = lower(_email)) THEN
    RAISE EXCEPTION 'Account does not match registration';
  END IF;
  IF EXISTS (SELECT 1 FROM company_entry_codes WHERE code = _entry) THEN
    UPDATE company_entry_codes SET used_count = used_count + 1 WHERE code = _entry AND used_count < 3;
    IF NOT FOUND THEN RAISE EXCEPTION 'Company entry code has reached its 3-member limit'; END IF;
  ELSE
    SELECT id INTO _sponsor FROM profiles WHERE referral_code = _entry;
    IF NOT FOUND THEN RAISE EXCEPTION 'Valid company entry or identifier code is required'; END IF;
    IF (SELECT count(*) FROM profiles WHERE sponsor_id = _sponsor) >= 3 THEN
      RAISE EXCEPTION 'This identifier code has reached its 3-person limit';
    END IF;
  END IF;
  _code := public.generate_referral_code();
  INSERT INTO profiles(id, full_name, phone, email, sponsor_id, referral_code, status)
  VALUES (_user_id, trim(_full_name), trim(_phone), lower(_email), _sponsor, _code, 'pending');
  INSERT INTO payments(user_id, amount, status) VALUES (_user_id, 100000, 'pending');
  RETURN _code;
END;
$$;
REVOKE ALL ON FUNCTION public.provision_member(uuid,text,text,text,text,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.provision_member(uuid,text,text,text,text,boolean) TO service_role;
COMMIT;