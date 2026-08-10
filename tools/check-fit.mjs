/* ==========================================================================
   MEN 201 · FIT CHECK
   Opens every deck in a headless Chromium at 1920x1080, lets the type-zoom
   runtime settle, then walks every slide and reports any that spills more
   than it did at its authored size.

   Run:  node tools/check-fit.mjs
   ========================================================================== */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8765;

const CHROME = [
  'C:/Users/DELL/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find((p) => fs.existsSync(p));
if (!CHROME) { console.error('no chromium found'); process.exit(1); }

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

/* --- a static server, so the pages run the way GitHub Pages runs them ----- */
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

/* --- chromium over CDP ---------------------------------------------------- */
const userDir = fs.mkdtempSync(path.join(process.env.TEMP || '/tmp', 'men201-'));
const chrome = spawn(CHROME, [
  '--remote-debugging-port=9333',
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1920,1080',
  `--user-data-dir=${userDir}`,
  'about:blank',
], { stdio: 'ignore' });

async function endpoint() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch('http://127.0.0.1:9333/json/version');
      return (await r.json()).webSocketDebuggerUrl;
    } catch { await new Promise((r) => setTimeout(r, 250)); }
  }
  throw new Error('chromium did not start');
}

const ws = new WebSocket(await endpoint());
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
const events = [];
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  else events.push(msg);
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

/* --- the measurement, run inside the page --------------------------------- */
const PROBE = `(async () => {
  await new Promise(r => setTimeout(r, 2500));           // let the idle fitting drain
  const stage = document.querySelector('.stage');
  const slides = [...stage.querySelectorAll('.slide')];

  // Same measure the runtime uses: how far content reaches outside the safe
  // zone and the page, from bounding rectangles, with 4px of slack.
  const s = parseFloat(getComputedStyle(stage).getPropertyValue('--s')) || 1;
  const framesCache = new WeakMap();
  const framesOf = (slide) => {
    let found = framesCache.get(slide);
    if (found) return found;
    found = [slide];
    const body = slide.querySelector('.body');
    if (body) found.push(body);
    for (const el of slide.querySelectorAll('*')) {
      if (!(el instanceof HTMLElement) || el === body) continue;
      if (el.classList.contains('scroll') || el.classList.contains('table-wrap')) continue;
      const cs = getComputedStyle(el);
      if (/hidden|clip/.test(cs.overflowX) || /hidden|clip/.test(cs.overflowY)) found.push(el);
    }
    framesCache.set(slide, found);
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

  const probe = document.querySelector('.txt, .lead, ul.bul li, p');
  const sample = probe ? getComputedStyle(probe).fontSize : 'n/a';
  const docTz = getComputedStyle(document.documentElement).getPropertyValue('--tz').trim();

  const rows = [];
  for (const s of slides) {
    const applied = s.style.getPropertyValue('--tz') || docTz;
    const after = spill(s);
    const keep = s.style.getPropertyValue('--tz');
    s.style.setProperty('--tz', '1');
    const before = spill(s);
    if (keep) s.style.setProperty('--tz', keep); else s.style.removeProperty('--tz');
    rows.push({ tz: parseFloat(applied), before, after });
  }
  return JSON.stringify({ sample, docTz, count: slides.length, rows });
})()`;

const decks = fs.readdirSync(ROOT)
  .filter((f) => f.endsWith('.html') && f !== 'index.html')
  .sort();

let problems = 0;
for (const deck of decks) {
  await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/${deck}` }, sessionId);
  await new Promise((r) => setTimeout(r, 1200));
  const res = await send('Runtime.evaluate',
    { expression: PROBE, awaitPromise: true, returnByValue: true }, sessionId);
  if (res.result?.exceptionDetails) {
    console.log(`${deck}\n  ERROR ${res.result.exceptionDetails.text}`);
    problems++;
    continue;
  }
  const data = JSON.parse(res.result.result.value);
  const shrunk = data.rows.filter((r) => r.tz < parseFloat(data.docTz) - 0.001);
  const worse = data.rows.filter((r) => r.after > r.before + 1);
  console.log(
    `${deck.replace('MEN201_', '').replace('.html', '')}\n` +
    `  ${data.count} slides · body type ${data.sample} · --tz ${data.docTz}` +
    ` · ${shrunk.length} slide(s) stepped down` +
    (shrunk.length ? ` (to ${[...new Set(shrunk.map((r) => r.tz.toFixed(2)))].sort().join(', ')})` : '') +
    (worse.length ? `\n  !! ${worse.length} slide(s) still spilling: ${worse.map((r, i) => data.rows.indexOf(r) + 1).join(', ')}` : '')
  );
  problems += worse.length;
}

console.log(`\n${problems ? problems + ' slide(s) need a look' : 'every slide sits inside its frame'}`);

ws.close();
chrome.kill();
server.close();
process.exit(0);
