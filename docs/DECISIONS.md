# Decisions

## 2026-09-25: Reconstructed specification

The user identified the agreement PDF when asked for the missing SCOPE.md. Reconstructed SCOPE.md from that source and the pasted implementation request. Model fields, folder structure, login thresholds and checklist are proposed technical defaults, not recovered original text. Explicit conservative defaults: attendee visibility off, optional phone off, zero guests; cancelled events remain public; DST ambiguity requires a choice. sessionVersion and persisted publicName are added for revocation and privacy. Confirm defaults before launch.

## Existing scaffold and Git boundary

Retain src/ and its existing alias; Next.js 16.3.6 is the registry stable version. JSX files use .jsx. Parent repository is C:/Projects; commits must use explicit third-place-clt paths. No deployment or production database operations are authorized by this loop.

## Backend ownership and tooling

Christian confirmed frontend work is concurrent; backend task leaves page wiring and UI to that task, exposing documented service/action interfaces. Use bundled Node 24 LTS (Vitest 5 excludes local Node 25). Prisma 7.10 uses prisma.config.mjs, prisma-client-js to keep generated sources outside the project, and adapter-pg for standard PostgreSQL TCP connections including Neon and disposable local Postgres. Generated dependency typings do not constitute project TypeScript source.

## Gate status

Initial scaffold lint/build passed. Next build prints a generic Running TypeScript step but project contains no TypeScript sources. Client-boundary scan follows local imports and stops at use-server RPC boundaries. Dependency audit currently flags Prisma CLI transitive deepmerge-ts/mysql2 advisories; resolve or review before handoff.

## Concurrent frontend database mock

Frontend process repeatedly replaced src/lib/db.js after the backend commit. The real server-only Prisma singleton now lives in src/lib/prisma-db.js, and all backend imports point there. Preserve frontend work; replace its mock imports during later page integration. The in-memory mock must not be deployed as production persistence/authentication. This is a deliberate path deviation to avoid overwriting concurrent work.
