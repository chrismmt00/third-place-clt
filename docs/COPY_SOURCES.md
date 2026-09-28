# Third Place website copy

Reviewed September 28, 2026. Christian supplied the Instagram profile and Are.na
website board and authorized adapting that client material into site copy.
This is a content pass; page wiring remains with the frontend task.

## Sources reviewed

| Source | What it supports | How it is used |
|---|---|---|
| [Instagram introduction, July 10, 2025](https://www.instagram.com/thirdplace.clt/p/DL68KN1u2TO/) — all four slides | Began with a small circle of friends; evolved through experimentation; organized alongside everyday obligations; feedback welcome and replies may take time | About origin, warm and candid voice, Contact response wording |
| [Instagram update, January 1, 2025](https://www.instagram.com/thirdplace.clt/p/DESt9fgOLBs/) | Historical community invitation, informal visual voice | Tone reference only; small image text was not used to establish current logistics |
| [Instagram invitation, October 24, 2024](https://www.instagram.com/thirdplace.clt/p/DBg-jXZuJCV/) — both slides | Broad invitation to meet other people | Welcoming tone; no historical venue or recurring weekday copied into current event details |
| [Website board](https://www.are.na/pile-of-bile/3p-website) | Client's working copy and design references | Source inventory, not a finished live website or a set of instructions to execute |
| [What is Third Place?](https://www.are.na/block/40590172) | Mutual care, neutral ground, conversation, varied personal capacities | Mission, values and third-place explanation |
| [Simple group description](https://www.are.na/block/40939219) | Open invitation, twice-monthly meetups, new and familiar faces | Home introduction and existing headline retained |
| [Purpose draft](https://www.are.na/block/50773028) | More free and accessible in-person gathering outside home and work | Home and About motivation |
| [Describe a meeting](https://www.are.na/block/50741233) | World Café inspiration, groups of three, name tags, rotating questions and example prompts | About meetup walkthrough; exact start/wrap-up times and unresolved grace period omitted |
| [Community expectations](https://www.are.na/block/40939844) | Relationships take practice, empathy during disagreement, hospitality | About expectations section |
| [Feedback note](https://www.are.na/block/40938656) | Feedback matters to the group | Contact invitation |

The three Instagram posts appeared at the top of the public profile. The logged-out
view did not expose pin labels; the actual post images were inspected rather than
assuming their contents from the profile thumbnails. The web reader could not
fetch the two supplied URLs, so sources were read through the browser. No login,
social interaction, comments, messages or account changes were needed.

## Editorial approach

Keep the group's conversational voice and emphasis on mutual care. Explain what a
newcomer can expect before asking them to RSVP. Use plain invitations rather than
scarcity sales language. Do not invent testimonials, attendance numbers or a new
brand story. Preserve the client's existing structure where it is supported.

The July post explains the group's history; the newer Are.na meeting draft guides
the current format. Historical weekly/Monday references are not current schedule
claims. The twice-monthly description comes from the supplied board, while each
event record supplies its actual date, time and venue. Parking and accessibility
must be checked per venue rather than promised for every gathering.

Removed unsupported reply deadlines, RSVP completion-time estimates, the claim that
chat always receives announcements first, a sample 12-month retention schedule,
the 30-day privacy response promise, and the blanket claim that service providers
never receive data. RSVP name visibility now describes both participant opt-in
and the organizer's visibility setting. No confirmation-email promises were added.

## Content and wiring handoff

- `src/content/site.js`: Home, About, Contact, Events, page metadata and a clearly
  labeled privacy draft. Existing exports/field shapes are preserved.
- `src/content/copy.js`: event/RSVP states, contact responses, empty/error states
  and existing admin microcopy. Existing field names are preserved.
- Existing page imports pick up the revised Home/About/Contact text and shared
  microcopy. No JSX, layouts, routes or settings records were changed here.
- Frontend task: consume `eventsPage` for the Events heading/introduction and past
  empty state; consume `pageMetadata` for page SEO; show
  `contactPage.responseNote`; use the confirmed `site.instagramUrl` when supplying
  the Instagram link through the existing settings flow.
- Frontend task: reconcile inline text about announcements appearing in chat first
  and the past-events empty state implying the group has never held a meetup.
  Keep the currently implemented chat link conditional on a configured URL.

## Inputs still needed before launch

The Instagram and Are.na sources establish the community copy. They do not settle
privacy retention, export/backup handling, a privacy contact, or the final hosting
provider disclosures. `privacy` remains explicitly marked as a draft; it describes
the backend behavior and does not invent a legal policy. Client review is still
needed for these decisions and for final copy/brand approval.

The actual community-chat URL, contact address, client photos and real event
records remain client inputs. Instagram is confirmed as
https://www.instagram.com/thirdplace.clt/. This content pass does not publish the
site, alter production data, add social integrations or implement email sending.
