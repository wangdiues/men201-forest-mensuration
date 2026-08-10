/* ==========================================================================
   MEN 201 · SLIDE SCREENSHOTS
   Renders named slides at 1920x1080 into tmp/shots/.

   Run:  node tools/shot.mjs <deckSubstring> <n> [n ...]
         node tools/shot.mjs Unit_VI 9 20 48
   ========================================================================== */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Several of these can run at once; each caller picks a lane with MEN201_PORT_OFFSET.
const OFFSET = Number(process.env.MEN201_PORT_OFFSET || 0);
const PORT = 8769 + OFFSET;
const OUT = path.join(ROOT, 'tmp', 'shots');
fs.mkdirSync(OUT, { recursive: true });

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
    res.writeHead(404).end('no'); return;
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

const userDir = fs.mkdtempSync(path.join(process.env.TEMP || '/tmp', 'men201-shot-'));
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${9337 + OFFSET}`, '--headless=new', '--disable-gpu', '--hide-scrollbars',
  '--window-size=1920,1080', `--user-data-dir=${userDir}`, 'about:blank',
], { stdio: 'ignore' });

async function endpoint() {
  for (let i = 0; i < 80; i++) {
    try { const r = await fetch(`http://127.0.0.1:${9337 + OFFSET}/json/version`); return (await r.json()).webSocketDebuggerUrl; }
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

const [needle, ...nums] = process.argv.slice(2);
const matches = fs.readdirSync(ROOT).filter((f) => f.startsWith('MEN201_') && f.endsWith('.html') && f.includes(needle));
if (matches.length > 1) { console.error(`ambiguous deck name ${needle}: ${matches.join(', ')} - add the trailing underscore, e.g. Unit_II_`); process.exit(1); }
const deck = matches[0];
if (!deck) { console.error('no deck matching ' + needle); process.exit(1); }
console.error('deck: ' + deck);
if (!deck) { console.error('no deck matching ' + needle); process.exit(1); }

await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/${deck}` }, sessionId);
await new Promise((r) => setTimeout(r, 4200));   // let the idle fitting drain

const tag = deck.replace('MEN201_', '').replace('.html', '').slice(0, 22);
for (const n of nums) {
  await send('Runtime.evaluate', {
    expression: `(() => {
      const slides = [...document.querySelectorAll('.stage .slide')];
      const t = slides.find(s => s.getAttribute('data-n') === '${n}') || slides[${n} - 1];
      slides.forEach(s => s.classList.remove('active'));
      t.classList.add('active');
      const cur = document.getElementById('cur'); if (cur) cur.textContent = '${n}';
      return t.className;
    })()`, returnByValue: true,
  }, sessionId);
  await new Promise((r) => setTimeout(r, 1500));
  const { result } = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  const file = path.join(OUT, `${tag}-s${String(n).padStart(2, '0')}.png`);
  fs.writeFileSync(file, Buffer.from(result.data, 'base64'));
  console.log(file);
}

ws.close(); chrome.kill(); server.close(); process.exit(0);
