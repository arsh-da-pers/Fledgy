import type { Post } from "@/lib/blog";

// Add new posts to the top of this array. Each post needs a unique `slug`.
export const posts: Post[] = [
  {
    slug: "how-to-write-a-cover-letter-that-gets-read",
    title: "How to Write a Cover Letter That Actually Gets Read",
    description:
      "A practical guide to writing a cover letter that recruiters actually read — structure, what to include, what to cut, and the mistakes that get you filtered out.",
    date: "2026-08-02",
    excerpt:
      "Most cover letters get skimmed for ten seconds, if that. Here's how to write one that earns the read — whether you're a new graduate, a career changer, or a seasoned professional.",
    tags: ["cover letter", "job applications", "careers"],
    body: [
      {
        type: "p",
        text: "A cover letter is the one part of your application where you get to speak directly to a human. Done well, it turns a stack of qualifications into a person a recruiter wants to meet. Done badly — or worse, copied and pasted — it does nothing at all. This guide covers what to write, what to cut, and how to make sure yours earns the ten seconds it gets.",
      },
      { type: "h2", text: "Do you even need one?" },
      {
        type: "p",
        text: "Not every application asks for a cover letter, and a generic one is worse than none. But when a role is competitive, a specific, well-aimed letter is often the tiebreaker between two similar CVs. If you're going to write one, write one that could only have been sent to this employer for this job.",
      },
      { type: "h2", text: "A structure that works" },
      {
        type: "ul",
        items: [
          "**The opening** — skip \"I am writing to apply for.\" Lead with why this specific role or company genuinely interests you, in one concrete sentence.",
          "**The proof** — pick two or three achievements that map directly to what the job needs, and show the result, not just the task.",
          "**The fit** — connect what you've done to what they're trying to do. Show you understand the role beyond its title.",
          "**The close** — a short, confident sign-off that invites the next step, without begging for it.",
        ],
      },
      { type: "h2", text: "Match the letter to the job description" },
      {
        type: "p",
        text: "Read the posting and note the words it repeats — the skills, tools, and outcomes it keeps coming back to. Those are the recruiter's priorities. Your letter should echo them honestly, backed by real examples. This isn't keyword-stuffing; it's answering the question they actually asked.",
      },
      { type: "h2", text: "Show results, not adjectives" },
      {
        type: "p",
        text: "Anyone can call themselves \"hard-working\" and \"detail-oriented.\" Recruiters have read those words a thousand times and they mean nothing. Replace them with evidence: what you did, and what changed because you did it. \"Detail-oriented\" is a claim; \"cut reporting errors to near zero over a quarter\" is proof.",
      },
      { type: "h2", text: "Common mistakes that get you filtered out" },
      {
        type: "ul",
        items: [
          "Reusing one letter for every application and forgetting to change the company name.",
          "Summarising your whole CV instead of choosing the few points that matter here.",
          "Writing three dense paragraphs no one will read — keep it under a page, ideally well under.",
          "Making it all about what you want, instead of what you'd bring.",
          "Addressing it to \"To Whom It May Concern\" when a two-minute search would find a name.",
        ],
      },
      { type: "h2", text: "Pair it with a CV that backs it up" },
      {
        type: "p",
        text: "A great cover letter opens the door, but the recruiter's next click is your CV — and if that doesn't deliver, the letter was wasted. Fledgy's [free CV scorer](/cv) rates your CV against real hiring norms and can generate a recruiter-ready rewrite, so the two documents tell one strong, consistent story. Get that right before you hit send.",
      },
    ],
  },
  {
    slug: "personal-statement-guide-international-students",
    title:
      "How to Write a Personal Statement for University (International Student Guide)",
    description:
      "A step-by-step guide to writing a university personal statement as an international student — structure, what admissions tutors look for, and common mistakes to avoid.",
    date: "2026-07-27",
    excerpt:
      "Your personal statement is often the only place admissions tutors hear your voice. Here's how to structure one that stands out — written for students applying from outside the US and UK.",
    tags: ["personal statement", "university applications", "admissions"],
    body: [
      {
        type: "p",
        text: "For most international students, the personal statement is the hardest part of the application — and the most important. Your grades and test scores put you in the pile; your statement decides whether you come out of it. This guide walks through a structure that works, what admissions tutors actually look for, and the mistakes that quietly sink strong candidates.",
      },
      { type: "h2", text: "Start with a specific moment, not a summary" },
      {
        type: "p",
        text: "The weakest openings announce the essay: \"I have always been passionate about engineering.\" The strongest ones drop the reader into a specific moment — a problem you tried to solve, a question you couldn't let go of. Specificity signals authenticity, and authenticity is what separates you from thousands of applicants writing the same sentences.",
      },
      { type: "h2", text: "A structure that works" },
      {
        type: "ul",
        items: [
          "**The hook** — a concrete moment or question that shows genuine interest in your subject.",
          "**The evidence** — what you did about it: reading, projects, work, competitions. Show, don't claim.",
          "**The reflection** — what you learned and how your thinking changed. This is where most applicants are thin.",
          "**The fit** — why this course, and why now. Connect your interest to what the programme actually offers.",
        ],
      },
      { type: "h2", text: "What admissions tutors are really scoring" },
      {
        type: "p",
        text: "Beyond enthusiasm, reviewers look for evidence of independent thought, the ability to reflect, and a realistic sense of what the course involves. Every paragraph should answer a silent question: \"So what does that tell me about this applicant?\"",
      },
      { type: "h2", text: "Common mistakes to avoid" },
      {
        type: "ul",
        items: [
          "Listing achievements without reflection — a CV in prose form.",
          "Trying to sound impressive with formal, stiff language instead of your own voice.",
          "Ignoring the word limit or burying your best point on the last line.",
          "Writing the same statement for very different courses.",
        ],
      },
      { type: "h2", text: "Get an honest score before you submit" },
      {
        type: "p",
        text: "Once you have a draft, the hardest thing is judging it objectively — you're too close to it. Fledgy's [free essay scorer](/essay) gives your personal statement an honest score out of 100 with specific, country-aware tips, so you know exactly what to fix before you submit. It's built for international applicants, not just US and UK ones.",
      },
    ],
  },
  {
    slug: "cv-mistakes-international-students",
    title: "7 CV Mistakes International Students Make (and How to Fix Them)",
    description:
      "The most common CV mistakes international students make when applying abroad — from formatting to phrasing — and exactly how to fix each one.",
    date: "2026-07-20",
    excerpt:
      "A CV that works in one country can quietly fail in another. Here are seven mistakes that cost international students interviews — and how to fix them.",
    tags: ["cv", "resume", "job applications"],
    body: [
      {
        type: "p",
        text: "CV conventions are not universal. A résumé that lands interviews at home can quietly get filtered out abroad because it breaks unwritten local rules. Here are seven of the most common mistakes international students make, and how to fix each one.",
      },
      { type: "h2", text: "1. Ignoring the target country's norms" },
      {
        type: "p",
        text: "Length, whether to include a photo, and how personal to get all vary by country. A US résumé is usually one page with no photo; some European CVs expect both. Always match the norms of where you're applying, not where you're from.",
      },
      { type: "h2", text: "2. Describing duties instead of results" },
      {
        type: "p",
        text: "\"Responsible for social media\" tells a recruiter nothing. \"Grew Instagram following 40% in three months\" tells them everything. Lead with outcomes and numbers wherever you can.",
      },
      { type: "h2", text: "3. Weak, repetitive verbs" },
      {
        type: "ul",
        items: [
          "Replace \"helped with\" and \"worked on\" with precise verbs: led, built, launched, analysed, redesigned.",
          "Start every bullet with a verb, not with \"I\" or \"Responsible for\".",
        ],
      },
      { type: "h2", text: "4. Burying the relevant experience" },
      {
        type: "p",
        text: "Recruiters spend seconds on a first pass. Put the most relevant experience near the top, and cut anything that doesn't support the role you're applying for.",
      },
      { type: "h2", text: "5. Formatting that breaks in screening software" },
      {
        type: "p",
        text: "Tables, text boxes, and unusual fonts can scramble your CV inside applicant tracking systems. A clean, simple layout is safer and reads better on any screen.",
      },
      { type: "h2", text: "6. Typos and inconsistent tenses" },
      {
        type: "p",
        text: "Use past tense for past roles and present tense for current ones — and keep it consistent. A single obvious typo can undo an otherwise strong CV.",
      },
      { type: "h2", text: "7. Never getting a second opinion" },
      {
        type: "p",
        text: "You can't proofread your own blind spots. Fledgy's [free CV scorer](/cv) rates your CV against your target country's hiring norms and can generate a recruiter-ready rewrite — a fast way to catch every mistake on this list before an employer does.",
      },
    ],
  },
  {
    slug: "how-to-choose-a-career-path",
    title: "How to Choose a Career Path When You're Not Sure Yet",
    description:
      "A practical framework for choosing a career path or degree when you feel unsure — how to weigh your strengths, interests, and options as a student.",
    date: "2026-07-13",
    excerpt:
      "Feeling stuck on what to study or do next is normal. Here's a practical way to narrow it down without pretending you have it all figured out.",
    tags: ["career", "students", "decisions"],
    body: [
      {
        type: "p",
        text: "\"What do you want to do?\" is a stressful question when the honest answer is \"I don't know yet.\" The good news: you don't need certainty to make a good next move. You need a way to narrow the field. Here's a practical framework.",
      },
      { type: "h2", text: "Separate interests from strengths" },
      {
        type: "p",
        text: "The things you enjoy and the things you're naturally good at overlap, but they aren't the same. Careers that sit in the overlap tend to be the most sustainable. List both honestly before you rule anything in or out.",
      },
      { type: "h2", text: "Test cheaply before you commit" },
      {
        type: "ul",
        items: [
          "Shadow someone, do a short internship, or take one online course before committing years to a field.",
          "Treat each experiment as data, not a verdict — you're collecting evidence about fit.",
        ],
      },
      { type: "h2", text: "Widen the options before you narrow them" },
      {
        type: "p",
        text: "Most people choose from the three or four careers they've heard of. Spend time deliberately discovering roles you didn't know existed — the right fit is often something you couldn't have named at the start.",
      },
      { type: "h2", text: "Factor in studying and working internationally" },
      {
        type: "p",
        text: "If you're planning to study or work abroad, weigh visa realities, demand for the field in your target country, and how transferable the qualification is. A path that's obvious at home may look very different across borders.",
      },
      { type: "h2", text: "Get a starting point in a few minutes" },
      {
        type: "p",
        text: "If you're staring at a blank page, a structured starting point helps more than another late-night search. Fledgy's [career quiz](/careers) combines a personality profile and an aptitude check to suggest paths that match how you actually think and work — whether you're a student, changing careers, or growing in your field.",
      },
    ],
  },
];
