# MEN 201 · Forest Mensuration

Teaching decks for **MEN 201 Forest Mensuration**, BSc in Forestry — College of Natural
Resources, Royal University of Bhutan.

Eleven units — seven core decks (I–VII) plus four supplementary modules (VIII–XI) — joined
into one site with a contents page, together with the full module descriptor as a 28-slide
deck of its own: 534 slides in total. Also: a set of student lecture notes and a calculation
handbook for Units I–VII, two working Excel calculators, three printable A4 field sheets, and
an online, AI-assisted Unit Test and Module Examination system covering all eleven units
(see [Unit Tests and Module Examinations](#unit-tests-and-module-examinations) below).

**Author** — Wangdi, Senior Forestry Officer, Forest Resources Planning and Management
Division; Adjunct Lecturer. [Portfolio](https://wangdiues.github.io/Wangdi-portfolio-v7/)

## The units

| Unit | Sessions | Title | Slides |
|------|----------|-------|--------|
| — | — | **The Module Descriptor** — the approved terms of the module in full | 28 |
| I | 1–2 | Introduction to Forest Mensuration | 44 |
| II | 3–4 | Diameter, Girth and Bark Thickness | 49 |
| III | 5 | Measurement of Crown Closure | 58 |
| IV | 6–9 | Measurement of Tree Height | 63 |
| V | 10–12 | Measurement of Tree Volume | 62 |
| VI | 13–14 | Measurement of the Crop | 63 |
| VII | 15–17 | Age and Growth of Trees | 53 |
| VIII | — | Forest Inventory and Sampling *(supplementary)* | 31 |
| IX | — | Digital Forest Mensuration and Data Management *(supplementary)* | 26 |
| X | — | Forest Biomass and Carbon Estimation *(supplementary)* | 26 |
| XI | — | Remote and Emerging Technologies in Forest Mensuration *(supplementary)* | 31 |

`node tools/final-check.mjs` (aliased as `npm test`) recomputes this table's slide counts from
the actual deck files on every run — check its output rather than trusting this table blindly
if the decks have been edited since.

Every unit carries a **Bhutan policy connection**, naming the national decisions its measurements
feed, and a **notation reference sheet** that is identical in all seven core decks. Units II to VII
also carry one step each of a **continuous case study** — a single 500 m² plot measured in Unit II
and followed through canopy, height, volume, the hectare and ten years of growth.

### Four supplementary modules

Units VIII–XI were added after the original seven-unit core, one module per Bhutan-context
supplementary reading in `supplementary/`: inventory and sampling design, digital data
management, biomass/carbon accounting, and remote-sensing technologies. They don't have a
dedicated student-notes file (notes exist only for Units I–VII) and aren't part of the
continuous case study, but they're full teaching decks in the same visual system, and — like
every unit — have a complete 40-question Unit Test in the online assessment system. Three of
the four (VIII, IX, X) embed a small interactive calculator directly in the deck rather than a
separate Excel workbook.

## The site

`index.html` is the contents page: a green top bar with the page's sections and a **Start
Unit I** button, a full-bleed forest photograph under the title, then the register of units,
the readings, notes, assessment, feedback, calculators and field sheets, the deck shortcuts,
and the author footer. Behind the page runs one photograph at a time — the woodland behind
the core units, the aerial valley behind the supplementary units, the leaf behind the notes,
and so on — crossfading as the reader reaches each section; every panel on the page is dark
glass over that photograph rather than a white card.

- **Photographs** live in `images/` (the originals) and `images/optimized/` (the WebP
  versions the site actually loads, two sizes each). The page fetches each backdrop the
  first time its section comes near, so it does not download eleven photographs up front.
  Unsplash photographs are linked to their source pages from the credits paragraph at the
  foot of the page; the five Pexels photographers are named there too. The three `IMG_`
  mountain and valley views are supplied course assets. No photograph on the page shows an
  identifiable person.
- **Phones** get the same page with the top-bar links wrapped onto two lines, one card per
  unit with its slide count beneath, and no frosted blur — iOS Safari drops the blur under
  load, so on touch devices the panels rely on a more opaque fill instead. Print falls back
  to ink on paper throughout.
- **The other pages** — the nine notes pages, `feedback.html`, and the quiz app's index and
  unit pages — open on the same forest photograph and close on the same author footer,
  through one shared stylesheet, `assets/men201-chrome.css`. The module descriptor's cover
  carries the photograph as its plate.
- **Contrast** on the photographs is measured, not estimated: the scrim behind paper-coloured
  text is set so that text clears 4.5:1 on the brightest patch of the brightest photograph,
  and `node .claude/skills/web-design/scripts/contrast.mjs --css <file>` checks a page's
  colour tokens against its backgrounds.

## Unit Tests and Module Examinations

`quiz/` is a full student-assessment SPA covering all eleven units, built on top of the
teaching decks — each unit's last slide links to its own Unit Test. No build step or
framework: plain ES module JavaScript, imported directly by the browser.

| Assessment | Questions | Marks | Time | Pass mark | Attempts |
|---|---|---|---|---|---|
| **Unit Test** (one per unit, 11 total) | 40, six Bloom sections | 50 | 90 min | 20 (40%) | 3 |
| **Mock Module Examination** (three alternate papers) | 56, six Bloom sections, all eleven units | 100 | 150 min | 40 (40%) | 3 |

Every question is tagged to a level of Bloom's taxonomy (Remember → Understand → Apply →
Analyze → Evaluate → Create) and to a topic/subtopic for analytics. Objective formats
(multiple choice, true/false, fill-in-the-blank, numerical, matching, multi-response) are
graded deterministically and instantly; short-answer and long-answer items are graded against
a per-question rubric — see [Backend and infrastructure](#backend-and-infrastructure) for how.

### Sitting a paper

A student signs in, opens a unit's module page, and sees either **Start test** (attempts
remaining) or **View your grade →** (all 3 used, or a result already in). Papers over ~15
questions are shown a few at a time — "Step 2 of 5 · Questions 9–16" — with Previous/Next,
rather than one long scroll, and a live "N of 40 answered" counter next to Submit.

Grading isn't instant, since it runs on a schedule rather than a live server (see below), so
submitting lands on an **"Your attempt is under assessment"** screen instead of a bare
spinner — it explains why, auto-checks every 15 seconds, and a **Check now** button skips the
wait. A result, once ready, shows the total, a pass/fail badge, a bar per Bloom level,
strengths/improvements, a full question-by-question review, and a **Download assessed paper
(PDF)** button (browser print, "Save as PDF"). Every attempt is labelled with its number —
"Attempt 2 of 3" on the result page, "Pema attempt1" on the teacher's list — since a student
can sit the same paper up to three times.

**Pages**, all under `quiz/`:

| File | Role |
|---|---|
| `index.html` | Landing page — sign in/register, unit list, exam cards, "my recent results" |
| `unit.html?u=<roman>` | One unit's module page — starts its Unit Test or shows the result |
| `take.html?aid=<id>` | The paper itself: printed-style sheet, clock, step-by-step navigation for long papers, submit |
| `result.html?tid=<attemptId>` | A single attempt's result — score, per-Bloom breakdown, question-by-question review, "download as PDF" via print |
| `teacher.html` | Teacher dashboard (below) |
| `preview-paper.html?u=<roman>` or `?paper=<examId>` | Renders a paper straight from `quiz/data/*.json`, no Firebase — for proofreading a paper before it's seeded |

A `take.html?mode=practice&u=<roman>` route also exists (ten random auto-graded questions,
instant feedback, nothing recorded) but isn't currently linked from any page — Unit Tests are
the sole assessment path a student reaches through the UI today.

**Teacher dashboard** (`teacher.html`, gated by a `teacher` role on the user's Firestore
profile): a grading queue for anything every AI provider failed to grade, unit/Bloom/
difficulty/common-mistakes analytics computed from materialized `stats` documents (never a
live scan of every attempt), a "students needing support" view, question and assessment
managers, and a CSV grade-sheet export per assessment (sorted so an assessment with real
attempts sorts above one nobody's sat yet). Every attempt records `gradedBy` — a teacher's
UID, or `ai:gemini` / `ai:nvidia` / `ai:groq` / `ai:openrouter` — so which provider (or
person) produced a given mark is always traceable, even though the dashboard doesn't yet
surface a UI to re-open and correct an AI-graded attempt after the fact (a known gap — see
`MEN201_UNIFIED_IMPROVEMENT_PLAN.md`).

**Question data**: `quiz/data/questions-unit-*.json` (11 files, one per unit) and
`quiz/data/questions-exam*.json` (3 module-exam papers) are the source of truth, seeded into
Firestore by `quiz/js/seed.js` — see the two `*_Instructions.md` files at the repo root for the
exact schema and paper-building process if a unit's paper ever needs rebuilding.

## Backend and infrastructure

Everything runs on free tiers — no payment card, no paid subscription, and nothing that stops
working (rather than starts billing) if a quota is hit.

- **Firebase, Spark plan**: Authentication (email/password) and one Cloud Firestore database.
  `firestore.rules` enforces role-based access server-side (a client can create an attempt but
  never write its own score; only a teacher can write grading fields), and
  `firestore.indexes.json` declares the composite indexes the app's queries need.
- **No Cloud Functions.** Deploying Cloud Functions requires the paid Blaze plan, so grading
  does not run there. Instead:
  - **`.github/workflows/grade-attempts.yml`** runs `quiz/js/grade-attempts.js` on a public
    GitHub Actions runner (free — GitHub Actions is unmetered for public repositories) every 5
    minutes. It auto-marks objective items, then grades written items through an AI fallback
    chain — **Gemini → NVIDIA NIM → Groq → OpenRouter**, all free-tier API keys — falling
    through to the next provider on any failure, and leaving an attempt for a human teacher in
    `awaiting-manual` if every provider fails.
  - **`cf-relay/`** is a small Cloudflare Worker (free tier) that lets the site trigger that
    same workflow *instantly* on submit, instead of waiting for the next scheduled run — most
    students see a result within seconds. The real GitHub token lives only in the Worker's
    secret store; the browser calls the Worker's public URL with no credential at all. See
    `cf-relay/README.md` for the full design and how to redeploy or rotate its token.
  - **`.github/workflows/seed.yml`** and **`set-role.yml`** are on-demand admin workflows —
    the first re-pushes `quiz/data/*.json` into Firestore after a content edit, the second
    promotes or demotes a user between `student` and `teacher`.
- **Hosting**: the whole repository (this deck site *and* the quiz app) is served from both
  **Firebase Hosting** (`men201-quiz.web.app`) and **GitHub Pages**
  (`wangdiues.github.io/men201-forest-mensuration`) — the same static files, two independent
  free hosts. `firebase.json`'s `hosting.ignore` list keeps local-only material (student
  submissions, scratch, node_modules, question-bank source JSON) out of both.
- **`functions/`** contains an earlier Cloud-Functions implementation of the same grading
  logic, kept only as reference/emulator code — it is not part of the deployed system and
  would need the Blaze plan to run for real.

## Type scale

All seven decks share one type scale, set for readability from the back of a lecture room: titles
58 px, body 24 px, bullets 23 px, tables 21 px, callouts 23 px, citations 17 px on the 1920 × 1080
stage. Unit II runs a step larger again (body 30 px, bullets 28 px) because its slides carry less
text. Where a slide is dense enough that the larger type would overflow, it takes a `fit` or `fit2`
class that trims **padding and gaps only** — never the type.

## Source presentations

Units I–IV link out to the Google Slides presentation each deck was built from, shown as
**Source slides** on the unit's row on the contents page. They are hosted on Drive, not in this
repo, and must stay shared as *Anyone with the link → Viewer* or students will hit a request-access
screen. Units V–VII have no source link yet.

## Supplementary readings

Six PDFs in `supplementary/`, linked from the contents page. Five are the working documents of
the Department of Forests and Park Services, so the equations and procedures match what is used in
the field in Bhutan.

| Document | Source | Units |
|----------|--------|-------|
| National Forest Inventory Volume I — State of Forest Report | Second NFI, DoFPS, 2023 | all |
| National Forest Inventory Volume II — State of Forest Carbon Report | Second NFI, DoFPS, 2023 | V, VI, VII |
| Species-Specific Volume Equation — *Pinus wallichiana* | Forest Resources Management Division, DoFPS, 2018 | V |
| Allometric Biomass Equations — 14 species and 2 general | UWICER & FRMD, DoFPS, 2018 | V, VI |
| Forest Canopy Cover Assessment Guidelines | Forest Monitoring and Information Division, DoFPS, 2024 | III |
| A Simple Guide to Common Forest Measurements | Mercker & Yang, UT Extension W 1117 | I, II, IV, VI |

The two inventory volumes are the source of the national protocol the module measures by — over-bark
DBH at 1.37 m, trees from 10 cm, three 12.62 m plots to a cluster on a 4 × 4 km grid, 95 % confidence
intervals, and the 69.71 % forest cover figure used throughout. They are also the largest files in the
repository, at 6.5 MB and 11.2 MB; they are vendored rather than linked so the whole module can be
cloned once and read offline.

The UT Extension guide is in imperial units (inches, feet, acres); the decks are SI throughout.

These documents are taught, not merely filed. The slides built from them are cited on the
references slide of each unit that uses them:

| Unit | Slides | What they add |
|------|--------|---------------|
| I | 2 | The module descriptor as approved — credits, the 30/30/40 assessment, core and supplementary units, and the instrument changes |
| III | 30–33 | **The official Bhutan canopy procedure, as the spine of Section C** — the FNCA 2023 definitions and thresholds, the area-based choice between direct measurement and sampling, the 500 m² / 12.62 m plot with its 89 + 11 points, and the GRS crown densitometer with both the one-plot and multi-plot calculation |
| V | 54–56 | The Department's two selected volume models for *Pinus wallichiana*; the published validation tree (DBH 54.1 cm, height 23.4 m, field 2.109 m³ against Model 16's 2.237 m³, +6.1 %); and the model's domain, geographic basis and limits |
| VI | 49–52 | The two routes to biomass, the equation-selection hierarchy, the structure of the Bhutan equations and their calibration ranges, tree → stand → carbon with uncertainty, and a comparative exercise on three blue pine |

**Unit III now teaches the national method first.** Section C opens with the 2024 guidelines and
the GRS crown densitometer, and the field practical and data sheet follow that procedure. Ocular
estimation, the spherical densiometer, hemispherical photography, transects and remote sensing
follow afterwards and are labelled **comparative methods — not the prescribed method for the
Bhutan field exercise**. The spherical densiometer is retained in Part C of the practical, both
because the College holds it and because comparing it against the official figure is the clearest
demonstration in the module that cover and closure are different quantities.

## Student lecture notes and calculation handbook

`notes/` holds a reading document for each unit plus one handbook. They are written to be studied
independently — they explain rather than summarise, and they do not assume the deck is on screen.
Open `notes/index.html`, or print any of them: each is a single HTML file that paginates to A4 and
comes out at about eight sides.

Every unit file follows the same thirteen parts: learning outcomes · key terminology · major
concepts · equations and notation · the meaning and units of every variable · step-by-step worked
examples · Bhutan-specific procedures and applications · assumptions and limitations · common errors
· field-practical guidance · practice questions · summary · references.

`MEN201_Calculation_Handbook.html` carries what does not belong on a slide, in twenty sections:

- notation and units, and the unit-conversion tables
- a formula sheet covering all seven units
- five derivations — the four solids from `V = S_b·l/(r+1)` and why Newton's formula is exact, the
  quarter-girth ratio `QGV/V = π/4`, the spacing factor `G = 7854/F²`, the six sine cases, and the
  culmination of the m.a.i both with and without calculus
- a step-by-step evaluation of the restricted cubic spline term
- the complete coefficient tables — volume Models 7 and 16 with their domain, all 32 biomass
  equations in both the BA and BAH forms, and nine published form factors
- the Bhutan protocol reference (Second NFI and the 2024 canopy guidelines)
- worked solutions to every practice question in every unit

Terminology, notation, units, equations, citations and Bhutan conventions are the same across the
decks, the notes and the handbook. The decks carry what has to be seen from the back of the room;
the notes carry the explanation; the handbook carries the derivations, the tables and the answers.

## Calculators and field sheets

`calculators/` holds two Excel workbooks. Every coefficient is on a locked sheet, every result is a
live formula, and each workbook carries a validation sheet that reproduces the figures taught in the
decks.

| Workbook | Reproduces |
|----------|------------|
| `MEN201_Volume_Calculator_Pinus_wallichiana.xlsx` | The study's validation tree — 54.1 cm / 23.4 m → Model 16 **2.237 m³**, Model 7 **2.908 m³**, field measured 2.109 m³ |
| `MEN201_Biomass_Calculator_Bhutan.xlsx` | The Unit VI figures — general conifer 15 cm → 46.1 kg, 25 cm → 154.2 kg, 40 cm → 494.7 kg, 60 cm → 1 656.9 kg |

`practicals/` holds three printable field sheets, each one A4 side at 100 % scale:

- `MEN201_Practical_Unit_II_Diameter_and_Bark.html`
- `MEN201_Practical_Unit_III_Canopy_Cover.html` — the 100-point tally, from Annexure 1 of the 2024 guidelines
- `MEN201_Practical_Unit_V_Sectional_Volume.html`

## Running a deck

Each unit is a single self-contained HTML file — no build step, no dependencies beyond the
Google Fonts stylesheet. Open `index.html` and pick a unit, or open a unit file directly.

| Key | Does |
|-----|------|
| <kbd>→</kbd> <kbd>Space</kbd> <kbd>Page Down</kbd> | Next slide |
| <kbd>←</kbd> <kbd>Backspace</kbd> <kbd>Page Up</kbd> | Previous slide |
| <kbd>Home</kbd> <kbd>End</kbd> | First or last slide |
| <kbd>Esc</kbd> <kbd>C</kbd> | Leave the deck and return to the contents page |
| <kbd>E</kbd> | Edit slide text in place — <kbd>Ctrl</kbd>+<kbd>S</kbd> saves, <kbd>Esc</kbd> leaves edit mode |
| <kbd>O</kbd> <kbd>?</kbd> | Slide index, keyboard shortcuts — Unit II only |
| <kbd>+</kbd> <kbd>−</kbd> <kbd>0</kbd> | Larger text, smaller text, back to the standard size |

No deck carries a class timer or a timetable. Class hours, practical dates and room allocation
live on the VLE, where they can be changed without editing a slide.

Tapping or clicking the right and left thirds of the screen also moves through the deck, as
does swiping on a touchscreen.

Slides are laid out on a fixed 1920 × 1080 stage and scaled uniformly to the viewport, so a
deck looks the same on a laptop as on the projector. The module descriptor's control bar has a
**Full screen** button (<kbd>F</kbd> does the same; <kbd>Esc</kbd> leaves full screen before
it leaves the deck); the unit decks still use the browser's own <kbd>F11</kbd>. On a phone
the descriptor keeps its controls on one line, and in portrait asks to be turned sideways —
tapping that hint goes full screen and, on Android, turns the deck landscape.

**Edits made with <kbd>E</kbd> are local.** They are written to that browser's local storage
only — the file is unchanged and no one else sees them. To publish a correction, edit the HTML
and push.

## Text size

Every type size in the module — decks, notes, handbook, field sheets — is written as a multiple
of one token, `--tz`, declared in the `:root` block of each document. The decks ship at 1.12,
the notes and the contents page a little lower, the printed field sheets lower again, and print
takes the field sheets at their drawn size so they stay on one page.

<kbd>+</kbd> and <kbd>−</kbd> move the whole package up or down in five per cent steps. The
setting is remembered per browser and carries from one document to the next, so a lecturer sets
it once for a room rather than per file.

A deck cannot simply grow: the stage is a fixed 1920 × 1080 canvas, so larger type has to come
out of the layout's own space. `assets/men201-type-zoom.js` therefore measures each slide and
steps `--tz` back down on any slide that would end up clipped — about one slide in seven, a few
of them all the way back to their drawn size. No slide is ever made tighter than it was written.
`node tools/check-fit.mjs` re-runs that check over every slide of every deck in a headless
browser; `node tools/type-scale.mjs` re-applies the rewrite after new sizes are hand-written
into a file.

## Editing

**Decks**: hand-written HTML and CSS, one file per unit. The design tokens live in the
`:root` block at the top of each file and are shared across the seven core decks, so a colour
or type change should be made in each file to keep the module consistent.

`index.html` is the contents page; it links to the unit files by name, so renaming a unit file
means updating the matching `href`. Its styling is layered: the original register styles,
then a block that restyles the page in the reference look, then the photograph backdrop, the
vertical rhythm and the glass panels — the later blocks use a `body` prefix so they win over
the base rules regardless of order. To change which photograph sits behind a section, edit
that section's `data-backdrop` attribute and the matching `.backdrop-photo` entry near the top
of `<body>`; to change the photograph behind the notes, feedback and quiz pages, edit
`assets/men201-chrome.css`.

**Quiz app**: plain ES modules under `quiz/js/`, no build step — edit and reload. After
changing a question bank (`quiz/data/questions-*.json`) or `assessments.json`, run the
`seed.yml` GitHub Action (or `node quiz/js/seed.js` locally with a service-account key) to push
the change into Firestore; editing the JSON files alone does nothing to the live site, since
they're only the seed source, not what the app reads at runtime. After changing any file
Firebase Hosting serves, redeploy with `firebase deploy --only hosting`; GitHub Pages
redeploys itself automatically on every push to `main`. Firebase keeps every deployed
version, and on the Spark plan a run of deploys can fill the Hosting storage quota (the CLI
then refuses with HTTP 429); the fix is in the console — Hosting → Release history →
Version history settings → auto-delete old versions — after which deploys resume.

## Acknowledgement

The course developer gratefully acknowledges **Laxmi Sagar, Associate Lecturer, College of Natural
Resources**, for sharing teaching materials previously used for the same Forest Mensuration course.
Selected concepts and materials were reviewed, adapted, expanded and contextualized for the present
MEN 201 course.

Where a particular diagram, table, exercise, explanation or slide is directly adapted from the
shared materials, a specific source note appears on that slide or in the corresponding
lecture-note section. Acknowledgement of the overall contribution does **not** replace proper
citation of the original books, manuals, reports, research papers, photographs, diagrams,
equations, tables or datasets used within the shared teaching materials; those are cited where
they are used.

## Licence

Teaching material for MEN 201. Free to use and adapt for teaching, with attribution to the
author and the College of Natural Resources, Royal University of Bhutan.
