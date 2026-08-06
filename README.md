# MEN 201 · Forest Mensuration

Teaching decks for **MEN 201 Forest Mensuration**, BSc in Forestry — College of Natural
Resources, Royal University of Bhutan.

Seven units, 343 slides, joined into one site with a contents page.

**Author** — Wangdi, Senior Forestry Officer, Forest Resources Planning and Management
Division; Adjunct Lecturer. [Portfolio](https://wangdiues.github.io/Wangdi-portfolio-v7/)

## The units

| Unit | Title | Slides |
|------|-------|--------|
| I | Introduction to Forest Mensuration | 39 |
| II | Diameter, Girth and Bark Thickness | 42 |
| III | Measurement of Crown Closure | 50 |
| IV | Measurement of Tree Height | 57 |
| V | Measurement of Tree Volume | 54 |
| VI | Measurement of the Crop | 52 |
| VII | Age and Growth of Trees | 49 |

## Source presentations

Units I–IV link out to the Google Slides presentation each deck was built from, shown as
**Source slides** on the unit's row on the contents page. They are hosted on Drive, not in this
repo, and must stay shared as *Anyone with the link → Viewer* or students will hit a request-access
screen. Units V–VII have no source link yet.

## Supplementary readings

Four PDFs in `supplementary/`, linked from the contents page. Three are the working documents of
the Department of Forests and Park Services, so the equations and procedures match what is used in
the field in Bhutan.

| Document | Source | Units |
|----------|--------|-------|
| Species-Specific Volume Equation — *Pinus wallichiana* | Forest Resources Management Division, DoFPS, 2018 | V |
| Allometric Biomass Equations — 14 species and 2 general | UWICER & FRMD, DoFPS, 2018 | V, VI |
| Forest Canopy Cover Assessment Guidelines | Forest Monitoring and Information Division, DoFPS, 2024 | III |
| A Simple Guide to Common Forest Measurements | Mercker & Yang, UT Extension W 1117 | I, II, IV, VI |

The UT Extension guide is in imperial units (inches, feet, acres); the decks are SI throughout.

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
| <kbd>O</kbd> <kbd>?</kbd> <kbd>T</kbd> | Slide index, shortcuts, class timer — Unit II only |

Tapping or clicking the right and left thirds of the screen also moves through the deck, as
does swiping on a touchscreen.

Slides are laid out on a fixed 1920 × 1080 stage and scaled uniformly to the viewport, so a
deck looks the same on a laptop as on the projector. Press <kbd>F11</kbd> for full screen.

**Edits made with <kbd>E</kbd> are local.** They are written to that browser's local storage
only — the file is unchanged and no one else sees them. To publish a correction, edit the HTML
and push.

## Editing

Everything is hand-written HTML and CSS in one file per unit. The design tokens live in the
`:root` block at the top of each file and are shared across all seven, so a colour or type
change should be made in each file to keep the module consistent.

`index.html` is the contents page; it links to the unit files by name, so renaming a unit file
means updating the matching `href`.

## Licence

Teaching material for MEN 201. Free to use and adapt for teaching, with attribution to the
author and the College of Natural Resources, Royal University of Bhutan.
