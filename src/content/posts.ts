import type { Post } from "@/lib/blog";

// Add new posts to the top of this array. Each post needs a unique `slug`.
export const posts: Post[] = [
  {
    slug: "career-change-cv",
    title: "How to Write a CV for a Career Change (Step-by-Step Guide)",
    description:
      "How to write a CV for a career change: choosing a target role, translating transferable skills, handling gaps and pay cuts — plus a free AI score before you apply.",
    date: "2026-09-19",
    excerpt:
      "Changing careers isn't a CV formatting problem — it's a translation problem. Here's how to rewrite your CV so a hiring manager in a new field can see, in ten seconds, why you belong there.",
    tags: ["career change", "cv", "transferable skills", "job applications"],
    body: [
      {
        type: "p",
        text: "Most career-change CVs fail for the same reason: they describe a career the reader isn't hiring for. The experience is genuinely relevant, but it's written in the language of the old industry, so the hiring manager has to do the translating — and in a ten-second scan, they won't. This guide walks through how to rewrite your CV for a new field, step by step, including the parts people avoid: gaps, pay cuts, and how to explain why you're switching.",
      },
      { type: "h2", text: "The short answer" },
      {
        type: "p",
        text: "To write a CV for a career change: pick **one** target role, open with a short positioning statement that names it, and then rewrite your existing experience in that field's language — leading with outcomes and transferable skills rather than job titles. Keep a reverse-chronological structure (recruiters and ATS systems expect it), and add one piece of concrete proof — a project, certification, or freelance piece — that shows you've already started doing the new work.",
      },
      { type: "h2", text: "Why a career-change CV is different" },
      {
        type: "p",
        text: "A normal CV answers \"are you good at this job?\" A career-change CV has to answer a harder question first: \"why would we take you over someone who has already done this exact job?\" Hiring managers aren't hostile to switchers — they're risk-averse. Every line of your CV should reduce the perceived risk of hiring you, by showing that the skills transfer, that the motivation is considered rather than impulsive, and that you've already tested the new field in some small, real way.",
      },
      { type: "h2", text: "Step 1: Pick one target role before you touch the CV" },
      {
        type: "p",
        text: "The single most common mistake is writing one broad CV for \"something in tech\" or \"anything in marketing.\" A CV aimed at everything reads as aimed at no one. Choose a specific job title, pull up five real job adverts for it, and highlight the requirements that repeat. Those repeated phrases are your brief: they tell you what to lead with, which keywords matter, and which parts of your history are now the main story instead of a footnote.",
      },
      {
        type: "p",
        text: "If you're still deciding between directions, do that work first — a CV can't fix an unresolved target. Fledgy's free [career quiz](/careers) maps your strengths and interests onto specific paths, so you're rewriting toward one role rather than hedging across three.",
      },
      { type: "h2", text: "Step 2: Replace your summary with a positioning statement" },
      {
        type: "p",
        text: "The top third of the page decides whether the rest gets read. For a career changer, that space shouldn't be a generic profile — it should state where you're going, what you bring from where you've been, and why the two connect. Two or three lines, no adjectives you can't prove.",
      },
      {
        type: "quote",
        text: "Before: \"Hard-working and passionate professional with 6 years' experience, seeking a new challenge in a dynamic organisation.\" After: \"Operations lead moving into data analysis. Six years running supply-chain reporting for a 40-store retailer — built the SQL dashboards that cut stock-outs by 18%. Google Data Analytics certified; looking for an analyst role in retail or logistics.\"",
      },
      { type: "h2", text: "Step 3: Translate your experience into the new field's language" },
      {
        type: "p",
        text: "This is the heart of a career-change CV. The work you did doesn't change; the vocabulary does. Take each bullet and ask what the equivalent activity is called in your target industry — the job adverts from Step 1 give you the exact words.",
      },
      {
        type: "ul",
        items: [
          "**Teacher → corporate training or customer success:** \"taught Year 10 physics\" becomes \"designed and delivered a 30-week curriculum to 120 learners, with termly assessment of outcomes.\"",
          "**Retail or hospitality management → operations:** \"ran a shop floor\" becomes \"managed a 14-person team across rotas, stock forecasting and P&L for a £1.2m site.\"",
          "**Military or public service → project management:** \"led a section\" becomes \"coordinated logistics and personnel for deployments of 30+, under fixed deadlines and audited compliance.\"",
          "**Finance → product or analytics:** \"prepared monthly reports\" becomes \"built the reporting that leadership used to prioritise spend across five business lines.\"",
          "**Admin or coordination → anything:** \"handled scheduling\" becomes \"was the single point of coordination between four departments and 60+ external suppliers.\"",
        ],
      },
      {
        type: "p",
        text: "Rule of thumb: if a bullet only makes sense to someone from your old industry — internal system names, sector jargon, team codes — rewrite it or cut it.",
      },
      { type: "h2", text: "Step 4: Lead with evidence, not job titles" },
      {
        type: "p",
        text: "Your old titles won't impress a new industry, but numbers cross industries intact. Every bullet should show an outcome: what changed, by how much, for whom. \"Responsible for customer complaints\" says nothing; \"cut complaint resolution time from 5 days to 36 hours across a 2,000-ticket backlog\" says you can improve a process — which is what you're actually being hired for.",
      },
      {
        type: "p",
        text: "Keep the structure reverse-chronological. A fully functional, skills-only CV hides your dates, and both recruiters and applicant tracking systems read that as evasion. The safer format for switchers is a hybrid: positioning statement, then a short \"relevant skills and projects\" block aimed at the new role, then your standard dated work history underneath.",
      },
      { type: "h2", text: "Step 5: Close the credibility gap with proof" },
      {
        type: "p",
        text: "One piece of real evidence beats a paragraph of enthusiasm. It doesn't have to be big — a certification with a project attached, a freelance job, a volunteer piece, a public portfolio, an internal project you volunteered for at your current employer. Its job is to prove that you've already done a version of the new work, so the hiring manager isn't betting entirely on potential.",
      },
      {
        type: "ul",
        items: [
          "Put the proof **above** your unrelated work history, not buried at the bottom of the page.",
          "Describe it as work, not study: what you built, the tools used, the result — not just the course name.",
          "One or two strong items is enough. A list of ten half-finished certificates reads as browsing, not commitment.",
        ],
      },
      { type: "h2", text: "Step 6: Handle gaps, pay cuts and the \"why\" honestly" },
      {
        type: "p",
        text: "Career changes often come with a gap, a step down in seniority, or a lower salary band — and trying to disguise any of them usually costs more than explaining them. A single clear line in your positioning statement or cover letter (\"stepping into an analyst role to build on six years of reporting work\") answers the question before it becomes a doubt. For a gap, name it plainly and say what you did with it: retraining, caring responsibilities, a relocation, building the project above. Employers hire people with gaps every day. They hire far fewer people whose timeline looks like it's hiding something.",
      },
      { type: "h2", text: "What to cut" },
      {
        type: "ul",
        items: [
          "Old responsibilities that only matter in your previous industry — compress those roles to one or two lines.",
          "Objective statements about what *you* want from the employer. The top of the CV is for what you offer.",
          "Skills lists padded with Microsoft Word and \"team player.\" Keep the ones the job adverts actually asked for.",
          "Anything over roughly 10–15 years old, unless it's directly relevant to the new target.",
          "Clichés — \"passionate,\" \"dynamic,\" \"results-driven.\" Every switcher writes them, so they signal nothing.",
        ],
      },
      { type: "h2", text: "Before you send it" },
      {
        type: "p",
        text: "The hard part of a career-change CV is that you can't read it the way a stranger in the new industry will — you know all the context that's missing from the page. That's exactly what an outside read is for. Paste yours into Fledgy's free [CV checker](/cv) and you'll get an instant score out of 100 with specific feedback on what a hiring manager sees first, where the evidence is thin, and which lines still read as your old job rather than your next one. It's free to try, and a lot faster than waiting to learn from silence.",
      },
      {
        type: "p",
        text: "The bottom line: a career change isn't a formatting problem, it's a translation problem. Pick one target, say plainly where you're going, and rewrite your history in the language of the job you want — then check it against what the reader actually sees.",
      },
    ],
    faq: [
      {
        q: "How far back should a career-change CV go?",
        a: "Roughly 10 to 15 years, and only in detail where it's relevant to the new role. Recent and relevant experience should take the most space; older or unrelated jobs can be compressed into one line each with title, employer and dates. Keep the timeline complete — shortening entries is fine, deleting years creates unexplained gaps.",
      },
      {
        q: "Should I use a functional (skills-based) CV for a career change?",
        a: "Usually not on its own. Fully functional CVs hide dates and job order, which recruiters read as a red flag and many applicant tracking systems parse badly. A hybrid works better: a short positioning statement and a relevant-skills or projects block at the top, followed by a normal reverse-chronological work history underneath.",
      },
      {
        q: "How do I explain why I'm changing careers on my CV?",
        a: "In one line, near the top, framed as a direction rather than an escape. Name the target role and the thread that connects it to your existing experience — for example, \"operations lead moving into data analysis after six years building supply-chain reporting.\" Save the longer story for the cover letter and the interview.",
      },
      {
        q: "Do I need a cover letter when changing careers?",
        a: "Yes — it matters more for switchers than for anyone else. The CV shows that the skills transfer; the cover letter explains the decision, which is the part a hiring manager is quietly worried about. Keep it to three short paragraphs: why this field, what transfers with evidence, and what you've already done to prepare.",
      },
      {
        q: "Will an applicant tracking system reject a career-change CV?",
        a: "Not for changing careers, but it may score you low if the wording doesn't match the job advert. ATS matching is largely about keywords and clean structure, so mirror the exact terms used in the posting, use standard section headings, avoid tables, columns and text inside images, and submit as a normal .docx or PDF unless told otherwise.",
      },
    ],
  },
  {
    slug: "personal-statement-vs-sop",
    title:
      "Personal Statement vs SOP: What's the Difference? (And Which You Need)",
    description:
      "Personal statement vs statement of purpose (SOP): the real differences, when each is required, and how to write both well — plus a free way to score yours before you apply.",
    date: "2026-09-06",
    excerpt:
      "\"Personal statement\" and \"SOP\" get used interchangeably, but they're not the same document — and sending the wrong kind can quietly cost you a place. Here's the difference, and which your application actually needs.",
    tags: ["applications", "SOP", "personal statement", "study abroad"],
    body: [
      {
        type: "p",
        text: "If you're applying to university abroad, you've probably seen both terms — \"personal statement\" and \"statement of purpose\" (SOP) — sometimes on the same application, sometimes used as if they mean the same thing. They don't. They overlap, but they answer different questions, and writing one when the programme wanted the other is a common, avoidable mistake. Here's the difference in plain terms, and how to tell which you need.",
      },
      { type: "h2", text: "The short answer" },
      {
        type: "p",
        text: "A **personal statement** is about *you* — your story, motivation, and what shaped your interest. A **statement of purpose (SOP)** is about your *purpose* — your academic and research goals, why this specific programme, and what you'll do with it. Personal statements lean personal and narrative; SOPs lean focused and professional. Many strong essays blend both, but knowing which the programme is really asking for tells you where to put the weight.",
      },
      { type: "h2", text: "What a personal statement is" },
      {
        type: "p",
        text: "A personal statement is a short, first-person essay about who you are and why you want to study a subject. It's the standard for most undergraduate applications (including UCAS in the UK) and many taught Master's programmes. Admissions readers use it to understand your motivation, your background, and whether you'll fit and thrive — not just your grades. Good personal statements tell a specific story: a moment, a problem, a turning point that led you here, and evidence you've pursued the subject beyond the classroom.",
      },
      { type: "h2", text: "What a statement of purpose (SOP) is" },
      {
        type: "p",
        text: "An SOP is more focused and forward-looking. It's the norm for graduate study — Master's and especially PhD applications, and most US and Canadian programmes. It answers: what do you want to research or specialise in, why this department and these supervisors, what have you already done that prepares you, and what are your goals afterwards? An SOP reads more like a professional case than a personal story. Committees are checking research fit — whether your interests match what the department actually does.",
      },
      { type: "h2", text: "The key differences at a glance" },
      {
        type: "ul",
        items: [
          "**Focus** — Personal statement: your story and motivation. SOP: your academic/research purpose and fit.",
          "**Where it's used** — Personal statement: undergrad and many taught Master's (UK/Europe common). SOP: graduate study, PhDs, and most US/Canada programmes.",
          "**Tone** — Personal statement: reflective and narrative. SOP: focused, specific, professional.",
          "**What readers want** — Personal statement: who you are and why you'll thrive. SOP: what you'll study, why here, and proof you can do it.",
          "**Programme specificity** — Personal statement: often reusable across similar courses. SOP: usually tailored to each department and its faculty.",
        ],
      },
      { type: "h2", text: "Which one do you need?" },
      {
        type: "p",
        text: "Read the application instructions first — the exact wording tells you which document (and length) they expect. As a rule of thumb:",
      },
      {
        type: "ul",
        items: [
          "**Undergraduate, or a taught Master's in the UK/Europe** → usually a personal statement.",
          "**PhD, research Master's, or most US/Canada graduate programmes** → usually a statement of purpose.",
          "**Asked for both** → keep them distinct: the personal statement carries the story and motivation, the SOP carries the research focus and fit. Don't just resubmit the same essay twice.",
        ],
      },
      { type: "h2", text: "How to make either one stronger" },
      {
        type: "p",
        text: "Whichever you're writing, the fixes are similar: be specific instead of generic, lead with evidence rather than adjectives, and cut the clichés every admissions reader has seen a thousand times. The hardest part is seeing your own draft clearly — you're too close to it. Before you submit, get an honest, outside read.",
      },
      {
        type: "p",
        text: "Fledgy's free tools do exactly that. Paste your essay into the [personal statement checker](/personal-statement-checker) or the [SOP checker](/sop-checker) and get an instant score out of 100 with specific, no-fluff feedback on what's working and what's holding it back — the same [essay scoring engine](/essay) behind both, tuned to what admissions readers actually look for. It's free to try, and it's a lot cheaper than finding out from a rejection.",
      },
      {
        type: "p",
        text: "The bottom line: a personal statement and an SOP aren't interchangeable. Work out which your programme wants, put the weight where that document expects it, and pressure-test the draft before it's the version a committee reads.",
      },
    ],
  },
  {
    slug: "how-to-explain-a-career-gap-on-your-cv",
    title: "How to Explain a Career Gap on Your CV (Without Apologising for It)",
    description:
      "How to explain a career gap on your CV — how to frame it, whether to address it in your cover letter, and what to say in an interview if it comes up.",
    date: "2026-08-31",
    excerpt:
      "A gap on your CV isn't a red flag by itself — how you present it is. Here's how to frame it, whether to mention it upfront, and what to say if it comes up.",
    tags: ["cv", "career gap", "job seekers", "career changers"],
    body: [
      {
        type: "p",
        text: "Redundancy, illness, caregiving, a failed business, burnout, travel, further study that didn't lead anywhere obvious — there are a hundred honest reasons for a gap in your work history, and almost none of them are the problem employers imagine. What actually costs candidates interviews isn't the gap itself; it's leaving it unexplained and hoping no one notices, or over-explaining it in a way that reads as an apology. Here's how to handle it well.",
      },
      { type: "h2", text: "Recruiters notice gaps less than you think — but they do notice silence" },
      {
        type: "p",
        text: "A short gap, a few months, rarely raises an eyebrow. A longer one, six months or more, usually gets a second look — not because it's disqualifying, but because an unexplained blank space invites the reader to guess, and people tend to guess worse than the truth. A one-line explanation closes that gap before it becomes a question mark.",
      },
      { type: "h2", text: "Decide where it belongs" },
      {
        type: "ul",
        items: [
          "**On the CV itself** — for a gap tied to something concrete (parental leave, caregiving, study, illness, travel), a short line in the timeline is often enough: \"2023–2024: Career break — full-time caregiving.\" No lengthy justification needed.",
          "**In the cover letter** — if the gap is relevant to the role or you want to frame it positively (a return-to-work programme, a deliberate career change), a sentence or two here works better than crowding the CV.",
          "**Saved for the interview** — if it's more personal (burnout, a layoff you're still processing, a business that didn't work out), a brief, matter-of-fact line prepared for the interview is often the better call than putting it in writing at all.",
        ],
      },
      { type: "h2", text: "Frame it as time used, not time lost" },
      {
        type: "p",
        text: "Even an unplanned gap usually involved something: courses, volunteering, freelance projects, caregiving that built real organisational and crisis-management skills, or simply a clear-eyed reason for stepping back. Naming it briefly turns a blank space into a data point, without turning your CV into a confession. You don't owe a full account — you owe enough that the reader isn't left guessing.",
      },
      { type: "h2", text: "What to say in the interview" },
      {
        type: "p",
        text: "Keep it short, factual, and forward-looking: what happened, in one sentence, and then what you're looking for now. \"I stepped back for eighteen months to care for a family member; I'm now looking to get back into a role like this one\" says everything a hiring manager needs and nothing they don't. Rehearse it so it comes out calm and brief — the biggest tell of an unresolved gap isn't the gap, it's a candidate who visibly dreads the question.",
      },
      { type: "h2", text: "Mistakes that make a gap look worse than it is" },
      {
        type: "ul",
        items: [
          "Leaving the timeline blank and hoping no one does the maths on the dates.",
          "Fudging dates to hide a gap — inconsistencies are far more damaging than the gap itself if they're caught.",
          "Over-explaining in writing what a single calm sentence in the interview would cover better.",
          "Sounding apologetic or defensive, as if a gap needs forgiveness rather than a simple explanation.",
          "Failing to show what you did with the time, even briefly, when there's something genuinely worth naming.",
        ],
      },
      { type: "h2", text: "Get the rest of the CV working as hard as possible" },
      {
        type: "p",
        text: "A well-handled gap stops being the story the moment the rest of your CV is strong. Fledgy's [free CV scorer](/cv) rates your CV against real hiring norms and can generate a recruiter-ready rewrite, so the roles either side of the gap — and everything else on the page — make the strongest possible case for you.",
      },
    ],
  },
  {
    slug: "best-certifications-to-advance-your-career",
    title: "Best Certifications to Advance Your Career (by Field)",
    description:
      "Which professional certifications are actually worth your time and money by field — tech, project management, data, marketing, HR, and finance — and how to pick one.",
    date: "2026-09-06",
    excerpt:
      "Not every certification pays off. Here's how to tell which ones are worth the time and money, broken down by field, and how to put one to work once you have it.",
    tags: ["certifications", "career growth", "working professionals"],
    body: [
      {
        type: "p",
        text: "A certification is a bet: weeks or months of study and a fee, in exchange for a credential you hope moves the needle on a promotion, a raise, or a career change. Some bets pay off fast. Others sit on a CV doing nothing because the field doesn't rate them or you picked one for the wrong reason. Here's how to tell the difference, field by field, and how to actually use one once you've earned it.",
      },
      { type: "h2", text: "When a certification is worth it — and when it isn't" },
      {
        type: "p",
        text: "Certifications work best in three situations: the field has a widely recognised standard (accounting, project management, cloud platforms), you're changing fields and need a credible signal fast, or a specific role formally requires one. They work poorly as a substitute for experience, as a way to avoid the harder work of building a portfolio, or when you're chasing a credential nobody in your target industry actually asks about. Before you enrol, search a handful of real job postings in your target role and see whether the certification appears as a requirement or a plus — that's a better signal than any ranking article, including this one.",
      },
      { type: "h2", text: "By field: tech and IT" },
      {
        type: "ul",
        items: [
          "**Cloud** — AWS Certified Solutions Architect, Microsoft Azure Fundamentals/Administrator, or Google Cloud's Associate Cloud Engineer. Whichever cloud your target employers actually run.",
          "**Security** — CompTIA Security+ for a first credential, CISSP once you have real experience behind you.",
          "**Data** — Google Data Analytics Certificate or Microsoft's Power BI credentials for analysts; a portfolio of real projects still matters more than the badge itself.",
        ],
      },
      { type: "h2", text: "By field: business, project management, and finance" },
      {
        type: "ul",
        items: [
          "**Project management** — PMP (Project Management Professional) is the recognised standard for experienced PMs; CAPM is the entry-level version if you don't yet meet PMP's experience requirement.",
          "**Agile** — Certified ScrumMaster (CSM) or PMI-ACP, common in tech and product organisations.",
          "**Finance** — CFA for investment and asset management; CPA (or your country's equivalent) for accounting; both are long, serious commitments that genuinely change what roles you're eligible for.",
          "**General business** — a short, credible course in financial modelling or Excel/SQL fluency often does more for an early-career professional than a broad, generic \"business certificate.\"",
        ],
      },
      { type: "h2", text: "By field: marketing and HR" },
      {
        type: "ul",
        items: [
          "**Marketing** — Google Analytics and Google Ads certifications (free, widely recognised), HubSpot's inbound and content marketing certificates.",
          "**HR** — SHRM-CP or PHR for HR generalists and people managers, both well recognised by recruiters in the US and increasingly beyond it.",
        ],
      },
      { type: "h2", text: "How to choose between two options" },
      {
        type: "p",
        text: "When you're torn between certifications, weigh three things: how often it appears in real job postings for the role you want, how much study time it actually needs versus what you can realistically give it, and whether it's issued or recognised by a body employers in your field trust. A well-known, moderately impressive certification you finish is worth more than a prestigious one you abandon halfway through.",
      },
      { type: "h2", text: "Put it to work once you have it" },
      {
        type: "ul",
        items: [
          "Add it to your CV and LinkedIn headline the day you pass, not \"eventually.\"",
          "Use it as a concrete reason in your next promotion conversation — a new skill is evidence you're already closer to the next level.",
          "Apply what you learned to a real project at work within weeks, while it's fresh, so it becomes a story rather than just a line item.",
          "If it's aimed at a career change, mention it explicitly in your cover letter and CV summary, since it's doing the work experience normally would.",
        ],
      },
      { type: "h2", text: "Make sure it actually shows up on your CV" },
      {
        type: "p",
        text: "A new certification only helps if it's positioned clearly — buried in a long skills list, it does nothing. If you're not sure where a new certification should sit or how to phrase it, Fledgy's [free CV scorer](/cv) rates your CV against real hiring norms and can generate a recruiter-ready rewrite. And if you're weighing which certification fits your longer-term direction in the first place, the [career quiz](/careers) can help narrow that down before you spend the time and money.",
      },
    ],
  },
  {
    slug: "how-to-ask-for-a-promotion",
    title: "How to Ask for a Promotion (and What to Do If the Answer Is Not Yet)",
    description:
      "How to ask for a promotion — building your case, timing the conversation, what to say, and how to keep growing if the answer is \"not yet.\"",
    date: "2026-08-30",
    excerpt:
      "Waiting to be noticed rarely works. Here's how to build the case, time the conversation, and keep growing even if the answer isn't yes yet.",
    tags: ["career growth", "promotion", "working professionals"],
    body: [
      {
        type: "p",
        text: "Most people wait to be noticed. They put their head down, do good work, and assume someone above them is quietly tracking it and will eventually offer more money or a bigger title. Sometimes that happens. More often, the people who get promoted are the ones who made the case for themselves clearly, at the right time, in the right way. Here's how to do that without it feeling like office politics.",
      },
      { type: "h2", text: "Build the case before you ask" },
      {
        type: "p",
        text: "A promotion request is really a proposal: you're asking the business to invest more in you, and you need to show why that's a good bet. Vague confidence (\"I've been here two years and work hard\") doesn't move anyone. Specific, remembered impact does.",
      },
      {
        type: "ul",
        items: [
          "**Track outcomes, not tasks.** \"Managed the client onboarding process\" is a task. \"Cut onboarding time from three weeks to nine days, reducing early churn\" is an outcome — the kind a manager can repeat to their own boss.",
          "**Collect it as you go.** Keep a running note of wins, numbers, and positive feedback the month they happen. Trying to reconstruct a year of impact the night before a review never works as well.",
          "**Show you're already operating at the next level.** The strongest case isn't \"I'll grow into this role\" — it's \"here's where I've already been doing it.\" Mentoring juniors, owning a project beyond your title, or making decisions your role wasn't designed for all count.",
          "**Know the gap, not just your strengths.** Look honestly at what separates you from people already at the next level — scope, visibility, a specific skill — and address it directly rather than hoping no one notices.",
        ],
      },
      { type: "h2", text: "Time it deliberately" },
      {
        type: "p",
        text: "Don't wait for an annual review to be the first time your manager hears you want more. By then, budgets and headcount decisions are often already made. Raise your intent to grow well before the formal cycle — a quarter ahead is a reasonable rule of thumb — so your manager has time to build a case for you, not just react to one.",
      },
      { type: "h2", text: "How to have the conversation" },
      {
        type: "p",
        text: "Frame it as a discussion about growth, not an ultimatum. Ask directly what it would take to reach the next level, and listen for specifics rather than accepting a vague \"let's see how it goes.\" A useful structure: state your interest in growing into a specific role or level, walk through two or three concrete examples of impact, then ask what gap remains between where you are and where you want to be. Ending with an open question — rather than a demand — keeps the conversation collaborative and gives your manager room to become an advocate.",
      },
      { type: "h2", text: "Common mistakes that stall the conversation" },
      {
        type: "ul",
        items: [
          "Comparing yourself to a coworker's raise or title instead of making the case on your own impact.",
          "Asking once and then going quiet for a year, instead of checking in on progress regularly.",
          "Leading with tenure (\"I've been here three years\") instead of evidence of growth.",
          "Making it purely about money when the real blocker is scope or level — solve the actual gap first.",
          "Being vague when your manager asks what you want next. Know your target title or scope going in.",
        ],
      },
      { type: "h2", text: "If the answer is \"not yet\"" },
      {
        type: "p",
        text: "A \"not now\" isn't a rejection if you leave the conversation with a clear list of what needs to change and a rough timeline to revisit it. Write down exactly what was said, agree on a check-in date, and then go close the gap — take on the project, build the skill, or get the visibility that was missing. The difference between people who get promoted on the second try and those who don't usually isn't talent; it's whether they actually closed the specific gap they were given.",
      },
      { type: "h2", text: "Keep growing, even between promotions" },
      {
        type: "p",
        text: "Not every step forward needs a new title. Broader ownership, a stretch project, or a skill that makes you harder to replace all compound over time — and they're also exactly what you'll cite in your next promotion case. If you're not sure which direction offers the most growth from where you sit, Fledgy's [career quiz](/careers) can help map out paths that fit your strengths and interests. And when a bigger move — a new role, a new company — is actually next, make sure your [CV](/cv) reflects the level you've been operating at, not just the title on the door.",
      },
    ],
  },
  {
    slug: "how-to-answer-tell-me-about-yourself",
    title: "How to Answer \"Tell Me About Yourself\" in an Interview",
    description:
      "How to answer \"Tell me about yourself\" in an interview — what interviewers really want, a simple present-past-future formula, an example, and mistakes to avoid.",
    date: "2026-08-09",
    excerpt:
      "It's the first question and the most fumbled. Here's a simple formula for answering \"tell me about yourself\" — what to include, what to cut, and an example.",
    tags: ["interviews", "job applications", "careers"],
    body: [
      {
        type: "p",
        text: "\"Tell me about yourself\" is almost always the first question — and one of the most fumbled. It isn't an invitation to recite your life story or read your CV aloud. It's your chance to set the tone and frame everything that follows. Here's how to answer it well.",
      },
      { type: "h2", text: "What the interviewer actually wants" },
      {
        type: "p",
        text: "They're not testing your memory of your own CV. They want a quick, relevant sense of who you are professionally and why you're sitting in that chair. A good answer is short — 60 to 90 seconds — focused on the role, and it ends by pointing forward to why you're excited about this job.",
      },
      { type: "h2", text: "The present–past–future formula" },
      {
        type: "p",
        text: "The simplest structure that works every time: where you are now, how you got here, and where you want to go — tied to this role.",
      },
      {
        type: "ul",
        items: [
          "**Present** — your current role or status in one line: \"I'm a final-year computer science student\" or \"I'm a marketing coordinator with three years in B2B.\"",
          "**Past** — the one or two experiences that led you here and are relevant to this job. Not everything — just what matters.",
          "**Future** — why this role, at this company, is the natural next step. This is where you show you actually want it.",
        ],
      },
      { type: "h2", text: "A quick example" },
      {
        type: "quote",
        text: "\"I'm a final-year business student. Over the last two years I've run marketing for our 400-member entrepreneurship society and interned at a fintech startup, where I grew their newsletter from 500 to 4,000 subscribers. I loved the analytical side of that work — which is exactly why this data-focused marketing role caught my eye.\"",
      },
      { type: "h2", text: "Common mistakes" },
      {
        type: "ul",
        items: [
          "Starting at birth — \"I was born in…\". Begin with where you are now.",
          "Reciting your entire CV line by line — they've already read it.",
          "Being so vague it could describe anyone (\"I'm a hard worker who loves challenges\").",
          "Rambling past 90 seconds. Prepare it, time it, and stop.",
          "Forgetting to connect your answer to this specific role.",
        ],
      },
      { type: "h2", text: "Prepare it — don't memorise it word for word" },
      {
        type: "p",
        text: "Write out your present–past–future, then practise it aloud until it feels natural rather than recited. You want the structure locked in and the delivery loose, so it sounds like you and not a script.",
      },
      { type: "h2", text: "Point your answer at the right target" },
      {
        type: "p",
        text: "The best \"tell me about yourself\" answers are aimed at a specific kind of role — which is hard if you're still unsure what you're going for. If that's you, Fledgy's [career quiz](/careers) suggests paths that fit how you actually think and work, so you know exactly what to aim your pitch at.",
      },
    ],
  },
  {
    slug: "how-to-write-a-cv-with-no-experience",
    title: "How to Write a CV With No Experience (Student & Graduate Guide)",
    description:
      "How to write a strong CV with no work experience — what actually counts, which sections to lead with, and how to turn projects and activities into achievements.",
    date: "2026-08-09",
    excerpt:
      "No jobs yet? You still have plenty to work with. Here's how to build a CV that reads like a strong candidate — using projects, coursework, and activities.",
    tags: ["cv", "students", "graduates"],
    body: [
      {
        type: "p",
        text: "Every job seems to want experience, and you can't get experience without a job. It's the most frustrating catch-22 in job hunting — but a strong CV with \"no experience\" is absolutely possible. You have more to work with than you think; the trick is knowing what counts and how to present it.",
      },
      { type: "h2", text: "You have more experience than you think" },
      {
        type: "p",
        text: "\"Experience\" isn't only paid, full-time jobs. Coursework, group projects, volunteering, part-time and casual work, clubs and societies, side projects, competitions, and freelancing all count. Employers hiring for entry-level roles expect this — they're looking for evidence of skills and attitude, not a decade of job titles.",
      },
      { type: "h2", text: "Lead with your strengths, not your gaps" },
      {
        type: "p",
        text: "With little work history, open with a short personal profile (two or three lines) and your education. The profile says who you are, what you're good at, and what you're looking for. Then let education, projects, and skills carry the weight that job titles normally would.",
      },
      { type: "h2", text: "Sections that do the heavy lifting" },
      {
        type: "ul",
        items: [
          "**Personal profile** — a tight two-to-three line summary aimed at the specific role.",
          "**Education** — degree, relevant modules, strong grades, and any notable coursework or dissertation.",
          "**Projects & coursework** — describe what you built or solved and the result, just as you would a job.",
          "**Volunteering & activities** — leadership, teamwork, and reliability shown in real settings.",
          "**Skills** — tools, software, languages, and certifications relevant to the role.",
        ],
      },
      { type: "h2", text: "Turn activities into achievements" },
      {
        type: "p",
        text: "The mistake is listing what you were part of. Instead, show what you did and what changed. \"Member of the events society\" says little; \"Organised a 120-person event and grew attendance 30% on the previous year\" shows initiative and results — exactly what a first employer wants to see.",
      },
      { type: "h2", text: "Common mistakes" },
      {
        type: "ul",
        items: [
          "Leaving gaps blank instead of filling them with projects, study, or volunteering.",
          "Writing \"no experience\" or apologising for it — never draw attention to it.",
          "Listing duties instead of outcomes, even for non-work activities.",
          "Sending one generic CV everywhere instead of tailoring the profile and skills to each role.",
          "Running over one page when you don't need to.",
        ],
      },
      { type: "h2", text: "Check it before you apply" },
      {
        type: "p",
        text: "When you don't have work history to fall back on, presentation matters even more. Fledgy's [free CV scorer](/cv) rates your CV against real hiring norms, flags weak phrasing, and can generate a recruiter-ready rewrite — so a light-on-experience CV still reads like a strong candidate.",
      },
    ],
  },
  {
    slug: "how-to-write-a-statement-of-purpose-sop",
    title: "How to Write a Statement of Purpose (SOP) for Master's Applications",
    description:
      "How to write a Statement of Purpose (SOP) for Master's and PhD applications — a structure that works, what admissions committees look for, and the mistakes to avoid.",
    date: "2026-08-09",
    excerpt:
      "Your SOP is where you argue why this programme and why you. Here's a structure that works, what committees actually score, and the mistakes that sink strong applicants.",
    tags: ["statement of purpose", "sop", "graduate applications"],
    body: [
      {
        type: "p",
        text: "A Statement of Purpose (SOP) carries your graduate application. Your grades and test scores get you considered; the SOP is where you argue, in your own words, why this programme and why you. This guide covers what admissions committees look for, a structure that works, and the mistakes that sink otherwise strong applicants.",
      },
      { type: "h2", text: "What an SOP actually is" },
      {
        type: "p",
        text: "An SOP is a focused, forward-looking essay — usually 800–1,200 words — explaining your academic background, your motivation for the field, and what you want to do next. Unlike an undergraduate personal statement, it leans heavily on specifics: research interests, projects, and the exact reasons this department fits your goals.",
      },
      { type: "h2", text: "A structure that works" },
      {
        type: "ul",
        items: [
          "**Opening** — a specific hook: the problem, question, or moment that pulled you toward the field. Skip the childhood-dream cliché.",
          "**Academic background** — the coursework, projects, and research that prepared you, framed as a progression rather than a list.",
          "**Research or professional experience** — what you did, what you found, and what it taught you about the questions you want to pursue.",
          "**Why this programme** — name specific professors, labs, or courses and connect them to your goals. This is where generic SOPs lose.",
          "**Goals** — what you intend to do during and after the degree, concretely enough to be believable.",
        ],
      },
      { type: "h2", text: "What admissions committees are really scoring" },
      {
        type: "p",
        text: "Committees read for fit and focus: does your background support your stated goals, and do your goals match what this programme offers? A brilliant essay aimed at the wrong department still gets rejected. Every paragraph should reinforce that you belong in that specific room.",
      },
      { type: "h2", text: "Common SOP mistakes" },
      {
        type: "ul",
        items: [
          "Writing one generic SOP and just swapping the university name — reviewers spot it instantly.",
          "Listing achievements without explaining what they taught you or why they matter.",
          "Spending half the essay on your childhood instead of your research direction.",
          "Vague goals (\"I want to make an impact\") that could apply to anyone.",
          "Ignoring the word limit or the programme's specific prompt.",
        ],
      },
      { type: "h2", text: "Check your SOP before you submit" },
      {
        type: "p",
        text: "Once you have a draft, you're too close to judge it objectively. Fledgy's [free SOP checker](/sop-checker) scores your statement of purpose out of 100 and gives specific feedback on structure, focus, and fit — so you know exactly what to sharpen before the deadline.",
      },
    ],
  },
  {
    slug: "sop-vs-personal-statement",
    title: "SOP vs Personal Statement: What's the Difference?",
    description:
      "SOP vs personal statement — what's the difference, when you need each, and how to write the right one for graduate, undergraduate, or UCAS applications.",
    date: "2026-08-09",
    excerpt:
      "\"SOP\" and \"personal statement\" aren't the same document. Here's how to tell them apart — and write whichever one your programme is actually asking for.",
    tags: ["statement of purpose", "personal statement", "applications"],
    body: [
      {
        type: "p",
        text: "\"SOP\" and \"personal statement\" get used interchangeably, but for many applications they are different documents with different jobs — and mixing them up can cost you. Here's how to tell them apart and write whichever one your programme is actually asking for.",
      },
      { type: "h2", text: "The short version" },
      {
        type: "p",
        text: "A Statement of Purpose is programme- and goal-focused: your academic direction, research interests, and why this specific course fits. A personal statement is broader and more personal: who you are, what shaped you, and the qualities you bring. SOPs dominate graduate and most US applications; personal statements are common for undergraduate and UK (UCAS) applications.",
      },
      { type: "h2", text: "How they differ" },
      {
        type: "ul",
        items: [
          "**Focus** — SOP: your goals and research fit. Personal statement: your story and character.",
          "**Tone** — SOP: professional and specific. Personal statement: reflective and personal.",
          "**Content** — SOP: coursework, projects, professors, plans. Personal statement: motivation, growth, wider context.",
          "**Where you'll meet them** — SOP: Master's, PhD, most US programmes. Personal statement: undergrad, UCAS, some scholarships.",
        ],
      },
      { type: "h2", text: "When a programme just says \"essay\"" },
      {
        type: "p",
        text: "If the prompt is vague, let the questions guide you. Asking about your goals and fit? Write an SOP. Asking who you are or what motivates you? Write a personal statement. When in doubt, lead with specifics and back every claim with evidence — that works for both.",
      },
      { type: "h2", text: "The one rule that applies to both" },
      {
        type: "quote",
        text: "Show, don't tell. \"I'm passionate about research\" means nothing; describing the project that kept you up at night means everything.",
      },
      { type: "h2", text: "Get either one scored before you send it" },
      {
        type: "p",
        text: "Whichever you're writing, an outside read helps most. Fledgy scores both — try the [SOP checker](/sop-checker) for graduate statements or the [essay scorer](/essay) for personal statements, each with specific, honest feedback out of 100.",
      },
    ],
  },
  {
    slug: "cv-vs-resume-difference",
    title: "CV vs Resume: What's the Difference (and Which Do You Need)?",
    description:
      "CV vs resume — the real difference, what each includes, and which one to send depending on your country and the role you're applying for.",
    date: "2026-08-09",
    excerpt:
      "In some countries they mean the same thing; in others they don't. Here's the difference between a CV and a resume — and which one to send where.",
    tags: ["cv", "resume", "job applications"],
    body: [
      {
        type: "p",
        text: "\"CV\" and \"resume\" are often used as if they mean the same thing — and in some countries they do. But send the wrong format for the wrong market and you can look out of step before anyone reads a word. Here's the difference and how to know which one to use.",
      },
      { type: "h2", text: "The core difference" },
      {
        type: "p",
        text: "A resume is a short, targeted summary — usually one page — tailored to a specific job. A CV (curriculum vitae) is longer and more comprehensive, covering your full academic and professional history. In the US and Canada, \"resume\" is the default for most jobs and \"CV\" means the long academic version. In the UK, Europe, and much of Asia and the Middle East, \"CV\" is simply the everyday word for what Americans call a resume.",
      },
      { type: "h2", text: "CV vs resume at a glance" },
      {
        type: "ul",
        items: [
          "**Length** — Resume: one page (sometimes two). CV: two or more pages, as long as it needs to be.",
          "**Purpose** — Resume: one specific job. CV: a full record, common in academia and research.",
          "**Content** — Resume: only the most relevant experience. CV: education, publications, projects, the full history.",
          "**Region** — \"Resume\" is US and Canada. \"CV\" is the UK, Europe, Asia, and the Middle East (and academia everywhere).",
        ],
      },
      { type: "h2", text: "Which one should you send?" },
      {
        type: "ul",
        items: [
          "Applying to a company job in the US or Canada? Send a one-page **resume**.",
          "Applying in the UK, Europe, India, or the Gulf? They'll call it a **CV**, but they usually mean the short, targeted version — keep it to one or two pages.",
          "Applying for academic, research, or PhD roles anywhere? Send a full **academic CV**.",
        ],
      },
      { type: "h2", text: "The mistake that costs interviews" },
      {
        type: "p",
        text: "The real error isn't the label — it's sending a long, unfocused document when the employer wanted a tight, tailored one. Whatever it's called in your market, lead with results, match the role, and cut anything that doesn't earn its place.",
      },
      { type: "h2", text: "Get yours checked against local norms" },
      {
        type: "p",
        text: "Not sure your document fits the market you're applying to? Fledgy's [free CV checker](/cv-checker) scores it against real hiring norms for your target country and can generate a recruiter-ready rewrite — so it lands the way it should, wherever you send it.",
      },
    ],
  },
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
