# Backend integration handoff

Status: real PostgreSQL backend implemented; frontend wiring is a separate task
at Christian's direction. Do not deploy the prototype's in-memory persistence or
authentication. The backend tests do not certify the unfinished frontend flows.

## Ownership

- Backend: prisma/, tests/, scripts/, src/app/actions/, src/app/api/, src/proxy.js,
  src/app/robots.js, src/app/sitemap.js and backend libraries below.
- Frontend: pages/layouts/components/styles/content and its prototype helpers.
- `src/lib/db.js` belongs to the concurrent prototype. The real Prisma singleton
  is `src/lib/prisma-db.js` because the prototype repeatedly replaced db.js.
  Import named `db` only in server modules. Do not copy the mock into production.
- Shared configuration/package changes must preserve both tasks' edits.

## Forms and result contract

Server actions take `(previousState, FormData)` for React `useActionState`.
Success: `{ ok: true, message, ... }`. Failure: `{ ok: false, error, code?, fields? }`.
Render errors accessibly and preserve non-secret input; never echo passwords.
`fields` maps field name to validation message. Buttons need pending/disabled
state and form summaries need focus management. Auth codes are
UNAUTHENTICATED, FORBIDDEN and PASSWORD_CHANGE_REQUIRED. Route handlers use 401/403.

Forms send checkbox `on`/`true` or booleans through service calls. Missing checkbox
means false except event visibility, where omission preserves current/default
settings. To turn event visibility off explicitly, submit `false` (hidden input
before the checkbox is one approach). Capacity blank means unlimited. Omit event
`id` for new events. Database IDs are CUIDs; prototype UUIDs are not compatible.
Statuses are uppercase enums; map frontend display badges explicitly.

## Authentication and administrators

Use `src/app/actions/auth.js`: login, logout, changePassword, addAdmin, manageAdmin.
Auth.js route is `/api/auth/[...nextauth]`. Login expects email/password and lands
on `/admin/account`; that page reads `getAdminAccount()` and shows forced reset
when required. Successful password change revokes existing sessions: show the
returned sign-in prompt and navigate to `/admin/login`.

Every protected page must call the appropriate backend query/helper on the
server. Catch UNAUTHENTICATED to redirect to login and PASSWORD_CHANGE_REQUIRED
to redirect to account. Only the account page may call
`requireAdmin({ allowPasswordChange: true })`. Proxy merely checks token presence;
it is not sufficient authorization. Don't pass the full requireAdmin result into
client props: use `getAdminAccount()` (safe fields only).

`addAdmin`: name, email, role OWNER/EDITOR, temporary password (12+ chars, <=72
UTF-8 bytes). `manageAdmin`: id plus operation remove, role (with role), or reset
(with new temporary password). Share passwords outside the site through a secure
channel. There is no password-reset email. Last-owner changes are blocked.

## Events

`src/lib/admin-queries.js`: listAdminEvents({filter,search,page}), getAdminEvent(id),
listAdminUsers(), getAdminAccount(), listAdminRsvps(eventId,{search,sort,page}),
getAdminOverview(), listAdminMessages({status,search,page}), getAdminMessage(id).
Every helper authorizes before loading data. Pages are 50 records; overview 10.
Event filters: upcoming/past/draft/cancelled. RSVP sort: newest/oldest/name.
Message statuses: NEW/READ/ARCHIVED/ALL. Admin event results include `_count.rsvps`
for delete confirmation and `headcount` for capacity display.

`src/app/actions/events.js`:

- saveEventDraft: title, description, startsAt, endsAt, locationName, address,
  mapUrl, imageId, imageAlt, capacity, rsvpEnabled, rsvpDeadline, collectPhone,
  maxGuestsPerRsvp, showAttendeeCount, showAttendeeNames and optional id.
  New records are drafts; editing preserves an existing record's publication
  status. Saving and publishing are distinct actions; don't imply save unpublishes.
- updateEventStatus: id and operation publish/unpublish/cancel/duplicate/delete.
  Delete also sends confirmationCount from the latest `_count.rsvps`; mismatch
  returns CONFIRM_DELETE with an updated count rather than deleting stale data.
- Dates are Eastern `YYYY-MM-DDTHH:mm` strings. Repeated times require separate
  startsAtOccurrence/endsAtOccurrence/rsvpDeadlineOccurrence = earlier/later;
  default reject. Spring-forward gaps always fail. `utcToEasternInput` and
  `formatEventDate` are in src/lib/dates.js.

Draft preview reads getAdminEvent on a protected server page and renders the same
event view with RSVP disabled. Never use a public helper to reveal a draft.

## Images

POST `/api/admin/uploads/direct-url` with same-origin JSON `{}`. On
`available: true`, upload the image file using FormData directly to `uploadURL`;
wait for success, then include the returned `id` as imageId in the event form.
Cloudflare enforces the direct-upload restrictions; UI should restrict supported
image types and size. An unavailable development response explicitly sets
`developmentStub: true`; allow saving without an image. Never persist a fake ID.
Tokens are used only in lib/cloudflare.js. The server verifies upload ownership
metadata and completion before attachment. Duplicate events do not share images.

## Public events and RSVPs

`src/lib/public-events.js`: listPublicEvents({past,limit,page}) (Home uses limit 3),
getPublicEvent(slug) returns null for drafts/missing events; call notFound().
Cancelled events remain listed with a cancelled banner and rsvpOpen false.
Public DTO contains imageUrl, ogImageUrl, directionsUrl, rsvpOpen, spotsLeft,
attendeeCount (null when hidden), attendeeNames (formatted opted-in strings only).
Pass these DTOs to clients; never serialize admin/Prisma records as public props.
Set `export const dynamic = "force-dynamic"` on database-backed public pages (or
the shared layout that loads settings). Prisma queries alone do not opt pages
out of build-time prerendering. This keeps credentials/runtime data out of builds
and prevents stale event availability. Authenticated queries already read cookies.

`submitRsvp` in src/app/actions/rsvp.js: eventId, firstName, lastName, email, phone,
guestCount, note, consent, publicNameConsent, website (empty honeypot). Public-name opt-in starts unchecked. Consent is required.
Phone is optional when enabled and discarded otherwise. Counts include guests.
Success contains no attendee personal data. Duplicate emails stay unique even
after cancellation; direct the attendee to the organizer for changes.

No CAPTCHA token is required. Turnstile was removed at the user’s request on
September 30, 2026. Both public actions retain rate limits and honeypot validation.

`manageRsvp`: id, eventId, operation cancel/delete. CSV link:
`/api/admin/events/{id}/rsvps/export`. The route authenticates and escapes formulas.

## Contact and settings

`src/app/actions/contact.js`: submitContact, manageMessage, saveSettings.
Contact expects name,email,subject,message,consent,website. Message operations: read/archive/delete. When an admin
explicitly opens a message, POST manageMessage(read) and render the protected
query result. GET/prefetch never marks a message read. Reply uses an encoded
mailto URL, not email delivery.

Settings: siteName, contactEmail, instagramUrl,facebookUrl,chatUrl,
showAttendeeCountDefault,showAttendeeNamesDefault. Header/footer read
getSiteSettings() from src/lib/settings.js on the server. It supplies no invented
contact data. For new events, omitted visibility fields inherit these defaults.

## Metadata and security

Wire `eventMetadata(slug)` from src/lib/metadata.js into generateMetadata.
Page titles/descriptions and root metadataBase remain frontend work. Sitemap and
robots handlers are implemented; they need DATABASE_URL/NEXT_PUBLIC_SITE_URL at
runtime. CSP permits Cloudflare image delivery/upload; third-party frames are disabled. Static Next
hydration currently needs unsafe-inline; a nonce policy would require coordinated
dynamic page rendering. Do not introduce unsafe HTML rendering.

Production deployment must overwrite untrusted x-forwarded-for and configure the
correct public origin. Backend returns unavailable errors when credentials are
missing; don't turn a failed write into a success notification.

## Verification and open work

Use Node 24 LTS. `npm run verify` and `npm run build`. Integration tests run only
with an explicitly nonproduction TEST_DATABASE_URL; see DEPLOY.md. Unit tests are
not a substitute for wiring forms, checking redirects/403/404 and keyboard/mobile
testing. No production database was contacted. Live Cloudflare, Neon deployment,
client content and complete browser flows are still acceptance prerequisites.
