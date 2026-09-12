# ABBDIX

Website name is "Dickson×Abbey Netflow"

A sales and marketing mobile website  that sales a flash disk as the product.

The network should be up to 5 refferal levels. 

The website should generate an automatic refferal code that allows a person to reffer only 3 persons in their network 

The website should also generate a registration form which is verified the refferal code given 

Make the registration code printable 

Each client reffered should have a portal to view their network and earnings 

It should be in Ugandan currency

Entry charge is uganda shillings 50,000/= and a client earns uganda Shillings 5000/=

This project was built with [Lovable](https://lovable.dev).

**Lovable preview**: https://dixabtradings.lovable.app

**Target domain**: https://dixabtradings.com

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d22d1951-0134-458a-918a-91bcc7a64710).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Supabase and Cloudflare deployment

The browser build uses the `VITE_SUPABASE_*` values in the tracked `.env` file.
Those values identify Supabase project `nikcyaskiywylvoglxbf` and contain only
its public `sb_publishable_` key. The server reads the same URL and publishable
key from Cloudflare runtime variables in `cloudflare/workers/wrangler.jsonc`
(Workers) or the root `wrangler.jsonc` (Pages). Never put a Supabase secret or legacy
service-role key in `.env`, a `VITE_*` variable, or either Wrangler config.

Member login, registration completion, dashboards, and payment functions also
need a server-only `SUPABASE_SECRET_KEY` binding. Create a Supabase secret key for
this project, then add it as an encrypted secret to the chosen Cloudflare Worker
or Pages project before using those flows. `SUPABASE_SERVICE_ROLE_KEY` is
accepted as a legacy fallback. For local Cloudflare previews, put the secret in
an ignored `.dev.vars` file; the Pages preview script reads it too. Do not
commit it. A public key alone cannot run the server-side member and payment
functions.

If the new project's `profiles` table is empty, set the server-only
`DIXAB_BOOTSTRAP_ADMIN_EMAIL` binding to the intended founder's email before
opening registration. The founding account must confirm that email. This stops
an arbitrary first signup from receiving the admin role. After the founding
profile exists, later registrations use referral codes and do not need this
bootstrap setting.

The app supports either Cloudflare hosting product:

| Target | Build and deploy | Local preview |
| --- | --- | --- |
| Workers | `npm run deploy:worker` | `npm run build:worker` then `npm run preview` |
| Pages with Functions advanced mode | `npm run deploy:pages` | `npm run build:pages` then `npm run preview:pages` |

`npm run build:pages` bundles the TanStack/Nitro server into
`.output/public/_worker.js`; uploading only the static files without this build
would break server functions. Create a Pages project named `dixabtradings` before
using `deploy:pages`. The root `wrangler.jsonc` is a Pages config so Git builds
pick it up before and after building. Cloudflare Pages injects `CF_PAGES=1`,
so even an existing `npm run build` setting now selects the Pages build. Set the
output directory to `.output/public` in the Pages dashboard (the root config
also declares this path). The root config sets compatibility date `2026-09-12`,
`nodejs_compat`, and the three public `SUPABASE_*` runtime variables. Add the
encrypted `SUPABASE_SECRET_KEY` in Pages settings. The Pages CLI script stages
the same config outside the Worker build directory. The Pages build ignores
Lovable sandbox preset variables, uses the Pages config for browser Supabase
values even if old `VITE_*` dashboard variables remain, and does not emit a
Worker deploy redirect.

Workers uses the custom domain `dixabtradings.com` from
`cloudflare/workers/wrangler.jsonc`.
Cloudflare must manage that domain in the deploying account. If using Pages,
attach `dixabtradings.com` to the Pages project instead; a domain can point to
only one deployment target at a time. In Supabase Auth URL Configuration, set
the Site URL to `https://dixabtradings.com` and allow
`https://dixabtradings.com/dashboard` as a redirect URL. Add any preview or
local development URLs there separately. The new Supabase project's email
confirmation is enabled, so signups confirm their email before the app creates
their member profile.
