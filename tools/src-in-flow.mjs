/* ==========================================================================
   MEN 201 · SOURCE NOTES IN FLOW
   A slide's .src note is a citation for the content above it, but it was
   written as page chrome: position:absolute against the slide, on the same
   baseline as the page number. Chrome cannot be run into, and a note that
   wraps to three lines reaches up into the safe zone and lands on top of the
   closing callout - which is what Unit VI slide 9 was doing.

   This moves each slide-level .src to the end of its own .body, where it is a
   real block that the content above has to make room for. The stylesheet gives
   it margin-top:auto, so it still sits on the bottom of the band.

   Run:  node tools/src-in-flow.mjs
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* Find the index just past the <div ...> that opens at `from`, and the index
   at which its matching </div> starts. Only div nesting is tracked, which is
   all that separates one block from another here. */
function matchDiv(html, from) {
  const open = html.indexOf('>', from) + 1;
  let depth = 1, i = open;
  const re = /<div\b|<\/div>/g;
  re.lastIndex = open;
  let m;
  while ((m = re.exec(html))) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) return { inner: open, close: m.index };
    i = re.lastIndex;
  }
  return null;
}

const decks = fs.readdirSync(ROOT).filter((f) => f.startsWith('MEN201_') && f.endsWith('.html'));

for (const deck of decks) {
  const file = path.join(ROOT, deck);
  let html = fs.readFileSync(file, 'utf8');
  let moved = 0;

  html = html.replace(/<section class="slide[\s\S]*?<\/section>/g, (slide) => {
    const bodyAt = slide.indexOf('<div class="body');
    if (bodyAt < 0) return slide;
    const body = matchDiv(slide, bodyAt);
    if (!body) return slide;

    // Only a .src that sits outside the body, as a sibling of it.
    const srcAt = slide.indexOf('<div class="src"', body.close);
    if (srcAt < 0) return slide;
    const src = matchDiv(slide, srcAt);
    if (!src) return slide;
    const srcEnd = src.close + '</div>'.length;
    const block = slide.slice(srcAt, srcEnd);

    moved++;
    return slide.slice(0, body.close) + block + slide.slice(body.close, srcAt)
         + slide.slice(srcEnd);
  });

  if (moved) {
    fs.writeFileSync(file, html);
    console.log(`${deck.replace('MEN201_', '').replace('.html', '')}: ${moved} source note(s) moved into the body`);
  }
}
