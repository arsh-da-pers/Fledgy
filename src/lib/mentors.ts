// Fledgy Mentors — the people you can book 1:1 sessions with.
//
// TO EDIT / LAUNCH:
//  • Add each mentor's `bookingUrl` (Calendly / Cal.com). While it's empty, the card
//    shows a "Request a session" button that emails hello@fledgy.guide instead — so
//    the page works today and upgrades to real calendar booking the moment you paste a link.
//  • Photos live in /public/mentors/. Update the `photo` path if you rename the files.
//  • Price is shown on each card ($29 launch price). Payment is collected at booking
//    (via Calendly) or through a payment provider once that's wired up.

export type Mentor = {
  id: string;
  name: string;
  title: string;
  areas: string[];
  blurb: string;
  sessionLength: string;
  price: string; // e.g. "$29"
  email?: string; // where "Request a session" is sent; falls back to BOOKING_EMAIL if empty
  bookingUrl?: string; // Calendly / Cal.com link — leave empty until ready
  photo?: string; // e.g. "/mentors/arshkiran.jpg"
  accent: string; // avatar fallback background (used only if no photo)
};

// Email used for the "Request a session" fallback when bookingUrl is not set.
export const BOOKING_EMAIL = "hello@fledgy.guide";

// Flat launch price for a 1:1 session. Change per-mentor in the array if needed.
export const DEFAULT_PRICE = "$29";

const PENDING_MENTORS: Mentor[] = [
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
    bookingUrl: "",
    photo: "/mentors/arshkiran.jpg",
    accent: "#0f766e",
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
    email: "", // TODO: add Hasna's email (provided tomorrow); falls back to hello@fledgy.guide until then
    bookingUrl: "",
    photo: "/mentors/hasna.jpg",
    accent: "#b45309",
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
    email: "ajitkahlon@gmail.com",
    bookingUrl: "",
    photo: "/mentors/ajit.jpg",
    accent: "#1d4ed8",
  },
];

// ---------------------------------------------------------------------------
// NOT YET PUBLIC.
//
// The three profiles above are finished but held back until each person has
// agreed to their name, photo and bio appearing on fledgy.guide. Hasna and
// Ajit had not confirmed as of 2026-09-05, and publishing someone's likeness
// without that is not ours to decide.
//
// TO PUBLISH: move the people who HAVE agreed into MENTORS below, and restore
// their photos, which were removed from the deploy so they aren't fetchable at
// a guessable URL:  git checkout a1e6855 -- public/mentors/
// Before you
// do, also fix the two things that are wrong for launch —
//   • hasna.email is empty, so her requests fall back to hello@fledgy.guide,
//     which is Ajit's mailbox
//   • ajit.email is a personal Gmail sitting in a public mailto on a page
//     that is in the sitemap; give him an @fledgy.guide address
// ---------------------------------------------------------------------------
export const MENTORS: Mentor[] = [];

// Referenced so the held-back profiles don't trip the unused-variable lint.
export const PENDING_MENTOR_COUNT = PENDING_MENTORS.length;

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
