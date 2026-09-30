# Progress

## Status

2026-09-30 production preparation is in progress: account email/name changes and
guarded first-owner provisioning implemented; private credentials prepared but not
activated in production. The existing frontend is now part of the release checkpoint.
Production migration/account approval and domain/hosting details are pending.
See DEPLOY.md for the current launch blockers and exact handoff procedure.

Christian confirmed concurrent frontend work. This task now owns backend only; page wiring and visual QA are deferred to that task.

Reconfirmed 2026-09-28: supplied Neon is production and must remain unchanged;
page wiring stays with frontend. Christian authorized dedicated local PostgreSQL
development/test databases and .env.local instead.

Scope reconstructed from the agreement and implementation request; no original SCOPE.md supplied.

## Backlog


## Phase 1: Foundation

- [x] Next.js (latest stable, App Router, JavaScript) + Tailwind + ESLint; jsconfig.json with @/* alias
- [x] Folder structure per SCOPE.md §7 — backend foundation implemented; validate/lint/unit gates pass.
- [x] Prisma schema from SCOPE.md §4, adapted to the installed Prisma version's Neon setup (see 6.1) — backend foundation implemented; validate/lint/unit gates pass.
- [x] Prisma singleton (server-only) — src/lib/prisma-db.js; path changed to avoid frontend mock collisions (DECISIONS.md).
- [x] First migration applied to the development database — dedicated local PostgreSQL replaces a Neon dev branch with Christian's authorization; verification recorded below.
- [x] prisma/seed.js: idempotent; creates the OWNER from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD and the SiteSettings singleton — backend foundation implemented; validate/lint/unit gates pass.
- [x] .env.example matching SCOPE.md §8; .gitignore covers .env* except the example — backend foundation implemented; validate/lint/unit gates pass.
- [x] Vitest configured; npm test runs — backend foundation implemented; validate/lint/unit gates pass.

## Phase 2: Authentication

- [x] Auth.js v5 Credentials provider against AdminUser, bcrypt/argon2 hashes, generic error message — backend implementation and unit tests pass; UI wiring deferred.
- [x] requireAdmin() / requireOwner() helpers in lib/auth.js (see 6.3) — backend implementation and unit tests pass; UI wiring deferred.
- [x] Middleware/proxy redirect for /admin/* except /admin/login; admin API routes return 401 — backend implementation and unit tests pass; UI wiring deferred.
- [x] Login rate limiting + lockout after repeated failures — backend implementation and unit tests pass; UI wiring deferred.
- [x] Forced password change on first login — backend implementation and unit tests pass; UI wiring deferred.
- [ ] Admin layout with nav + sign-out — DEFERRED: frontend wiring/visual verification, per Christian. Backend interfaces are in BACKEND_HANDOFF.md.
- [ ] /admin/account: change password — DEFERRED: frontend wiring/visual verification, per Christian. Backend interfaces are in BACKEND_HANDOFF.md.
- [ ] /admin/users (OWNER only): add, remove, reset password; last OWNER can't be removed or demoted — DEFERRED: frontend wiring/visual verification, per Christian. Backend interfaces are in BACKEND_HANDOFF.md.
- [x] Tests: unauthenticated access, EDITOR blocked from users, lockout — backend implementation and unit tests pass; UI wiring deferred.

## Phase 3: Events

- [x] Zod schemas for event create/edit (end after start, capacity ≥ current headcount on edit, Eastern-time inputs) — backend implemented; live image verification awaits credentials.
- [x] lib/dates.js: Eastern ↔ UTC conversion and display formatting ("Sat, Oct 18 · 7:00 PM") — backend implemented; live image verification awaits credentials.
- [x] lib/events.js: slug generation with -2, -3 collision handling; headcount; spots left; isRsvpOpen — backend implemented; live image verification awaits credentials.
- [x] Server actions: save draft, publish, unpublish, cancel, duplicate (as new draft), delete (reports RSVP count first) — backend implemented; live image verification awaits credentials.
- [x] New events inherit attendee-visibility defaults from SiteSettings — backend implemented; live image verification awaits credentials.
- [x] lib/cloudflare.js: direct upload URL, delete image, delivery URL builder (see 6.6) — backend implemented; live image verification awaits credentials.
- [x] POST /api/admin/uploads/direct-url (authenticated) — backend implemented; live image verification awaits credentials.
- [x] Image replace and event delete remove the old Cloudflare image — backend implemented; live image verification awaits credentials.
- [ ] Admin events table with filters (Upcoming / Past / Draft / Cancelled), title search, RSVP counts — DEFERRED: frontend wiring/visual verification, per Christian. Backend interfaces are in BACKEND_HANDOFF.md.
- [ ] Admin preview of a draft's public layout — DEFERRED: frontend wiring/visual verification, per Christian. Backend interfaces are in BACKEND_HANDOFF.md.
- [x] Tests: slugs, date conversion across DST, validation rules, publish/unpublish visibility — safe server projection/lifecycle tests pass.

## Phase 4: Public pages

- [x] publicEventSelect and public query helpers (published only; never private attendee fields) — safe server projection/lifecycle tests pass.
- [ ] Pages wired: Home (next 3 events), About, Events list, Event detail, Contact, Privacy, not-found, error — DEFERRED: frontend wiring/visual verification, per Christian. Backend interfaces are in BACKEND_HANDOFF.md.
- [x] Static community copy in /content — adapted from client Instagram introductions and Are.na drafts on 2026-09-28; sources and remaining wiring in COPY_SOURCES.md. Privacy policy remains a client-review draft.
- [ ] Draft or missing slug → 404; cancelled events show a banner with RSVP closed (pick list behavior and log it in DECISIONS.md) — DEFERRED: frontend wiring/visual verification, per Christian. Backend interfaces are in BACKEND_HANDOFF.md.
- [ ] "Get directions" uses mapUrl, else a Google Maps search URL from address — DEFERRED: frontend wiring/visual verification, per Christian. Backend interfaces are in BACKEND_HANDOFF.md.
- [x] Tests: drafts never public, cancelled handling, public select contains no private fields — safe server projection/lifecycle tests pass.

## Phase 5: RSVP

- [x] lib/turnstile.js: server-side verification — backend implemented; unit gates pass.
- [x] lib/rate-limit.js (see 6.5) — backend implementation and unit tests pass; UI wiring deferred.
- [x] RSVP Zod schema (phone only when collectPhone; guests 0..maxGuestsPerRsvp; note ≤ 500; consent required; honeypot) — backend implemented; unit gates pass.
- [x] RSVP server action with capacity-safe transaction (see 6.4); duplicate email → friendly message — backend implemented; unit gates pass.
- [x] Attendee visibility: count and/or opted-in list formatted server-side as "First L." — backend implemented; unit gates pass.
- [ ] /admin/events/[id]/rsvps: summary, search, sort, cancel, delete — DEFERRED: frontend wiring/visual verification, per Christian. Backend interfaces are in BACKEND_HANDOFF.md.
- [x] CSV export route (admin-only, formula-injection safe; see 6.7) — backend implemented; unit gates pass.
- [ ] Admin overview: upcoming events with headcount vs. capacity, RSVP totals, unread messages — DEFERRED: frontend wiring/visual verification, per Christian. Backend interfaces are in BACKEND_HANDOFF.md.
- [x] Tests: isRsvpOpen matrix, guests count toward capacity, duplicate rejection, concurrent overbooking test, visibility formatting — verified locally; see acceptance results.

## Phase 6: Contact and settings

- [x] Contact form action (Zod + Turnstile + honeypot + rate limit) → ContactMessage — backend storage/status/settings tests pass; public UI wiring deferred.
- [ ] /admin/messages: filters, open marks READ, archive, delete, mailto reply — DEFERRED: frontend wiring/visual verification, per Christian. Backend interfaces are in BACKEND_HANDOFF.md.
- [ ] /admin/settings: edit SiteSettings with URL validation; public header/footer read from it — DEFERRED: frontend wiring/visual verification, per Christian. Backend interfaces are in BACKEND_HANDOFF.md.
- [x] Tests: settings changes appear publicly, message status transitions — backend storage/status/settings tests pass; public UI wiring deferred.

## Phase 7: Hardening and handoff

- [x] Security headers in next.config (CSP allowing Turnstile + imagedelivery.net, X-Frame-Options, Referrer-Policy) — verified locally; see acceptance results.
- [x] images.remotePatterns for imagedelivery.net — verified locally; see acceptance results.
- [ ] Metadata: per-page title/description, per-event Open Graph image (og variant), sitemap.js, robots.js (block /admin) — DEFERRED: frontend wiring/visual verification, per Christian. Backend interfaces are in BACKEND_HANDOFF.md.
- [ ] Friendly error states on every form and admin action — DEFERRED: frontend wiring/visual verification, per Christian. Backend interfaces are in BACKEND_HANDOFF.md.
- [x] Run SCOPE.md §11 checklist; record pass/fail for each line in PROGRESS.md — verified locally; see acceptance results.
- [x] npm run build clean, no ESLint errors — verified locally; see acceptance results.
- [x] docs/DEPLOY.md: the SCOPE.md §12 steps as a checklist with exact commands — verified locally; see acceptance results.
- [x] docs/ADMIN_GUIDE.md: plain-language client guide (create/publish events, images, RSVPs, CSV export, visibility toggles, settings) — verified locally; see acceptance results.

## Needs from Christian

- Confirm reconstructed SCOPE.md technical defaults; original sections were unavailable.
- Production Neon remains unchanged; production migration/initial OWNER provisioning requires the separate release process. Local development/test databases are configured in ignored .env.local.
- Cloudflare Images credentials, four variants and live upload/delivery/delete verified on 2026-09-30; deployment must receive those existing credentials.
- Production Turnstile keys/domain configuration, deployment host/domain, initial OWNER credentials.
- Community copy and Instagram link supplied/adapted; still need client photos, contact/community-chat links, final copy/brand approval, privacy retention and attendee collection/visibility policy. See COPY_SOURCES.md.

## Change requests

- Design handoff mentions waitlist, calendar/confirmation email, emailing attendees and galleries. Parked; not implemented.

## Phase checks

- 2026-09-30 readiness: 47 tests PASS (including local owner provisioning and RSVP concurrency); Prisma validation, lint, secret boundary (38 modules) and production build PASS. Production config check correctly FAILS on localhost origins/test Turnstile keys/seed password. Production schema read-only audit: 0/6 tables. First-owner credentials prepared, pending production approval and deployment. Browser server launch rejected by automatic approval review; no workaround attempted.

- 2026-09-28 client-source copy pass: Instagram introductions and Are.na drafts reviewed; Home/About/Contact and shared event/RSVP/error copy updated, Events/SEO copy prepared for frontend wiring. Source/claim review, Prisma validation, ESLint, 35 tests (including local PostgreSQL integration), client secret boundary (37 modules), tracked-TypeScript check and production build PASS. No new copy-only tests added. Privacy is a labeled client-review draft; no page wiring or production data changed.

- 2026-09-28 persistent local database setup: guarded migrations PASS for third_place_clt_dev and third_place_clt_test. Development seed ran twice: one OWNER, one settings row, forced password reset enabled. Production URL rejection PASS without connecting to Neon. Prisma validation, ESLint, 34 unit tests + 1 real local PostgreSQL concurrency test (exactly 5/20 admitted), client secret boundary, tracked-TypeScript checks and Next production build PASS. Both private environment files are ignored; existing Cloudflare credentials preserved.

- 2026-09-27 Cloudflare environment correction: existing Images credentials reused, empty aliases removed, configured credential values preserved. Prisma validation, ESLint, 33 unit tests, client secret boundary and tracked-TypeScript checks PASS. No live Cloudflare mutations or database integration tests were run for this change.

- Phase 1 backend: PASS validate/generate/lint/unit/build; persistent local PostgreSQL migration and idempotent seed PASS. Production Neon remains outside this development loop.
- Phase 2 backend: PASS auth/lockout/fresh-role/forced-reset/last-owner tests and build; UI deferred.
- Phase 3 backend: PASS validation, DST, slugs, lifecycle and build; Images credentials now recognized, live operations pending.
- Phase 4 backend: PASS safe projections, draft exclusion/cancelled handling and build; pages deferred.
- Phase 5 backend: PASS unit tests and real PostgreSQL 20-way concurrency (exactly 5 admitted for capacity 5), plus build.
- Phase 6 backend: PASS message/settings tests and build; UI deferred.
- Phase 7 backend: PASS headers configuration, robots/sitemap build, guides and static secret/TS gates; frontend/live-service checks deferred.
- Final local gates: Node 24.19.0; Prisma 7.10 validate/generate, ESLint, 31 unit + 1 database integration test, Next production build PASS. npm audit: zero vulnerabilities.
- Temporary HTTP server launch was rejected by automatic approval review with only blocked-by-policy detail; live HTTP smoke tests NOT RUN. Route functions have direct 401/403 tests.
- No production migrations, seeds, data changes or deployment were performed.

## Acceptance checklist

| # | Acceptance item (SCOPE.md section 11) | Result |
|---|---|---|
| 1 | Public pages/mobile/accessibility | DEFERRED frontend |
| 2 | Public statuses and draft/missing 404 | Backend filtering PASS; actual page 404 DEFERRED |
| 3 | Fresh admin authorization and owner controls | Backend PASS; frontend data loaders must be wired |
| 4 | Lockout, forced reset, session invalidation | Backend PASS; browser flows DEFERRED |
| 5 | Event lifecycle and images | Lifecycle tests PASS; live Images upload/ownership/four variants/deletion PASS; browser event editing unverified |
| 6 | Eastern DST boundary cases | PASS, including both Nov 1 01:30 occurrences and spring gap |
| 7 | RSVP validation/duplicates/deadlines/guests | PASS |
| 8 | Disposable database overbooking test | PASS: 20 parallel submissions, exactly 5 accepted |
| 9 | Attendee privacy/consent/projections | Backend PASS; frontend serialization review DEFERRED |
| 10 | RSVP management and CSV | Backend queries/actions/export PASS; UI DEFERRED |
| 11 | Contact storage/status/mailto | Backend PASS; UI/mailto DEFERRED |
| 12 | Settings and public header/footer | Settings persistence/public query PASS; UI DEFERRED |
| 13 | Live Cloudflare/Turnstile configuration | Images PASS; production Turnstile keys/domain still BLOCKED |
| 14 | Shared rate limiter/trusted proxy | DB counter implementation/tests PASS; hosting header verification BLOCKED |
| 15 | Headers/metadata/sitemap/robots | Config/handlers/helper/build PASS; per-page wiring and live HTTP DEFERRED |
| 16 | Friendly form/admin errors | Backend safe result contract PASS; visible accessibility DEFERRED |
| 17 | Validate/lint/tests/build/no TS/secrets | PASS at backend checkpoint |
| 18 | Nonproduction migration/seed/release plan | Persistent local PostgreSQL migration/idempotent seed PASS; production release/provisioning remains separate |
| 19 | Client content/brand/privacy | Community copy and Instagram reviewed/adapted; final approval, photos/contact/chat and privacy policies still pending |
| 20 | Deployment and admin guides | PASS, expressly labeled pending integration/launch |
