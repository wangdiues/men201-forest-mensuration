/* ==========================================================================
   MEN 201 · MAKE ROOM FOR THE SOURCE NOTE
   On a slide whose source note now sits at the end of the body, a block above
   it that claims height:100% takes the whole band and leaves the note hanging
   below the page. The claim was written when the note was absolute chrome and
   cost the band nothing; now it has to mean "take what is left".

   Only direct children of the body are touched, so the width:100%;height:100%
   on an <svg> inside a figure plate is left alone.

   Run:  node tools/srcfoot-space.mjs
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* Walk the direct children of an element's inner range, returning [start,end)
   for each. Container tags only; the decks use no void element as a body
   child. */
function children(html, from, to) {
  const out = [];
  let i = from;
  while (i < to) {
    const lt = html.indexOf('<', i);
    if (lt < 0 || lt >= to) break;
    const m = /^<([a-zA-Z][\w-]*)/.exec(html.slice(lt, lt + 24));
    if (!m) { i = lt + 1; continue; }
    const tag = m[1];
    const open = new RegExp(`<${tag}\\b`, 'g');
    const close = new RegExp(`</${tag}>`, 'g');
    let depth = 0, cursor = lt, end = -1;
    while (cursor < to) {
      open.lastIndex = cursor; close.lastIndex = cursor;
      const o = open.exec(html), c = close.exec(html);
      if (!c) break;
      if (o && o.index < c.index) { depth++; cursor = o.index + 1; continue; }
      depth--;
      cursor = c.index + 1;
      if (depth === 0) { end = c.index + tag.length + 3; break; }
    }
    if (end < 0) break;
    out.push([lt, end]);
    i = end;
  }
  return out;
}

function matchDiv(html, from) {
  const open = html.indexOf('>', from) + 1;
  let depth = 1;
  const re = /<div\b|<\/div>/g;
  re.lastIndex = open;
  let m;
  while ((m = re.exec(html))) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) return { inner: open, close: m.index };
  }
  return null;
}

for (const deck of fs.readdirSync(ROOT).filter((f) => f.startsWith('MEN201_') && f.endsWith('.html'))) {
  const file = path.join(ROOT, deck);
  let html = fs.readFileSync(file, 'utf8');
  let fixed = 0;

  html = html.replace(/<section class="slide[\s\S]*?<\/section>/g, (slide) => {
    const bodyAt = slide.search(/<div class="body[^"]*\bsrcfoot\b/);
    if (bodyAt < 0) return slide;
    const body = matchDiv(slide, bodyAt);
    if (!body) return slide;

    let out = slide, delta = 0;
    for (const [s, e] of children(slide, body.inner, body.close)) {
      const kid = slide.slice(s, e);
      if (/^<div class="src"/.test(kid)) continue;
      const head = kid.slice(0, kid.indexOf('>') + 1);
      if (!/height:100%/.test(head)) continue;
      const newHead = head.replace(/height:100%/, 'flex:1 1 auto;min-height:0');
      out = out.slice(0, s + delta) + newHead + out.slice(s + delta + head.length);
      delta += newHead.length - head.length;
      fixed++;
    }
    return out;
  });

  if (fixed) {
    fs.writeFileSync(file, html);
    console.log(`${deck.replace('MEN201_', '').replace('.html', '')}: ${fixed} full-band claim(s) turned into "take what is left"`);
  }
}
