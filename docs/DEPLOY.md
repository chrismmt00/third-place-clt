# Deployment checklist

Backend preparation only. Frontend integration and client launch approval remain
outstanding. The development loop never applies migrations or seeds to production.

## Local development and test database

- [ ] Use Node 24 LTS; verify `node --version`. Local machine Node 25 is outside
  Vitest 5's supported range. The Codex bundled executable is available at
  `C:\Users\Chris\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`.
- [ ] `npm ci` (postinstall generates Prisma's JavaScript client).
- [ ] Copy `.env.example` to `.env`; fill values locally, never commit secrets.
  `AUTH_SECRET` can be generated with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"` in your own terminal.
- [ ] Set DATABASE_URL to an identified development Neon branch, never production.
  For remote mutations also set NONPRODUCTION_DATABASE_HOST and
  PRODUCTION_DATABASE_HOST. Pooled and direct Neon endpoints normalize for checks.
- [ ] `npm run db:validate` then `npm run db:generate`.
- [ ] `npm run db:migrate` (guarded migration deploy, nonproduction only).
- [ ] Set SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD privately, then `npm run db:seed`.
  Run twice to confirm idempotency; existing users/passwords/settings are preserved.
- [ ] `npm run verify` and `npm run build`.

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
