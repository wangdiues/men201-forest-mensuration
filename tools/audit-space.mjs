/* ==========================================================================
   MEN 201 · SPACE AUDIT
   Opens every deck in headless Chromium at 1920x1080, lets the type-zoom
   runtime settle, then reports per slide:

     tz        the type zoom the runtime actually settled on
     fill      the fraction of the .body safe zone the content actually covers
     slackB    unused canvas pixels below the lowest content in the body
     slackR    unused canvas pixels right of the widest content in the body
     minpx     smallest rendered body font size, in canvas px (1920-wide basis)
     spill     content reaching outside a clipping frame
     overlap   text-on-text collision area between independent zones

   Run:  node tools/audit-space.mjs [deckSubstring ...]
   ========================================================================== */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Several of these can run at once; each caller picks a lane with MEN201_PORT_OFFSET.
const OFFSET = Number(process.env.MEN201_PORT_OFFSET || 0);
const PORT = 8767 + OFFSET;

const CHROME = [
  'C:/Users/DELL/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find((p) => fs.existsSync(p));
if (!CHROME) { console.error('no chromium found'); process.exit(1); }

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end('no');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

const userDir = fs.mkdtempSync(path.join(process.env.TEMP || '/tmp', 'men201-audit-'));
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${9335 + OFFSET}`,
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1920,1080',
  `--user-data-dir=${userDir}`,
  'about:blank',
], { stdio: 'ignore' });

async function endpoint() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${9335 + OFFSET}/json/version`);
      return (await r.json()).webSocketDebuggerUrl;
    } catch { await new Promise((r) => setTimeout(r, 250)); }
  }
  throw new Error('chromium did not start');
}

const ws = new WebSocket(await endpoint());
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
};
function send(method, params = {}, sessionId) {
  const n = ++id;
  ws.send(JSON.stringify({ id: n, method, params, sessionId }));
  return new Promise((r) => pending.set(n, r));
}

const { targetId } = (await send('Target.createTarget', { url: 'about:blank' })).result;
const { sessionId } = (await send('Target.attachToTarget', { targetId, flatten: true })).result;
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
await send('Emulation.setDeviceMetricsOverride',
  { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false }, sessionId);

const PROBE = `(async () => {
  await new Promise(r => setTimeout(r, 3200));
  const stage = document.querySelector('.stage');
  const slides = [...stage.querySelectorAll('.slide')];
  const s = parseFloat(getComputedStyle(stage).getPropertyValue('--s')) || 1;
  const docTz = getComputedStyle(document.documentElement).getPropertyValue('--tz').trim();

  const framesOf = (slide) => {
    const found = [slide];
    const body = slide.querySelector('.body');
    if (body) found.push(body);
    for (const el of slide.querySelectorAll('*')) {
      if (!(el instanceof HTMLElement) || el === body) continue;
      if (el.classList.contains('scroll') || el.classList.contains('table-wrap')) continue;
      const cs = getComputedStyle(el);
      if (/hidden|clip/.test(cs.overflowX) || /hidden|clip/.test(cs.overflowY)) found.push(el);
    }
    return found;
  };

  const spill = (slide) => {
    let total = 0;
    for (const frame of framesOf(slide)) {
      const fr = frame.getBoundingClientRect();
      for (const el of frame.querySelectorAll('*')) {
        if (!(el instanceof HTMLElement)) continue;
        if (el.closest('.scroll,.table-wrap')) continue;
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        total += Math.max(0, r.bottom - fr.bottom - 4 * s);
        total += Math.max(0, r.right - fr.right - 4 * s);
        total += Math.max(0, fr.top - r.top - 4 * s);
        total += Math.max(0, fr.left - r.left - 4 * s);
      }
    }
    return total / s;
  };

  const zoneSelector = '.head,.runhead,.card,.callout,.formula,.answer,.q,.step,.numrow,table,.cmeta,.src,.pageno,.sectext,.fig,.diagram,.plate';
  const textBoxes = (slide) => {
    const boxes = [];
    const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.nodeValue || !node.nodeValue.trim()) continue;
      const parent = node.parentElement;
      if (!parent) continue;
      const cs = getComputedStyle(parent);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
      const zone = parent.closest(zoneSelector) || parent;
      const range = document.createRange();
      range.selectNodeContents(node);
      const fontSize = parseFloat(cs.fontSize) || 16;
      for (const rr of range.getClientRects()) {
        if (rr.width < 1 || rr.height < 1) continue;
        const middle = (rr.top + rr.bottom) / 2;
        const gh = fontSize * .92 * s;
        boxes.push({ zone, fontSize, left: rr.left, right: rr.right,
                     top: middle - gh / 2, bottom: middle + gh / 2 });
      }
    }
    return boxes;
  };

  const overlap = (boxes) => {
    const b = boxes.slice().sort((a, z) => a.top - z.top);
    let total = 0;
    for (let i = 0; i < b.length; i++) {
      for (let j = i + 1; j < b.length && b[j].top < b[i].bottom; j++) {
        const a = b[i], z = b[j];
        if (a.zone === z.zone || a.zone.contains(z.zone) || z.zone.contains(a.zone)) continue;
        const w = Math.min(a.right, z.right) - Math.max(a.left, z.left);
        const h = Math.min(a.bottom, z.bottom) - Math.max(a.top, z.top);
        if (w > 2 * s && h > 2 * s) total += w * h / (s * s);
      }
    }
    return Math.round(total);
  };

  // How far text runs outside the panel that is supposed to be painted behind
  // it. A card stretched to a row height rather than sized to its contents can
  // sit inside the safe zone while its last lines are read against the graph
  // paper instead of the leaf - which is not spill, and not a collision.
  const overrun = (slide) => {
    let worst = 0, who = '';
    for (const panel of slide.querySelectorAll('.card,.callout,.q,.calc,.answer,.formula,.fig')) {
      const cs = getComputedStyle(panel);
      if (cs.display === 'none') continue;
      const pr = panel.getBoundingClientRect();
      const pad = {
        b: parseFloat(cs.paddingBottom) || 0, r: parseFloat(cs.paddingRight) || 0,
        t: parseFloat(cs.paddingTop) || 0, l: parseFloat(cs.paddingLeft) || 0,
      };
      for (const el of panel.querySelectorAll('*')) {
        if (!(el instanceof HTMLElement)) continue;
        if (el.closest('.scroll,.table-wrap')) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        const out = Math.max(r.bottom - (pr.bottom - pad.b * .35), r.right - (pr.right - pad.r * .35),
                             (pr.top + pad.t * .35) - r.top, (pr.left + pad.l * .35) - r.left) / s;
        if (out > worst) { worst = out; who = panel.className.slice(0, 22); }
      }
    }
    return { px: Math.round(worst), who };
  };

  const rows = [];
  for (const sl of slides) {
    // Inactive slides are visibility:hidden; children inherit it and would all
    // measure as invisible. Reveal without touching .active, so the deck
    // runtime and the type-zoom MutationObserver see no change.
    const keepVis = sl.style.visibility, keepOp = sl.style.opacity;
    sl.style.visibility = 'visible';
    sl.style.opacity = '1';
    const applied = parseFloat(sl.style.getPropertyValue('--tz') || docTz);
    const body = sl.querySelector('.body');
    const holder = body || sl;
    const hr = holder.getBoundingClientRect();
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, area = 0;
    const kids = holder.querySelectorAll('*');
    for (const el of kids) {
      if (!(el instanceof HTMLElement) && !(el instanceof SVGElement)) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      minX = Math.min(minX, r.left); maxX = Math.max(maxX, r.right);
      minY = Math.min(minY, r.top);  maxY = Math.max(maxY, r.bottom);
    }
    // covered area: union approximated by summing top-level painted children
    const painted = [];
    for (const el of holder.children) {
      const walk = (n) => {
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const bg = cs.backgroundColor, bd = cs.borderTopWidth;
        const r = n.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        const solid = (bg && bg !== 'rgba(0, 0, 0, 0)') || parseFloat(bd) > 0 || n.tagName === 'SVG' || n.tagName === 'svg' || n.tagName === 'IMG';
        if (solid || !n.children.length) { painted.push(r); return; }
        for (const c of n.children) walk(c);
      };
      walk(el);
    }
    // grid-sample the body box for coverage
    const GX = 48, GY = 27;
    let hit = 0;
    for (let gy = 0; gy < GY; gy++) {
      for (let gx = 0; gx < GX; gx++) {
        const px = hr.left + (gx + .5) * hr.width / GX;
        const py = hr.top + (gy + .5) * hr.height / GY;
        for (const r of painted) {
          if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom) { hit++; break; }
        }
      }
    }
    const boxes = textBoxes(sl);
    let minpx = Infinity;
    for (const b of boxes) minpx = Math.min(minpx, b.fontSize / s);
    rows.push({
      n: sl.getAttribute('data-n') || (rows.length + 1),
      cls: sl.className.replace('slide', '').replace('active', '').trim(),
      tz: +applied.toFixed(3),
      fill: +(hit / (GX * GY)).toFixed(3),
      slackB: Math.round((hr.bottom - maxY) / s),
      slackR: Math.round((hr.right - maxX) / s),
      minpx: isFinite(minpx) ? +minpx.toFixed(1) : null,
      spill: Math.round(spill(sl)),
      overlap: overlap(boxes),
      over: overrun(sl),
    });
    sl.style.visibility = keepVis;
    sl.style.opacity = keepOp;
  }
  return JSON.stringify({ docTz, count: slides.length, rows });
})()`;

const filters = process.argv.slice(2);
const decks = fs.readdirSync(ROOT)
  .filter((f) => f.startsWith('MEN201_') && f.endsWith('.html'))
  .filter((f) => !filters.length || filters.some((x) => f.includes(x)))
  .sort();

const out = {};
for (const deck of decks) {
  await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/${deck}` }, sessionId);
  await new Promise((r) => setTimeout(r, 1400));
  const res = await send('Runtime.evaluate',
    { expression: PROBE, awaitPromise: true, returnByValue: true }, sessionId);
  if (res.result?.exceptionDetails) {
    console.log(`${deck}  ERROR ${JSON.stringify(res.result.exceptionDetails).slice(0, 300)}`);
    continue;
  }
  const data = JSON.parse(res.result.result.value);
  out[deck] = data;
  const short = deck.replace('MEN201_', '').replace('.html', '');
  console.log(`\n### ${short}  (${data.count} slides, --tz ${data.docTz})`);
  for (const r of data.rows) {
    const flags = [];
    if (r.spill > 2) flags.push('SPILL');
    if (r.over.px > 6) flags.push('OVERRUN:' + r.over.px + '/' + r.over.who);
    if (r.overlap > 0) flags.push('OVERLAP');
    if (r.fill < 0.55 && !/cover|sect/.test(r.cls)) flags.push('SPARSE');
    if (r.slackB > 90 && !/cover|sect/.test(r.cls)) flags.push('BOTTOM');
    if (r.tz < parseFloat(data.docTz) - 0.001) flags.push('tz' + r.tz);
    if (flags.length) {
      console.log(`  s${String(r.n).padStart(2)} ${r.cls.padEnd(12)} fill=${r.fill} slackB=${String(r.slackB).padStart(4)} slackR=${String(r.slackR).padStart(4)} min=${r.minpx} spill=${r.spill} ovl=${r.overlap}  ${flags.join(' ')}`);
    }
  }
}
// one file per port lane, so concurrent runs do not overwrite each other
const outFile = OFFSET ? `space-audit-${OFFSET}.json` : 'space-audit.json';
fs.writeFileSync(path.join(ROOT, 'tmp', outFile), JSON.stringify(out, null, 1));
console.log('\nwrote tmp/space-audit.json');

ws.close();
chrome.kill();
server.close();
process.exit(0);
