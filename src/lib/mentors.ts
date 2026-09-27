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
//  • Photos live in /public/mentors/ and are named m1/m2/m3 ON PURPOSE. A file
//    called hasna.jpg hands out the name this page is built to withhold —
//    it shows up in the <img src>, in Next's preload <link>, and in View
//    Source. Same reason the `id` is m2 and not "hasna": it is serialised into
//    the page so the form can post it. Keep both opaque; the mapping from an
//    id to a real person stays in this file, server-side.

import { MENTOR_PRICE } from "@/lib/products";
import type { PublicMentor } from "@/lib/mentorsPublic";

export type Mentor = {
  id: string;
  name?: string; // internal — only rendered if SHOW_MENTOR_NAMES is true. Optional:
  // a mentor can be listed with no name held in the codebase at all.
  title: string; // the public heading on the card while names are hidden
  areas: string[];
  blurb: string;
  sessionLength: string;
  price?: string; // per-mentor override; otherwise the site-wide MENTOR_PRICE
  email?: string; // internal routing only — never rendered, never sent to the browser
  photo?: string; // e.g. "/mentors/m1.jpg" — keep the filename opaque
  accent: string; // avatar fallback background (used only if no photo)
  published: boolean;
};

// Where every enquiry lands. Arshkiran triages and forwards to the mentor.
export const BOOKING_EMAIL = "arshkiran@fledgy.guide";

// Names stay off the cards during the soft launch. One edit reveals them.
export const SHOW_MENTOR_NAMES = false;

// The price shown on every card. It is NOT written here — it comes from
// products.ts, where the ladder lives and where the rule that a mentor session
// stays the dearest thing on the site is enforced. Set `price` on a mentor only
// to override them individually.
export const DEFAULT_PRICE = MENTOR_PRICE;

const ALL_MENTORS: Mentor[] = [
  {
    id: "m1",
    name: "Arshkiran",
    title: "Business Psychologist & Career Mentor",
    areas: ["Career direction", "University applications", "CV · LinkedIn · interviews"],
    blurb:
      "I'm a psychologist at heart — BA in Psychology, then an MSc in Business Psychology from Manchester. Over the years I've mentored 600+ students, taught, and helped people land jobs across the UK, the Gulf and beyond. I've also hired across startups and big corporates and sat in the room where the yes/no actually happens, so I know what gets a CV noticed and what quietly gets it passed over. Come to me for honest, down-to-earth help with your CV, interviews, LinkedIn, uni applications, or just figuring out your next move — and because it's all rooted in psychology, we'll get into why people (and hiring managers) really think the way they do. ✨",
    sessionLength: "30 min",
    email: "arshkiran@fledgy.guide",
    photo: "/mentors/m1.jpg",
    accent: "#0f766e",
    published: true,
  },
  {
    id: "m2",
    name: "Hasna",
    title: "Recruiter · Tech, Fintech & Crypto",
    areas: ["CV feedback", "Interview prep", "LinkedIn & job search"],
    blurb:
      "I've spent 4+ years hiring across tech, fintech, crypto and corporate roles, all over the world. I've read thousands of CVs and interviewed people from just about everywhere, so I know what actually makes someone stand out — and what quietly gets them skipped. No fluff, no gatekeeping: just real interview tips, honest CV feedback, LinkedIn help, and career advice that actually makes sense. Whether it's your first job, a career switch, or chasing your next big role, I'll help you work smarter, not harder. ✨",
    sessionLength: "30 min",
    email: "", // enquiries route to BOOKING_EMAIL until Hasna has an address
    photo: "/mentors/m2.jpg",
    accent: "#b45309",
    published: true,
  },
  {
    id: "m3",
    name: "Ajit",
    title: "Commercial Pilot",
    areas: ["Aviation careers", "Flight school & licenses", "Interviews & sim prep"],
    blurb:
      "I've been flying since 2015, so I've been through every stage of this — from wide-eyed cadet to the flight deck. Aviation is brutal to break into: it's long, expensive, and full of steps nobody really explains. So whether you're weighing up flight school, slogging through licenses and ratings, prepping for airline interviews and sim checks, or just wondering if the cockpit is really for you, I'll give it to you straight — what's worth your money, what it's actually like, and how to land that first seat. No sugar-coating, no gatekeeping. ✈️",
    sessionLength: "30 min",
    email: "hello@fledgy.guide",
    photo: "/mentors/m3.jpg",
    accent: "#1d4ed8",
    published: true,
  },
  {
    id: "m4",
    title: "Marketing Manager · Premium Fashion",
    areas: ["Marketing careers", "Brand, copy & tone of voice", "Non-linear career paths"],
    blurb:
      "I started working at 18, and 15 years later my career has been through retail, consulting, research, teaching, hospitality and now fashion. Not a conventional path — but it's exactly what shaped how I approach marketing: understand people, figure things out fast, and remember there's rarely only one way to get somewhere. Today I'm a Trade & Partner Marketing Manager for international premium fashion brands across Europe and Asia, sitting somewhere between brand gatekeeper and growth partner. I've built copy and tone-of-voice systems from scratch, run influencer and activation strategy without fancy analytics tools, and learned what makes communication land instead of getting ignored. Less jargon, more what actually works and why. Come to me to work out where you fit in marketing, or how to navigate a career that isn't a straight line. ✨",
    sessionLength: "30 min",
    email: "", // no address yet — enquiries fall back to BOOKING_EMAIL, which is fine
    photo: "/mentors/m4.jpg", // TODO: drop the file in at EXACTLY this path
    accent: "#9d174d",
    published: true,
  },
];

export const MENTORS: Mentor[] = ALL_MENTORS.filter((m) => m.published);

export function priceOf(m: Mentor): string {
  return m.price || DEFAULT_PRICE;
}

// What the browser is allowed to see: the shape in mentorsPublic.ts, and
// nothing else. The name and email never leave the server, so no scraper gets
// a mailing list — or a way around Fledgy — out of this page.
// Written as an allow-list, not as "everything except email and name": a field
// added to Mentor later (a phone number, a rate, a calendar link) then stays
// server-side by default instead of leaking the moment someone adds it.
export function toPublic(m: Mentor): PublicMentor {
  const pub: PublicMentor = {
    id: m.id,
    title: m.title,
    areas: m.areas,
    blurb: m.blurb,
    sessionLength: m.sessionLength,
    price: priceOf(m),
    photo: m.photo,
    accent: m.accent,
  };
  return SHOW_MENTOR_NAMES ? { ...pub, name: m.name } : pub;
}

// The label used for a mentor in enquiry emails and on the leads dashboard.
// Internally this always includes the name so enquiries can be forwarded.
export function mentorById(id: string): Mentor | undefined {
  return ALL_MENTORS.find((m) => m.id === id);
}

// How a mentor is named in enquiry emails and on the leads dashboard. Falls
// back to the role when no name is stored — the titles are distinct, so an
// enquiry is still unambiguous without one.
export function mentorLabel(m: Mentor): string {
  return m.name ? `${m.name} — ${m.title}` : m.title;
}
