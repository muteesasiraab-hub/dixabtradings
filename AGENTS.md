# Architecture rules

- Keep mobile-money merchant details in the shared payment-methods module so registration and member payment views stay consistent.
- Use encrypted, HTTP-only director sessions verified on the server for every company-wide read and action; never expose director secrets to the browser.
- Use secure partitioned SameSite=None director cookies on both static id-preview Lovable hosts and live lovableproject.com editor hosts, and SameSite=Lax elsewhere, so iframe sign-in persists without relaxing production cookies; on those preview hosts only, also accept a short-lived HMAC-signed header token kept in sessionStorage, because some mobile browsers block all iframe cookies.
- Provision member profiles and approve payment activation through transactional database functions to keep registration, referral limits and earnings consistent.
- Self-managed hosting requires server-only database credentials and application migrations; never expose privileged keys through VITE variables.