# Architecture rules

- Keep mobile-money merchant details in the shared payment-methods module so registration and member payment views stay consistent.
- Use encrypted, HTTP-only director sessions verified on the server for every company-wide read and action; never expose director secrets to the browser.
- Provision member profiles and approve payment activation through transactional database functions to keep registration, referral limits and earnings consistent.
- Self-managed hosting requires server-only database credentials and application migrations; never expose privileged keys through VITE variables.