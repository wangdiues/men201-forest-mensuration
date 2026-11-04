# Unit VII change report

4 November 2026. Changed: `MEN201_Unit_VII_Age_and_Growth_of_Trees.html` only.
Not deployed, published or committed. The annotated PDF and the review file are untouched.
Backup of the original: `Improvements/Unit 7/MEN201_Unit_VII_Age_and_Growth_of_Trees.BACKUP-before-review-fixes-20261104.html`

## Slide numbering

The deck grew from 53 to 55 slides. Each original slide keeps its `data-n`, so the PDF page mapping still holds.

| Original PDF page / `data-n` | Now shown as |
|---|---|
| 1–12 | 1–12 |
| new `data-n="12b"`, the rounding trap, split out of 12 | 13 |
| 13–30 | 14–31 (+1) |
| new `data-n="30b"`, growth accounting | 32 |
| 31–53 | 33–55 (+2) |

Slides 46, 50 and 51 had no `data-n`, so I added it. Cross-references to slide numbers, on slides and in notes, were updated to the new numbers. The `:nth-of-type` overrides that depended on position now use `data-n`.

## Your nine comments

| PDF page | Comment | What was done |
|---|---|---|
| 10 | Add formula for P2 | P1 and P2 side by side, in lowercase d |
| 11 | Add full questions | Full problem added above the data |
| 12 | Add formula and workings | Given, Find, Formula, Substitute, Numerator, Denominator, S, Initial age, Target year, Answer. Rounding comparison moved to new slide 13 |
| 21 | Correct the plot | Rebuilt from 30 hypothetical trees with a least-squares curve fitted to those points. Markers sit on that curve |
| 25 | Correct the plot | Rebuilt from one tree model. Linear 25-year ticks, dimensionless axis (each curve as % of its own peak), volume curve added. Only net volume goes negative |
| 30 | Add formula | Given to Answer, with general p.a.i and m.a.i formulae and units |
| 33 | Correct the plot | c.a.i and m.a.i both derive from one V(A) fitted to the slide 31 table. The marker is at the true crossing |
| 41 | Add formula and workings | Three columns: Formula, Substitute, Calculate, Answer |
| 42 | Add formula and workings | Same layout, for the 300 to 400 cft example |

## Other corrections, by original slide number

- **8:** sal bark corrected (it was reversed) and cited.
- **10–12, 16–17, 47–48:** the periodic method is now a qualified, model-based estimate, with its required conditions stated.
- **3, 4, 20, 25, 33, 35, 38, 43, 44, 46–48:** physical growth separated from financial return and rotation. "Fell it", "fixed by the culmination" and "usually longer/shorter" are gone.
- **28, 29, 45:** c.a.i, p.a.i, m.a.i and dV/dA distinguished. Slide 29's signal-and-noise wording tightened and the plots analogy removed. Slide 45 separates precision, bias and biological variation.
- **32, 34, 36, 48:** "exactly twice" removed, first-year identity separated from the crossing, batting-average claim replaced with a counter-example (scores 40, 60, 20), and the sign change now required for a maximum.
- **30, 36, 50:** p.a.i > m.a.i now supports only a rise across the interval.
- **31:** age 40 is the highest listed m.a.i, and p.a.i is plotted at midpoints or as segments.
- **35:** "ten years either side" corrected to five. "Decade either way" removed.
- **39, 41–44, 47:** inequality conditions added and the volume % claim qualified. All three equations are now on the revision sheet.
- **14, 17, 40, 44, 48, 49:** w defined, bark basis rule rewritten, `d_n,ub = d_n,ob − 2t_n` shown first.
- **6, 7, 13, 15, 16, 19, 24, 51:** datum, planting age against biological age, proxy dates, local figures, DBH convention. `Gub` corrected to `C_ub`, `D` to `d`, `So` to `S0`.
- **2, 16, 48:** resolved as four traditional standing-tree methods, plus coring (5) and stump count (6).
- **Beyond the brief:** slide 24 redrawn from the same model as 25, so the increment curve really is its slope, and its axis ticks are now consistent.
- **Layout and print:** divider captions, stale counters, and a print note on the quiz page. Speaker notes were updated to match all of the above.

## Corrected calculations

| Item | Was | Now |
|---|---|---|
| S with P2 = 0.018 | 1.105 | 1.105449 |
| Age in 1980, rounded P2 | 55 | 55.2305 (about 55) |
| Rounding effect | "nine per cent", "one thousandth" | 4.7695 yr, 7.95 % of 60. Whole-year comparison 8.33 %. Change in P2 0.0001818, a 1 % cut |
| Tenth root of 65/46 | 1.035175 | 1.0351792 (answer stays 3.52 %) |
| Case study m.a.i | 7.1 only | 6.35 at 55, rising to 7.14 at 65 |
| Slide 30 m.a.i | 5.65 only | 4.93 rising to 5.65 |
| Slide 35 flat peak | about 1 %, "ten years" | 1.12 % at ±5 yr. Age 50: −3.82 %. Age 30: −5.62 % |
| Simple over compound | "about a fifth" | 14–17 % in these two examples |

## Models used in the graphs

All are hypothetical and labelled so on the slides.

- **Slide 33 (now 35):** `V(A) = 714[1 − exp(−0.0483A)]^3.05`, least squares on the slide 31 table, RMSE 1.39 m³/ha.
  - c.a.i = m.a.i at A = 39.94 yr, at 11.08 m³/ha/yr. The search for the m.a.i maximum lands at the same age.
  - c.a.i − m.a.i is +1.84 five years before and −1.62 five years after.
  - c.a.i peaks at 23.1 yr. Beyond age 50 is extrapolation, and the slide says so.
- **Slide 25 (now 26):** peaks at 13.9 (height), 25.0 (diameter), 38.0 (basal area) and 41.9 yr (gross volume). The model was set to reproduce the source's 25 and 38. Net volume falls below zero at about 119 yr. Diameter increment never goes negative.
- **Slide 21 (now 22):** A = 0.792d + 0.0024d², n = 30, residual SD 6.4 yr. Reads 17 yr at 20 cm and 79 yr at 80 cm. These replace the old 18 and 84, which were never fitted to the plotted points.

## Sources

Read and used:

- ICFRE/IWST species entry for *Shorea robusta*.
- NIST, *How Do You Measure the Age of a Tree?*
- Susaeta & Demers, UF/IFAS FOR355 (FR424), 2019, reviewed 2023. Its finding that LEV rotation "can be shorter or longer" than the biological rotation replaced the deck's generalisation.
- TBFRA 2000 definitions, as reported by Schoene in FAO Y4171E (section V).
- DoFPS, *NFI Volume I*, 2023. DBH "measured over bark at 1.37 m" (report pages 42 and 76), so that claim stays and is now cited.
- Pande (1960), *Indian Forester* 86(3), 117–131. Abstract only.

Could not be read:

- **ANU mensuration pages** (connection refused, including Brack & Wood). The midpoint rule for p.a.i therefore rests on the arithmetic of an interval average, without a citation.
- **UNECE definitions page** (403). The FAO page above carries the same TBFRA definitions.
- **Any definition of ingrowth.** None of the sources read defines it. Slide 32 calls its rule "this example's own convention".

## Validation

| Check | Result |
|---|---|
| Independent recalculation, reading coordinates back out of the final HTML | 76 of 76 passed. Curves match the formulae within ±0.004 |
| `tools/final-check.mjs` | No failures. 1 warning, in the Module Descriptor |
| `tools/check-fit.mjs` | Unit VII passes. Other flags: Unit IV slide 21 and `feedback.html` |
| Type size at 1920×1080 | No slide below `--tz` 1.0. Seven dense slides (now 9, 14, 16, 17, 20, 33, 51) step down to 1.02–1.10 from the deck's 1.12. Not compared slide by slide with the original deck |
| Visual inspection | Changed slides at 1920×1080, 4 slides at 1366×768, and 8 pages of real print output |
| Navigation | First and last slide, arrows, Home/End, buttons, click zones, swipe, fullscreen, edit mode, page totals all work |
| Images | 9 of 9 load and have alt text. All 4 plots have title and description |
| Quiz | Loads on the last slide and shows sign-in. Fallback link intact. Nothing submitted |
| Print | 55 pages, numbered n / 55, all four divider captions complete, quiz page shows a print note |
| Contrast | New gold text 6.15:1, axis text 7.48:1, vermilion 4.81:1 on the chart card |

Limits of this validation:

- **Print test:** run in headless Chromium with the quiz and video blocked, not from your browser's print dialog.
- **Fit check:** the guard cannot see a panel covering a source note. That is why the rebuilt grids now clip, so overflow gets measured.
- **Laptop size:** the HUD still covers parts of older, long source notes at 1366×768. It did before these changes too. The notes I rewrote are narrowed to clear it.

## Needs your decision

These repeat errors corrected here, or sit outside this deck, so I left them alone as instructed.

1. **The mock exam marks a corrected claim as true.** `exams/units-i-vii/solutions-1.json` Q28 and the Paper 1 solutions in `outputs/mock-exams-units-i-vii/` say the curves meet twice. Your final paper draws from the mocks, so this should be settled first.
2. **`notes/MEN201_Notes_Unit_VII.html` still teaches the old versions:** "meet exactly twice", "nine per cent", simple > compound "always", and "comparable with a bank rate". The student notes now disagree with the deck.
3. **`G_ub = G_ob − 2πt` is still in other files:** Units I–VI, `notes/MEN201_Calculation_Handbook.html`, `notes/MEN201_Notes_Unit_II.html` and the Unit II practical. Until they change, slide 53's "identical in every unit" is not literally true.
4. **The unit paper's questions were not reviewed.** `quiz/data/assessments.json` holds no question text, so I could not check them against these corrections.
5. **Esc in edit mode leaves the deck for the contents page,** contrary to the comment in the script. Edits are saved first. The same two handlers exist in the other decks.

## Remaining uncertainty

- **Original reference for `Age = 1/(P1 S)`:** unverified. The derivation in the slide 10 notes is mine, from the assumption P = c·d^(−S). Pande's abstract reports an earlier method failing at larger diameters, but the full text is paywalled, so I cannot say it is the same formula.
- **Southern Bhutan wording on slide 15:** the claim was softened to "species- and site-specific". No Bhutan-specific ring study was checked.
- **Slide 14 (now 15), "bore on the uphill side":** kept as written, unverified. It is worth checking against your field protocol.
- **Slide 38 (now 40), "a stock of 200 m³" for one big tree:** kept, but unrealistically large for a single tree.
- **Image `2.png`** (slide 1 and slide 16) has "S_o" and the old formula printed in the picture itself. It needs regenerating to match `S0`.
- **Browser edits:** any saved in-browser edits to this deck will no longer load, because they only apply to a deck of the same length. Your backup and the deck are unaffected, but re-enter anything you had saved that way.
