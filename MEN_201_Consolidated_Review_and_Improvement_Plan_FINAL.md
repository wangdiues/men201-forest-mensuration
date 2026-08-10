# Consolidated Review and Improvement Plan

## MEN 201: Forest Mensuration Course Notes

**Review baseline:** Course package containing seven HTML lecture decks and 348 slides, reviewed 7 August 2026.

**Tracking status:** Recommendations are identified as **Outstanding**, **Partially implemented**, **Mostly implemented**, or **Resolved** so that completed work is not repeatedly treated as a new task.

**Implementation pass of 8 August 2026.** Priorities 1–3 have been implemented across the seven lecture decks, the course index, the README and both forms of the module descriptor.

**Second pass, same day.** Priority 4 taken further: the type scale raised across all seven decks, class timers and timetable content removed entirely, the Excel calculators and standalone field sheets built, and the continuous Bhutan case study added to Units II–VII.

**Third pass, same day.** The last substantial deliverable was built: coordinated student lecture notes for Units I–VII and a calculation handbook, in `notes/`, linked from the module contents page and the README. Priorities 1 to 4 are now complete; §13.3 remains partially implemented. Item-level status labels below record what was done.

## 1. Overall Verdict

The MEN 201 Forest Mensuration course is technically strong, carefully structured, and unusually thorough. Its worked examples, field reasoning, derivations, and treatment of measurement error provide an excellent foundation for undergraduate forestry education.

However, the course should currently be described as **Bhutan-contextualized forest mensuration notes**, rather than an officially Bhutan-standard course.

The module uses Bhutanese species, locations, datasets, and field situations effectively, particularly in Units V and VI. Nevertheless, some national field conventions are outdated, unverified, inconsistent, or incorrectly attributed. The course also gives insufficient attention to Bhutan’s wider forestry principles, including equitable benefit sharing, community participation, indigenous knowledge, biodiversity conservation, ecosystem services, climate resilience, watershed protection, cultural values, and multipurpose forest management.

The underlying review found that the arithmetic in approximately 40 worked examples and answer keys was generally strong, while the principal weaknesses involved consistency, provenance, national protocols, and several substantive statements. Basic treatment of measurement error is strong, but the explanations of model-error cancellation and sampling precision still require correction.

| Aspect | Assessment |
| --- | --- |
| Core mensuration science | Strong |
| Worked examples and field reasoning | Strong |
| Treatment of measurement error and bias | Strong foundation; model and sampling uncertainty need correction |
| Bhutanese species and terrain context | Strong, particularly in Units V and VI |
| Compliance with current Bhutan protocols | Partial; important corrections required |
| Alignment with Bhutan forestry policy | Partial |
| Sampling and statistical inference | Insufficiently developed |
| Citations and traceability | Inconsistent |
| Cross-unit consistency | Several contradictions require correction |
| Student–tutor content separation | Requires improvement |

Bhutan’s National Forest Policy frames forestry around equitable benefits, people-centred management, good science combined with indigenous knowledge, biodiversity, ecosystem services, climate change, and cultural values. The Forest and Nature Conservation Act 2023 and Bhutan’s biodiversity strategy reinforce conservation, sustainable use, and multipurpose forest management.

Key policy sources already identified for the course include:

- National Forest Policy of Bhutan 2011:
  [https://bt.chm-cbd.net/sites/bt/files/inline-files/National%20Forest%20Policy%202011.pdf](https://bt.chm-cbd.net/sites/bt/files/inline-files/National%20Forest%20Policy%202011.pdf)
- Forest and Nature Conservation Act 2023:
  [https://parliament.bt/uploads/topics/16920826464271.pdf](https://parliament.bt/uploads/topics/16920826464271.pdf)
- National Biodiversity Strategy and Action Plan 2025:
  [https://nbc.gov.bt/nbsap/](https://nbc.gov.bt/nbsap/)

---

# 2. What Is Already Working Well

## 2.1 Technical foundation

The course presents the central concepts of forest mensuration clearly and progressively. The movement from individual-tree measurements to stand-level estimates is logical, and the derivations generally help students understand why formulas work rather than merely memorizing them.

Particularly strong elements include:

- propagation of diameter errors into basal area and volume;
- distinction between random error, systematic error, and bias;
- tangent and sine approaches to tree-height measurement;
- derivation of leaning-tree corrections;
- sectional measurement and volume-estimation exercises;
- crop diameter, Lorey’s mean height, basal area, and crop-volume calculations;
- current annual increment, periodic annual increment, and mean annual increment;
- discussion of model applicability and measurement uncertainty.

The module’s repeated emphasis that a measurement without a clear definition, protocol, unit, and reference point is incomplete is pedagogically valuable.

## 2.2 Bhutanese contextualization

The course includes Bhutanese species and field conditions such as:

- *Pinus wallichiana*;
- *Pinus roxburghii*;
- *Abies densa*;
- *Picea spinulosa*;
- *Tsuga dumosa*;
- *Quercus lamellosa*;
- *Castanopsis* species;
- steep terrain and slope corrections;
- CNR teaching forests;
- Bhutanese inventory reports and volume tables;
- national forest inventory examples;
- local forest-management situations.

Unit V contains the strongest integration of Bhutanese research equations, local species, model limitations, uncertainty, and practical application. It is a useful model for the rest of the course, although its DBH convention and claims about aggregation of model errors still require correction.

## 2.3 Field reasoning

Several examples successfully connect classroom equations with field decisions. The course is especially effective when it asks students to diagnose why a result is implausible, identify a measurement error, or compare alternative methods rather than simply calculate a number.

The distinction among crown cover, crown closure, and canopy closure in Unit III is also one of the strongest conceptual sections in the course.

---

# 3. Corrections Required Before Teaching

## 3.1 Correct the Bhutan DBH convention

**Status: Resolved — implemented 8 August 2026.** Every deck now teaches that the DBH reference height is protocol-dependent, naming 1.37 m for Bhutan's Second NFI and 1.30 m for many international manuals. Unit II carries a dedicated *national DBH protocol* slide with the 10 cm tree threshold, the 5–10 cm sapling class, the 12.62 m plots, the 4 × 4 km grid and the 95 % confidence intervals. The statement also appears on the shared notation reference sheet in all seven decks, in Units III, V, VI and VII where breast height is discussed, and in both forms of the module descriptor. The index no longer labels Unit II "cm · at 1.30 m".

Some slides state or imply that 1.30 m is Bhutan’s standard DBH reference height or that Bhutan’s National Forest Inventory used 1.30 m.

The Second National Forest Inventory states that over-bark DBH was recorded at **1.37 m**, with:

- trees beginning at 10 cm DBH;
- saplings from 5 cm to less than 10 cm DBH;
- three 12.62 m-radius plots per cluster;
- a 4 × 4 km national sampling grid;
- electronic data collection using Open Foris Collect Mobile;
- estimates accompanied by 95% confidence intervals.

The course should therefore teach:

> **DBH reference height is protocol-dependent. Bhutan’s Second National Forest Inventory used 1.37 m, while many international manuals use 1.30 m. Always identify and follow the applicable inventory protocol and record the reference height used.**

This correction should be made consistently in the course index and every affected unit, including Units II, III, V, VI, and VII.

Second NFI source:

[https://bfl.org.bt/wp-content/uploads/2024/11/National-Forest-Inventory-Volume-I\_State-of-Forest-Report-2023.pdf](https://bfl.org.bt/wp-content/uploads/2024/11/National-Forest-Inventory-Volume-I_State-of-Forest-Report-2023.pdf)

The course should not describe 1.30 m or 1.37 m as universally correct. The correct value depends on the official protocol governing the exercise.

## 3.2 Rebuild Unit III around Bhutan’s 2024 canopy guideline

**Status: Resolved — implemented 8 August 2026.** Section C now opens with four new slides implementing section 8 of this plan: definitions and thresholds, direct measurement or sampling, the 500 m² plot, and the GRS crown densitometer with both calculations. The former single national-procedure slide was removed and its content redistributed. The five comparative method families follow afterwards and are each labelled *comparative method — not the prescribed Bhutan procedure*. The field practical and data sheet were rebuilt on the official procedure, with the spherical densiometer retained in Part C as a comparative instrument. The original description of this item follows.

**Original description.** The current Unit III includes the national procedure near the end of the deck, including the GRS instrument, 12.62 m plot radius, 89 systematic plus 11 random observations, and the 2024 source. However, the unit sequence and principal field practical still centre on the spherical densiometer. The remaining task is to make the official procedure the organising spine of the lesson and practical.

Unit III explains general canopy concepts well and now presents Bhutan’s operative canopy-cover assessment procedure, but the official method is not yet sufficiently integrated into the main teaching sequence and field exercise.

The 2024 Forest Canopy Cover Assessment Guidelines should become the official Bhutanese spine of the unit.

The course should teach:

- use of the GRS crown densitometer;
- line-intercept or point observations;
- 500 m² circular plots;
- plot radius of 12.62 m;
- a minimum of 100 observations;
- approximately 2.5 m systematic spacing;
- procedures for larger areas;
- rectangular-plot provisions;
- the applicable definition of high forest;
- consistent point-selection conventions;
- calculation for single and multiple plots.

The current wording:

> “How much ground is shaded at noon?”

should be replaced with:

> **“The proportion of ground covered by the vertical projection of tree crowns.”**

Actual shade varies with solar angle and is not the technical definition of canopy cover.

Spherical densiometers, hemispherical photography, LiDAR, and other approaches may remain in the unit, but they should be labelled as comparative or alternative methods rather than the prescribed method for the main Bhutan field exercise.

## 3.3 Update tree-height measurement claims

**Status: Resolved — implemented 8 August 2026.** Unit IV no longer states that the clinometer is the instrument most used in Bhutan. It now distinguishes national inventory practice (Haglöf Laser Geo hypsometer, every tree in the plot) from FMU, community-forest, teaching and resource-limited practice, and says *name the setting before you name the instrument*. The height-class slide no longer presents subsampling as a national convention.

Some slides state that the clinometer is the instrument most commonly used in Bhutan and that tree height is generally measured only for a subsample.

The Second NFI states that a Haglöf Laser Geo Hypsometer was used to measure all trees within the plot.

The course should distinguish between:

- national forest inventory practice;
- Forest Management Unit practice;
- community-forest inventory practice;
- teaching-forest exercises;
- historical or resource-limited field practice.

Statements about clinometers or subsampling should not be presented as national conventions unless supported by a current official manual.

## 3.4 Integrate Bhutanese volume equations into Unit V

**Status: Resolved — implemented 8 August 2026.** The published validation tree (DBH 54.1 cm, height 23.4 m, field-measured 2.109 m³) is now a student-facing worked example, showing Model 16 at 2.237 m³ (+6.1 %) against Model 7 at 2.908 m³ (+37.9 %), with the four discussion questions of section 9. A second new slide sets out the model domain, the 214-of-249 western-valley geographic basis, extrapolation risk and the three uncertainties. The field practical now computes Model 16 directly and compares it with sectional volume, separating definitional difference from model and measurement error. Unit V now presents Models 7 and 16, their inputs, calibration information, and a visible worked example. The published 54.1 cm and 23.4 m validation example remains in lecturer notes rather than student-facing content, and the practical still compares sectional volume with a generic form-factor estimate rather than Model 16.

The Bhutanese *Pinus wallichiana* merchantable-volume study should be taught as part of the main lesson rather than provided only as supplementary reading.

Students should learn:

- what the model predicts;
- which inputs are required;
- whether height is included;
- the definition of merchantable volume;
- the diameter and geographic calibration range;
- model error and potential regional bias;
- risks of extrapolating beyond the fitted data.

The study selected:

- Model 7: basal area without height;
- Model 16: basal area × height.

Model 16 performed better in the published study and incorporates tree height.

The model domain should be presented clearly:

- species: *Pinus wallichiana*;
- minimum DBH: 10 cm;
- merchantable top diameter: 10 cm over bark;
- branches and foliage excluded;
- sample size: 249 trees;
- 214 trees from Thimphu, Paro, and Haa;
- approximate DBH range: 10–128 cm;
- cautious use outside the calibration range.

## 3.5 Integrate Bhutanese biomass equations into Unit VI

**Status: Resolved — implemented 8 August 2026.** Four new slides follow the existing general-conifer example: the two routes with their trade-offs; the equation-selection hierarchy and the six things to record; the structure of the equations with knots, units, calibration ranges and the five common errors; tree → stand → carbon with the three uncertainties; and a comparative student exercise on three blue pine. The exercise makes the intended point directly — trees A and B share a DBH of 25 cm, so the DBH-only equation returns 172.9 kg for both, while the height-inclusive equation separates them at 154.2 kg and 211.4 kg. Unit VI now introduces the Bhutan general-conifer equation, tree-to-hectare conversion, and the existence of species-specific and forest-group models. It still needs the complete two-route comparison, equation-selection hierarchy, carbon-conversion guidance, uncertainty treatment, and a student exercise comparing DBH-only with DBH-plus-height estimates.

The current course still gives greater emphasis to biomass estimation through:

$$
\text{Volume} \times \text{Wood density} \times \text{Expansion factor}
$$

This is one valid approach, but direct allometric estimation is also important.

Students should learn two routes:

1. **Indirect biomass estimation**
   Volume × wood density × biomass expansion factor.
2. **Direct biomass estimation**
   Species-specific or forest-group allometric equations using DBH, or DBH plus height.

The 2018 Bhutan biomass reference provides:

- equations for 14 species;
- general conifer equations;
- general broadleaf equations;
- DBH-only models;
- DBH-plus-height models;
- species-specific calibration ranges;
- restricted cubic-spline terms.

Students must be warned not to:

- omit the spline term;
- confuse centimetres and metres;
- apply an equation outside its species or DBH range without caution;
- use a general equation when an appropriate species-specific equation is available;
- assume equation uncertainty disappears when estimates are aggregated.

## 3.6 Correct overstatements in Unit VII

**Status: Resolved — implemented 8 August 2026.** All three replacements were made in the slide bodies, the increment-classification table, the review questions, the summary graphic and the speaker notes.

Replace:

> “CAI cannot be measured.”

with:

> **“Annual diameter or volume increment may be too small or variable to estimate reliably from ordinary annual tape measurements. CAI can, however, be estimated using dendrometers, tree-ring measurements, repeated high-precision observations, or suitable growth models.”**

Replace:

> “PAI > MAI means the stand is not ready to cut.”

with:

> **“When PAI exceeds MAI, mean annual volume production is still increasing under the assumed yield sequence. This does not by itself determine whether a stand should be harvested.”**

Replace:

> “MAI culmination equals rotation.”

with:

> **“MAI culmination identifies the biological rotation for maximum mean annual volume production.”**

Actual rotations in Bhutan may instead be influenced by:

- biodiversity objectives;
- watershed protection;
- livelihood requirements;
- financial returns;
- regeneration needs;
- carbon objectives;
- cultural values;
- habitat conservation;
- legal or management-plan requirements.

## 3.7 Correct claims about error cancellation

**Status: Resolved — implemented 8 August 2026.** The corrected statement now appears in Unit V, on the new validity-and-limitations slide and on the validation-tree slide, and in Unit VI, on the equation-structure slide as the fifth of the five common errors.

The statement that individual-tree model errors cancel when trees are combined into a stand estimate is too strong.

Replace it with:

> **“Positive and negative random errors may partly offset in a sufficiently large sample, but shared model bias, site effects, species differences, measurement bias, and extrapolation error can remain or accumulate.”**

## 3.8 Correct the sampling-fraction statement

**Status: Resolved — implemented 8 August 2026.** Unit VI worked example 9 now states that a small sampling fraction is not by itself evidence of poor precision, lists the eight things precision actually depends on, and gives the decisive objection: one plot cannot represent spatial variability and provides no design-based variance. The new variance slide makes the point quantitatively — seven plots would meet a 10 % relative standard error on that stand, a sampling fraction of 0.7 %.

A 0.2% sampling fraction is not automatically evidence of poor precision.

Precision depends on:

- number of plots;
- plot distribution;
- population variability;
- sampling design;
- plot size;
- estimator used;
- measurement quality;
- spatial autocorrelation.

The stronger criticism is that **one plot cannot adequately represent spatial variability and cannot provide a defensible design-based variance estimate**.

## 3.9 Correct specific arithmetic and wording issues

**Status: Resolved — implemented 8 August 2026.** All five remaining items are done. Unit VII assessment questions now run 1–8. The diameter-growth question was recalibrated to 25, 28 and 31 cm, giving S = 1 exactly and an age of about 52 years in 2010, with the worked answer and the reason for the recalibration in the speaker notes. The Schiffel statement now refers to total height being twice *breast height*. The Unit VI crop-height understatement is reported as 22.6 % of the correct value, with the 29.2 % alternative explained in the speaker notes. The negative-increment cross-reference now points to slide 23. Three further stale cross-references found during the pass were also corrected.

The items were:

- Unit VII assessment numbering contains 1, 2, 4, 4, 5, 6, 7, 8; question 3 is missing.
- The Unit VII diameter-growth question gives a biologically implausible age result and should be recalibrated.
- The Schiffel form-quotient statement should refer to total height being twice breast height, not twice DBH in the same units.
- The Unit VI crop-height understatement should be reported as approximately 22.6% relative to the correct value.
- The cross-reference to the negative-increment slide should point to the correct slide.

---

# 4. Cross-Unit Contradictions to Resolve

## 4.1 Crown height

**Status: Resolved — implemented 8 August 2026.** The recommended system was adopted in full. Unit III's ambiguity slide is retitled *Why this module never says "crown height"* and names the four terms. Unit IV renames its item 6 to crown-base height and its ratio to live-crown ratio. Both units, and the shared notation reference sheet in all seven decks, now carry the same four definitions, and "live crown ratio" was hyphenated throughout.

The adopted system is:

- **Crown-base height:** ground to base of live crown.
- **Crown length:** total height minus crown-base height.
- **Crown midpoint height:** ground to midpoint of live crown.
- **Live-crown ratio:** crown length divided by total height.

Avoid using “crown height” unless its meaning is explicitly defined.

## 4.2 Bark notation

**Status: Resolved — implemented 8 August 2026.** *t* is one-sided bark thickness and *B* = 2*t* is double bark thickness, stated on the notation reference sheet in every deck and on the Unit II bark slides.

The adopted system is:

$$
D\_{ub}=D\_{ob}-2t
$$

where:

- (D\_{ub}) = under-bark diameter;
- (D\_{ob}) = over-bark diameter;
- (t) = bark thickness on one side.

If double bark thickness is needed, use a separate symbol such as (B=2t).

## 4.3 Abnormality at breast height

**Status: Resolved — implemented 8 August 2026.** Unit II and Unit VI now both state that the two rules are not interchangeable and that the applicable inventory protocol governs, with the abnormality, the measurement positions and the calculation method recorded.

The two rules were:

- measure immediately above or below the abnormality;
- measure above and below and take the mean.

These may represent different protocols, but they should not be presented as interchangeable universal rules.

The slide should state:

> **“Follow the applicable inventory protocol. Record the abnormality, measurement positions, and calculation method.”**

## 4.4 Session numbering

**Status: Resolved — implemented 8 August 2026.** Unit VII was renumbered from Sessions 14–16 to Sessions 15–17, removing the clash with Unit VI. The sequence now runs I: 1–2, II: 3–4, III: 5, IV: 6–9, V: 10–12, VI: 13–14, VII: 15–17, and every deck cover and index card carries its session range.

## 4.5 Attribution of the 69.71% forest-cover figure

**Status: Resolved.** The current decks consistently attribute the 69.71% forest-cover figure to the Second National Forest Inventory, and the Second NFI report supports that figure. Retain consistent wording and citation during future revisions.

## 4.6 Notation drift

**Status: Resolved — implemented 8 August 2026.** A single notation reference sheet — the same markup in all seven decks — fixes the symbols below, together with the crown terms, the bark symbols, the spelling list of 4.7 and the DBH protocol statement. The governing rule is stated explicitly: lower case is one tree, upper case is the stand.

The adopted system is:

- (d): tree diameter;
- (C): circumference or girth;
- (g): basal area of one tree;
- (G): stand basal area;
- (h): individual-tree height;
- (H\_L): Lorey’s mean height;
- (v): individual-tree volume;
- (V): stand volume;
- (t): one-sided bark thickness.

Add the same notation slide or reference sheet to all units.

## 4.7 Terminology and spelling

**Status: Resolved — implemented 8 August 2026.** Standardised course-wide and listed on the notation reference sheet: *relascope* (Relaskop removed), *calliper* (matching the module descriptor), *Smythies’ hypsometer*, *chir pine* (chirpine removed), *breast height*, *over bark* and *under bark*, *merchantable height*, *bole height*, *crown-base height*.

The list was:

- relascope or Relaskop;
- caliper or calliper;
- Smythies’ hypsometer;
- chir pine;
- breast height;
- over bark and under bark;
- merchantable height;
- bole height;
- crown-base height.

---

# 5. Bhutan Policy and Management Alignment

## 5.1 Present mensuration as multipurpose forestry

**Status: Resolved — implemented 8 August 2026.** Unit V's slide title *Why volume is the ultimate objective of mensuration* became *Why volume carries so many decisions*, and its closing claim that every other measurement exists to produce volume was replaced. Unit I's learning outcome 3, its definition slide, its summary and its review question were reworded, and a panel listing the fourteen quantities below was added to the slide that previously asserted volume's primacy.

The statement replaced was:

> “Volume is the ultimate objective.”

should be replaced.

Forest mensuration supports estimation and monitoring of:

- growing stock;
- timber and fuelwood supply;
- non-wood forest products;
- biomass;
- carbon;
- forest structure;
- biodiversity habitat;
- regeneration;
- forest health;
- watershed protection;
- livelihood supply;
- restoration;
- sustainable harvest;
- climate-change impacts.

Volume is one major variable, not the sole objective.

## 5.2 Add a Bhutan policy connection to every unit

**Status: Resolved — implemented 8 August 2026.** All seven units now carry a student-facing *Bhutan policy connection* slide following the table below, each citing the Constitution, the National Forest Policy 2011, the FNCA 2023 or the biodiversity strategy as applicable. Unit I's version sets the frame for the other six.

The connections implemented are:

| Unit | Bhutan policy or practice connection |
| --- | --- |
| Unit I | Constitutional forest commitment, sustainable forest management, national reporting |
| Unit II | Community-forest inventory, timber marking, NFI tree measurement |
| Unit III | Forest classification, canopy assessment, habitat condition, land-use decisions |
| Unit IV | Growing-stock estimation, dominant height, site quality, biomass models |
| Unit V | FMU planning, local volume equations, timber allocation, merchantability |
| Unit VI | Carbon reporting, crop structure, sustainable yield, biomass per hectare |
| Unit VII | Rotation decisions, allowable harvest, growth monitoring, climate resilience |

## 5.3 Include communities and indigenous knowledge

**Status: Resolved — implemented 8 August 2026.** Community forestry now appears on the policy slide of every unit. Unit VI carries the fullest treatment: management-plan preparation and revision, the group's own timber, fuelwood and pole requirement against sustainable supply, regeneration monitoring, culturally important species, NWFP resources, and the explicit statement that members' local ecological knowledge is combined with plot measurement rather than replaced by it, in support of transparent and equitable allocation.

The uses listed were:

- prepare and revise community-forest management plans;
- assess local timber and fuelwood needs;
- estimate sustainable supply;
- monitor regeneration;
- identify culturally important species;
- assess NWFP resources;
- combine local ecological observations with formal measurements;
- support transparent and equitable allocation decisions.

## 5.4 Include biodiversity, ecosystem services, and climate resilience

**Status: Resolved — implemented 8 August 2026.** The full list below appears as a chip panel on the Unit VI policy slide under the heading *Beyond timber — the same instruments*, and the point is reinforced on the Unit I, III, IV, V and VII policy slides.

The quantities listed were:

- number of large habitat trees;
- standing and fallen deadwood;
- diameter-class diversity;
- crown condition;
- regeneration density;
- basal area by species group;
- biomass and carbon;
- canopy cover;
- riparian stand structure;
- climate-related mortality;
- changes between repeated inventories.

---

# 6. Add a Proper Sampling and Inference Section

**Status: Resolved — implemented 8 August 2026.** Three new slides in Unit VI, placed before the sources-of-error slide, cover the whole of sections 6.1 to 6.6: the sampling frame and the target-versus-sampling-population gap; the four designs plus the fixed-area / variable-radius and permanent / temporary axes, with the Second NFI grid and cluster design named; expansion factors; a fully worked variance, standard error and 95 % confidence interval on five plots (200 ± 64 m³/ha, relative standard error 11.6 %, CV 26 %, about seven plots needed for a 10 % relative standard error); the measurement-versus-sampling-error distinction; non-response and inaccessible plots; and a ten-item QA/QC list.

The course introduces sampling but does not develop it sufficiently in the student-facing teaching sequence.

A dedicated section should cover:

## 6.1 Sampling frame

Students should understand:

- target population;
- sampling population;
- forest boundary;
- exclusions;
- inaccessible plots;
- incomplete frames;
- implications of boundary errors.

## 6.2 Sampling designs

Teach:

- simple random sampling;
- systematic sampling;
- stratified sampling;
- cluster sampling;
- fixed-area plots;
- variable-radius plots;
- permanent versus temporary plots.

## 6.3 Expansion factors

For a fixed-area plot:

$$
\text{Expansion factor}=\frac{1\text{ ha}}{\text{plot area in ha}}
$$

For a 500 m² plot:

$$
500\text{ m}^2=0.05\text{ ha}
$$

$$
\text{Expansion factor}=\frac{1}{0.05}=20
$$

Therefore, the plot total is multiplied by 20 to estimate the equivalent quantity per hectare.

## 6.4 Variance and confidence intervals

Students should learn:

- sample mean;
- sample variance;
- standard error;
- confidence interval;
- effect of sample size;
- difference between measurement error and sampling error;
- why one plot cannot provide a reliable estimate of spatial variability.

## 6.5 Non-response and inaccessible plots

The course should discuss:

- replacement versus non-replacement;
- reasons for plot non-response;
- recording inaccessible plots;
- bias caused by systematically excluding steep or remote locations;
- documenting protocol deviations.

## 6.6 Quality assurance and quality control

Include:

- instrument calibration;
- repeat measurements;
- tolerance limits;
- species-code checks;
- coordinate checks;
- range checks;
- duplicate-tree prevention;
- field-team consistency;
- supervisor remeasurement;
- data validation before analysis.

---

# 7. Recommended Incorporation Map

| Source | Primary course location | What students should learn |
| --- | --- | --- |
| Forest Canopy Cover Assessment Guidelines 2024 | Unit III | Official Bhutan canopy-cover procedure |
| *Pinus wallichiana* merchantable-volume study | Unit V | Application and evaluation of a Bhutan volume model |
| Allometric Biomass Equations 2018 | Unit VI | Conversion of tree measurements to biomass per hectare |

The three PDFs are already included under clear filenames. Do not add duplicate copies. Retain the existing links in the course index and integrate the content into the teaching sequence. Record file hashes separately only when the original comparison files and an auditable hash record are available.

Do not paste full PDF tables into slides. Convert selected material into:

- diagrams;
- decision rules;
- worked examples;
- model-selection guides;
- field-practical instructions;
- data sheets;
- spreadsheet calculators.

---

# 8. Unit III: Recommended New Teaching Sequence

**Status: Resolved — implemented 8 August 2026.** The four slides below were built and inserted at the head of Section C, in this order, and the field practical and data sheet were rebuilt on them. The specification that follows was the brief.

Move the Bhutan canopy material before the general methods section.

## Slide 1: Bhutan definition and thresholds

Include:

- forest area threshold;
- minimum tree-height criterion;
- minimum canopy-cover criterion;
- applicable high-forest threshold;
- canopy cover as vertical crown projection;
- canopy closure as obstruction of the sky hemisphere.

Clearly cite the exact definition and legal or guideline source.

## Slide 2: Direct measurement or sampling

Present the guideline’s observation requirements:

- area ≤500 m²: 100 observations;
- area >500–2,500 m²: 150 observations;
- area >2,500–5,000 m²: 200 observations;
- area >5,000 m²: establish sample plots.

Explain how irregular boundaries and rectangular areas are handled.

## Slide 3: Bhutan’s 500 m² circular plot

Include:

- radius: 12.62 m;
- minimum 100 readings;
- approximately 2.5 × 2.5 m spacing;
- 89 systematic and 11 additional points, where specified;
- consistent point-selection procedure;
- field sketch showing observation locations.

## Slide 4: Using the GRS crown densitometer

Procedure:

1. Hold and level the instrument correctly.
2. Observe the inner circle.
3. Record 1 when canopy occupies more than 50% of the inner circle.
4. Record 0 otherwise.
5. Continue until all observations are complete.
6. Calculate:

$$
\text{Canopy cover}=
\frac{\text{canopy observations}}
{\text{total observations}}
\times100
$$

Include both one-plot and multiple-plot examples.

## Field practical revision

The field practical and data sheet should follow the official Bhutan procedure.

Other instruments should be labelled:

> **Alternative or comparative methods—not the prescribed method for this exercise.**

---

# 9. Unit V: Bhutan Merchantable-Volume Lesson

**Status: Resolved — implemented 8 August 2026.** The validation tree is now worked example 11, student-facing, and the practical compares sectional volume with Model 16 directly. Slides 1 and 2 of the specification below were already present; slides 3 and 4 were built during this pass. The Excel calculator remains outstanding.

Insert the lesson before the general sources-of-error section.

## Slide 1: Predicted quantity

Explain that the equation predicts:

- merchantable stem volume;
- for *Pinus wallichiana*;
- for trees at or above the study’s minimum DBH;
- to a 10 cm over-bark top diameter;
- excluding branches and foliage.

Clearly distinguish:

- total tree volume;
- merchantable stem volume;
- biomass.

## Slide 2: Selected models

Present only the main models:

- Model 7: basal area without height;
- Model 16: basal area × height.

Explain the model-selection logic and why the height-inclusive model performed better.

Do not show every candidate model unless they are placed in a handout.

## Slide 3: Worked Bhutan example

Use the published example:

- DBH = 54.1 cm;
- height = 23.4 m;
- field-measured merchantable volume = 2.109 m³;
- Model 16 prediction ≈ 2.237 m³.

Calculate percentage error:

$$
\frac{2.237-2.109}{2.109}\times100
$$

$$
\frac{0.128}{2.109}\times100
$$

$$
\approx6.1%
$$

Ask students to discuss:

- whether 6.1% is acceptable for one tree;
- whether the same error would be acceptable for stand estimation;
- whether the error is random or systematic;
- whether the tree lies within the calibration range.

## Slide 4: Validity and limitations

Include:

- sample size;
- geographic representation;
- DBH range;
- merchantability definition;
- output unit;
- potential regional bias;
- risks of extrapolation;
- model uncertainty;
- measurement uncertainty.

## Practical exercise

Students should:

1. sectionally measure a felled blue pine using Smalian’s formula;
2. estimate volume using the Bhutan equation;
3. compare the estimates;
4. calculate absolute and percentage differences;
5. explain likely sources of disagreement.

Provide one hand-worked demonstration and an Excel calculator for repeated use.

---

# 10. Unit VI: Bhutan Biomass Lesson

**Status: Resolved — implemented 8 August 2026.** The existing general-conifer example was preserved and all four specification slides plus the student exercise were built after it, before the sources-of-error slide. Carbon conversion is taught as a rule — find, use and cite the fraction the applicable protocol requires — rather than as a memorised constant. The Excel calculator remains outstanding.

Place the expanded biomass section after crop-volume estimation and before the general sources-of-error section.

## Slide 1: Two routes to biomass

### Indirect approach

$$
\text{Volume}
\times
\text{Wood density}
\times
\text{Expansion factor}
$$

### Direct approach

Apply a Bhutan allometric equation using:

- DBH; or
- DBH and height.

Explain when each approach may be appropriate.

## Slide 2: Equation-selection hierarchy

Use:

1. species-specific DBH-plus-height equation within its calibration range;
2. species-specific DBH-only equation when reliable height is unavailable;
3. general conifer or broadleaf equation when no suitable species equation exists.

Students should always record:

- equation source;
- species;
- input units;
- calibration range;
- output unit;
- reason for selecting the equation.

## Slide 3: Structure of the Bhutan equations

Explain:

- DBH is converted to basal area in square metres;
- BAH is basal area multiplied by height;
- output biomass is in kilograms;
- (X\_2) is a restricted cubic-spline term;
- published knots must be used exactly;
- units must not be mixed;
- the spline term must not be omitted.

## Slide 4: Tree biomass to stand biomass

Procedure:

1. calculate biomass for each tree;
2. sum tree biomass within the plot;
3. divide by plot area in hectares;
4. report kg/ha;
5. convert to Mg/ha:

$$
1\text{ Mg}=1,000\text{ kg}
$$

6. convert biomass to carbon only using the carbon fraction required by the applicable reporting protocol;
7. report sampling, equation, and measurement uncertainty.

## Student exercise

Compare DBH-only and DBH-plus-height estimates for three blue pine trees.

Students should explain why two trees with the same DBH but different heights may not have the same biomass.

---

# 11. Presentation and Source Strategy

## 11.1 Use visible source classifications

Every slide containing a procedure, threshold, equation, or dataset should be visibly labelled as one of the following:

- **Official Bhutan procedure**
- **Bhutan research equation**
- **General international method**
- **Historical practice**
- **Hypothetical teaching data**

Qualifications should not remain only in hidden speaker notes.

## 11.2 Standard information for every equation

Each worked equation should show:

- source and year;
- predicted variable;
- required inputs;
- input units;
- output unit;
- applicable species;
- calibration range;
- geographic basis;
- merchantability definition, where relevant;
- major limitation.

## 11.3 Replace incomplete citations

Replace footers such as:

> “Source: Session 3, slide 8.”

with:

- publication author;
- year;
- publication title;
- manual or report section;
- relevant page;
- stable file or web link.

Units II and IV particularly require full reference slides.

## 11.4 Keep international comparative readings clearly separated

The American extension guide may remain as optional comparative reading, but it should not be presented as Bhutan field guidance because it uses:

- 4.5-foot DBH;
- acres;
- board feet;
- Doyle log rules;
- southern United States hardwood examples.

Students should not be expected to apply those conventions in Bhutan unless the exercise explicitly compares measurement systems.

---

# 12. Course Structure and Teaching Products

The course currently contains 348 slides. Adding all recommended material without restructuring would make it too long.

Develop three coordinated products.

## 12.1 Concise, readable student-facing teaching slides

The seven lecture decks should be prepared as **student-facing teaching materials**. They should be concise enough to read comfortably from the back of a classroom and should prioritise the information students need to understand, practise, and revise.

Use the slides for:

- learning outcomes;
- key concepts and definitions;
- official Bhutan protocols;
- diagrams and field illustrations;
- decision rules;
- essential formulas and notation;
- essential derivations only;
- selected worked examples;
- practical instructions;
- common measurement errors;
- key assumptions and limitations;
- short source citations;
- assessment guidance;
- unit summaries and revision points.

Recommended minimum font sizes are:

- **slide titles:** 30–36 pt;
- **main text:** 24–28 pt;
- **table and figure labels:** at least 20 pt;
- **citations and source notes:** at least 16–18 pt.

Do not reduce font size simply to fit more material onto a slide. Long explanations, detailed derivations, coefficient tables, extended worked examples, and supplementary technical notes should be moved to the student lecture notes or handbook.

Avoid overcrowded tables. Equations, symbols, units, diagrams, tables, and worked calculations must remain clearly visible.

## 12.2 Student-facing lecture notes and calculation handbook

**Status: Resolved — implemented 8 August 2026.** A `notes/` directory now holds a reading document for each of Units I–VII plus one calculation handbook, with a contents page of their own and a link from the module contents page and the README. Each unit file follows the thirteen-part structure specified below, in that order, and none of the thirteen parts is omitted in any unit. The seven units run about 24 700 words in total; the handbook adds about 5 700.

The handbook takes the eight kinds of material listed below off the slides, in twenty sections: notation and units; unit conversions; a formula sheet covering all seven units; five derivations — the four solids from *V* = *S*<sub>b</sub>·*l*/(*r*+1) and why Newton's formula is exact by Simpson's rule, the quarter-girth ratio QGV/*V* = π/4, the spacing factor *G* = 7854/*F*², the six sine cases, and the culmination of the m.a.i both with and without calculus; a step-by-step evaluation of the restricted cubic spline term; the complete coefficient tables — volume Models 7 and 16 with their domain, all 32 biomass equations in both the BA and BAH forms, and nine published form factors; the Bhutan protocol reference; and worked solutions to every practice question in every unit.

Terminology, notation, units, equations, citations and Bhutan-specific conventions are the same in the notes, the handbook, the decks, the practical sheets and the calculators. Every numerical answer in the notes and in the handbook's solutions was computed by script and checked before it was written. Each file paginates to about eight A4 sides and prints without a horizontal scroll at 390 px, so it can be read on a phone or handed out on paper. The original description of this item follows.

Prepare a coordinated set of **student-facing lecture notes for Units I–VII**. These notes should complement rather than duplicate the slides and should contain enough explanation for independent study before and after class.

For each unit, the lecture notes should preferably include:

1. unit title and learning outcomes;
2. key terminology and definitions;
3. explanation of major concepts;
4. important equations and notation;
5. meaning and units of every variable;
6. step-by-step worked examples;
7. Bhutan-specific field procedures and applications;
8. important assumptions and limitations;
9. common measurement and calculation errors;
10. short field-practical guidance;
11. practice questions or self-study exercises;
12. unit summary;
13. key references and further reading.

Use the student lecture notes or calculation handbook for:

- long derivations;
- complete coefficient tables;
- additional worked examples;
- formula sheets;
- model documentation;
- detailed explanatory notes;
- self-study exercises;
- worked solutions or answer keys where appropriate.

Where appropriate, the notes should explain how each topic is applied in Bhutanese forestry, including forest inventory, community forestry, forest management planning, biomass and carbon estimation, biodiversity monitoring, sustainable harvesting, and multipurpose forest management.

The slides, student lecture notes, practical sheets, and assessments should use the **same terminology, notation, units, equations, and Bhutan-specific conventions**.

## 12.3 Field practical and data sheets

Use for:

- instrument checks;
- field procedures;
- plot establishment;
- tree-measurement forms;
- canopy observations;
- height measurement;
- sectional volume;
- biomass calculations;
- QA/QC;
- supervisor verification.

Generic and repetitive material should be moved from the slides into the handbook rather than simply appending more slides.

---

# 13. Additional Structural Improvements

## 13.1 Rebuild Unit II

**Status: Resolved — implemented 8 August 2026.** Four slides were added: the national DBH protocol; calibration and repeatability tolerances with a blind re-measurement procedure; a standalone field data sheet with exception codes and an in-field QC block; and the Bhutan policy connection. The shared notation reference sheet was added too. All thirty "Source: Session 3, slide N" style footers were replaced with real citations (DoFPS 2023; Husch, Beers and Kershaw 2003; West 2009; BIPM 2019), and a full references block replaced the two-line source list on the summary slide, with the UT Extension guide explicitly marked as comparative reading only. The difficult-stem rules were aligned with Unit VI. The class timer and the classroom-timetable panel were removed.

Unit II is currently weaker than the other units in:

- Bhutanese content;
- references;
- speaker notes;
- error classification;
- field-practical guidance;
- data sheets;
- assessment alignment.

Because diameter enters basal area and volume as a squared term, Unit II is one of the most consequential units in the course.

It should include:

- official Bhutan DBH protocol;
- difficult-stem decision rules;
- slope and leaning-tree procedures;
- buttress and deformity examples;
- bark measurement;
- instrument calibration;
- repeatability tolerances;
- Bhutanese species examples;
- field data sheet;
- complete references.

## 13.2 Move tutor-facing instructions

**Status: Resolved — implemented 8 August 2026.** Every student-visible tutor note, verification instruction and drafting comment was removed or rewritten as student-facing content across Units V, VI and VII, and the open verification tasks in the speaker notes were resolved into settled guidance. The 55-versus-60-year age answer in Unit VII is now decided: 60 years is marked correct, and 55 is taught only as the rounding demonstration. A validation script checks the decks for these patterns and currently reports none.

The examples given were:

Statements such as:

- “Decide which you will mark as correct”;
- “Verify against DoFPS”;
- “Fill in the specific references”;

should not appear in the student-facing slide body.

Open verification tasks should be resolved before teaching.

## 13.3 Improve assessment guidance

**Status: Partially implemented.** Assessment-link callouts, required units, worked answers in speaker notes and marking guidance were strengthened where slides were edited, and the Unit VII marking guidance now carries a full worked answer for the recalibrated question. A systematic per-unit statement of the seven points below has not been made and remains outstanding. The student notes built under §12.2 now carry practice questions for every unit and the handbook carries worked solutions to all of them, which covers two of the seven points — required units and whether formulae are provided are explicit throughout — but the seven points are not yet stated as a set, unit by unit, in one place. That is the remaining work on this item.

The seven points are:

- which outcomes are assessed;
- common student errors;
- required units;
- whether formulas are provided;
- whether derivations are examinable;
- whether protocol identification is assessed;
- whether students must interpret uncertainty.

Avoid relying only on:

> “Every outcome is examinable.”

## 13.4 Use a continuous Bhutan case study

**Status: Resolved — implemented 8 August 2026.** One **500 m² circular plot of 12.62 m radius** — deliberately the same geometry as the National Forest Inventory, the 2024 canopy guideline and Unit VI's expansion factor of 20 — is carried through Units II to VII as six slides, one per unit, under a shared banner reading *Case study · one 500 m² plot, carried through Units II–VII · step N of 6*.

The plot holds 24 stems, 11.2–57.6 cm DBH, mostly *Pinus wallichiana* with three *Quercus lanata*, in a Thimphu-valley blue pine compartment at about 2 600 m. Every figure was generated and checked by script before any slide was written: 480 stems/ha, G 32.2 m²/ha, Lorey's height 22.7 m, crop diameter 29.2 cm against a mean diameter of 26.4 cm, growing stock 349 m³/ha, biomass 141.9 Mg/ha, canopy cover 68 %, and after ten years at 0.42 cm/yr a p.a.i of 11.5 against an m.a.i of 7.1 m³/ha/yr.

**The thread is additive, not a replacement.** The existing worked examples each teach their own point and their arithmetic has been verified; rebuilding them around one dataset would put that at risk for no pedagogical gain. The six case-study slides sit alongside them and are labelled as the continuous thread.

The proposed structure was:

The proposed structure was:

- Unit II: measure diameter;
- Unit III: assess canopy cover;
- Unit IV: measure tree height;
- Unit V: estimate individual-tree volume;
- Unit VI: estimate basal area, growing stock, and biomass per hectare;
- Unit VII: estimate growth and discuss sustainable harvest.

This would show students how measurement errors propagate through a complete inventory rather than presenting disconnected hypothetical datasets.

---


## 13.5 Improve slide readability, remove timing elements, and acknowledge teaching-material contributions

**Status: Resolved — implemented 8 August 2026.** The type scale was raised across all seven decks. Units I, III, V, VI and VII were brought up to the scale Unit IV already used; Unit II went a step further again, because measurement showed it was the emptiest deck in the module at 58 % median content fill against 100 % everywhere else.

| | Was | Now | Unit II now |
|---|---|---|---|
| Slide title | 52 px | **58 px** | **58 px** |
| Lead | 30 px | **34 px** | **38 px** |
| Body text | 21 px | **24 px** | **30 px** |
| Bullets | 20 px | **23 px** | **28 px** |
| Tables | 19 px | **21 px** | **24 px** |
| Callouts | 20 px | **23 px** | **28 px** |
| Citations | 15 px | **17 px** | **17 px** |

The roughly 600 inline `font-size` overrides inside slides were scaled by the same factor, so the increase is visible on the busiest slides and not only on the sparse ones.

**What it cost, and where the space came from.** Raising the type put **42 slides** over their frame. Card padding, grid gaps and row spacing were tightened module-wide, which recovered most of it; 27 slides then took a `fit` or `fit2` class that trims **padding and gaps only**; and 11 slides had genuine content cut, in line with §12.1's instruction to shorten rather than shrink. Two reference slides render their bibliography at citation size, which this plan permits for citations and which is still an increase on the old body size. The type was **not** reduced anywhere to make material fit.

**Unit II's empty space.** Type alone took Unit II from 58 % to 64 % median fill, because its slides genuinely carry less than their counterparts elsewhere. Thirteen of the thinnest were given the closing callout every other deck uses — the “so what” line, spanning the full width — which brought the deck to **74 %**. Stretching the grid rows to fill the band was tried first and rejected: it produced tall boxes with text adrift in the middle, which reads worse than honest white space.

**A related defect found and fixed.** The larger titles pushed 15 slides' two-line headings into the body band. `.body.deep` was retuned to 266 px and applied to those slides, and the render check now tests for head/body collision as well as overflow.

### Enlarge the font size and reduce slide density

Increase the font size throughout all seven lecture decks so that the content is readable from the back of a classroom. Reduce the amount of text on each slide instead of fitting lengthy explanations into small text.

Recommended minimum sizes:

- **Slide titles:** 30–36 pt
- **Main text:** 24–28 pt
- **Table and figure labels:** at least 20 pt
- **Citations and source notes:** at least 16–18 pt

Long explanations, derivations, coefficient tables, extensive notes, and additional worked examples should be transferred to the **student-facing lecture notes, calculation handbook, or speaker notes**, depending on whether the material is intended for students or lecturers.

Student-facing slides should retain only the essential concepts, formulas, diagrams, decision rules, Bhutan-specific procedures, selected worked examples, and assessment guidance. Equations, units, symbols, tables, and worked calculations must remain clearly visible.

### Make all lecture materials student-facing

The seven lecture decks and accompanying lecture notes should be designed specifically for students.

Student-facing materials should include:

- learning outcomes;
- key concepts and definitions;
- essential formulas and notation;
- Bhutan-specific procedures and examples;
- diagrams and field illustrations;
- selected worked examples;
- practical instructions;
- common measurement errors;
- important assumptions and limitations;
- short source citations;
- summaries and revision points.

Do not display lecturer-only material such as:

- reminders to verify information;
- instructions about what the lecturer should explain;
- directions about what should be marked correct;
- presentation prompts;
- answer-key notes;
- internal editing comments;
- unresolved drafting instructions;
- session-management notes.

Lecturer-only information should be kept in **speaker notes, the lecturer’s lesson plan, or a separate lecturer guide**.

### Remove class timing and timetable elements

**Status: Resolved — implemented 8 August 2026.** The class timer was removed from Unit II — the only deck that had one — along with its CSS, its HUD element, its keyboard handlers and its two help-overlay rows, and the classroom-timetable panel was replaced on the Unit II closing slide. Remaining timing references are in speaker notes, where this plan directs them.

**Second pass.** The *Class hours* card (Monday 2nd–4th period 09:00–12:15, Thursday 2nd–3rd 09:00–11:15, Classroom B2.6) was still on the closing slide of Units I, III, IV, V, VI and VII. All six were replaced with a **Where to find things** card pointing at the contents page, the supplementary readings and the VLE — none of which goes stale when the timetable changes. The matching housekeeping lines in the speaker notes were reworded, and the index and README no longer advertise a class timer. A grep for `Class hours`, `09:00`, `B2.6` and `2nd – 4th` across the whole package now returns nothing.

Remove class timers, countdowns, session-duration indicators, break schedules, and timetable information from student-facing lecture slides and lecture notes.

These elements occupy valuable slide space, distract from academic content, and may become inaccurate when the teaching schedule changes.

Class duration, activity timing, breaks, and session planning should instead be maintained in:

- the lecturer’s lesson plan;
- speaker notes;
- the VLE course schedule; or
- a separate teaching timetable.

Student-facing materials should concentrate on **what students need to understand, practise, apply, and revise**.

### Credit the contributor of teaching materials

**Status: Resolved — implemented 8 August 2026.** An acknowledgement slide was added to Unit I and to the module descriptor deck, and the same acknowledgement was added to the README and to the descriptor markdown. The wording below was used verbatim.

Add an acknowledgement slide near the beginning or end of the course and include the same acknowledgement in the course handbook, student lecture notes, or README file.

**Recommended acknowledgement**

> **Acknowledgement**  
> The course developer gratefully acknowledges **Laxmi Sagar, Associate Lecturer, College of Natural Resources**, for sharing teaching materials previously used for the same Forest Mensuration course. Selected concepts and materials were reviewed, adapted, expanded, and contextualized for the present MEN 201 course.

Where a particular diagram, table, exercise, explanation, or slide is directly adapted from the shared materials, include a specific source note on that slide or in the corresponding lecture-note section, for example:

> *Adapted from teaching materials shared by Laxmi Sagar, Associate Lecturer, College of Natural Resources.*

Acknowledgement of the overall contribution does **not** replace proper citation of original books, manuals, reports, research papers, photographs, diagrams, equations, tables, or datasets used within the shared teaching materials.

### Required implementation across Units I–VII

1. Increase slide font sizes and simplify slide content.
2. Move detailed explanations and extended calculations into student-facing lecture notes or the calculation handbook.
3. Remove lecturer instructions, internal drafting comments, answer-key directions, and unresolved verification notes from student-facing slides.
4. Remove class timers, timetable information, break schedules, and session-duration indicators.
5. Maintain lecturer-only material separately in speaker notes, lesson plans, or a lecturer guide.
6. Develop coordinated student-facing lecture notes for Units I–VII.
7. Add an acknowledgement slide crediting Laxmi Sagar.
8. Add specific adaptation notes where individual materials are directly derived from the shared teaching materials.
9. Retain proper citations to original publications and source materials.
10. Ensure consistent terminology, notation, units, formulas, and Bhutan-specific procedures across the complete MEN 201 teaching package.


---

# 14. Prioritized Action Plan

**Implementation status, 8 August 2026.** Priority 1 complete. Priority 2 complete. Priority 3 complete. Priority 4 complete. The one item that remains open anywhere in the plan is §13.3, the systematic per-unit statement of the seven assessment points; the notes now carry practice questions and worked solutions for every unit, but the seven-point statement has not been made unit by unit.

## Priority 1: Correct before the next class — **all complete**

1. Correct the DBH protocol statements.
2. Resolve crown-height terminology.
3. Standardize bark notation.
4. Correct the Schiffel statement and the Unit VI 22.6% calculation.
5. Correct Unit VII question numbering, the unresolved age answer, and the negative-increment cross-reference.
6. Replace the Unit VII overstatements about CAI, PAI, MAI, harvest readiness, and rotation.
7. Correct the claims about model-error cancellation and sampling fraction.
8. Remove tutor notes and unresolved verification instructions from student slides.
9. Correct session numbering.

## Priority 2: Integrate official Bhutan content — **all complete**

1. Recenter Unit III and its practical around the 2024 canopy guideline.
2. Complete the *Pinus wallichiana* merchantable-volume lesson and model-based practical in Unit V.
3. Complete the Bhutan biomass lesson and comparative exercise in Unit VI.
4. Update the height-instrument discussion using the applicable inventory context.
5. Add one Bhutan policy connection to every unit.

## Priority 3: Strengthen professional competency — **all complete**

1. Add sampling and statistical inference.
2. Rebuild Unit II.
3. Create a common notation guide.
4. Develop a continuous Bhutan community-forest case study.
5. Introduce explicit QA/QC procedures.
6. Improve references and source traceability.

## Priority 4: Restructure the teaching package — **all complete**

Complete: 2 (classroom-readable sizes on all new material), 3 (timers and timetable removed), 6 (lecturer-only material confined to speaker notes), 9 (acknowledgement slide), 10 (adaptation-note convention established), 11 (original citations retained and expanded), 12 (PDFs retained as references rather than copied onto slides).

Also complete after the second pass: 1 (type raised module-wide and the dense slides audited — see §13.5), 7 (three standalone A4 field sheets in `practicals/`), 8 (two Excel calculators in `calculators/`).

Complete after the third pass: 4 (seven unit notes and the calculation handbook in `notes/` — see §12.2), 5 (the long derivations, the complete coefficient tables, the formula sheets, the spline evaluation, the additional worked examples and the worked solutions now sit in the handbook, where this plan directs them, rather than only in speaker notes).

1. Reduce and simplify all seven teaching-slide decks.
2. Apply classroom-readable font sizes throughout the decks.
3. Remove class timers, timetable information, session-duration indicators, and break schedules from student-facing materials.
4. Create coordinated student-facing lecture notes and a calculation handbook for Units I–VII.
5. Move long derivations, coefficient tables, extended explanations, and additional worked examples out of the slides.
6. Keep lecturer-only instructions in speaker notes, lesson plans, or a separate lecturer guide.
7. Create field-practical sheets and data sheets.
8. Develop Excel calculators for Bhutan volume and biomass equations.
9. Add an acknowledgement slide crediting Laxmi Sagar, Associate Lecturer, College of Natural Resources.
10. Add specific adaptation notes where individual teaching materials are directly adapted from the shared materials.
11. Retain proper citations to original publications, manuals, reports, photographs, diagrams, equations, and datasets.
12. Retain the complete PDFs as technical references rather than copying their tables onto slides.

---

# 15. Final Assessment

The MEN 201 course already has an excellent scientific and pedagogical foundation. Its calculations, derivations, treatment of uncertainty, and use of Bhutanese species and terrain are major strengths.

The principal gap is not the quality of the mensuration science. The gap is that Bhutanese material is often added as examples around a broader international or Indian textbook structure, rather than serving as the governing framework of the course.

The course will become substantially more authoritative and genuinely Bhutan-centred when:

- official Bhutan procedures are taught first;
- international procedures are clearly labelled as comparative;
- local equations are applied through worked examples;
- field conventions are consistent across units;
- Bhutan’s policy and management objectives are visible throughout;
- community forestry, biodiversity, ecosystem services, and climate resilience are treated alongside timber and volume;
- sampling and uncertainty are taught as central professional competencies;
- slides are concise, classroom-readable, and genuinely student-facing;
- detailed explanations are available in coordinated student lecture notes and the calculation handbook;
- lecturer-only timing and presentation machinery are kept out of student-facing materials; and
- teaching-material contributions and original sources are acknowledged transparently.

Unit V already demonstrates the desired direction: Bhutanese data, explicit assumptions, local species, uncertainty, and clear warnings about model applicability. Bringing the remaining units to the same standard would make MEN 201 a strong national-level undergraduate forest mensuration course.

## Scope and confidence

This consolidated document combines the supplied course review and recommendations and has been refreshed against the course package available on 7 August 2026. Confidence is **high** that it faithfully consolidates the material provided. The principal NFI, canopy, volume, biomass, legislation, policy, and biodiversity references were checked against the supplied PDFs or current official sources. Recheck any protocol or publication detail if a newer official edition is issued before implementation.

## Implementation record, 8 August 2026

**Files changed.** All seven lecture decks, `MEN201_Module_Descriptor.html`, `MEN201_Forest_Mensuration_Full_Revised_Module_Descriptor.md`, `index.html`, `README.md` and this plan.

**Deck sizes after both passes.** Unit I 43, Unit II 48, Unit III 57, Unit IV 60, Unit V 61, Unit VI 63, Unit VII 52 — **384 slides** against 348 before, plus a 28-slide module descriptor. Twenty-eight new slides were written and one superseded slide removed; the shared notation reference sheet accounts for seven of the new slides, the Bhutan policy connections for another seven, and the continuous case study for six.

**New files.** `calculators/` — two Excel workbooks. `practicals/` — three printable A4 field sheets and their shared stylesheet.

**Figures verified during the pass.** The canopy procedure was taken from the 2024 guidelines (Table 1, section 4.1.1, Annexure 1). The volume figures were recomputed from the 2018 report: BA 0.229871 m², BAH 5.37898 m³, g(BAH) 40.489, Model 16 2.237 m³ against a field-measured 2.109 m³, an error of +6.1 %; Model 7 2.908 m³, +37.9 %. The biomass figures were recomputed from the 2018 equation table and reproduce the existing Unit VI slide exactly (15 cm 46.1 kg, 25 cm 154.2 kg, 40 cm 494.7 kg, 60 cm 1 656.9 kg, mean tree 226 kg). The Unit VI Lorey understatement is (18.49 − 14.31)/18.49 = 22.6 %. The recalibrated Unit VII question gives P₁ = 0.024, P₂ = 0.021429, S = 1.000000 and an age of 51.7 years in 2010.

**Checks run.** Tag balance, duplicate attributes, page-number sequence and totals, HUD totals, leftover placeholders, student-visible tutor language, control characters and local link resolution across all nine HTML files; JavaScript syntax parsing on every deck; a headless render of all 384 slides at 1920 × 1080 testing both frame overflow and head/body collision; and an A4 print test of the three field sheets. All pass: **0 structural problems, 0 overflows, 0 collisions, 3 sheets at one page each.**

**Calculator verification.** Both workbooks were recalculated in LibreOffice and read back. The volume workbook returns Model 16 = 2.23719 m³ and Model 7 = 2.90838 m³ for the study's validation tree (published 2.237 and 2.908). The biomass workbook returns 154.18 kg for a 25 cm general conifer, matching the Unit VI slide.
leftover placeholders, student-visible tutor language, control characters and local link resolution
across all nine HTML files; JavaScript syntax parsing on every deck; a headless render of all 384
slides at 1920 × 1080 testing both frame overflow and head/body collision; and an A4 print test of
the three field sheets. All pass: **0 structural problems, 0 overflows, 0 collisions, 3 sheets at one
page each.**

**Calculator verification.** Both workbooks were recalculated in LibreOffice and read back. The volume
workbook returns Model 16 = 2.23719 m³ and Model 7 = 2.90838 m³ for the study's validation tree
(published 2.237 and 2.908). The biomass workbook returns 154.18 kg for a 25 cm general conifer,
matching the Unit VI slide.

**Known divergence requiring academic approval.** Practical 5 in the approved descriptor prescribed the spherical densiometer as the main instrument for crown-closure assessment. Following section 3.2 of this plan, the practical now follows the 2024 guidelines with the GRS crown densitometer, retaining the spherical densiometer as a comparative instrument so that the original learning outcomes are still met. Both the descriptor markdown and the descriptor deck were updated to match. **This change should go through the academic process before the practical is run.**
