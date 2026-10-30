# Dixab website tasks

- [x] Fix directors’ preview cookie policy; verify local dashboard sign-in, reload and sign-out (member records still blocked on database key)
- [x] Obtain and install the provider-issued members database key as a project secret (MEMBERS_DB_SECRET_KEY saved; Cloudflare copy still pending)
- [x] Repair director sign-in and member registration/payment visibility
- [x] Add Airtel and MTN merchant payment methods
- [x] Organise the Discover heading typography
- [ ] User: add MEMBERS_DB_SECRET_KEY as SUPABASE_SECRET_KEY in Cloudflare (dixabtradings.com) and redeploy — blocked on the user
- [x] User: run the database setup — success confirmed; verified profiles, payments, earnings and payouts access; director dashboard loads and session persists
- [ ] Configure Muteesasira Abbey as the founding member — verified account exists and bootstrap email configured; provision_member rolled back on an existing admin-role conflict; user must run dixab-abbey-first-member.sql to resolve it transactionally
- [ ] End-to-end test: register member → submit payment reference → director approves → member sees chain/earnings (needs a verified founding member and valid sponsor code; do not approve fictitious payments on the live database)
- [x] Publish the latest fixes
- [x] Fix security findings: self-activation via profile edit (SQL policy) and public member-email lookup (server-side sign-in)

- [x] Provide a downloadable export of the website files
- [ ] Connect custom domain `dixab.com` (waiting for domain-owner DNS changes)
- [x] Explain external hosting and Lovable Cloud disconnection limitations
- [ ] Provide source and database setup export for self-managed migration
- [ ] Export live data through Cloud → Advanced settings → Export data (requires user action)
- [ ] Confirm GitHub code sync is live (needs repo URL from user to verify)
- [ ] Run security scan on the latest published code before broad sharing
