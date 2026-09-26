#!/usr/bin/env node
// Pull each dealer's Google reviews so their preview site can show what their own
// customers say, instead of an empty reviews block.
//
//   node fetch_reviews.mjs [--only slug] [--force] [--want 20]
//
// Source: the reviews pane of the Google Maps listing we already store per dealer
// (`google.reviewsUrl`). No API key, no billing. Cached in reviews/<slug>.json.
//
// Everything is captured, including the bad ones, because a 2-star review is a fact about
// the dealer worth knowing when we talk to them. The site only renders 4 and 5 star ones
// (see link_reviews.py) — that is a display decision, not a reason to throw data away.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'reviews'); fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const arg = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const only = arg('--only', null);
const force = args.includes('--force');
const WANT = Number(arg('--want', 20));

const dealers = JSON.parse(fs.readFileSync(path.join(HERE, 'dealers.json'), 'utf8'));
const targets = dealers.filter((d) => (only ? d.slug === only : !d.closed && (d.google || {}).reviewsUrl));

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const browser = await chromium.launch({ executablePath: `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`, headless: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function scrape(d) {
  const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1280, height: 950 }, locale: 'en-NZ' });
  const page = await ctx.newPage();
  const out = { slug: d.slug, at: new Date().toISOString(), reviews: [] };
  try {
    await page.goto(d.google.reviewsUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(4500);
    if (process.env.RV_DEBUG) console.log('   cards after load:', await page.$$eval('div[data-review-id]', (e) => e.length).catch(() => 'err'));
    for (const label of ['Accept all', 'Reject all', 'I agree']) {
      const b = await page.$(`button:has-text("${label}")`);
      if (b) { await b.click().catch(() => {}); await sleep(2500); break; }
    }
    // What Google gives a headless browser is the place panel's own review list — three
    // or so, the ones it considers most relevant. The full list behind the "N reviews"
    // control is not reachable without fighting their UI, and that fight breaks monthly.
    // Scroll the panel anyway: on some listings it lazy-loads a few more.
    const pane = await page.evaluate(() => {
      const ps = [...document.querySelectorAll('div')]
        .filter((e) => e.scrollHeight > e.clientHeight + 200 && e.clientHeight > 300)
        .sort((a, b) => b.scrollHeight - a.scrollHeight);
      const r = ps[0]?.getBoundingClientRect();
      return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null;
    });
    if (pane) {
      await page.mouse.move(pane.x, pane.y);
      for (let i = 0; i < 8; i++) {
        const n = await page.$$eval('div[data-review-id]', (e) => new Set(e.map((x) => x.getAttribute('data-review-id'))).size).catch(() => 0);
        if (n >= WANT) break;
        await page.mouse.wheel(0, 2000);
        await sleep(900);
      }
    }
    // Expand truncated reviews so we store the whole thing, not "…More". Scoped to the
    // review cards: a bare :has-text("More") elsewhere on the page navigates away and
    // takes the whole list with it.
    for (const more of await page.$$('div[data-review-id] button[aria-label="See more"]')) {
      await more.click().catch(() => {});
    }
    await sleep(800);
    out.reviews = await page.$$eval('div[data-review-id]', (cards) => {
      // Google renders each review in more than one container; the id is the identity.
      const seen = new Set();
      return cards.filter((c) => {
        const id = c.getAttribute('data-review-id');
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      }).map((c) => {
        const stars = c.querySelector('[role="img"][aria-label*="star"], span[aria-label*="star"]');
        const label = stars?.getAttribute('aria-label') || '';
        const rating = Number((label.match(/([1-5])/) || [])[1]) || null;
        const name = c.querySelector('.d4r55, [class*="d4r55"]')?.textContent?.trim()
          || c.querySelector('button[aria-label^="Photo of"]')?.getAttribute('aria-label')?.replace(/^Photo of /, '')
          || '';
        const text = (c.querySelector('.wiI7pd, [class*="wiI7pd"]')?.textContent || '').trim();
        const when = (c.querySelector('.rsqaWe, [class*="rsqaWe"]')?.textContent || '').trim();
        return { id: c.getAttribute('data-review-id'), name, rating, when, text };
      }).filter((r) => r.rating);
    });
  } catch (e) {
    out.error = e.message.slice(0, 90);
    console.log('   debug:', e.message.slice(0, 120));
  }
  out.reviews = out.reviews.slice(0, WANT);
  await ctx.close();
  return out;
}

let n = 0;
for (const d of targets) {
  const cache = path.join(OUT, `${d.slug}.json`);
  if (fs.existsSync(cache) && !force) continue;
  const r = await scrape(d);
  fs.writeFileSync(cache, JSON.stringify(r, null, 1));
  n++;
  const good = r.reviews.filter((x) => x.rating >= 4 && x.text).length;
  console.log(`${r.reviews.length ? '✓' : '·'} ${d.shortName}: ${r.reviews.length} review(s), ${good} usable (4★+ with text)${r.error ? ' — ' + r.error : ''}`);
  await sleep(1500);
}
await browser.close();
console.log(`${n} dealers scraped`);
