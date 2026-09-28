# Deployment checklist

Backend preparation only. Frontend integration and client launch approval remain
outstanding. The development loop never applies migrations or seeds to production.

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
