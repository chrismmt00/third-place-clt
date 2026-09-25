# Third Place CLT implementation scope

## 1. Sources and status

Reconstructed on 2026-09-25 from the user's backend implementation request and
`Third_Place_CLT_Website_Development_Agreement.pdf`, the scope source Christian
identified during this task. No original SCOPE.md was present. This is an
implementation specification, not an amendment to the agreement. Technical
defaults below are decisions to review, not terms quoted from the agreement.

## 2. Scope

### 2.1 Included

Responsive community website: Home, About, Events and event details, Contact,
supporting Privacy content, social links, and supplied client content. Secure
admin event creation/editing/publication/unpublication/removal; stored RSVPs and
admin attendee management; client-controlled attendee count and opted-in names.
Basic functional/responsive testing and deployment assistance.

The implementation request specifies OWNER/EDITOR administration, password
management, event cancellation/duplication, guest capacity, CSV export, stored
contact messages, settings, Cloudflare Images and Turnstile, and SEO metadata.
These are implementation details of the included capabilities.

### 2.2 Excluded

Payments, paid tickets, memberships, attendee accounts, QR check-in, SMS, messaging
integrations, custom mobile app, email sending, page-copy CMS, brand creation,
extensive original copywriting, ongoing content entry or marketing services.
Client supplies external chat/social links; a normal link is allowed. Third-party
fees are the client's responsibility. Do not deploy without a configured target.

### 2.3 Future only

Waitlists, confirmation emails, notifications, calendar downloads, and galleries.
Centralize RSVP creation so future approved work can extend it; implement none now.

## 3. Stack

Next.js installed stable 16.3.6, App Router, React, JavaScript (.jsx for JSX),
Tailwind 4, ESLint, Prisma/PostgreSQL (Neon), Auth.js v5 Credentials with JWT,
Zod and Vitest. No project TypeScript files or direct TypeScript dependencies.
Read installed Next documentation before changes. Keep Prisma configuration in
JavaScript; use a stable Prisma release with a JavaScript-compatible client.

## 4. Data model

All IDs are generated opaque strings, dates UTC, emails trimmed/lowercased.

- AdminUser: id, email unique, name, passwordHash, role OWNER/EDITOR,
  mustChangePassword, failedLoginCount, lockedUntil, sessionVersion, timestamps.
- Event: id, slug unique, title, description, startsAt, endsAt, locationName,
  address, mapUrl, imageId, imageAlt, status DRAFT/PUBLISHED/CANCELLED,
  capacity nullable, rsvpEnabled, rsvpDeadline nullable, collectPhone,
  maxGuestsPerRsvp, showAttendeeCount, showAttendeeNames, timestamps.
- Rsvp: id, eventId (cascade deletion), firstName, lastName, publicName (derived
  on the server), email, phone nullable, guestCount, note nullable,
  publicNameConsent, consentAt, status GOING/CANCELLED, timestamps.
  Unique (eventId, email). Index eventId/status. Headcount includes guests.
- ContactMessage: id, name, email, subject, message, status NEW/READ/ARCHIVED,
  timestamps.
- SiteSettings: singleton id `site`, siteName, contactEmail, instagramUrl,
  facebookUrl, chatUrl, showAttendeeCountDefault, showAttendeeNamesDefault.
- RateLimitHit: key unique (action + hashed IP + window), count, expiresAt.

Defaults: drafts, RSVPs enabled, no capacity limit, no phone collection, zero
guests, visibility off. Defaults are conservative implementation choices pending
client review. Only opted-in formatted names may be public, never raw names.

## 5. Features and security

### 5.1 Events

Validate all changes using Zod. End after start, edit capacity >= current GOING
headcount. Convert America/New_York local inputs server-side. Reject nonexistent
DST times and require explicit earlier/later choice for repeated times. Collision
slugs use -2, -3 etc. Duplicate produces a draft with no RSVPs. Delete confirmation
reports actual RSVP count. Cancelled events stay visible with RSVP closed.
Drafts and missing slugs return 404. New events inherit settings visibility.

### 5.2 RSVP

Require name/email and consent; phone only when enabled; guests 0..event maximum;
note <=500 chars; honeypot; Turnstile; rate limit 5/10 minutes. Check event
publication, enabled status, start/deadline and capacity. Serializable transaction
loads event, sums GOING headcount, creates RSVP; retry P2034 three times. Unique
email per event returns a friendly duplicate message. Server formats First L.
Public projections include no email, phone, note, full last name or raw first/last
name combination. Capacity tests use 20 concurrent requests and 5 spots.

### 5.3 Contact and settings

Zod + Turnstile + honeypot + 5/10 minute rate limit stores a message. Admin search,
filters, READ when explicitly opened, archive/delete, mailto reply. Settings
validate external URLs as http/https, optional empty links allowed. Header/footer
read settings. Content lives in source files, not a CMS.

### 5.4 Administration

Every protected action/handler calls requireAdmin/requireOwner first; helper reads
fresh database user each time. EDITOR cannot manage users. Last OWNER removal or
demotion prevented transactionally. Forced password change allows only account
update/sign-out. Password changes invalidate old sessions. Generic login failures.
Admin API responses are 401/403, not HTML redirects. Proxy is convenience only.

### 5.5 Security defaults

Login IP limit: 10 attempts/15 minutes; account lock after 5 failures for 15 minutes
(reconstructed defaults, original section unavailable). Hash IP before persistence.
Use Postgres shared counters and opportunistic expiry pruning. Never log private
attendee data, credentials or database URLs. Use server-only imports on privileged
libraries. No interpolated raw SQL. Never run migrations/seeds/tests on production.
Integration/mutation tooling requires an explicitly confirmed nonproduction URL;
reject production host/database matches and pooled/nonpooled Neon equivalents.

## 6. Integrations and implementation

Cloudflare Images: server creates upload URL; browser directly uploads; token only
in lib/cloudflare.js. Save image ID, remove replaced/deleted images after successful
DB changes. Failed cleanup logs a generic message and does not undo the operation.
Use card/hero/og/thumb variants. Missing credentials must yield explicit disabled
or development stub behavior, never an insecure production bypass.

Turnstile verifies server-side; documented testing keys only outside production.
CSV admin-only; quote fields and double embedded quotes; prefix cells beginning
with =,+,-,@,tab,CR with apostrophe. Filename uses sanitized slug and date.
Unit tests use Vitest. Database integration tests require TEST_DATABASE_URL and
refuse production-equivalent URLs. No mutation tests on DATABASE_URL.

## 7. Folders

Keep existing src layout and @/* -> ./src/* alias. src/app: public pages,
admin/login, admin/(protected) route group, api/auth, api/admin. src/components:
reusable view/form components. src/lib: db, auth, events, dates, validation,
cloudflare, turnstile, rate-limit, rsvp and CSV helpers. src/content: static copy.
prisma: schema/migrations/seed.js. tests: unit and integration. docs: this scope,
PROGRESS, DECISIONS, DEPLOY, ADMIN_GUIDE and design reference files.

## 8. Environment

DATABASE_URL; TEST_DATABASE_URL; NONPRODUCTION_DATABASE_HOST;
PRODUCTION_DATABASE_HOST; AUTH_SECRET; AUTH_URL; SEED_ADMIN_EMAIL;
SEED_ADMIN_PASSWORD; CLOUDFLARE_ACCOUNT_ID; CLOUDFLARE_IMAGES_TOKEN;
NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH; NEXT_PUBLIC_TURNSTILE_SITE_KEY;
TURNSTILE_SECRET_KEY; NEXT_PUBLIC_SITE_URL. Never populate secrets in tracked files.
Commit only .env.example. Nonproduction/production host declarations support
fail-closed mutation safeguards. Deployment must identify trusted proxy IP headers.

## 9. Design/content

Use supplied design handoff tokens/components as reference; prototypes are not
production code. Client photos, brand confirmation, event content, contact/social
links, attendee collection/visibility policy and privacy retention copy are pending.
No invented testimonials, real events or client contact details.

## 10. Phases and done checks

1. Foundation: JavaScript scaffold, schema/client, safe migration and idempotent
   seed, environment example and Vitest. Validate/lint/test/build pass. Applying
   migration requires confirmed nonproduction database; record blocked separately.
2. Auth: login/lockout, fresh role checks, forced reset, account/users and admin
   shell. Auth tests plus build pass.
3. Events: validation/dates/slugs/actions/images/admin listing/preview; unit tests
   including DST and publication transitions plus build pass.
4. Public: all public pages/content, safe projection, cancelled/draft behavior,
   directions and public privacy tests plus build pass.
5. RSVP: verification/limiter/transaction, attendee visibility, RSVP admin/CSV,
   overview; unit tests and disposable DB concurrency test plus build pass.
6. Contact/settings: public contact storage, admin inbox/settings, status/settings
   tests and build pass.
7. Hardening/handoff: security headers/images, metadata/sitemap/robots, friendly
   errors, checklist and deployment/admin documentation; gates pass.

Client revisions (Phase 8) and post-launch support (Phase 10) are client-driven.
One small task per iteration/commit; run available gates, record blocked needs,
continue independent work. Three failures on a task -> record blocker and continue.

## 11. Acceptance checklist

- [ ] All public pages usable on desktop/mobile with accessible navigation/forms.
- [ ] Only published/cancelled events public; drafts/missing slugs 404.
- [ ] All admin entry points require fresh authorization; OWNER-only user controls.
- [ ] Login lockout, forced reset and password/session invalidation work.
- [ ] CRUD/publish/cancel/duplicate events, safe deletion and image lifecycle work.
- [ ] Eastern-time conversions cover Oct 31, both Nov 1 01:30 instants, Nov 2, 2026.
- [ ] RSVP validation, duplicate handling, deadlines/guests/capacity work.
- [ ] Disposable database concurrency test proves no overbooking.
- [ ] Attendee consent/visibility respected; no private fields in public payloads.
- [ ] RSVP admin search/sort/cancel/delete and safe CSV export work.
- [ ] Contact messages persist; admin READ/archive/delete/mailto work.
- [ ] Settings update public header/footer; external URLs validated.
- [ ] Real Cloudflare image upload/delete and Turnstile production configuration verified.
- [ ] Rate limits share PostgreSQL state; trusted IP header deployment verified.
- [ ] Security headers, SEO metadata/OG, sitemap/robots configured.
- [ ] All forms/admin actions have accessible friendly error states.
- [ ] Prisma validate, ESLint, Vitest and production build pass; no tracked TS/secrets.
- [ ] Nonproduction migration/seed tested; production deployment plan reviewed.
- [ ] Client content/brand/privacy decisions supplied and reviewed.
- [ ] Deployment and administrator guides complete.

This reconstructed checklist is not represented as the absent original checklist.

## 12. Deployment checklist requirements

Install dependencies; configure nonproduction secrets; validate/generate Prisma;
apply migration and seed only to confirmed dev DB; run gates and integration tests;
configure Cloudflare variants/Turnstile domains; set production secrets in host;
review/apply migration through an explicit production release process (not this
development loop); provision initial owner securely; build/deploy to agreed host;
configure domain/TLS; verify public/admin flows and backups; collect client review.
Never claim launch complete until external setup and acceptance checks pass.
