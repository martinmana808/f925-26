#!/usr/bin/env node
// Collect several real photos per dealer for the hero slider on their preview site.
//
// Source: the dealer's own Google Maps listing (photos of their shopfront, yard, interior
// and gear — mostly posted by the business itself). We already store the place URL per
// dealer in `google.mapsUrl`, so no API key and no billing. Saves the originals to
// images-extra/<slug>/NN.jpg and records them on the dealer as `preview.heroImages`.
//
//   node fetch_images.mjs [--only slug] [--force] [--want 5] [--limit N]
//
// Deliberately skipped: anything that isn't a photograph of the place (logos, maps,
// review avatars) and anything under 600px on its long edge.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'images-extra'); fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const arg = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const only = arg('--only', null);
const force = args.includes('--force');
const WANT = Number(arg('--want', 5));
const LIMIT = Number(arg('--limit', 0));

const dealers = JSON.parse(fs.readFileSync(path.join(HERE, 'dealers.json'), 'utf8'));
let targets = dealers.filter((d) => (only ? d.slug === only : !d.closed && (d.google || {}).mapsUrl));
if (LIMIT) targets = targets.slice(0, LIMIT);

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const browser = await chromium.launch({ executablePath: `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`, headless: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Google serves one image at any size: rewrite the =w###-h### suffix to something usable. */
function atSize(url, w = 1600) {
  const base = url.split('=')[0];
  return `${base}=w${w}-h${Math.round(w * 0.75)}-k-no`;
}
// `gps-cs-s` and `grass-cs` ARE the place-photo paths; the junk is reviewer avatars
// (/a-/ALV-… at 36px), Street View tiles and map raster tiles.
const JUNK = /\/a-\/ALV-|\/a\/ACg8|streetview|maps\/vt|=w\d{1,2}-h\d{1,2}|=s\d{1,2}(-|$)/i;
const PHOTO = /lh\d\.googleusercontent\.com\/(gps-cs-s|grass-cs|places|p)\//i;

async function harvest(d) {
  const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1280, height: 900 }, locale: 'en-NZ' });
  const page = await ctx.newPage();
  const found = new Set();
  page.on('response', (r) => {
    const u = r.url();
    if (PHOTO.test(u) && !JUNK.test(u)) found.add(u.split('=')[0]);
  });
  try {
    await page.goto(d.google.mapsUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3500);
    // consent interstitial, when Google shows one
    for (const label of ['Accept all', 'Reject all', 'I agree']) {
      const b = await page.$(`button:has-text("${label}")`);
      if (b) { await b.click().catch(() => {}); await sleep(2500); break; }
    }
    // open the photo gallery: the hero image at the top of the listing
    // "See photos" opens the full gallery — far more than the three tiles on the listing
    const opener = await page.$('button:has-text("See photos"), button[jsaction*="heroHeaderImage"], button[aria-label*="Photo"]');
    if (opener) { await opener.click().catch(() => {}); await sleep(4000); }
    // scroll the gallery so lazy tiles load
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 1200);
      await sleep(900);
      if (found.size > 40) break;
    }
    // also read any photo URLs sitting in the DOM
    const inDom = await page.evaluate(() =>
      [...document.querySelectorAll('img,[style*="googleusercontent"]')]
        .map((e) => e.getAttribute('src') || (e.getAttribute('style') || '').match(/url\(["']?([^"')]+)/)?.[1])
        .filter(Boolean));
    inDom.forEach((u) => { if (PHOTO.test(u) && !JUNK.test(u)) found.add(u.split('=')[0]); });
  } catch (e) {
    console.log(`  ! ${d.slug}: ${e.message.slice(0, 70)}`);
  }
  await ctx.close();
  return [...found];
}

/** Reject anything that won't work as a hero: 360° panoramas (equirectangular, ~2:1, and
 *  badly warped once cropped) and anything too short to fill the frame. */
function usableShape(file) {
  try {
    const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' });
    const w = Number(out.match(/pixelWidth:\s*(\d+)/)?.[1]);
    const h = Number(out.match(/pixelHeight:\s*(\d+)/)?.[1]);
    if (!w || !h) return false;
    return w / h < 1.9 && h >= 600;
  } catch { return false; }
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) return 0;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 25_000) return 0;              // thumbnails and spacers
  fs.writeFileSync(dest, buf);
  if (!usableShape(dest)) { fs.unlinkSync(dest); return 0; }
  return buf.length;
}

let done = 0;
for (const d of targets) {
  const dir = path.join(OUT, d.slug);
  const existing = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.jpg')) : [];
  if (existing.length >= WANT && !force) { continue; }
  fs.mkdirSync(dir, { recursive: true });
  const urls = await harvest(d);
  let saved = existing.length;
  // Google hands the same photo back under more than one URL (listing tile vs gallery
  // entry), so dedupe on content, not on the address it came from.
  const hashes = new Set(existing.map((f) => crypto.createHash('md5').update(fs.readFileSync(path.join(dir, f))).digest('hex')));
  for (const u of urls) {
    if (saved >= WANT) break;
    const dest = path.join(dir, `${String(saved + 1).padStart(2, '0')}.jpg`);
    try {
      const n = await download(atSize(u), dest);
      if (!n) { if (fs.existsSync(dest)) fs.unlinkSync(dest); continue; }
      const h = crypto.createHash('md5').update(fs.readFileSync(dest)).digest('hex');
      if (hashes.has(h)) { fs.unlinkSync(dest); continue; }
      hashes.add(h); saved++;
    } catch { /* next */ }
  }
  done++;
  console.log(`${saved >= 2 ? '✓' : '·'} ${d.shortName}: ${saved} photo(s) from ${urls.length} candidates`);
  await sleep(1200);
}
await browser.close();
console.log(`${done} dealers processed`);
