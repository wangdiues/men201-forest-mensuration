# MEN201 Online Quiz & Assessment System — Implementation Plan (v3)

> Status: **IN PROGRESS** · v3 (per-unit assessment modules + full question-format suite) · 20 Sep 2026
> **Phase 1 done** (Unit II). **Phase 2–3 in progress**: teacher dashboard + manual grading UI live; Unit IV bank seeded. Remaining: banks for Units I, III, V–XI.
> Target: free web-based assessment system for MEN 201 Forest Mensuration on the existing
> GitHub Pages site, with Firebase (free Spark tier) as backend.
> Framework: **Bloom's Revised Taxonomy** — every question carries a level; every unit has a
> dedicated assessment module; assessments are composed of marked sections; results report
> per-level performance with generated strengths/improvements.

---

## 1. Current Repository Analysis (unchanged from v1/v2)

**Framework: none — hand-written static HTML/CSS/JS, no build step, no dependencies.**
Live site: `Final/` → repo `wangdiues/men201-forest-mensuration` → GitHub Pages
(`.github/workflows/pages.yml` uploads the repo root; zero changes needed for the quiz).

Reusable assets: shared design tokens (`index.html`), 11 unit decks + module descriptor,
`notes/` (7 unit notes with *Practice questions* sections + calculation handbook),
`assets/images/men201/` (66 images incl. measurement diagrams), `practicals/` (3 A4 field
sheets), `tools/*.mjs` (plain-Node pattern).

**Added by this project:** `quiz/` (pages + JS + seed data), `functions/` (Cloud Functions),
Firebase config files, one new section on `index.html`.

---

## 2. Assessment Framework

### 2.1 Bloom's Revised Taxonomy — level × question-format matrix

| Level | Cognitive task | Question formats used |
|---|---|---|
| **Remember** | Recall knowledge | MCQ · Fill in the blank · Matching · True/False · Short definition (auto-graded) |
| **Understand** | Explain concepts | Short answer (teacher-graded) · Diagram interpretation (image MCQ) · Concept explanation · Compare concepts |
| **Apply** | Use knowledge practically | Numerical problems · Formula application · Field calculation problems |
| **Analyze** | Analyze information | Case studies · Data interpretation · Error identification · Comparison questions |
| **Evaluate** | Judge and justify | Method selection · Decision-based questions · Evidence-based answers |
| **Create** | Develop solutions | Field planning problems · Design questions · Practical scenarios |

### 2.2 Question formats and grading rules

**Auto-graded (7):**

| Format | Answer shape | Grading rule |
|---|---|---|
| MCQ | index into `options` | exact match |
| Multiple response | set of indices | partial credit: `(correct picked − wrong picked) / total correct`, floor 0 |
| True/False | boolean | exact match |
| Fill in the blank | string(s) | normalized match (trim, case-insensitive, whitespace-collapsed, unit suffix stripped) against `answer` + `alternatives`; multi-blank items grade each blank independently |
| Numerical calculation | number | `\|given − answer\| ≤ tolerance` (absolute or relative) |
| Matching | left→right mapping | partial credit: correct pairs / total pairs |
| Image-based | image + any of the above | graded by its underlying format |

**Teacher-graded (4):** Short answer · Long answer · Essay · Field practical report.
Each carries a `modelAnswer` + `rubric` (key points with marks); the teacher awards
0…marks per question with optional feedback. Manual marks merge into the total via a second
Cloud Function trigger (§7.3).

---

## 3. Unit Module Structure — ALL 11 MEN201 Units

```
UNIT MODULE  (one hub page per unit: quiz/unit.html?u=IV)
├── Learning materials   → existing unit deck + notes + handbook (links, no duplication)
├── Learning outcomes    → from the unit notes / module descriptor
├── Practice questions   → unlimited practice mode: instant feedback, no attempt limit,
│                          not recorded (no score impact)
├── Unit quiz            → frequent 10-question check (3 attempts, best kept, auto-graded)
├── Unit assessment      → formal sectioned test (50 marks, Bloom-mapped sections)
└── Performance analysis → student's unit view: per-Bloom-level bars, strengths &
                           improvements, attempt history
```

### 3.1 Unit registry

| Unit | Title | Deck | Notes | Bank size | Unit quiz | Unit assessment |
|---|---|---|---|---|---|---|
| I | Introduction to Forest Mensuration | `MEN201_Unit_I_…html` | ✓ | ~40 | 10 q | 50 marks |
| II | Diameter, Girth and Bark Thickness | `MEN201_Unit_II_…html` | ✓ | ~50 | 10 q | 50 marks |
| III | Measurement of Crown Closure | `MEN201_Unit_III_…html` | ✓ | ~40 | 10 q | 50 marks |
| IV | Measurement of Tree Height | `MEN201_Unit_IV_…html` | ✓ | ~50 | 10 q | 50 marks |
| V | Measurement of Tree Volume | `MEN201_Unit_V_…html` | ✓ | ~50 | 10 q | 50 marks |
| VI | Measurement of the Crop | `MEN201_Unit_VI_…html` | ✓ | ~50 | 10 q | 50 marks |
| VII | Age and Growth of Trees | `MEN201_Unit_VII_…html` | ✓ | ~40 | 10 q | 50 marks |
| VIII | Forest Inventory and Sampling | `MEN201_Unit_VIII_…html` | — | ~50 | 10 q | 50 marks |
| IX | Digital Forest Mensuration & Data Management | `MEN201_Unit_IX_…html` | — | ~30 | 10 q | 25 marks |
| X | Forest Biomass and Carbon Estimation | `MEN201_Unit_X_…html` | — | ~30 | 10 q | 25 marks |
| XI | Remote & Emerging Technologies | `MEN201_Unit_XI_…html` | — | ~30 | 10 q | 25 marks |

Total bank ≈ **470–500 questions** (2–3× each assessment's draw, so random selection stays
fresh). Units I–VIII are the core (full 50-mark assessments); IX–XI are supplementary
(25-mark assessments, same section structure scaled down).

### 3.2 Unit assessment — section template (50 marks)

```
Unit IV: Tree Height Measurement — Total marks: 50

Section A: Remember          10 × 1 = 10 marks   (MCQ / T-F / fill-blank / matching)
Section B: Understand         5 × 2 = 10 marks   (short answer / diagram interpretation)
Section C: Apply              5 × 4 = 20 marks   (numerical / field calculation)
Section D: Analyze / Evaluate 2 × 5 = 10 marks   (case study / method selection / long answer)
```

- Each section declares `bloomLevels`, `questionCount`, `marksPerQuestion` and allowed
  `questionTypes`; the engine samples within the section (§7.1).
- Create-level items live in the unit quiz bank and the Phase 4 practical; optionally one
  Section D question may be Create-level.
- 25-mark variant (IX–XI): A 5×1 · B 3×2 · C 3×4 · D 1×5.

---

## 4. Updated System Architecture

```
┌──────────────────────────────── BROWSER (student / teacher) ───────────────────────────────┐
│  GitHub Pages site (wangdiues.github.io/men201-forest-mensuration)                         │
│                                                                                             │
│  index.html ──► quiz/index.html (dashboard: units, my results)                             │
│                quiz/unit.html?u=IV   (UNIT MODULE hub: materials · outcomes · practice ·   │
│                                       quiz · assessment · performance)                     │
│                quiz/take.html        (runner: all 7 auto formats + text answers)           │
│                quiz/result.html      (score, per-Bloom bars, strengths/improvements,       │
│                                       per-question feedback; "awaiting teacher grading"     │
│                                       state for manual items)                              │
│                quiz/teacher.html     (grading queue + dashboard: unit-wise performance,    │
│                                       Bloom analytics, difficulty analysis, common         │
│                                       mistakes, students needing support, CSV export,      │
│                                       question & assessment managers)                      │
│  quiz/js/* — vanilla ES modules: firebase.js · auth.js · bloom.js · formats.js ·          │
│                quiz-engine.js · analytics.js · teacher-grade.js · teacher.js · seed.js     │
│  (Firebase JS SDK v10+ from CDN — no build step)                                           │
└──────────────┬──────────────────────────────┬───────────────────────────┬──────────────────┘
               │ Auth REST                    │ Firestore REST            │ Storage (Ph.4)
┌──────────────▼──────────┐   ┌───────────────▼────────────────────────┐  ┌─────▼──────────┐
│  Firebase Authentication │   │  Cloud Firestore (Spark free tier)      │  │ Firebase       │
│  email/password (+Google)│   │  users · questions (bloomLevel,         │  │ Storage        │
└──────────────┬──────────┘   │  difficulty, subtopic, 11 formats) ·     │  │ (practical     │
               │              │  assessments (kind quiz|assessment,      │  │  reports)      │
               │              │  sections) · attempts (auto + manual) ·  │  └────────────────┘
               │              │  users/{uid}/results · stats       │
               │              └───────────────┬────────────────────────┘
               │                              │
               │   ┌───────────────────────────┴──────────────────────────────────────┐
               │   │ Cloud Functions (Node 20, free tier)                              │
               │   │ ① onAttemptCreated:  grade auto items → autoScore, bloomBreak-   │
               │   │    down, strengths/improvements; status "auto-graded"            │
               │   │    (or "awaiting-manual"); increment stats                  │
               │   │ ② onAttemptManualGraded: teacher writes manualGrading via client  │
               │   │    (rules allow teacher-only updates) → function merges manual    │
               │   │    marks → final total, final breakdowns, results + stats update │
               │   └───────────────────────────────────────────────────────────────────┘
```

Key decisions:
- **All auto-graded scoring is server-side** — the client submits raw answers only.
- **Two assessment kinds, one collection**: `assessments/{id}` with `kind: "quiz" |
  "assessment"`; both use the same sectioned engine (a quiz is a single mixed section).
- **Manual grading loop**: teacher awards marks from the dashboard (client write,
  teacher-only rules); a second trigger finalizes the attempt. Students see their auto score
  instantly and the final score once grading completes.
- **Class analytics materialized** in `stats/{assessmentId}` (incl. per-question
  correct/missed counts → powers *common mistakes* and *difficulty analysis* at O(1) reads).

---

## 5. Updated Folder Structure

```
Final/                                    (repo root = Pages root, unchanged)
├── index.html                            (+ one "Practice & Assessment" section)
├── quiz/
│   ├── index.html                        student dashboard: unit list, my results
│   ├── unit.html                         UNIT MODULE hub (?u=I…XI) — the 6-part structure
│   ├── take.html                         assessment runner (all formats)
│   ├── result.html                       results + feedback + strengths/improvements
│   ├── teacher.html                      grading queue + full dashboard
│   ├── css/quiz.css                      shares the site's :root tokens
│   ├── js/
│   │   ├── firebase.js                   config + app/auth/db init
│   │   ├── auth.js                       register, login, logout, role check
│   │   ├── bloom.js                      Bloom constants, section sampler, breakdowns,
│   │   │                                 strengths/improvements generation
│   │   ├── formats.js                    renderers + answer collectors for all 11 formats
│   │   │                                 (mcq, multi-response, t-f, fill-blank, numerical,
│   │   │                                  matching, image-mcq, short/long/essay, practical)
│   │   ├── quiz-engine.js                load assessment, select per section, run, submit
│   │   ├── analytics.js                  teacher-side: unit-wise, Bloom, difficulty,
│   │   │                                 common mistakes, support list
│   │   ├── teacher-grade.js              grading queue: rubric view, mark entry, feedback
│   │   ├── teacher.js                    dashboard logic + CSV export + managers
│   │   └── seed.js                       CLI: import data/*.json → Firestore (idempotent)
│   └── data/
│       ├── questions-unit-i.json … questions-unit-xi.json   (all bloomLevel+difficulty+subtopic)
│       └── assessments.json              all unit quizzes + sectioned unit assessments
├── functions/
│   ├── index.js                          ① onAttemptCreated  ② onAttemptManualGraded
│   └── package.json
├── firebase.json · firestore.rules · firestore.indexes.json · .firebaserc
```

---

## 6. Updated Firestore Schema

```
users/{uid}
  email, displayName, role: "student"|"teacher", registeredAt, lastSeenAt

courses/{men201}
  code, title, units: [{id, title, deckHref, notesHref, outcomes: […]}]

questions/{questionId}
  unit: "I"…"XI"
  topic: "dbh" | "girth" | "height" | "volume" | "basal-area" | "sampling" | …
  subtopic: "tangent-method" | "sine-method" | …          (new in v3)
  questionType: "mcq" | "multi-response" | "true-false" | "fill-blank"
               | "numerical" | "matching" | "image-mcq"
               | "short-answer" | "long-answer" | "essay" | "practical-report"
  autoGraded: true | false
  bloomLevel: "Remember"|"Understand"|"Apply"|"Analyze"|"Evaluate"|"Create"
  difficulty: "Easy" | "Medium" | "Hard"
  marks: 1                       (section sets the weight at draw time)
  question: string               (fill-blank uses "___" placeholders)
  image?: "assets/images/men201/Tan_Q1.png"
  options?: string[]
  answer:                        (type-specific)
    mcq / true-false / image-mcq : index (number)
    multi-response               : [indices]
    fill-blank                   : ["accepted", "alternative", …]   (multi-blank:
                                       blanks: [{answer: […], marks}])
    numerical                    : number  (+ tolerance {mode, value}, units)
    matching                     : pairs: [{left, right}]
    short/long/essay             : modelAnswer: string
  alternatives?: string[]        (fill-blank accepted variants)
  rubric?: [{point, marks}]      (teacher-graded formats)
  explanation: string
  learningOutcome: string
  active: true

assessments/{assessmentId}
  kind: "quiz" | "assessment"
  unit: "IV"
  title: "Unit IV — Tree Height Measurement: Assessment"
  totalMarks: 50
  sections: [
    { id: "A", label: "Remember",
      bloomLevels: ["Remember"], questionCount: 10, marksPerQuestion: 1,
      questionTypes: ["mcq","true-false","fill-blank","matching"] },
    { id: "B", label: "Understand",
      bloomLevels: ["Understand"], questionCount: 5, marksPerQuestion: 2,
      questionTypes: ["short-answer","image-mcq","mcq"] },
    { id: "C", label: "Apply",
      bloomLevels: ["Apply"], questionCount: 5, marksPerQuestion: 4,
      questionTypes: ["numerical"] },
    { id: "D", label: "Analyze / Evaluate",
      bloomLevels: ["Analyze","Evaluate"], questionCount: 2, marksPerQuestion: 5,
      questionTypes: ["mcq","long-answer","multi-response"] }
  ]
  timeLimitSec?, attemptsAllowed: 3 (quiz) / 1 (assessment), passPercent: 50, active: true

attempts/{attemptId}
  userId, assessmentId, unit,
  questionIds: [qid…], sectionAssignment: { A: [qid…], B: [qid…], … },
  answers: [{ qid, section, given, givenIndex?, givenIndices?, givenText?,
              givenBlanks?, givenPairs?, timeTakenSec }],
  status: "submitted" → "auto-graded" | "awaiting-manual" → "complete"
  submittedAt
  // ── function ① writes ──
  autoScore, autoMax,
  bloomBreakdown: { Remember: {correct, total, percent}, … },   // auto items
  topicBreakdown, difficultyBreakdown,
  strengths: ["Good conceptual understanding"],
  improvements: ["Needs more practice applying formulas"],
  // ── teacher client writes (rules: teacher-only, these keys only) ──
  manualGrading: [{ qid, marks, feedback }],
  // ── function ② writes ──
  manualScore, manualMax, totalScore, totalMax, percent,
  finalBloomBreakdown, learningGaps: [{bloomLevel, topic, message}]

users/{uid}/results/{assessmentId}          (rollup, function-written)
  bestPercent, avgPercent, attempts, lastAttemptAt, lastPercent,
  bloomProfile: { Remember: {avgPercent, attempts}, … }

stats/{assessmentId}                  (materialized, function-written)
  studentCount, avgPercent,
  perLevel:  { Remember: {correct, total, avgPercent}, … },
  perTopic:  { height: {…}, … },
  perQuestion: { "{qid}": {correct, total, percent} },          // common mistakes
  perStudent: { "{uid}": { attempts, bestPercent,
                           bloom: { Remember: 90, … } } },
  lastUpdated
```

Composite indexes: `attempts (assessmentId ASC, submittedAt DESC)`;
`attempts (userId ASC, submittedAt DESC)`; `attempts (status ASC)` for the grading queue.

---

## 7. Assessment Workflow

### 7.1 Selection (client, at start — `bloom.js`)

For each section: pool = bank questions matching `bloomLevels` + section `questionTypes` +
unit + `active`; draw `questionCount` at random (Fisher–Yates). If a pool is short, borrow
from the same section's other levels/types and record it. Store `questionIds` +
`sectionAssignment` on the attempt so grading always matches what the student saw.

### 7.2 Auto-grading (Function ①, on attempt creation)

1. Batch-read the attempt's questions.
2. Mark each auto item per §2.2 rules (partial credit where defined).
3. Compute `autoScore/autoMax`, `bloomBreakdown`, `topicBreakdown`, `difficultyBreakdown`.
4. Generate **strengths** (best level ≥ 70 %: level-specific template, e.g. Understand →
   "Good conceptual understanding") and **improvements** (worst level < 60 %, e.g. Apply →
   "Needs more practice applying formulas").
5. Status: `"complete"` (no manual items) or `"awaiting-manual"`.
6. Upsert `users/{uid}/results/{assessmentId}`; increment `stats/{assessmentId}`
   (perLevel, perTopic, perQuestion, perStudent).

### 7.3 Manual grading loop (teacher-graded items)

1. Teacher opens the grading queue (attempts with status `awaiting-manual`), sees each text
   answer beside the `modelAnswer` + `rubric`, awards 0…marks + optional feedback, saves.
2. Client writes `manualGrading` + status `"complete"` (teacher-only rule, key-restricted).
3. Function ② (trigger on that update) merges: `totalScore = autoScore + manualScore`,
   final breakdowns incl. manual items' Bloom levels, final `learningGaps`, updates results
   and stats.
4. Student's result page shows the final score (auto portion was visible immediately).

### 7.4 Student result view (the required example)

```
Unit IV Performance:
  Remember:  90 %   Understand: 80 %   Apply: 65 %   Analyze: 70 %   Evaluate: 60 %
  Strength:  Good conceptual understanding
  Improvement: Needs more practice applying formulas
  + per-section marks (A 9/10 · B 8/10 · C 13/20 · D 7/10 = 37/50)
  + per-question review (correct/incorrect, answer, explanation, learning outcome)
```

---

## 8. Teacher Dashboard (updated)

- **Grading queue** (Phase 2): pending manual items, rubric side-by-side, mark + feedback.
- **Unit-wise performance**: per unit — class average, pass rate, per-level averages,
  attempt counts (aggregated from that unit's assessment stats docs).
- **Bloom-level performance**: class average per level, per assessment and overall.
- **Question difficulty analysis**: pass rate per question grouped by difficulty (from
  `stats.perQuestion` + question metadata).
- **Common mistakes**: top-N most-missed questions with text + explanation (drives
  re-teaching).
- **Students needing support**: below pass % or ≥ 2 learning gaps — list with gaps and
  suggested unit re-practice links.
- **Question manager**: CRUD with Bloom/difficulty/subtopic/type filters; format-aware
  editor (options, blanks, pairs, rubric, image picker from existing assets).
- **Assessment manager**: create/edit assessments with the section editor (levels, counts,
  marks, allowed types; live pool-count preview per section).
- **CSV export**: per-assessment grade sheet (student, section marks, per-level %, gaps)
  and full results export.

---

## 9. Development Phases

### Phase 1 — Platform + auto-graded formats + first unit *(Medium–Large, ~3–4 days)*

- Firebase project, Auth, Firestore, rules, indexes; `firebase.json`/`.firebaserc`
- `quiz/index.html` + `unit.html` hub (6-part structure, live for Unit II first)
- Engine + `formats.js` with **all 7 auto-graded formats** (MCQ, multi-response, T/F,
  fill-blank, numerical, matching, image-based)
- Seed Unit II bank (~50 questions, all tagged) + Unit II quiz (10 q) + Unit II 50-mark
  sectioned assessment
- Function ①: auto-grading, breakdowns, strengths/improvements, stats
- `result.html` with per-level bars; "My attempts"
- ✅ **Done:** a student completes the full Unit II module (materials → practice → quiz →
  assessment) and sees the required result layout; no score is writable by the client.

### Phase 2 — Manual grading + full bank + all units *(Large, ~4–5 days)*

- Teacher-graded formats (short/long/essay): text capture, `awaiting-manual` flow,
  grading queue UI, Function ② merge
- Question bank for Units I–VIII (~400 questions, drafted from notes/handbook/decks,
  **teacher-reviewed before seeding**)
- All 8 unit modules live: hub pages, quizzes, sectioned assessments
- ✅ **Done:** Unit IV assessment runs exactly as the example (50 marks, 4 sections, mixed
  formats incl. teacher-graded), and the teacher grades a pending attempt end-to-end.

### Phase 3 — Full teacher dashboard *(Medium–Large, ~3–5 days)*

- Unit-wise performance, Bloom analytics, difficulty analysis, common mistakes,
  students-needing-support
- Question + assessment managers (incl. section editor with pool previews)
- CSV exports with Bloom columns
- ✅ **Done:** every dashboard view in §8 renders from live data; a grade sheet exports.

### Phase 4 — Supplementary units + advanced features *(Large, ~1 week+)*

- Units IX–XI modules (25-mark assessments, ~30-question banks)
- Field practical reports: photo/data-sheet upload to Firebase Storage + rubric grading
  (home of open-ended Create items)
- Timed assessments with auto-submit; analytics charts (distributions, topic × level heatmap)
- Streaks/badges; email reminders (optional); leaderboard (recommendation: skip)

---

## 10. Example Questions Mapped to Bloom Levels (v3 formats)

**Remember — fill-blank · Unit VI · basal-area · Easy**
> "Basal area is the cross-sectional area of the stem at ___ height."
> *Answer:* ["breast", "dbh", "1.37 m"] · *Outcome:* recall the DBH concept.

**Remember — matching · Unit II · instruments · Easy**
> Match: diameter tape → "encircles the stem at 1.37 m" · calipers → "direct diameter,
> small stems" · hypsometer → "tree height" · clinometer → "vertical angles".
> *Grading:* 1 mark per correct pair (partial credit).

**Remember — true/false · Unit II · dbh · Easy**
> "In Bhutan's national protocol, DBH is measured under bark." → **False** (over bark).

**Understand — short answer (teacher-graded) · Unit II · dbh · Medium · 2 marks**
> "Explain why DBH is measured at breast height rather than at the stem base."
> *Rubric:* [standardisation across trees/crews (1) · avoids roots/buttressing/swelling (1)].

**Understand — image-mcq · Unit IV · height · Medium** *(uses `Tan_Q1.png`)*
> "In this tangent-method setup, what does the tangent height represent?"
> → the vertical distance from the instrument's line of sight to the taut line at the top.

**Apply — numerical · Unit IV · height · Medium · 4 marks**
> "Tangent method: baseline 30 m, tangent height 1.5 m, instrument height 1.6 m, tree base
> at instrument elevation. Calculate the total tree height." → 31.6 m (±0.2).

**Apply — numerical · Unit V · volume · Hard · 4 marks**
> "Using DoFPS Model 16 for *Pinus wallichiana*, estimate the stem volume of a tree with
> DBH 54.1 cm and height 23.4 m." → 2.237 m³ (±2 % relative) — the published validation tree.

**Analyze — multi-response · Unit VIII · sampling · Medium · 2 marks**
> "Which of these are sources of systematic (not random) error in DBH measurement? Pick all
> that apply." → [tape consistently sagging, reading habit of rounding up] — not [tree
> movement, individual reading scatter].

**Analyze — case-study MCQ · Unit II · dbh · Medium**
> "A crew's 100-tree DBH mean is 2.1 cm higher than a re-measured subset of 20 trees.
> Most likely explanation?" → consistent tape-handling bias (systematic), not growth.

**Evaluate — method-selection MCQ · Unit V · volume · Medium**
> "For a mature *Pinus wallichiana* stand in Bhutan, select the most appropriate volume
> method and justify." → DoFPS species-specific Model 16 within its domain (validated
> against field measurements) over generic cylinder/form-factor tables.

**Create — design MCQ · Unit VIII · sampling · Hard**
> "Design a sampling strategy: 100 ha stand, 95 % confidence, relative error ≤ 5 %, pilot
> s = 3.0 cm, mean = 30 cm. Minimum trees to sample?" → n ≈ 16 (options 8/16/32/64).

**Create — field protocol (teacher-graded) · Unit IV · height · Hard · 5 marks**
> "Develop a 5-step field protocol for tangent-method height measurement that minimizes
> systematic error." *Rubric:* [level baseline (1) · elevation correction (1) · instrument
> height (1) · taut sight-line/tangent check (1) · replicate & average (1)].

---

## 11. Firebase Free-Tier Limitations (v3)

| Service | Spark free tier | This system's usage (300 students, 11 units) | Status |
|---|---|---|---|
| Authentication | Free | ~300 accounts | ✅ |
| Firestore storage | 1 GB | ~500 questions + 22 assessments + ~3 000 attempts + stats ≈ **< 100 MB** | ✅ |
| Firestore reads | 50 000/day | Student: ~30 reads/assessment; teacher dashboard **O(1)** per view via `stats` | ✅ |
| Firestore writes | 20 000/day | ~3–4 writes/attempt (attempt + result + stats + manual update) ≈ 12 000/day peak exam week | ✅ |
| Cloud Functions | 2 M invocations + 400 000 GB-s / month | ~3 000–6 000 invocations/month, each < 200 ms | ✅ |
| Storage (Phase 4) | 5 GB | Practical reports, ~300 × 5 MB worst case = 1.5 GB | ✅ |

v3-specific notes:
- `stats.perQuestion` adds ~1 KB per assessment doc (22 questions) — negligible.
- Manual grading adds one extra write per attempt (teacher update) + one function
  invocation — still trivial.
- The 1 MB document limit: attempt docs with 22 items + text answers stay < 20 KB;
  `stats` perStudent map ~60 KB at 300 students.
- Unchanged caveat: enabling Cloud Functions requires linking a billing account; usage
  stays $0 on Spark. No paid services anywhere in the stack.

---

## Open Questions Before Phase 1

1. **Firebase project name/location** — `men201-quiz`, location `asia-southeast1`?
   (Created in the console by the teacher; the assistant will guide.)
2. **Question seeding** — the assistant drafts the bank (all formats, Bloom-tagged) from
   notes/handbook/decks; the teacher reviews before seeding. OK?
3. **Quiz UX** — one-question-at-a-time with progress bar, no back-navigation?
4. **Attempt limits** — quiz: 3 attempts, best kept; formal assessment: **1 attempt**
   (retake only with teacher permission)?
5. **Supplementary units IX–XI** — 25-mark assessments as in §3.1?
6. **Practice mode** — unrecorded (no writes, no score impact)?
7. **Default gap threshold** — flag a level when the student scores < 60 % on it?

---

*Once approved (and the seven questions answered), implementation proceeds Phase 1
step-by-step, pausing at each milestone for confirmation. No major changes without approval.*
