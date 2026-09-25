# Third Place CLT administrator guide

This describes the intended connected admin workflow. The backend is implemented;
frontend controls must be wired and checked before this guide is handed to the
client as a live-site guide. No email is sent automatically by this website.

## Sign in and passwords

Visit /admin/login. Use the administrator email and temporary password supplied
securely by the owner. On first login, change your password on Account. Use at
least 12 characters; after changing it, sign in again. Repeated failed attempts
temporarily lock sign-in. Ask an owner to reset a forgotten password.

Owners can add administrators, change OWNER/EDITOR roles, reset temporary
passwords and remove administrators. Editors can manage events, RSVPs, messages
and settings, but cannot manage administrator accounts. The last owner cannot be
removed or demoted. Sign out when using a shared computer.

## Create, edit and publish an event

Choose New event. Enter title, description, Eastern date/time, venue and address.
Set an end after the start. In the repeated hour when daylight saving time ends,
choose the earlier or later occurrence explicitly. A blank capacity is unlimited;
capacity includes attendees plus their guests. You cannot lower capacity below
the current headcount.

Set whether RSVP is enabled, an optional deadline, maximum guests and optional
phone collection. Save a new event as a draft, preview it, then Publish. Saving
edits to an already-published event preserves publication. Use Unpublish to hide
it. A draft is visible only in the authenticated preview.

Upload an image and provide descriptive alt text. Wait for the upload to finish
before saving. Replacing an image removes the old stored image after saving.
Image setup may be unavailable until Cloudflare is configured; saving an event
without an image remains possible.

Duplicate creates a new draft with no RSVPs or shared image. Cancel keeps the
event visible with a cancelled notice and closes RSVPs. Delete permanently removes
the event and its RSVPs. Review the displayed RSVP count before confirming;
if the count changes, review the new count and confirm again.

## RSVPs and visibility

Open an event's RSVP list to see registrations and total people, search, sort,
cancel a registration or delete it. Guests count toward capacity; cancelled RSVPs
do not. A cancelled email remains reserved for that event to prevent duplicate
registrations. Contact the organizer if an attendee needs a change.

Export CSV downloads attendee information for that event. Keep it private and
share it only with people authorized to manage the gathering. Export does not
send email or contact attendees.

Each event can show a headcount, opted-in names, both or neither. Names appear as
first name and last initial only, and only if the attendee opted in. Email,
phone, notes and full last names never appear in the public attendee list. Change
default visibility in Settings for newly created events; existing events retain
their own settings. Initial defaults are private pending client confirmation.

## Contact messages and settings

Messages contains new, read and archived messages. Opening a message marks a new
message read. Archive removes it from the active inbox; delete removes it
permanently. Reply opens your own email application and does not send by itself.

Settings controls site name, contact email, social/chat links and default event
visibility. Links must begin with http:// or https://; leave unused links blank.
Page text and static photos are maintained in the site's source files by the
developer; there is no page-copy editor in this scope.

## If something fails

Read the form's error message, correct the highlighted fields and try again.
Refresh the verification challenge after a failed submission. Respect temporary
rate-limit messages. If an image or database service is unavailable, contact
Christian; never assume a submission succeeded unless a success message appears.
No payment, attendee account, text-message automation or waitlist is included.
