# Progress

## Status

Christian confirmed concurrent frontend work. This task now owns backend only; page wiring and visual QA are deferred to that task.

Scope reconstructed from the agreement and implementation request; no original SCOPE.md supplied.

## Backlog


## Phase 1: Foundation

- [x] Next.js (latest stable, App Router, JavaScript) + Tailwind + ESLint; jsconfig.json with @/* alias
- [ ] Folder structure per SCOPE.md §7
- [ ] Prisma schema from SCOPE.md §4, adapted to the installed Prisma version's Neon setup (see 6.1)
- [ ] lib/db.js Prisma singleton (server-only)
- [ ] First migration applied to the dev branch — BLOCKED: no confirmed nonproduction URL; SQL generated offline only.
- [ ] prisma/seed.js: idempotent; creates the OWNER from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD and the SiteSettings singleton
- [ ] .env.example matching SCOPE.md §8; .gitignore covers .env* except the example
- [ ] Vitest configured; npm test runs

## Phase 2: Authentication

- [ ] Auth.js v5 Credentials provider against AdminUser, bcrypt/argon2 hashes, generic error message
- [ ] requireAdmin() / requireOwner() helpers in lib/auth.js (see 6.3)
- [ ] Middleware/proxy redirect for /admin/* except /admin/login; admin API routes return 401
- [ ] Login rate limiting + lockout after repeated failures
- [ ] Forced password change on first login
- [ ] Admin layout with nav + sign-out
- [ ] /admin/account: change password
- [ ] /admin/users (OWNER only): add, remove, reset password; last OWNER can't be removed or demoted
- [ ] Tests: unauthenticated access, EDITOR blocked from users, lockout

## Phase 3: Events

- [ ] Zod schemas for event create/edit (end after start, capacity ≥ current headcount on edit, Eastern-time inputs)
- [ ] lib/dates.js: Eastern ↔ UTC conversion and display formatting ("Sat, Oct 18 · 7:00 PM")
- [ ] lib/events.js: slug generation with -2, -3 collision handling; headcount; spots left; isRsvpOpen
- [ ] Server actions: save draft, publish, unpublish, cancel, duplicate (as new draft), delete (reports RSVP count first)
- [ ] New events inherit attendee-visibility defaults from SiteSettings
- [ ] lib/cloudflare.js: direct upload URL, delete image, delivery URL builder (see 6.6)
- [ ] POST /api/admin/uploads/direct-url (authenticated)
- [ ] Image replace and event delete remove the old Cloudflare image
- [ ] Admin events table with filters (Upcoming / Past / Draft / Cancelled), title search, RSVP counts
- [ ] Admin preview of a draft's public layout
- [ ] Tests: slugs, date conversion across DST, validation rules, publish/unpublish visibility

## Phase 4: Public pages

- [ ] publicEventSelect and public query helpers (published only; never private attendee fields)
- [ ] Pages wired: Home (next 3 events), About, Events list, Event detail, Contact, Privacy, not-found, error
- [ ] Static copy in /content
- [ ] Draft or missing slug → 404; cancelled events show a banner with RSVP closed (pick list behavior and log it in DECISIONS.md)
- [ ] "Get directions" uses mapUrl, else a Google Maps search URL from address
- [ ] Tests: drafts never public, cancelled handling, public select contains no private fields

## Phase 5: RSVP

- [ ] lib/turnstile.js: server-side verification
- [ ] lib/rate-limit.js (see 6.5)
- [ ] RSVP Zod schema (phone only when collectPhone; guests 0..maxGuestsPerRsvp; note ≤ 500; consent required; honeypot)
- [ ] RSVP server action with capacity-safe transaction (see 6.4); duplicate email → friendly message
- [ ] Attendee visibility: count and/or opted-in list formatted server-side as "First L."
- [ ] /admin/events/[id]/rsvps: summary, search, sort, cancel, delete
- [ ] CSV export route (admin-only, formula-injection safe; see 6.7)
- [ ] Admin overview: upcoming events with headcount vs. capacity, RSVP totals, unread messages
- [ ] Tests: isRsvpOpen matrix, guests count toward capacity, duplicate rejection, concurrent overbooking test, visibility formatting

## Phase 6: Contact and settings

- [ ] Contact form action (Zod + Turnstile + honeypot + rate limit) → ContactMessage
- [ ] /admin/messages: filters, open marks READ, archive, delete, mailto reply
- [ ] /admin/settings: edit SiteSettings with URL validation; public header/footer read from it
- [ ] Tests: settings changes appear publicly, message status transitions

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
