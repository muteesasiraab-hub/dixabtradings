-- DESTRUCTIVE: removes all member accounts and their financial records.
-- Run company-entry-setup.sql first. Director name/password access is independent.
BEGIN;
SELECT pg_advisory_xact_lock(704616964);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.company_entry_codes WHERE code = 'DIXAB-ENTRY') THEN
    RAISE EXCEPTION 'Install the company entry setup first';
  END IF;
END $$;
CREATE TEMP TABLE reset_member_ids ON COMMIT DROP AS
  SELECT id FROM public.profiles
  UNION SELECT id FROM auth.users WHERE raw_user_meta_data ? 'dixab_registration';
DELETE FROM public.payouts;
DELETE FROM public.earnings;
DELETE FROM public.payments;
DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM reset_member_ids);
DELETE FROM public.profiles;
-- Remove matching login accounts as well so old signup metadata cannot restore members.
DELETE FROM auth.users WHERE id IN (SELECT id FROM reset_member_ids);
UPDATE public.company_entry_codes SET used_count = 0 WHERE code = 'DIXAB-ENTRY';
COMMIT;
SELECT code AS company_entry_code, used_count, 3 - used_count AS entries_remaining
FROM public.company_entry_codes WHERE code = 'DIXAB-ENTRY';