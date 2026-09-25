#!/usr/bin/env node
// Free enrichment for dealers.json — no paid APIs, no keys. Headless Chromium visits:
//   1. Google Maps search       → listing URL, place id-ish, rating, review count, category,
//                                  Google's own hours (cross-check), website if listed
//   2. DuckDuckGo               → Facebook page URL, Instagram handle
//   3. Facebook page (public)   → followers, intro line, profile image, listed phone/email/site
//   4. Instagram (public)       → follower count, bio (best effort; IG often walls it)
// Writes free/<slug>.json per dealer (cache) and merges into dealers.json as `google`,
// `social`, `facebook`, `instagram`. Never stores review text — ratings and counts only.
//
//   node enrich_free.mjs [--only slug] [--force] [--all]   (default: the 42 Plan B targets)
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE = path.join(HERE, 'free'); fs.mkdirSync(CACHE, { recursive: true });
const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const force = args.includes('--force');
const all = args.includes('--all');
const dealers = JSON.parse(fs.readFileSync(path.join(HERE, 'dealers.json'), 'utf8'));
const targets = dealers.filter((d) => (only ? d.slug === only : all ? !d.closed : ['no-site', 'warm'].includes(d.segment)));

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const browser = await chromium.launch({ executablePath: `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`, headless: true });
const ctx = await browser.newContext({ locale: 'en-NZ', userAgent: UA, viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();

async function acceptConsent() {
  const b = page.locator('button:has-text("Accept all"), button:has-text("I agree")').first();
  if (await b.count()) { await b.click().catch(() => {}); await sleep(1500); }
}

async function googleMaps(d) {
  const st = d.stihlshop || {};
  const q = `${d.store} ${st.address || d.address}`;
  await page.goto('https://www.google.com/maps/search/' + encodeURIComponent(q), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(4500); await acceptConsent();
  let url = page.url();
  // Search page with several results → click the first that matches our name
  if (!/\/maps\/place\//.test(url)) {
    const link = page.locator('a[href*="/maps/place/"]').first();
    if (await link.count()) { await link.click().catch(() => {}); await sleep(3500); url = page.url(); }
  }
  const info = await page.evaluate(() => {
    const t = document.body.innerText;
    const out = { text: t.slice(0, 4000) };
    const h1 = document.querySelector('h1'); out.name = h1 ? h1.innerText.trim() : '';
    // Maps renders "4.6" and "(68)" in separate nodes → any whitespace/newlines between them.
    const m = t.match(/\b([1-5]\.\d)\s*\(\s*([\d,]+)\s*\)/) || t.match(/\b([1-5]\.\d)[\s\n]{0,10}([\d,]+)\s*reviews/i) || t.match(/\b([1-5]\.\d)\s*stars?[\s\n]{0,10}([\d,]+)/i);
    if (m) { out.rating = Number(m[1]); out.reviewCount = Number(m[2].replace(/,/g, '')); }
    const cat = t.match(/\(\s*[\d,]+\s*\)[\s\n·]*([A-Za-z &]{3,40}?(?:store|dealer|shop|equipment|supplier|service|repair))\b/i); if (cat) out.category = cat[1].trim();
    const web = [...document.querySelectorAll('a[data-item-id="authority"], a[aria-label^="Website"]')].map((a) => a.href)[0]; if (web) out.website = web;
    const ph = t.match(/(0\d[\d ]{7,11})/); if (ph) out.phone = ph[1].trim();
    const status = t.match(/(Open now|Closed now|Closes soon|Opens soon|Temporarily closed|Permanently closed)/i); if (status) out.status = status[1];
    const cidm = (document.documentElement.innerHTML.match(/"0x[0-9a-f]+:0x[0-9a-f]+"/) || [])[0]; if (cidm) out.ftid = cidm.replace(/"/g, '');
    return out;
  });
  const nameOk = /stihl/i.test(info.name || '') || new RegExp(d.shortName.split(' ')[0], 'i').test(info.name || '');
  return {
    mapsUrl: /\/maps\/place\//.test(url) ? url.split('?')[0] : null,
    name: info.name || null, nameMatches: nameOk,
    rating: info.rating ?? null, reviewCount: info.reviewCount ?? null,
    category: info.category || null, website: info.website || null, phone: info.phone || null, status: info.status || null,
    ftid: info.ftid || null,
    reviewsUrl: /\/maps\/place\//.test(url) ? url.split('?')[0] + '/reviews' : null,
    checkedAt: new Date().toISOString(),
  };
}

async function ddg(q, hostRe) {
  await page.goto('https://duckduckgo.com/?q=' + encodeURIComponent(q) + '&ia=web', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await sleep(3000);
  return page.evaluate((re) => {
    const rx = new RegExp(re, 'i');
    return [...document.querySelectorAll('a[href]')].map((a) => a.href).filter((h) => rx.test(h) && !/duckduckgo\.com/.test(h));
  }, hostRe);
}

function pickFacebook(urls, d) {
  const town = d.slug.replace(/-/g, '');
  const cands = [];
  for (const u of urls) {
    // Vanity pages: facebook.com/stihlshopkumeu ; unnamed pages: facebook.com/p/STIHL-Shop-Wairoa-1000678.../
    // or facebook.com/<numeric id>/ — for those the page name is in the /p/ slug.
    const pm = u.match(/facebook\.com\/(p|people)\/([^/?#]+)(?:\/(\d+))?/i);
    if (pm) { cands.push({ path: `${pm[1]}/${pm[2]}${pm[3] ? '/' + pm[3] : ''}`, name: pm[2].replace(/-?\d{8,}$/, '') }); continue; }
    const m = u.match(/facebook\.com\/([^/?#]+)/i); if (!m) continue;
    const seg = m[1];
    if (/^(people|pages|groups|hashtag|watch|reel|events|profile\.php|photo|posts|login|sharer|public|share|story\.php)$/i.test(seg)) continue;
    cands.push({ path: seg, name: seg });
  }
  const scored = cands.map((c) => ({ ...c, s: (/stihl/i.test(c.name) ? 2 : 0) + (new RegExp(town, 'i').test(c.name.replace(/-/g, '')) ? 3 : 0) + (/shop/i.test(c.name) ? 1 : 0) }));
  scored.sort((a, b) => b.s - a.s);
  return scored[0] && scored[0].s >= 3 ? 'https://www.facebook.com/' + scored[0].path.replace(/\/$/, '') + (scored[0].path.startsWith('p/') ? '/' : '') : null;
}
function pickInstagram(urls, d) {
  const cands = urls.map((u) => u.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/.*$/, '').replace(/\?.*$/, '')).filter((p) => p && !/^(p|reel|reels|explore|accounts|stories|tv)$/i.test(p));
  const town = d.slug.replace(/-/g, '');
  const scored = cands.map((p) => ({ p, s: (/stihl/i.test(p) ? 2 : 0) + (new RegExp(town, 'i').test(p) ? 3 : 0) }));
  scored.sort((a, b) => b.s - a.s);
  return scored[0] && scored[0].s >= 3 ? 'https://www.instagram.com/' + scored[0].p + '/' : null;
}

async function facebookPage(url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); await sleep(4000);
  return page.evaluate(() => {
    const meta = (p) => (document.querySelector(`meta[property="${p}"]`) || {}).content || '';
    const t = document.body.innerText.replace(/\n+/g, ' | ');
    const out = { title: meta('og:title').trim(), description: meta('og:description'), image: meta('og:image'), url: meta('og:url') };
    const f = out.description.match(/([\d,]+)\s*followers/i); if (f) out.followers = Number(f[1].replace(/,/g, ''));
    const intro = t.match(/Intro \| ([^|]{5,200}) \|/); if (intro) out.intro = intro[1].trim();
    const em = t.match(/([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i); if (em) out.email = em[1];
    const ph = t.match(/\+64 [\d -]{8,14}/); if (ph) out.phone = ph[0];
    const site = t.match(/\|\s*([a-z0-9.-]+\.(?:co\.nz|nz|com)(?:\/[^\s|]*)?)\s*\|/i); if (site) out.website = site[1];
    out.loginWalled = /Log In \| Forgot Account\?/.test(t) && !out.title;
    return out;
  });
}

async function instagramPage(url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {}); await sleep(3500);
  return page.evaluate(() => {
    const meta = (p) => (document.querySelector(`meta[property="${p}"], meta[name="${p}"]`) || {}).content || '';
    const desc = meta('og:description') || meta('description');
    const out = { description: desc, image: meta('og:image'), title: meta('og:title') };
    const f = desc.match(/([\d,.]+[KkMm]?)\s*Followers/); if (f) out.followersText = f[1];
    return out;
  });
}

let n = 0;
for (const d of targets) {
  const cache = path.join(CACHE, d.slug + '.json');
  if (fs.existsSync(cache) && !force) { d.free = JSON.parse(fs.readFileSync(cache, 'utf8')); continue; }
  const rec = { slug: d.slug, at: new Date().toISOString() };
  try { rec.google = await googleMaps(d); if (!rec.google.rating) { await sleep(3000); const again = await googleMaps(d); if (again.rating) rec.google = again; } } catch (e) { rec.google = { error: e.message.slice(0, 120) }; }
  try {
    const fbUrls = await ddg(`"${d.store}" facebook`, 'facebook\\.com/');
    rec.facebookUrl = pickFacebook(fbUrls, d);
    if (!rec.facebookUrl) { const alt = await ddg(`${d.store} Facebook page`, 'facebook\\.com/'); rec.facebookUrl = pickFacebook(alt, d); }
    const igUrls = await ddg(`"${d.store}" instagram`, 'instagram\\.com/');
    rec.instagramUrl = pickInstagram(igUrls, d);
  } catch (e) { rec.socialError = e.message.slice(0, 120); }
  if (rec.facebookUrl) { try { rec.facebook = await facebookPage(rec.facebookUrl); } catch (e) { rec.facebook = { error: e.message.slice(0, 120) }; } }
  if (rec.instagramUrl) { try { rec.instagram = await instagramPage(rec.instagramUrl); } catch (e) { rec.instagram = { error: e.message.slice(0, 120) }; } }
  fs.writeFileSync(cache, JSON.stringify(rec, null, 2));
  d.free = rec;
  n++;
  console.log(`✓ ${d.shortName}: google ${rec.google?.rating ?? '—'} (${rec.google?.reviewCount ?? '—'}) · fb ${rec.facebookUrl ? (rec.facebook?.followers ?? '?') + ' followers' : '—'} · ig ${rec.instagramUrl ? 'yes' : '—'}`);
  await sleep(1500 + Math.random() * 1500);
}
await browser.close();

// Merge into the canonical records
for (const d of dealers) {
  const f = d.free; if (!f) continue;
  d.google = f.google && !f.google.error ? { mapsUrl: f.google.mapsUrl, reviewsUrl: f.google.reviewsUrl, rating: f.google.rating, reviewCount: f.google.reviewCount, category: f.google.category, website: f.google.website, status: f.google.status, nameMatches: f.google.nameMatches, checkedAt: f.google.checkedAt } : null;
  d.social = { facebook: f.facebookUrl || '', instagram: f.instagramUrl || '' };
  d.facebook = f.facebook && !f.facebook.error && !f.facebook.loginWalled ? { url: f.facebookUrl, title: f.facebook.title, followers: f.facebook.followers ?? null, intro: f.facebook.intro || clean(f.facebook.description.split('.')[0]) || null, image: f.facebook.image || null, email: f.facebook.email || null, phone: f.facebook.phone || null, website: f.facebook.website || null } : null;
  d.instagram = f.instagram && !f.instagram.error && f.instagram.title ? { url: f.instagramUrl, followers: f.instagram.followersText || null, image: f.instagram.image || null } : null;
  if (!d.website && d.google?.website && !/stihlshop\.co\.nz/.test(d.google.website)) d.websiteFromGoogle = d.google.website;
  delete d.free;
}
fs.writeFileSync(path.join(HERE, 'dealers.json'), JSON.stringify(dealers, null, 2));
const t = targets;
console.log(`\n${n} fetched, ${t.length} targets: google ${t.filter((d) => d.google?.rating).length} rated · fb ${t.filter((d) => d.social?.facebook).length} · ig ${t.filter((d) => d.social?.instagram).length} · google-found website ${t.filter((d) => d.websiteFromGoogle).length}`);
