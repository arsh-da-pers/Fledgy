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
  bookingUrl?: string; // Calendly / Cal.com link — leave empty until ready
  photo?: string; // e.g. "/mentors/arshkiran.jpg"
  accent: string; // avatar fallback background (used only if no photo)
};

// Email used for the "Request a session" fallback when bookingUrl is not set.
export const BOOKING_EMAIL = "hello@fledgy.guide";

// Flat launch price for a 1:1 session. Change per-mentor in the array if needed.
export const DEFAULT_PRICE = "$29";

export const MENTORS: Mentor[] = [
  {
    id: "arshkiran",
    name: "Arshkiran",
    title: "Business Psychologist & Career Mentor",
    areas: ["Career direction", "University applications", "CV · LinkedIn · interviews"],
    blurb:
      "A psychologist at heart — BA in Psychology, then an MSc in Business Psychology from Manchester. I've mentored 600+ students, taught, and helped people land jobs across the UAE, Saudi, Qatar and Bahrain. I've hired across startups and big corporates and sat in the room where the yes/no gets decided — so I know what gets a CV shortlisted and what quietly gets people passed over. Warm, honest guidance on your CV, interviews, LinkedIn, university applications and career direction — all rooted in the why behind how people (and hiring managers) actually think. ✨",
    sessionLength: "30 min",
    price: "$29",
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
      "I've spent 4+ years hiring across tech, fintech, crypto and corporate roles — globally. I've read thousands of CVs and interviewed people from all over the world, so I know what actually gets someone noticed (and what gets them skipped). No fluff, no gatekeeping — just honest interview tips, CV feedback, LinkedIn help and career guidance that makes sense. First job, career switch, or chasing your next big role, I'll help you work smarter, not harder. ✨",
    sessionLength: "30 min",
    price: "$29",
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
      "A commercial pilot flying since 2015 — I've lived every stage of this career, from cadet to the cockpit. Aviation is one of the toughest industries to break into: the training path is long, expensive, and full of steps nobody explains clearly. Whether you're figuring out flight school, working through your licenses and ratings, prepping for airline interviews and sim assessments, or just wondering if a career in the skies is right for you, I'll give you the honest insider view — what's worth your money, what the process is actually like, and how to land that first seat. No sugar-coating, no gatekeeping. ✈️",
    sessionLength: "30 min",
    price: "$29",
    bookingUrl: "",
    photo: "/mentors/ajit.jpg",
    accent: "#1d4ed8",
  },
];

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
