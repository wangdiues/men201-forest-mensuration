/* ==========================================================================
   MEN 201 · WIKIMEDIA COMMONS SEARCH / FETCH
   Search:  node tools/commons.mjs search "<terms>" [limit]
   Info:    node tools/commons.mjs info "File:Name.jpg"
   Get:     node tools/commons.mjs get "File:Name.jpg" <localName> [width]

   `get` downloads a scaled JPEG into assets/images/men201/ and appends a
   record to assets/images/men201/image-credits.json in the shape the existing
   manifest already uses.
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'assets', 'images', 'men201');
const MANIFEST = path.join(DIR, 'image-credits.json');
const UA = 'MEN201-course-materials/1.0 (wangs5050@gmail.com) course slide illustration';
const API = 'https://commons.wikimedia.org/w/api.php';

const OK = [/^cc0/i, /^cc[ -]by(-sa)?[ -]?[0-9.]*$/i, /public domain/i, /^pd/i];

async function api(params) {
  const url = API + '?' + new URLSearchParams({ format: 'json', ...params });
  const r = await fetch(url, { headers: { 'user-agent': UA } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

const [cmd, arg, arg2, arg3] = process.argv.slice(2);

if (cmd === 'search') {
  const d = await api({
    action: 'query', generator: 'search', gsrsearch: `filetype:bitmap ${arg}`,
    gsrnamespace: '6', gsrlimit: String(arg2 || 12),
    prop: 'imageinfo', iiprop: 'extmetadata|size|url', iiurlwidth: '320',
  });
  const pages = Object.values(d.query?.pages || {});
  for (const p of pages) {
    const ii = p.imageinfo?.[0]; if (!ii) continue;
    const m = ii.extmetadata || {};
    const lic = (m.LicenseShortName?.value || '?').replace(/<[^>]+>/g, '');
    const clean = OK.some((re) => re.test(lic.trim()));
    console.log(`${clean ? 'OK ' : '   '} ${String(ii.width).padStart(5)}x${String(ii.height).padEnd(5)} ${lic.padEnd(14)} ${p.title}`);
  }
}

if (cmd === 'info') {
  const d = await api({ action: 'query', titles: arg, prop: 'imageinfo',
    iiprop: 'extmetadata|size|url|mime' });
  const p = Object.values(d.query.pages)[0];
  const ii = p.imageinfo[0], m = ii.extmetadata;
  console.log(JSON.stringify({
    title: p.title, width: ii.width, height: ii.height, mime: ii.mime,
    license: m.LicenseShortName?.value, licenseUrl: m.LicenseUrl?.value,
    artist: (m.Artist?.value || '').replace(/<[^>]+>/g, '').trim(),
    credit: (m.Credit?.value || '').replace(/<[^>]+>/g, '').trim().slice(0, 200),
    description: (m.ImageDescription?.value || '').replace(/<[^>]+>/g, '').trim().slice(0, 400),
    descriptionurl: ii.descriptionurl,
  }, null, 1));
}

if (cmd === 'get') {
  const width = arg3 || '1920';
  const d = await api({ action: 'query', titles: arg, prop: 'imageinfo',
    iiprop: 'extmetadata|size|url|mime', iiurlwidth: width });
  const p = Object.values(d.query.pages)[0];
  const ii = p.imageinfo[0], m = ii.extmetadata;
  const lic = (m.LicenseShortName?.value || '').replace(/<[^>]+>/g, '').trim();
  if (!OK.some((re) => re.test(lic))) { console.error('license not approved: ' + lic); process.exit(1); }

  const src = ii.thumburl || ii.url;
  const r = await fetch(src, { headers: { 'user-agent': UA } });
  if (!r.ok) { console.error('download failed ' + r.status); process.exit(1); }
  const buf = Buffer.from(await r.arrayBuffer());
  const asset = `assets/images/men201/${arg2}`;
  fs.writeFileSync(path.join(ROOT, asset), buf);

  const record = {
    asset,
    usedIn: [],
    alt: '',
    title: p.title.replace(/^File:/, ''),
    description: (m.ImageDescription?.value || '').replace(/<[^>]+>/g, '').trim().slice(0, 300),
    creator: (m.Artist?.value || '').replace(/<[^>]+>/g, '').trim(),
    license: lic,
    licenseUrl: m.LicenseUrl?.value || '',
    sourcePage: ii.descriptionurl,
    originalUrl: ii.url,
    downloadedFrom: src,
    width: ii.width,
    height: ii.height,
    mime: ii.mime,
    bytes: buf.length,
    sha256: crypto.createHash('sha256').update(buf).digest('hex'),
  };
  const man = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const at = man.findIndex((x) => x.asset === asset);
  if (at >= 0) man[at] = record; else man.push(record);
  fs.writeFileSync(MANIFEST, JSON.stringify(man, null, 2));
  console.log(JSON.stringify({ asset, bytes: buf.length, lic, creator: record.creator, src }, null, 1));
}

if (!['search', 'info', 'get'].includes(cmd)) {
  console.error('usage: search|info|get');
  process.exitCode = 1;
}
