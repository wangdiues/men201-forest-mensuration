/* ==========================================================================
   MEN 201 · BODY RHYTHM
   Units I-VII and the module descriptor were written before the vertical
   rhythm rules that Units VIII-XI share. Their .body is a plain block, content
   piles up against the top of the safe zone, and the closing callout is pinned
   to the bottom with position:absolute. Two consequences:

     - the band between the last block and the callout is dead space, and
     - a callout out of flow cannot stop the content above it from running
       into it, so the type-zoom guard has to shrink the whole slide instead.

   This makes .body the same flex column the newer decks use, and turns each
   pinned callout into a real flex item held down by margin-top:auto. Where a
   block above it reserved the callout's height by hand - height:calc(100% -
   Npx) - that guess is replaced by "take whatever is left".

   Run:  node tools/body-rhythm.mjs
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const RHYTHM = `
/* === VERTICAL RHYTHM ======================================================
   The body band is a fixed height. A slide that sizes its rows to their own
   content stops partway down the paper and reads as unfinished; a closing bar
   pinned out of flow cannot hold the content above it off. The band is a flex
   column: blocks marked .grow share the leftover height, and a closing bar
   held down by margin-top:auto still sits on the baseline while occupying
   real space that nothing above it can overrun.
   ========================================================================== */
.body{display:flex;flex-direction:column}
.body>*{flex:0 0 auto}
.body>.grow{flex:1 0 auto;min-height:0}
.grow>.stack>*{flex:1 0 auto}
/* Tables keep their natural rhythm and are never stretched: padding a table
   out to a row height spaces its rows unevenly, and a scroll wrapper grown
   past its last row is just an empty framed box. */
.body>table.dt{align-self:start}
.body>.table-wrap{align-self:start;max-width:100%}
`;

const decks = [
  'MEN201_Module_Descriptor.html',
  'MEN201_Unit_I_Introduction_to_Forest_Mensuration.html',
  'MEN201_Unit_II_Diameter_Girth_and_Bark_Thickness.html',
  'MEN201_Unit_III_Measurement_of_Crown_Closure.html',
  'MEN201_Unit_IV_Measurement_of_Tree_Height.html',
  'MEN201_Unit_V_Measurement_of_Tree_Volume.html',
  'MEN201_Unit_VI_Measurement_of_Crop.html',
  'MEN201_Unit_VII_Age_and_Growth_of_Trees.html',
];

const PINNED = /position:absolute;left:0;right:0;bottom:0/g;
const RESERVED = /height:calc\(100% - \d+px\)/g;

for (const deck of decks) {
  const file = path.join(ROOT, deck);
  let html = fs.readFileSync(file, 'utf8');

  if (!html.includes('=== VERTICAL RHYTHM')) {
    // Anchor on the .body geometry rule, so the rhythm sits with the rule it
    // modifies rather than at the far end of a 350-line stylesheet.
    const anchor = /(\.body\{position:absolute;[^}]*\})/;
    if (!anchor.test(html)) { console.log(`${deck}: no .body rule found, skipped`); continue; }
    html = html.replace(anchor, `$1\n${RHYTHM.trim()}\n`);
  }

  // Slide by slide, so a height:calc() is only reinterpreted on a slide that
  // actually has a pinned bar to make room for.
  let pinned = 0, reserved = 0;
  html = html.replace(/<section class="slide[\s\S]*?<\/section>/g, (slide) => {
    if (!PINNED.test(slide)) { PINNED.lastIndex = 0; return slide; }
    PINNED.lastIndex = 0;
    slide = slide.replace(PINNED, () => { pinned++; return 'margin-top:auto'; });
    slide = slide.replace(RESERVED, () => { reserved++; return 'flex:1 1 auto;min-height:0'; });
    return slide;
  });

  fs.writeFileSync(file, html);
  console.log(`${deck.replace('MEN201_', '').replace('.html', '')}: ${pinned} pinned bar(s) put back in flow, ${reserved} hand-reserved height(s) replaced`);
}
