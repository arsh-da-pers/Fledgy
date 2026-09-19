// Fledgy Mentors — the people you can book 1:1 sessions with.
//
// HOW THIS PAGE WORKS RIGHT NOW (soft launch, Sept 2026)
//
// Mentors are listed WITHOUT their names. A card shows the photo, the role,
// the areas they help with and their bio — enough to decide you want the
// session, not enough to skip Fledgy and book them directly. Every enquiry
// goes to Fledgy first (see /api/mentors) and is forwarded by hand; nothing on
// this page exposes a mentor's email address.
//
// The point is to measure demand before putting more mentors up: every enquiry
// lands in /leads-dashboard with the mentor it was meant for, so we can see
// which profiles people actually want.
//
// TO EDIT:
//  • `published: false` hides a mentor without deleting them. Only publish
//    someone who has agreed to their photo and bio being on fledgy.guide.
//  • Flip SHOW_MENTOR_NAMES to true to reveal names everywhere in one edit.
//  • Photos live in /public/mentors/.

export type Mentor = {
  id: string;
  name: string; // internal — only rendered if SHOW_MENTOR_NAMES is true
  title: string; // the public heading on the card while names are hidden
  areas: string[];
  blurb: string;
  sessionLength: string;
  price: string; // e.g. "$29"
  email?: string; // internal routing only — never rendered, never sent to the browser
  photo?: string; // e.g. "/mentors/arshkiran.jpg"
  accent: string; // avatar fallback background (used only if no photo)
  published: boolean;
};

// Where every enquiry lands. Arshkiran triages and forwards to the mentor.
export const BOOKING_EMAIL = "arshkiran@fledgy.guide";

// Names stay off the cards during the soft launch. One edit reveals them.
export const SHOW_MENTOR_NAMES = false;

// Flat launch price for a 1:1 session. Change per-mentor in the array if needed.
export const DEFAULT_PRICE = "$29";

const ALL_MENTORS: Mentor[] = [
  {
    id: "arshkiran",
    name: "Arshkiran",
    title: "Business Psychologist & Career Mentor",
    areas: ["Career direction", "University applications", "CV · LinkedIn · interviews"],
    blurb:
      "I'm a psychologist at heart — BA in Psychology, then an MSc in Business Psychology from Manchester. Over the years I've mentored 600+ students, taught, and helped people land jobs across the UK, the Gulf and beyond. I've also hired across startups and big corporates and sat in the room where the yes/no actually happens, so I know what gets a CV noticed and what quietly gets it passed over. Come to me for honest, down-to-earth help with your CV, interviews, LinkedIn, uni applications, or just figuring out your next move — and because it's all rooted in psychology, we'll get into why people (and hiring managers) really think the way they do. ✨",
    sessionLength: "30 min",
    price: "$29",
    email: "arshkiran@fledgy.guide",
    photo: "/mentors/arshkiran.jpg",
    accent: "#0f766e",
    published: true,
  },
  {
    id: "hasna",
    name: "Hasna",
    title: "Recruiter · Tech, Fintech & Crypto",
    areas: ["CV feedback", "Interview prep", "LinkedIn & job search"],
    blurb:
      "I've spent 4+ years hiring across tech, fintech, crypto and corporate roles, all over the world. I've read thousands of CVs and interviewed people from just about everywhere, so I know what actually makes someone stand out — and what quietly gets them skipped. No fluff, no gatekeeping: just real interview tips, honest CV feedback, LinkedIn help, and career advice that actually makes sense. Whether it's your first job, a career switch, or chasing your next big role, I'll help you work smarter, not harder. ✨",
    sessionLength: "30 min",
    price: "$29",
    email: "", // enquiries route to BOOKING_EMAIL until Hasna has an address
    photo: "/mentors/hasna.jpg",
    accent: "#b45309",
    published: true,
  },
  {
    id: "ajit",
    name: "Ajit",
    title: "Commercial Pilot",
    areas: ["Aviation careers", "Flight school & licenses", "Interviews & sim prep"],
    blurb:
      "I've been flying since 2015, so I've been through every stage of this — from wide-eyed cadet to the flight deck. Aviation is brutal to break into: it's long, expensive, and full of steps nobody really explains. So whether you're weighing up flight school, slogging through licenses and ratings, prepping for airline interviews and sim checks, or just wondering if the cockpit is really for you, I'll give it to you straight — what's worth your money, what it's actually like, and how to land that first seat. No sugar-coating, no gatekeeping. ✈️",
    sessionLength: "30 min",
    price: "$29",
    email: "hello@fledgy.guide",
    photo: "/mentors/ajit.jpg",
    accent: "#1d4ed8",
    published: true,
  },
];

export const MENTORS: Mentor[] = ALL_MENTORS.filter((m) => m.published);

// What the browser is allowed to see. The mentor's email never leaves the
// server, so no scraper gets a mailing list out of this page.
export type PublicMentor = Omit<Mentor, "email" | "name" | "published"> & {
  name?: string;
};

export function toPublic(m: Mentor): PublicMentor {
  const { email: _email, name, published: _published, ...rest } = m;
  return SHOW_MENTOR_NAMES ? { ...rest, name } : rest;
}

// The label used for a mentor in enquiry emails and on the leads dashboard.
// Internally this always includes the name so enquiries can be forwarded.
export function mentorById(id: string): Mentor | undefined {
  return ALL_MENTORS.find((m) => m.id === id);
}

export function mentorLabel(m: Mentor): string {
  return `${m.name} — ${m.title}`;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
