// The half of the mentor model that is safe in a browser bundle.
//
// This file exists so no client component ever imports "@/lib/mentors", which
// holds the mentors' real names and email addresses. Importing that module
// from the client would pull those strings into the JavaScript bundle — where
// anyone can read them — no matter that the page never renders them. Types and
// tiny helpers live here; the data stays server-side.

export type PublicMentor = {
  id: string;
  name?: string; // present only when SHOW_MENTOR_NAMES is on
  title: string;
  areas: string[];
  blurb: string;
  sessionLength: string;
  price: string; // always resolved before it reaches the browser
  photo?: string;
  accent: string;
};

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
