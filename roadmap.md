# Dixab website tasks

- [ ] Fix directors’ preview session persistence and verify dashboard sign-in
- [ ] Obtain and install the provider-issued members database key (cannot generate a substitute; requires database owner access)
- [x] Repair director sign-in and member registration/payment visibility
- [x] Add Airtel and MTN merchant payment methods
- [x] Organise the Discover heading typography
- [ ] User: add MEMBERS_DB_SECRET_KEY (private members-database key) as a project secret and in Cloudflare — blocked on the user
- [ ] User: run database/member-payment-setup.sql in the members database SQL editor — blocked on the user
- [ ] End-to-end test: register member → submit payment reference → director approves → member sees chain/earnings (needs the two items above)
- [x] Publish the latest fixes
- [x] Fix security findings: self-activation via profile edit (SQL policy) and public member-email lookup (server-side sign-in)

- [x] Provide a downloadable export of the website files
- [ ] Connect custom domain `dixab.com` (waiting for domain-owner DNS changes)
- [x] Explain external hosting and Lovable Cloud disconnection limitations
- [ ] Provide source and database setup export for self-managed migration
- [ ] Export live data through Cloud → Advanced settings → Export data (requires user action)
- [ ] Confirm GitHub code sync is live (needs repo URL from user to verify)
- [ ] Run security scan on the latest published code before broad sharing
