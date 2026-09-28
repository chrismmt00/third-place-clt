// Adapted from Third Place's Instagram introductions and Are.na website drafts.
// Source links, editorial choices and frontend wiring notes: docs/COPY_SOURCES.md.
// Privacy policy decisions and client photos still require client review.

export const site = {
  tagline: "An open-invite conversation café in Charlotte. Chat with new faces & catch up with the familiar.",
  chatLabel: "Join the community chat",
  instagramUrl: "https://www.instagram.com/thirdplace.clt/",
  description:
    "Meet new people in Charlotte through Third Place's free conversation meetups. An open invitation to slow down, listen and spend time together.",
};

export const home = {
  eyebrow: "A conversation café in Charlotte",
  headline: "Chat with new faces & catch up with the familiar.",
  intro:
    "We're an open-invite community group in Charlotte, getting together twice a month to talk, listen and get to know each other. No membership or fee. Bring yourself and a little curiosity.",
  whatTitle: "What's a third place?",
  what:
    "Home is one place. Work is another. A third place gives us somewhere else to spend time together, without needing to buy something or have a reason to be there. This is our way of making more room for that in Charlotte.",
  mission:
    "Conversation brings us together. Mutual care is what we practice: listening, making room for different people and offering what we can.",
  howLink: "How a meetup works",
  chatTitle: "Keep the conversation going",
  chatBody: "Stay in touch between meetups, share a thought and hear what the community is up to.",
};

export const about = {
  eyebrow: "About us",
  headline: "A portal to communal connectivity.",
  intro: [
    "Third Place began with a small group of friends meeting to talk and support one another. It grew into an invitation to make those kinds of connections with more people around Charlotte.",
    "Today, our conversation café takes inspiration from the World Café method: small groups, shared questions and a chance to meet someone new. Think platonic speed dating, with room to listen as well as talk.",
  ],
  definitionTitle: "A third place is somewhere that isn't home and isn't work.",
  definition: [
    "Think of the places people gather outside their everyday responsibilities: a park, a library or a familiar neighborhood meeting spot. Somewhere to linger, talk and feel part of life around you.",
    "So much of our social life happens through a screen. We're making a little more space for it to happen face to face, with people we might not otherwise meet.",
  ],
  valuesTitle: "What we care about",
  values: [
    ["01", "Mutual care", "We each bring different skills, energy and responsibilities. Care starts with respecting that."],
    ["02", "Neutral ground", "Nobody is obligated to participate. Come and go as you please."],
    ["03", "A warm welcome", "New here? You don't need to know anyone already. Help the next person feel welcome, too."],
    ["04", "Conversation first", "Ask questions, listen closely and leave room for someone else's experience."],
  ],
  meetupTitle: "What a meetup looks like",
  meetupSteps: [
    ["Sign in", "When you arrive, fill out the sign-in sheet and grab a name tag and a number: one, two or three."],
    ["Settle in", "Chairs are set up in groups of three, arranged in one big circle. We chat as a whole group until everyone arrives."],
    ["Talk it through", "A question goes up on the whiteboard, with an optional second one. Everyone in your group gets a chance to answer and respond."],
    ["Rotate", "Every 15 minutes, twos move one group clockwise and threes move one group counterclockwise. New questions go up. Repeat."],
  ],
  meetupNotes: [
    "Check the event page for the time and location. Arriving for the start and staying through the discussion helps keep the groups together, but you're free to leave when you need to.",
    "Organizers are around to help with rotations and make sure everyone is included.",
    "Food and drink depend on the space. Check the event page, and please clear your own trash.",
    "Check the event's parking and access information before you travel. If you need more detail, get in touch with the organizers.",
  ],
  questionsTitle: "Questions we've asked",
  questionsIntro: "Each meetup mixes nostalgic, fun, informative, challenging, silly and emotional questions. A few favorites:",
  questions: [
    "What's something you love that you wouldn't recommend to others?",
    "What's a piece of common advice that you disagree with?",
    "What thing, trend or practice from the past should we bring back?",
    "What are you having to relearn?",
  ],
  imperfectTitle: "Community isn't meant to be perfect",
  imperfect: [
    "Getting to know people takes time. We won't always agree or get everything right, and relationships will change as the group grows. We're here to keep practicing.",
    "That means meeting awkward moments with empathy, talking through differences with care and remembering that there's a person on the other side of the conversation.",
    "We'll do our best to help you feel welcome and comfortable being yourself. We ask everyone who joins us to offer that same hospitality to others.",
  ],
};

export const contactPage = {
  headline: "Say hello",
  intro: "Curious about coming along? Have a question, an idea or something to share after a meetup? We'd like to hear it. Your feedback helps us care for this community.",
  responseNote: "This is a project we care about alongside work and everyday life. Replies can take time; thank you for your patience.",
};

export const eventsPage = {
  headline: "Come spend some time together.",
  intro: "Find the next Third Place meetup in Charlotte. Come on your own or with a friend, meet a few new people and see where the conversation goes.",
  detailsNote: "Each event page has the time, location and RSVP details. Check there before heading over.",
  pastIntro: "A look back at meetups shared on this site.",
  pastEmpty: "There aren't any past meetups listed here yet. Take a look at what's coming up.",
};

// Ready for the frontend task to consume without changing page structure here.
export const pageMetadata = {
  home: { title: "Third Place CLT | Conversation & community in Charlotte", description: site.description },
  about: { title: "About Third Place", description: "Get to know Third Place, a Charlotte community built around conversation and mutual care. Find out what to expect at a meetup." },
  events: { title: "Meetups in Charlotte", description: "Find upcoming Third Place conversation meetups in Charlotte, with times, locations and RSVP details. New faces are welcome." },
  contact: { title: "Contact Third Place", description: "Ask a question, share an idea or tell the Third Place organizers how a meetup felt. We'd like to hear from you." },
  privacy: { title: "Privacy", description: "How RSVP details, contact messages and optional attendee names are handled on the Third Place website." },
};

export const privacy = {
  updated: "Draft for client review — September 28, 2026",
  lede: "Here's how this website handles the details you share when you RSVP or send a message. The retention policy still needs to be finalized before launch.",
  sections: [
    [
      "What we collect",
      "An RSVP records your name, email, guest count, any optional note, and a phone number if that event collects one. It also records your consent and whether you choose to share your name publicly. The contact form records your name, email, subject and message.",
    ],
    [
      "How we use it",
      "Organizers use RSVPs to manage attendance and guest numbers. Messages sent through the contact form go to the organizers' inbox on this site. Submitting either form does not subscribe you to a mailing list or send an automatic confirmation email.",
    ],
    [
      "Who can see it",
      "Authorized organizers can view RSVP details and export attendee lists. Your email, phone number, note and full last name are not displayed publicly. If you opt in and the organizer enables the attendee list, your first name and last initial can appear on that event page. An event may also display its total headcount, including guests.",
    ],
    [
      "Services that help the site work",
      "Hosting and database services process the information needed to operate the site. Cloudflare Turnstile checks form submissions for spam. To limit repeated submissions, the site stores a protected identifier derived from an IP address rather than the raw address in its rate-limit records.",
    ],
    [
      "How long we keep it",
      // This is an unresolved client policy, not an implemented automatic deletion schedule.
      "The organizers are finalizing how long RSVP details, contact messages, exports and backups will be kept. A confirmed retention policy will be added before launch.",
    ],
    ["Your choices", "Sharing your name on an attendee list is optional. Contact the organizers if you want to ask about your information, correct it or request its deletion."],
    ["Questions", "Use the Contact page to reach the organizers about privacy or your information."],
  ],
};
