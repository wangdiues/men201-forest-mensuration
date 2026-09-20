# MEN201 Quiz System — Handover Prompt (for the next assistant)

> Copy everything below the line into a fresh assistant session. The full plan is the source of
> truth: `Final/MEN201_Quiz_System_Implementation_Plan.md` (v3). Read it first.

---

You are continuing development of the **MEN201 Forest Mensuration online quiz & assessment
system** for a BSc Forestry course (Royal University of Bhutan). The design is finalized in
`MEN201_Quiz_System_Implementation_Plan.md` (v3) — follow it. Do not make major architectural
changes without confirmation.

## Fixed tech stack (do not change)

- **Frontend:** vanilla ES-module JavaScript, **no build step, no framework**. Lives in the
  existing GitHub Pages site — repo `wangdiues/men201-forest-mensuration`, the `Final/`
  directory is the Pages root. Reuse the site's design tokens (`--paper`, `--moss`,
  `--vermilion`; fonts Fraunces / Public Sans / JetBrains Mono) declared in `index.html` so the
  quiz reads as one document. Firebase JS SDK v10+ loaded from CDN as ES modules.
- **Backend:** Firebase **free Spark tier only** — Authentication (email/password), Cloud
  Firestore, Cloud Functions (Node 20), Firebase Storage (Phase 4). **No paid services.**
- **Hosting:** keep GitHub Pages. The Pages workflow (`.github/workflows/pages.yml`) uploads the
  repo root and needs zero changes.

## Already completed (do NOT redo — verify, then build on it)

- Phase 1 platform: `quiz/` pages (index, unit, take, result), `quiz/css/quiz.css`,
  `quiz/js/{firebase,auth,bloom,formats,quiz-engine,seed}.js`
- All **7 auto-graded formats** working: MCQ, multiple-response, true/false, fill-blank,
  numerical (tolerance), matching, image-based
- **Unit II module end-to-end** (hub, 10-q quiz, 50-mark sectioned assessment)
- `functions/index.js` → Function ① `onAttemptCreated` (auto-grading, Bloom/topic/difficulty
  breakdowns, strengths/improvements, `stats/class` increment)
- Firebase config: `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `.firebaserc`
- Seed data: `quiz/data/questions-unit-ii.json`, `quiz/data/assessments.json` (Unit II)

## Your tasks, in order

### 1. Complete the question bank (the biggest item — content, not code)
- Units **I, III, IV, V, VI, VII, VIII** (core, ~40–50 questions each) and **IX, X, XI**
  (supplementary, ~30 each). Target ≈ 420 more questions.
- Every question carries: `unit, topic, subtopic, questionType, bloomLevel, difficulty, marks,
  question, answer` (format-specific), `explanation, learningOutcome`, `active`.
- Distribute across all 7 auto + 4 teacher-graded formats and all six Bloom levels per the
  matrix in plan §2.1. Base items on the *Practice questions* sections in `notes/` and the
  worked examples in `MEN201_Calculation_Handbook.html`. Use existing diagrams in
  `assets/images/men201/` for image-based items.
- Save to `quiz/data/questions-unit-{i…xi}.json`. Register every unit's quiz + sectioned
  assessment in `quiz/data/assessments.json` (50-mark template in plan §3.2; 25-mark for
  IX–XI).
- Keep the bank ≥ 2–3× each assessment's draw so random selection stays fresh.

### 2. Phase 3 — full teacher dashboard
- `quiz/teacher.html` + `quiz/js/{analytics,teacher,teacher-grade}.js`
- Views (all fed by `stats/{assessmentId}` for O(1) reads, plan §8):
  - Grading queue (pending manual items, rubric side-by-side, mark + feedback)
  - Unit-wise performance · Bloom-level performance · question difficulty analysis
  - Common mistakes (top-missed questions + explanation) · students needing support
  - Question manager (format-aware CRUD; options/blanks/pairs/rubric/image picker)
  - Assessment manager (section editor: levels, counts, marks, allowed types, live pool preview)
  - CSV export (per-assessment grade sheet with Bloom columns + full results)

### 3. Phase 4 — advanced
- Units IX–XI modules live; field practical reports (Firebase Storage upload + rubric grading —
  home of open-ended Create items); timed assessments with auto-submit; analytics charts
  (score distribution, topic × level heatmap).

### 4. Deployment & verification (needs the teacher's Firebase project)
- Create project `men201-quiz` (location `asia-southeast1`), enable Auth + Firestore +
  Functions, `firebase deploy`, paste the web config into `quiz/js/firebase.js`, run
  `quiz/js/seed.js`, bootstrap the teacher account (set `role: "teacher"` in the console).
- Test end-to-end: register → open a unit module → take quiz + sectioned assessment → auto
  score + per-Bloom breakdown → teacher grades a pending manual item → final total → dashboard
  views + CSV export. Confirm a tampered client cannot write scores (rules).

## Non-negotiable constraints
- **Students can never write scores, breakdowns, or stats** — only Cloud Functions (admin SDK)
  do. Keep the security rules in plan §6/§8 intact (teacher-only, key-restricted attempt
  updates; `results` and `stats` write-denied to all clients).
- Grading: auto items in Function ①; teacher-graded items via the manual loop (Function ②
  `onAttemptManualGraded` merges manual marks into the final total + breakdowns).
- Stay within the free Spark tier (plan §11). No paid services.
- Follow the plan's schema and workflows exactly.

## Definition of done
All 11 units have a complete module (materials · outcomes · practice · quiz · sectioned
assessment · performance analysis); the teacher dashboard renders every view in plan §8 from
live data; a full exam-week load stays within the free tier; the site deploys to GitHub Pages
with zero workflow changes.
