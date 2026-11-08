-- DESTRUCTIVE: removes all member accounts and their financial records.
-- Run dixab-1-company-entry-setup.sql first. Director name/password access is independent.
-- Every step stands on its own, so it is safe to run again after a partial attempt.

-- Safety check: the company entry setup must be installed first.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.company_entry_codes WHERE code = 'DIXAB-ENTRY') THEN
    RAISE EXCEPTION 'Install the company entry setup first';
  END IF;
END $$;

-- Collect member ids in a normal table so it survives statement-by-statement execution.
CREATE TABLE IF NOT EXISTS public._reset_member_ids (id uuid PRIMARY KEY);
TRUNCATE public._reset_member_ids;
INSERT INTO public._reset_member_ids(id)
  SELECT id FROM public.profiles
  UNION SELECT id FROM auth.users WHERE raw_user_meta_data ? 'dixab_registration';

DELETE FROM public.payouts;
DELETE FROM public.earnings;
DELETE FROM public.payments;
DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM public._reset_member_ids);
DELETE FROM public.profiles;
-- Remove matching login accounts as well so old signup metadata cannot restore members.
DELETE FROM auth.users WHERE id IN (SELECT id FROM public._reset_member_ids);
DROP TABLE public._reset_member_ids;

UPDATE public.company_entry_codes SET used_count = 0 WHERE code = 'DIXAB-ENTRY';

SELECT code AS company_entry_code, used_count, 3 - used_count AS entries_remaining
FROM public.company_entry_codes WHERE code = 'DIXAB-ENTRY';
