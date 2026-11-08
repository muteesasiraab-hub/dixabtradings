# Dixab website tasks

- [ ] User: run dixab-1-company-entry-setup.sql then dixab-2-reset-members.sql in the database SQL editor — resets all membership including Abbey and installs the company-owned three-entry code (files delivered; 5/5 tests pass)
- [x] Support company entry registration without founding-member privileges; test three-entry cap — 5/5 tests pass (cap, no admin privileges, idempotent retry, 3-direct-recruit cap, reset)
- [x] Apply transparent home background with subtle light effects; verify phone and desktop — verified via screenshots on both

- [x] Fix director session policy for live lovableproject.com editor iframe; four cookie tests pass; local dashboard access, reload and sign-out verified with member records
- [ ] Confirm director sign-in in the user's actual editor iframe — simulated secure proxy could not reproduce the hosting environment; awaiting user retry

- [x] Fix directors’ preview cookie policy; verify local dashboard sign-in, reload and sign-out (member records still blocked on database key)
- [x] Obtain and install the provider-issued members database key as a project secret (MEMBERS_DB_SECRET_KEY saved; Cloudflare copy still pending)
- [x] Repair director sign-in and member registration/payment visibility
- [x] Add Airtel and MTN merchant payment methods
- [x] Organise the Discover heading typography
- [ ] User: add MEMBERS_DB_SECRET_KEY as SUPABASE_SECRET_KEY in Cloudflare (dixabtradings.com) and redeploy — blocked on the user
- [x] User: run the database setup — success confirmed; verified profiles, payments, earnings and payouts access; director dashboard loads and session persists
- [x] Configure Muteesasira Abbey as the founding member — verified active profile, identifier DAEA7529 and admin role; confirmed the active member appears in the directors dashboard
- [ ] End-to-end test: register member → submit payment reference → director approves → member sees chain/earnings (awaiting a real member payment or isolated test database; do not approve fictitious payments on the live database)
- [x] Publish the latest fixes
- [x] Fix security findings: self-activation via profile edit (SQL policy) and public member-email lookup (server-side sign-in)

- [x] Provide a downloadable export of the website files
- [ ] Connect custom domain `dixab.com` (waiting for domain-owner DNS changes)
- [x] Explain external hosting and Lovable Cloud disconnection limitations
- [ ] Provide source and database setup export for self-managed migration
- [ ] Export live data through Cloud → Advanced settings → Export data (requires user action)
- [ ] Confirm GitHub code sync is live (needs repo URL from user to verify)
- [ ] Run security scan on the latest published code before broad sharing
- [x] Publish current site state to live website — verified dixabtradings.com serves latest: new WhatsApp number, company name, directors' portal, merchant codes on /register
- [ ] Automated mobile money: payments must settle directly to company MTN/Airtel mobile-money accounts, not a Flutterwave account; user confirms both providers approved. Blocked on redacted provider-issued production connection instructions and confirmation of settlement destination before secure credential collection; existing merchant payment methods retained. Flutterwave connection was cancelled before execution; its Uganda policy also prohibits multi-level marketing.
