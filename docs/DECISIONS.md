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
