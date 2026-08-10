/* ==========================================================================
   MEN 201 · WHY IS THIS SLIDE SHRINKING?
   For each named slide, sets --tz to a chosen value and reports exactly which
   elements reach outside a clipping frame, and which text zones collide.

   Run:  node tools/why.mjs <deckSubstring> <tz> <n> [n ...]
   ========================================================================== */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Several of these can run at once; each caller picks a lane with MEN201_PORT_OFFSET.
const OFFSET = Number(process.env.MEN201_PORT_OFFSET || 0);
const PORT = 8771 + OFFSET;

const CHROME = [
  'C:/Users/DELL/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find((p) => fs.existsSync(p));

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.webp': 'image/webp',
};
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404).end('no'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

const userDir = fs.mkdtempSync(path.join(process.env.TEMP || '/tmp', 'men201-why-'));
const chrome = spawn(CHROME, [`--remote-debugging-port=${9339 + OFFSET}`, '--headless=new', '--disable-gpu',
  '--hide-scrollbars', '--window-size=1920,1080', `--user-data-dir=${userDir}`, 'about:blank'], { stdio: 'ignore' });
async function endpoint() {
  for (let i = 0; i < 80; i++) {
    try { const r = await fetch(`http://127.0.0.1:${9339 + OFFSET}/json/version`); return (await r.json()).webSocketDebuggerUrl; }
    catch { await new Promise((r) => setTimeout(r, 250)); }
  }
  throw new Error('chromium did not start');
}
const ws = new WebSocket(await endpoint());
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } };
const send = (method, params = {}, sessionId) => { const n = ++id; ws.send(JSON.stringify({ id: n, method, params, sessionId })); return new Promise((r) => pending.set(n, r)); };
const { targetId } = (await send('Target.createTarget', { url: 'about:blank' })).result;
const { sessionId } = (await send('Target.attachToTarget', { targetId, flatten: true })).result;
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false }, sessionId);

const [needle, tzArg, ...nums] = process.argv.slice(2);
const matches = fs.readdirSync(ROOT).filter((f) => f.startsWith('MEN201_') && f.endsWith('.html') && f.includes(needle));
if (matches.length > 1) { console.error(`ambiguous deck name ${needle}: ${matches.join(', ')} - add the trailing underscore, e.g. Unit_II_`); process.exit(1); }
const deck = matches[0];
if (!deck) { console.error('no deck matching ' + needle); process.exit(1); }
console.error('deck: ' + deck);
await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/${deck}` }, sessionId);
await new Promise((r) => setTimeout(r, 4200));

const EXPR = (n, tz) => `(() => {
  const slides = [...document.querySelectorAll('.stage .slide')];
  const sl = slides.find(s => s.getAttribute('data-n') === '${n}') || slides[${n} - 1];
  const kv = sl.style.visibility, ko = sl.style.opacity, kz = sl.style.getPropertyValue('--tz');
  sl.style.visibility = 'visible'; sl.style.opacity = '1';
  sl.style.setProperty('--tz', '${tz}');
  const stage = document.querySelector('.stage');
  const s = parseFloat(getComputedStyle(stage).getPropertyValue('--s')) || 1;
  const desc = (el) => {
    let t = el.tagName.toLowerCase();
    if (el.className && typeof el.className === 'string') t += '.' + el.className.trim().split(/\\s+/).join('.');
    const txt = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 46);
    return t + (txt ? ' «' + txt + '»' : '');
  };
  const frames = [sl];
  const body = sl.querySelector('.body'); if (body) frames.push(body);
  for (const el of sl.querySelectorAll('*')) {
    if (!(el instanceof HTMLElement) || el === body) continue;
    if (el.classList.contains('scroll') || el.classList.contains('table-wrap')) continue;
    const cs = getComputedStyle(el);
    if (/hidden|clip/.test(cs.overflowX) || /hidden|clip/.test(cs.overflowY)) frames.push(el);
  }
  const spills = [];
  for (const frame of frames) {
    const fr = frame.getBoundingClientRect();
    for (const el of frame.querySelectorAll('*')) {
      if (!(el instanceof HTMLElement)) continue;
      if (el.closest('.scroll,.table-wrap')) continue;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      const out = { b: (r.bottom - fr.bottom) / s, r: (r.right - fr.right) / s,
                    t: (fr.top - r.top) / s, l: (fr.left - r.left) / s };
      const worst = Math.max(out.b, out.r, out.t, out.l);
      if (worst > 4) spills.push({ frame: desc(frame).slice(0, 40), el: desc(el), out });
    }
  }
  const zoneSelector = '.head,.runhead,.card,.callout,.formula,.answer,.q,.step,.numrow,table,.cmeta,.src,.pageno,.sectext,.fig,.diagram,.plate';
  const boxes = [];
  const walker = document.createTreeWalker(sl, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.nodeValue || !node.nodeValue.trim()) continue;
    const parent = node.parentElement;
    if (!parent || parent.closest('.scroll,.table-wrap')) continue;
    const cs = getComputedStyle(parent);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
    const zone = parent.closest(zoneSelector) || parent;
    const range = document.createRange(); range.selectNodeContents(node);
    const fontSize = parseFloat(cs.fontSize) || 16;
    for (const rr of range.getClientRects()) {
      if (rr.width < 1 || rr.height < 1) continue;
      const mid = (rr.top + rr.bottom) / 2, gh = fontSize * .92 * s;
      boxes.push({ zone, text: node.nodeValue.trim().slice(0, 34),
        left: rr.left + s, right: rr.right - s, top: mid - gh / 2, bottom: mid + gh / 2 });
    }
  }
  boxes.sort((a, b) => a.top - b.top);
  const hits = [];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length && boxes[j].top < boxes[i].bottom; j++) {
      const a = boxes[i], b = boxes[j];
      if (a.zone === b.zone || a.zone.contains(b.zone) || b.zone.contains(a.zone)) continue;
      const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (w > 2 * s && h > 2 * s) hits.push({ a: desc(a.zone).slice(0, 34) + ' «' + a.text + '»',
                                              b: desc(b.zone).slice(0, 34) + ' «' + b.text + '»',
                                              area: Math.round(w * h / (s * s)) });
    }
  }
  sl.style.visibility = kv; sl.style.opacity = ko;
  if (kz) sl.style.setProperty('--tz', kz); else sl.style.removeProperty('--tz');
  return JSON.stringify({ cls: sl.className, spills: spills.slice(0, 14), hits: hits.slice(0, 10) });
})()`;

for (const n of nums) {
  const res = await send('Runtime.evaluate', { expression: EXPR(n, tzArg), returnByValue: true }, sessionId);
  const d = JSON.parse(res.result.result.value);
  console.log(`\n--- slide ${n}  [${d.cls}]  at --tz ${tzArg}`);
  if (!d.spills.length && !d.hits.length) console.log('   fits');
  for (const s of d.spills) {
    const dirs = Object.entries(s.out).filter(([, v]) => v > 4).map(([k, v]) => `${k}+${Math.round(v)}`).join(' ');
    console.log(`   SPILL ${dirs}  in ${s.frame}\n         ${s.el}`);
  }
  for (const h of d.hits) console.log(`   HIT ${h.area}px²\n         ${h.a}\n         ${h.b}`);
}

ws.close(); chrome.kill(); server.close(); process.exit(0);
