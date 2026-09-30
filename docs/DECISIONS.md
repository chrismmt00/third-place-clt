# Decisions

## 2026-09-25: Reconstructed specification

The user identified the agreement PDF when asked for the missing SCOPE.md. Reconstructed SCOPE.md from that source and the pasted implementation request. Model fields, folder structure, login thresholds and checklist are proposed technical defaults, not recovered original text. Explicit conservative defaults: attendee visibility off, optional phone off, zero guests; cancelled events remain public; DST ambiguity requires a choice. sessionVersion and persisted publicName are added for revocation and privacy. Confirm defaults before launch.

## Existing scaffold and Git boundary

Retain src/ and its existing alias; Next.js 16.3.6 is the registry stable version. JSX files use .jsx. Parent repository is C:/Projects; commits must use explicit third-place-clt paths. No deployment or production database operations are authorized by this loop.

## Backend ownership and tooling

Christian confirmed frontend work is concurrent; backend task leaves page wiring and UI to that task, exposing documented service/action interfaces. Use bundled Node 24 LTS (Vitest 5 excludes local Node 25). Prisma 7.10 uses prisma.config.mjs, prisma-client-js to keep generated sources outside the project, and adapter-pg for standard PostgreSQL TCP connections including Neon and disposable local Postgres. Generated dependency typings do not constitute project TypeScript source.

## Gate status

Initial scaffold lint/build passed. Next build prints a generic Running TypeScript step but project contains no TypeScript sources. Client-boundary scan follows local imports and stops at use-server RPC boundaries. Initial dependency audit flagged Prisma CLI transitive deepmerge-ts/mysql2 advisories; resolved by the verified overrides documented below.

## Concurrent frontend database mock

Frontend process repeatedly replaced src/lib/db.js after the backend commit. The real server-only Prisma singleton now lives in src/lib/prisma-db.js, and all backend imports point there. Preserve frontend work; replace its mock imports during later page integration. The in-memory mock must not be deployed as production persistence/authentication. This is a deliberate path deviation to avoid overwriting concurrent work.

## Verified implementation choices

- Temporal polyfill handles Eastern DST; ambiguous local times require earlier/later.
- Fixed-window Postgres rate limits use HMAC-SHA256 IP keys; no raw IP is persisted. Trust requires the host to overwrite forwarded IP headers.
- Passwords are 12+ characters and at most 72 UTF-8 bytes (bcrypt limit), cost 12; sessions last eight hours and sessionVersion revokes old sessions.
- Event capacities are positive or unlimited; guests capped at 20 per RSVP as an input bound. Cancellation retains duplicate-email reservation.
- Image application metadata verifies site ownership before attachment/deletion. Image IDs are unique per event; duplicates start without an image to avoid shared-image deletion. Missing image credentials produce an explicit development-only unavailable stub.
- Message opening uses a POST action to mark READ; GET/prefetch remains read-only.
- Static CSP permits inline Next hydration scripts/styles; no unsafe-eval in production. A nonce CSP would require coordinated dynamic frontend rendering.
- Prisma CLI transitive deepmerge-ts/mysql2 overridden to patched 8.0.2/3.24.4 compatible versions. Prisma validate/generate/migrate/seed and all tests passed after the override; npm audit reports zero vulnerabilities.
- Disposable local PostgreSQL 17 verified migrations, seed idempotency and concurrency. This does not represent a configured Neon branch or deployment.
- Automatic approval review rejected temporary HTTP server launch (blocked by policy); build and direct route tests passed, live HTTP checks remain unverified.

## 2026-09-27: Reuse existing Cloudflare credential names

Existing local credentials use CLOUDFLARE_IMAGES_ACCOUNT_ID,
CLOUDFLARE_IMAGES_TOKEN and CLOUDFLARE_IMAGES_ACCOUNT_HASH. The backend now reads
these names first, while retaining the earlier account-ID/public-hash aliases for
compatibility. Removed only the empty alias entries added to .env. Preserved every
configured credential, including Stream credentials; no Cloudflare token was
created or rotated. Delivery URLs are constructed server-side, so the existing
account hash does not need a NEXT_PUBLIC-prefixed environment entry.

## 2026-09-28: Confirmed production boundary and persistent local databases

Christian classified the supplied Neon connection as production and explicitly
asked to leave it unchanged. Its hostname is recorded in the ignored local
PRODUCTION_DATABASE_HOST setting; development tooling rejects that target.
Christian also reaffirmed that page wiring remains with the frontend task.

Christian supplied and authorized local PostgreSQL instead. Dedicated databases
third_place_clt_dev and third_place_clt_test replace the blocked development Neon
branch requirement for this loop. Their connection URLs live only in ignored
.env.local; the existing .env credentials are preserved. Prisma, seed and Vitest
tooling now load shell overrides first, .env.local second and .env last. Unlike
Next's normal test-mode convention, Vitest deliberately loads .env.local to obtain
the explicitly configured TEST_DATABASE_URL; integration tests still never fall
back to DATABASE_URL and retain the production guard. An empty shell
TEST_DATABASE_URL disables integration tests.

The development seed uses owner@third-place-clt.test as a local fixture identity,
the existing private seed password, and forced password change. This is not the
client's production owner. No production database operation or Cloudflare
credential creation was performed.

## 2026-09-28: Client-source copy adaptation

Christian authorized using the client's Instagram introductions and Are.na website
drafts to establish site copy. Updated existing src/content files while preserving
the frontend's page-wiring ownership. These are adaptations of supplied client
material, not an invented brand/story. Source URLs and editorial choices are in
COPY_SOURCES.md. Historical Instagram logistics do not override newer meetup
drafts or event-specific records. Unverified operational promises were removed;
privacy stays a labeled draft until retention and provider/contact decisions are
supplied. No production settings, database records or social accounts were changed.

## 2026-09-30: Production preparation and owner handoff

Christian requested production readiness and authorized a generated temporary
login that the client can replace. Added Account name/email changes requiring
the current password, preserving roles and revoking prior sessions. Forced initial
password change remains required before profile changes. No verification/recovery
email feature was added; temporary email uses the reserved .invalid domain.

Added offline production environment validation and a separately guarded,
create-only first-owner release command. Existing nonproduction-only migration
and seed guards are unchanged. Production writes remain pending Christian's
answer to the explicit approval question, honoring his previous instruction to
leave Neon unchanged. Production inspection was read-only and found no app tables.

Using the existing Cloudflare token, created only the four missing variants and
verified direct upload, metadata, delivery and cleanup with a generated disposable
image. The first image check failed; a fresh generated PNG
passed. Both owned fixtures were cleaned up. No new token was created and no
existing variant or client image was changed. Current domain/Turnstile configuration
is still local/test and is correctly rejected by production:check.

The existing untracked frontend is included in the release checkpoint so a fresh
checkout contains the app, while retaining its design and flows. The Account
addition is necessary for the newly requested email handoff. Browser smoke tests
could not run because automatic approval review rejected the temporary loopback
server launch as blocked by policy. Production readiness is not a launch claim.
