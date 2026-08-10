# MEN 201 · Forest Mensuration

Teaching decks for **MEN 201 Forest Mensuration**, BSc in Forestry — College of Natural
Resources, Royal University of Bhutan.

Seven units, 384 slides, joined into one site with a contents page, together with the full
module descriptor as a 28-slide deck of its own — plus a set of student lecture notes and a
calculation handbook, two working Excel calculators and three printable A4 field sheets.

**Author** — Wangdi, Senior Forestry Officer, Forest Resources Planning and Management
Division; Adjunct Lecturer. [Portfolio](https://wangdiues.github.io/Wangdi-portfolio-v7/)

## The units

| Unit | Sessions | Title | Slides |
|------|----------|-------|--------|
| — | — | **The Module Descriptor** — the approved terms of the module in full | 28 |
| I | 1–2 | Introduction to Forest Mensuration | 43 |
| II | 3–4 | Diameter, Girth and Bark Thickness | 48 |
| III | 5 | Measurement of Crown Closure | 57 |
| IV | 6–9 | Measurement of Tree Height | 60 |
| V | 10–12 | Measurement of Tree Volume | 61 |
| VI | 13–14 | Measurement of the Crop | 63 |
| VII | 15–17 | Age and Growth of Trees | 52 |

Every unit carries a **Bhutan policy connection**, naming the national decisions its measurements
feed, and a **notation reference sheet** that is identical in all seven decks. Units II to VII also
carry one step each of a **continuous case study** — a single 500 m² plot measured in Unit II and
followed through canopy, height, volume, the hectare and ten years of growth.

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
deck looks the same on a laptop as on the projector. Press <kbd>F11</kbd> for full screen.

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

Everything is hand-written HTML and CSS in one file per unit. The design tokens live in the
`:root` block at the top of each file and are shared across all seven, so a colour or type
change should be made in each file to keep the module consistent.

`index.html` is the contents page; it links to the unit files by name, so renaming a unit file
means updating the matching `href`.

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
