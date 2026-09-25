# Progress

## Status

Christian confirmed concurrent frontend work. This task now owns backend only; page wiring and visual QA are deferred to that task.

Scope reconstructed from the agreement and implementation request; no original SCOPE.md supplied.

## Backlog


## Phase 1: Foundation

- [x] Next.js (latest stable, App Router, JavaScript) + Tailwind + ESLint; jsconfig.json with @/* alias
- [x] Folder structure per SCOPE.md §7 — backend foundation implemented; validate/lint/unit gates pass.
- [x] Prisma schema from SCOPE.md §4, adapted to the installed Prisma version's Neon setup (see 6.1) — backend foundation implemented; validate/lint/unit gates pass.
- [x] lib/db.js Prisma singleton (server-only) — backend foundation implemented; validate/lint/unit gates pass.
- [ ] First migration applied to the dev branch — BLOCKED: no confirmed nonproduction URL; SQL generated offline only.
- [x] prisma/seed.js: idempotent; creates the OWNER from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD and the SiteSettings singleton — backend foundation implemented; validate/lint/unit gates pass.
- [x] .env.example matching SCOPE.md §8; .gitignore covers .env* except the example — backend foundation implemented; validate/lint/unit gates pass.
- [x] Vitest configured; npm test runs — backend foundation implemented; validate/lint/unit gates pass.

## Phase 2: Authentication

- [x] Auth.js v5 Credentials provider against AdminUser, bcrypt/argon2 hashes, generic error message — backend implementation and unit tests pass; UI wiring deferred.
- [x] requireAdmin() / requireOwner() helpers in lib/auth.js (see 6.3) — backend implementation and unit tests pass; UI wiring deferred.
- [x] Middleware/proxy redirect for /admin/* except /admin/login; admin API routes return 401 — backend implementation and unit tests pass; UI wiring deferred.
- [x] Login rate limiting + lockout after repeated failures — backend implementation and unit tests pass; UI wiring deferred.
- [x] Forced password change on first login — backend implementation and unit tests pass; UI wiring deferred.
- [ ] Admin layout with nav + sign-out
- [ ] /admin/account: change password
- [ ] /admin/users (OWNER only): add, remove, reset password; last OWNER can't be removed or demoted
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
- [ ] Admin events table with filters (Upcoming / Past / Draft / Cancelled), title search, RSVP counts
- [ ] Admin preview of a draft's public layout
- [x] Tests: slugs, date conversion across DST, validation rules, publish/unpublish visibility — safe server projection/lifecycle tests pass.

## Phase 4: Public pages

- [x] publicEventSelect and public query helpers (published only; never private attendee fields) — safe server projection/lifecycle tests pass.
- [ ] Pages wired: Home (next 3 events), About, Events list, Event detail, Contact, Privacy, not-found, error
- [ ] Static copy in /content
- [ ] Draft or missing slug → 404; cancelled events show a banner with RSVP closed (pick list behavior and log it in DECISIONS.md)
- [ ] "Get directions" uses mapUrl, else a Google Maps search URL from address
- [x] Tests: drafts never public, cancelled handling, public select contains no private fields — safe server projection/lifecycle tests pass.

## Phase 5: RSVP

- [x] lib/turnstile.js: server-side verification — backend implemented; unit gates pass.
- [x] lib/rate-limit.js (see 6.5) — backend implementation and unit tests pass; UI wiring deferred.
- [x] RSVP Zod schema (phone only when collectPhone; guests 0..maxGuestsPerRsvp; note ≤ 500; consent required; honeypot) — backend implemented; unit gates pass.
- [x] RSVP server action with capacity-safe transaction (see 6.4); duplicate email → friendly message — backend implemented; unit gates pass.
- [x] Attendee visibility: count and/or opted-in list formatted server-side as "First L." — backend implemented; unit gates pass.
- [ ] /admin/events/[id]/rsvps: summary, search, sort, cancel, delete
- [x] CSV export route (admin-only, formula-injection safe; see 6.7) — backend implemented; unit gates pass.
- [ ] Admin overview: upcoming events with headcount vs. capacity, RSVP totals, unread messages
- [ ] Tests: isRsvpOpen matrix, guests count toward capacity, duplicate rejection, concurrent overbooking test, visibility formatting

## Phase 6: Contact and settings

- [x] Contact form action (Zod + Turnstile + honeypot + rate limit) → ContactMessage — backend storage/status/settings tests pass; public UI wiring deferred.
- [ ] /admin/messages: filters, open marks READ, archive, delete, mailto reply
- [ ] /admin/settings: edit SiteSettings with URL validation; public header/footer read from it
- [x] Tests: settings changes appear publicly, message status transitions — backend storage/status/settings tests pass; public UI wiring deferred.

## Phase 7: Hardening and handoff

- [ ] Security headers in next.config (CSP allowing Turnstile + imagedelivery.net, X-Frame-Options, Referrer-Policy)
- [ ] images.remotePatterns for imagedelivery.net
- [ ] Metadata: per-page title/description, per-event Open Graph image (og variant), sitemap.js, robots.js (block /admin)
- [ ] Friendly error states on every form and admin action
- [ ] Run SCOPE.md §11 checklist; record pass/fail for each line in PROGRESS.md
- [ ] npm run build clean, no ESLint errors
- [ ] docs/DEPLOY.md: the SCOPE.md §12 steps as a checklist with exact commands
- [ ] docs/ADMIN_GUIDE.md: plain-language client guide (create/publish events, images, RSVPs, CSV export, visibility toggles, settings)

## Needs from Christian

- Confirm reconstructed SCOPE.md technical defaults; original sections were unavailable.
- Confirm a nonproduction Neon/PostgreSQL branch and configure DATABASE_URL locally; do not paste credentials into chat.
- Cloudflare Images credentials/account hash and card/hero/og/thumb variants.
- Production Turnstile keys/domain configuration, deployment host/domain, initial OWNER credentials.
- Client content/photos/contact/social links, brand approval, privacy retention and attendee collection/visibility policy.

## Change requests

- Design handoff mentions waitlist, calendar/confirmation email, emailing attendees and galleries. Parked; not implemented.

## Phase checks

Not run yet.

## Acceptance checklist

Reconstructed SCOPE.md section 11: all unchecked until independently verified.
