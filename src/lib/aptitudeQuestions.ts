// Original aptitude questions written for Fledgy (not sourced from any
// copyrighted test). SERVER-ONLY — this file must never be imported by a
// "use client" component, since correctIndex would end up in the browser
// bundle. The /api/careers/questions route strips answers before sending
// questions to the client; /api/careers uses this file to score submitted
// answers.

export type AptitudeCategory = "logical" | "numerical" | "verbal";

export type AptitudeQuestion = {
  id: number;
  category: AptitudeCategory;
  text: string;
  options: string[];
  correctIndex: number;
};

export const APTITUDE_QUESTIONS: AptitudeQuestion[] = [
  // Logical reasoning
  {
    id: 1,
    category: "logical",
    text: "What comes next in the sequence: 2, 6, 12, 20, 30, ?",
    options: ["36", "38", "40", "42"],
    correctIndex: 3,
  },
  {
    id: 2,
    category: "logical",
    text: "All Zips are Bloops. Some Bloops are Traps. Which of these must be true?",
    options: ["All Zips are Traps", "Some Zips may be Traps", "No Zips are Traps", "All Traps are Zips"],
    correctIndex: 1,
  },
  {
    id: 3,
    category: "logical",
    text: "If FRIEND is coded as HTKGPF (each letter shifted forward by 2), what is the code for CANDY?",
    options: ["ECPFA", "EDPFA", "DBOEZ", "ECPGB"],
    correctIndex: 0,
  },
  {
    id: 4,
    category: "logical",
    text: "A cube is painted red on all faces, then cut into 27 equal smaller cubes. How many small cubes have exactly 2 painted faces?",
    options: ["4", "6", "8", "12"],
    correctIndex: 3,
  },
  // Numerical reasoning
  {
    id: 5,
    category: "numerical",
    text: "A $150 item gets a 20% discount, then an extra 10% off the discounted price. What's the final price?",
    options: ["$105", "$108", "$112", "$120"],
    correctIndex: 1,
  },
  {
    id: 6,
    category: "numerical",
    text: "3 workers can build a wall in 12 days. Working at the same rate, how many days will 4 workers take?",
    options: ["8", "9", "10", "16"],
    correctIndex: 1,
  },
  {
    id: 7,
    category: "numerical",
    text: "What number should replace the question mark: 5, 11, 23, 47, ?",
    options: ["90", "94", "95", "96"],
    correctIndex: 2,
  },
  {
    id: 8,
    category: "numerical",
    text: "A train travels 60 km in 45 minutes. At the same speed, how far does it travel in 2 hours?",
    options: ["120 km", "150 km", "160 km", "180 km"],
    correctIndex: 2,
  },
  // Verbal reasoning
  {
    id: 9,
    category: "verbal",
    text: "Choose the word that is most nearly OPPOSITE in meaning to \"Reluctant\":",
    options: ["Hesitant", "Timid", "Eager", "Uncertain"],
    correctIndex: 2,
  },
  {
    id: 10,
    category: "verbal",
    text: "\"The scientist's theory was so ______ that even her critics found it hard to dismiss.\"",
    options: ["arbitrary", "compelling", "vague", "trivial"],
    correctIndex: 1,
  },
  {
    id: 11,
    category: "verbal",
    text: "Which word does NOT belong with the others?",
    options: ["Sprint", "Jog", "Walk", "Shout"],
    correctIndex: 3,
  },
  {
    id: 12,
    category: "verbal",
    text: "PEN is to WRITE as KNIFE is to:",
    options: ["Cut", "Sharp", "Kitchen", "Metal"],
    correctIndex: 0,
  },
];

export type AptitudeScore = {
  overall: number;
  byCategory: Record<AptitudeCategory, number>;
};

// answers: map of question id -> selected option index.
export function scoreAptitude(answers: Record<number, number>): AptitudeScore {
  const correctByCategory: Record<AptitudeCategory, number> = { logical: 0, numerical: 0, verbal: 0 };
  const totalByCategory: Record<AptitudeCategory, number> = { logical: 0, numerical: 0, verbal: 0 };
  let correct = 0;

  for (const q of APTITUDE_QUESTIONS) {
    totalByCategory[q.category] += 1;
    if (answers[q.id] === q.correctIndex) {
      correct += 1;
      correctByCategory[q.category] += 1;
    }
  }

  const pct = (c: number, t: number) => (t > 0 ? Math.round((c / t) * 100) : 0);

  return {
    overall: pct(correct, APTITUDE_QUESTIONS.length),
    byCategory: {
      logical: pct(correctByCategory.logical, totalByCategory.logical),
      numerical: pct(correctByCategory.numerical, totalByCategory.numerical),
      verbal: pct(correctByCategory.verbal, totalByCategory.verbal),
    },
  };
}

// Client-safe version of the question bank (answers stripped).
export function publicQuestions() {
  return APTITUDE_QUESTIONS.map(({ id, category, text, options }) => ({
    id,
    category,
    text,
    options,
  }));
}
