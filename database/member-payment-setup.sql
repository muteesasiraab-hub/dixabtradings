-- Self-managed hosting: run once in the members database SQL editor.
BEGIN;
-- Trusted helper: reads a member's locked fields without triggering RLS
-- (policies must never subquery the table they protect — that loops forever).
CREATE OR REPLACE FUNCTION public.profile_lock(_id uuid)
RETURNS TABLE(status text, referral_code text, sponsor_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.status, p.referral_code, p.sponsor_id FROM public.profiles p WHERE p.id = _id
$$;
REVOKE ALL ON FUNCTION public.profile_lock(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_lock(uuid) FROM authenticated, anon;
GRANT EXECUTE ON FUNCTION public.profile_lock(uuid) TO service_role;
-- Members may view their direct recruits (sponsor_id = own id; no self-subquery).
DROP POLICY IF EXISTS "users view downline profiles" ON public.profiles;
CREATE POLICY "users view downline profiles" ON public.profiles FOR SELECT TO authenticated
  USING (sponsor_id = auth.uid());
-- Members may edit their own name/phone but never their status, sponsor or
-- identifier code — only payment approval (service role) may activate them.
DROP POLICY IF EXISTS "users update own profile" ON public.profiles;
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND status = (SELECT l.status FROM public.profile_lock(auth.uid()) l)
    AND referral_code = (SELECT l.referral_code FROM public.profile_lock(auth.uid()) l)
    AND sponsor_id IS NOT DISTINCT FROM (SELECT l.sponsor_id FROM public.profile_lock(auth.uid()) l)
  );
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles, public.profiles, public.payments, public.earnings TO service_role;
GRANT SELECT ON public.profiles, public.payments, public.earnings TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
COMMIT;

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
DECLARE _payment payments%ROWTYPE; _member profiles%ROWTYPE; _ancestor uuid; _level integer := 1; _code text;
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

BEGIN;
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