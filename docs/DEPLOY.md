# Deployment checklist

Production release preparation. The admin/public interface now exists locally;
live launch verification and client configuration remain outstanding. Development
migration/seed commands still reject production. An explicit release approval is
required before the production migration and initial owner provisioning.

## September 30 readiness checkpoint

- Local validation, lint, 47 tests (including local owner provisioning and RSVP
  concurrency), client secret boundaries and production build pass.
- Account supports changing the login name/email after the mandatory initial
  password change, with current-password confirmation and session revocation.
- Existing Cloudflare credentials verified. Created only missing variants:
  card 960×600 cover, hero 1600×1200 scale-down, og 1200×630 cover, thumb 320×200
  cover. EXIF metadata is stripped; variants do not bypass signed-image access.
- Live direct image upload, ownership metadata, all four delivery variants and
  owned test-image deletion passed. No real client images were altered.
- Read-only production Neon inspection found 0/6 application tables. Reviewed
  initial migration creates four enums, six tables, indexes and the RSVP foreign
  key; it does not drop/reset data. No production writes have been performed.
- Temporary owner credentials are in ignored `.env.owner` (not active in
  production). The temporary email is a reserved `.invalid` login identifier,
  not a mailbox or public contact address. Share the password privately only
  after provisioning and deployment. The client replaces both credentials.
- Still needed: explicit production-write approval, hosting target/domain, real
  Turnstile widget keys for that domain, contact/chat details,
  privacy retention/provider review, and live browser/host-header verification.
- Home/About photography now uses free Pexels stock at the user's request; client
  photos are optional replacements. Attribution and license records are in
  IMAGE_SOURCES.md. These photos do not depict actual Third Place events.
- Automatic approval review blocked starting the temporary local HTTP server
  with only "blocked by policy" detail. Browser login/reset flows are unverified;
  direct action/auth and local database tests pass.

### Release environment check

Run `npm run production:check` in the host's configured environment before build
and deployment. For a private complete release file, use
`npm run production:check -- --env-file=.env.release`.
This offline check does not load `.env.local`, access the database, or print secret
values. It rejects missing settings, local/non-HTTPS origins, mismatched origins,
test Turnstile keys, a database host mismatch, missing database TLS, and test/seed
credentials left in the production runtime. It does not replace live verification.
The current `.env` intentionally fails because it still has local origins, dummy
Turnstile keys and the development seed password. Do not deploy it wholesale.

### First production owner (only after explicit release approval)

1. Supply the deployment domain, configure live secrets and review the migration.
2. Apply the reviewed migration through the approved release process below.
3. Run `npm run owner:provision -- --target=production --env-file=.env.release --credentials-file=.env.owner --confirm-host=CONFIRMED_PRODUCTION_HOST`.
   Use the actual hostname from the private production configuration. The command
   requires matching explicit/declared hosts and database TLS. It reads only the
   named files, so local development overrides cannot change its target.
4. This creates the first OWNER and missing settings singleton with the confirmed
   Instagram link. It never overwrites existing settings, resets a password,
   promotes another account, or adds a second owner. A matching still-temporary
   account makes a retry a no-op. Existing owners must use the Users page.
5. Privately hand over the `/admin/login` URL and generated credentials; complete
   the password and email changes described in ADMIN_GUIDE.md. Remove the local
   temporary credential file after the handoff and initial credential replacement.

Development migration/seed guards remain unchanged; this explicit release-only
provisioning procedure is separate. No automatic emails are sent.

## Local development and test database

- [ ] Use Node 24 LTS; verify `node --version`. Local machine Node 25 is outside
  Vitest 5's supported range. The Codex bundled executable is available at
  `C:\Users\Chris\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`.
- [ ] `npm ci` (postinstall generates Prisma's JavaScript client).
- [ ] On a new checkout, copy `.env.example` to `.env`; fill values locally, never commit secrets. Preserve existing configured credentials.
  `AUTH_SECRET` can be generated with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"` in your own terminal.
- [ ] Set DATABASE_URL in ignored `.env.local` to local PostgreSQL or an identified development Neon branch, never production. Set TEST_DATABASE_URL to a separate test database.
  For remote mutations also set NONPRODUCTION_DATABASE_HOST and
  PRODUCTION_DATABASE_HOST. Pooled and direct Neon endpoints normalize for checks.
- [ ] Tooling loads shell values first, then `.env.local`, then `.env`. Prisma,
  seed and Vitest share this order. Vitest deliberately reads `.env.local` even
  in test mode; only TEST_DATABASE_URL enables integration tests. Set an empty
  shell TEST_DATABASE_URL for unit-only checks. Never deploy `.env.local`.
- [ ] `npm run db:validate` then `npm run db:generate`.
- [ ] `npm run db:migrate` (guarded migration deploy, nonproduction only).
- [ ] Set SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD privately, then `npm run db:seed`.
  Run twice to confirm idempotency; existing users/passwords/settings are preserved.
- [ ] `npm run verify` and `npm run build`.

Current local setup (2026-09-28): PostgreSQL on localhost:5432 has separate
third_place_clt_dev and third_place_clt_test databases. The ignored `.env.local`
selects them, overriding the production Neon URL retained in `.env`. The local
fixture OWNER is owner@third-place-clt.test; its initial password uses the existing
private SEED_ADMIN_PASSWORD and must be changed on first login. Production owner
details remain a release input. Do not seed the integration database with real
attendees or client accounts.

Disposable local PostgreSQL example (PowerShell; Docker must be running):

```powershell
docker run --rm -d --name third-place-clt-test -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_DB=third_place_test -p 127.0.0.1::5432 postgres:17-alpine
$testPort = (docker port third-place-clt-test 5432/tcp).Split(':')[-1]
$env:DATABASE_URL = 'postgresql://postgres@127.0.0.1:' + $testPort + '/third_place_test'
$env:TEST_DATABASE_URL = $env:DATABASE_URL
npm run db:migrate
npm run verify
docker stop third-place-clt-test
Remove-Item Env:TEST_DATABASE_URL
Remove-Item Env:DATABASE_URL
```

Trust authentication is only for this disposable loopback-bound container, never
a remote database. Tests delete only their generated event; they do not reset or
seed arbitrary databases. TEST_DATABASE_URL never falls back to DATABASE_URL.

## Third-party configuration

- [ ] Cloudflare Images account ID/token and public account hash configured.
- [ ] Create card/hero/og/thumb image variants in Cloudflare.
- [ ] Verify real direct upload, attach, replace and delete; review orphan cleanup.
- [ ] Create Turnstile widget for the actual domains. Replace both test keys.
  Server checks hostname and action; production rejects documented dummy secrets.
- [ ] Set AUTH_URL and NEXT_PUBLIC_SITE_URL to the canonical HTTPS origin.
- [ ] Configure the hosting proxy to overwrite x-forwarded-for; verify rate limits
  cannot be bypassed with a caller-supplied header.

## Production release (Christian-operated, outside this development loop)

- [ ] Agree hosting environment/domain and finish frontend integration.
- [ ] Confirm deposit/final-balance and launch requirements with the client.
- [ ] Review client content, privacy retention/collection choices and brand.
- [ ] Provision database access, backups and a rollback plan. Review migration SQL.
- [ ] Configure production secrets in the host's secret store. Do not copy local
  test credentials, sample data, or prototype admin accounts.
- [ ] In the separately approved release job, run `npm ci`, `npx prisma generate`,
  then `npx prisma migrate deploy` against the explicitly reviewed release target.
  The local `db:migrate` guard intentionally refuses production; do not disable it.
- [ ] Provision the first OWNER through a reviewed one-time secure procedure.
  The included dev seed deliberately refuses production. Never publish an initial
  password in deployment logs; require password change on first login.
- [ ] `npm run build`, then host with `npm run start` or the agreed Next.js host.
- [ ] Configure DNS/TLS and verify real login/reset/roles, events, RSVP capacity,
  contact persistence, CSV, settings, image operations, metadata and headers.
- [ ] Complete the full SCOPE.md checklist and responsive/accessibility review.
- [ ] Handoff secure account access and ADMIN_GUIDE.md; record launch date and
  the agreement's 14-day bug-support window.

No deployment target was supplied, so no deployment was performed.
