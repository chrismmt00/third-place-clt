// Shared microcopy, revised against the group's own voice and implemented behavior.
// See docs/COPY_SOURCES.md for source notes and remaining client policy decisions.

export const copy = {
  badge: {
    open: "RSVP open",
    spots: (n) => `${n} spot${n === 1 ? "" : "s"} left`,
    full: "Full",
    closed: "RSVP closed",
    cancelled: "Cancelled",
    draft: "Draft",
    published: "Published",
    going: "Going",
    rsvpCancelled: "Cancelled",
    new: "New",
    read: "Read",
    archived: "Archived",
  },

  nav: { cta: "See Events" },
  home: { cta: "See upcoming events" },
  chat: { defaultLabel: "Join the community chat" },
  card: { link: "View details" },
  detail: {
    back: "All events",
    directions: "Get directions",
    spots: (n) => `${n} spot${n === 1 ? "" : "s"} available. We'd love to see you.`,
    fullTitle: "This one's full.",
    fullBody: (cap) =>
      `All ${cap} spots are taken. Plans change, so check back closer to the day in case a spot opens up.`,
    deadlineTitle: (date) => `RSVPs closed ${date}.`,
    deadlineBody: (email) => (email ? `Questions? Email ${email}.` : "Keep an eye on our events page for the next one."),
    noRsvpTitle: "No RSVP needed.",
    noRsvpBody: "Just show up. Everyone's welcome, and you can come and go as you like.",
    startedTitle: "Happening now.",
    startedBody: (end) => `RSVPs closed when the event started. It runs until ${end}.`,
    startedBodyNoRsvp: (end) => `Just show up. It runs until ${end}.`,
    endedTitle: "This event has wrapped up.",
    endedBody: "Thanks to everyone who came. See what's coming up next.",
    cancelledBanner: "This event has been cancelled.",
    cancelledBannerBody: "Sorry for the change of plans. RSVPs are closed. See what else is coming up below.",
    cancelledTitle: "RSVPs are closed.",
    cancelledBody: "If you'd RSVP'd, there's nothing you need to do.",
    otherEvents: "See other events",
    upcoming: "See upcoming events",
  },

  rsvp: {
    submit: "Save my spot",
    submitting: "Saving your spot…",
    subline: "Free to join. Let us know you're coming.",
    success: "You're on the list!",
    successLine: (first, guests) =>
      `Thanks, ${first}. Your spot is saved${guests ? ` for you + ${guests} guest${guests > 1 ? "s" : ""}` : ""}.`,
    duplicate: "You're already on the list for this event.",
    filled: "This event just filled up.",
    limited: "Too many tries in a row.",
    limitedBody: "Please wait a few minutes, then try again.",
    consent: "It's OK for Third Place CLT to keep my RSVP details to run this event.",
    emailHelp: "For the organizers. Your email won't appear on the public attendee list.",
    phoneHelp: "For the organizers. Your number won't appear on the event page.",
    guestHelp: (max) => `Up to ${max} guest${max === 1 ? "" : "s"}. Just you is fine too.`,
    noteHelp: "Accessibility needs, dietary notes, questions.",
    showName: "Show my name on the attendee list",
    showNameHelp: "If the organizer enables the list, it can show your first name and last initial, like “Maya R.”",
    previewNote: "The form is shown but can't be submitted in preview.",
  },

  contact: {
    submit: "Send message",
    submitting: "Sending…",
    successTitle: "Thanks, we got your message.",
    successReplyTime: "Your note is with the organizers. Replies can take time; thank you for your patience.",
    limited: "That's a lot of messages in a short time.",
    limitedBody: (email) => email ? `Please wait a few minutes and try again, or email ${email}.` : "Please wait a few minutes and try again.",
    again: "Send another message",
    consent: "It's OK for Third Place CLT to keep my message so we can reply.",
  },

  err: {
    name: "Please enter your name.",
    firstName: "Please enter your first name.",
    lastName: "Please enter your last name.",
    subject: "Please add a subject.",
    contactConsent: "Please check this box so we can keep your message and reply.",
    email: "Enter an email like name@example.com.",
    consent: "Please check this box so we can save your RSVP.",
    message: "Please write a message.",
    summary: (n) => `Please fix ${n} ${n === 1 ? "thing" : "things"} below`,
    url: "Paste the full link, starting with https://",
    end: "End must be after start.",
    start: "Pick a start date and time.",
    capacity: (n) => `Capacity can't be below the current headcount (${n}).`,
    title: "Give your event a title.",
    slug: "Use lowercase letters, numbers and dashes.",
    slugTaken: "Another event already uses this web address.",
    summaryLength: (n) => `Keep it under 200 characters (${n}/200).`,
    location: "Add where this is happening.",
    address: "Add the street address.",
    alt: "Describe the photo for people using screen readers.",
    deadline: "The RSVP deadline must be no later than the event's start time.",
  },

  empty: {
    home: "Nothing on the calendar just yet.",
    homeBody: "Check back here for the next meetup. We'd love to have you along.",
    events: "No upcoming events right now.",
    eventsBody: "Check back for the next meetup, including where we're gathering and how to join.",
    past: "No past meetups listed here yet.",
    attendees: "No one has shared their name yet.",
    adminNew: "Let's add your first event.",
    rsvps: "No RSVPs yet",
    messages: "You're all caught up",
    drafts: "No drafts right now",
  },

  confirm: {
    delete: (title) => `Delete “${title}”?`,
    cancel: "Cancel this event?",
    leave: "Leave without saving?",
    rsvpDelete: (name) => `Delete ${name}'s RSVP?`,
    rsvpCancel: (name) => `Cancel ${name}'s RSVP?`,
    removeUser: (name) => `Remove ${name}?`,
  },

  users: {
    lastOwner: "There must always be at least one owner, so the last owner can't be removed.",
  },

  toast: {
    published: ["Event published.", "It's live on the site."],
    draft: ["Draft saved.", "Only staff can see it."],
    saved: ["Changes saved.", "They're live on the site."],
    saveFail: ["Couldn't save.", "Check your connection and try again."],
  },

  settings: { saved: "Settings saved. Changes are live on the site." },

  auth: {
    invalid: "Invalid email or password.",
    locked: "Too many attempts.",
    lockedBody: "Sign-in is paused for 15 minutes. Ask an owner if you need your password reset.",
    passwordLength: "Use at least 12 characters.",
    passwordMatch: "The two passwords don't match.",
    wrongCurrent: "That's not your current password.",
  },

  preview: { banner: "Draft preview.", bannerBody: "Only signed-in staff can see this page. The public can't see it yet." },

  notFound: {
    title: "We couldn't find that page.",
    body: "It may have moved, or the link might have a typo.",
    bodyLong: "The link may be out of date, or the page may no longer be available. Visit Events to find a meetup.",
  },
  error: {
    title: "Something went wrong on our end.",
    body: (email) => email ? `Please give it a moment and try again. If it keeps happening, email ${email}.` : "Please give it a moment and try again. You can also return to the home page.",
  },

  upload: {
    type: "That file type won't work.",
    size: "That photo is too big.",
  },
};
