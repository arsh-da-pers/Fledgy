// The Mini-IPIP: a validated, public-domain 20-item short form of the Big
// Five personality dimensions (Donnellan, Oswald, Baird, & Lucas, 2006),
// built from the International Personality Item Pool (ipip.ori.org).
// IPIP items are explicitly public domain — no license or permission
// needed. Scoring key: https://ipip.ori.org/MiniIPIPKey.htm
//
// This is safe to import into client components: nothing here is a
// "correct answer" to hide, it's a self-report inventory.

export type Trait = "extraversion" | "agreeableness" | "conscientiousness" | "neuroticism" | "openness";

export type PersonalityItem = {
  id: number;
  text: string;
  trait: Trait;
  keyed: "+" | "-";
};

export const PERSONALITY_ITEMS: PersonalityItem[] = [
  { id: 1, text: "Am the life of the party.", trait: "extraversion", keyed: "+" },
  { id: 2, text: "Don't talk a lot.", trait: "extraversion", keyed: "-" },
  { id: 3, text: "Talk to a lot of different people at parties.", trait: "extraversion", keyed: "+" },
  { id: 4, text: "Keep in the background.", trait: "extraversion", keyed: "-" },

  { id: 5, text: "Sympathize with others' feelings.", trait: "agreeableness", keyed: "+" },
  { id: 6, text: "Am not interested in other people's problems.", trait: "agreeableness", keyed: "-" },
  { id: 7, text: "Feel others' emotions.", trait: "agreeableness", keyed: "+" },
  { id: 8, text: "Am not really interested in others.", trait: "agreeableness", keyed: "-" },

  { id: 9, text: "Get chores done right away.", trait: "conscientiousness", keyed: "+" },
  { id: 10, text: "Often forget to put things back in their proper place.", trait: "conscientiousness", keyed: "-" },
  { id: 11, text: "Like order.", trait: "conscientiousness", keyed: "+" },
  { id: 12, text: "Make a mess of things.", trait: "conscientiousness", keyed: "-" },

  { id: 13, text: "Have frequent mood swings.", trait: "neuroticism", keyed: "+" },
  { id: 14, text: "Am relaxed most of the time.", trait: "neuroticism", keyed: "-" },
  { id: 15, text: "Get upset easily.", trait: "neuroticism", keyed: "+" },
  { id: 16, text: "Seldom feel blue.", trait: "neuroticism", keyed: "-" },

  { id: 17, text: "Have a vivid imagination.", trait: "openness", keyed: "+" },
  { id: 18, text: "Am not interested in abstract ideas.", trait: "openness", keyed: "-" },
  { id: 19, text: "Have difficulty understanding abstract ideas.", trait: "openness", keyed: "-" },
  { id: 20, text: "Do not have a good imagination.", trait: "openness", keyed: "-" },
];

export const TRAIT_LABELS: Record<Trait, string> = {
  extraversion: "Extraversion",
  agreeableness: "Agreeableness",
  conscientiousness: "Conscientiousness",
  neuroticism: "Emotional sensitivity",
  openness: "Openness & imagination",
};

// answers: map of item id -> response on a 1 (Very Inaccurate) to 5 (Very
// Accurate) scale. Returns each trait as a 0-100 score.
export function scorePersonality(answers: Record<number, number>): Record<Trait, number> {
  const sums: Record<Trait, number[]> = {
    extraversion: [],
    agreeableness: [],
    conscientiousness: [],
    neuroticism: [],
    openness: [],
  };

  for (const item of PERSONALITY_ITEMS) {
    const raw = answers[item.id];
    if (typeof raw !== "number" || raw < 1 || raw > 5) continue;
    const scored = item.keyed === "+" ? raw : 6 - raw;
    sums[item.trait].push(scored);
  }

  const result = {} as Record<Trait, number>;
  for (const trait of Object.keys(sums) as Trait[]) {
    const values = sums[trait];
    const mean = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 3;
    result[trait] = Math.round(((mean - 1) / 4) * 100);
  }
  return result;
}
