#!/usr/bin/env node
// Audit every dealer that HAS a website: what it's built on, how big, how current, is it
// on-brand, mobile, fast, secure — and a screenshot. Produces a 0–100 quality score with
// the reasons, so dealers can be sorted into "weak site" vs "decent site" and moved by hand.
//
//   node audit_sites.mjs [--only slug] [--force]
// Writes audit/<slug>.json + audit/<slug>.png (desktop) and <slug>-m.png (mobile); merges
// `siteAudit` into dealers.json.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'audit'); fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const force = args.includes('--force');
const dealers = JSON.parse(fs.readFileSync(path.join(HERE, 'dealers.json'), 'utf8'));
const targets = dealers.filter((d) => (only ? d.slug === only : d.hasSite && d.website && !d.ourDealer && !d.closed));

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const browser = await chromium.launch({ executablePath: `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`, headless: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function detectTech(html, headers) {
  const h = html.toLowerCase(); const hs = JSON.stringify(headers).toLowerCase();
  if (/wix\.com|wixstatic|_wix_/.test(h) || /x-wix/.test(hs)) return 'Wix';
  if (/squarespace/.test(h) || /squarespace/.test(hs)) return 'Squarespace';
  if (/cdn\.shopify|myshopify|shopify-section|x-shopify/.test(h + hs)) return 'Shopify';
  if (/wp-content|wp-includes|wordpress/.test(h)) return /elementor/.test(h) ? 'WordPress (Elementor)' : 'WordPress';
  if (/shopify/.test(h) || /shopify/.test(hs)) return 'Shopify';
  if (/webflow/.test(h)) return 'Webflow';
  if (/rocketspark/.test(h)) return 'Rocketspark';
  if (/weebly/.test(h)) return 'Weebly';
  if (/godaddy|secureserver/.test(h)) return 'GoDaddy builder';
  if (/duda|dudamobile/.test(h)) return 'Duda';
  if (/zyro|hostinger/.test(h)) return 'Hostinger';
  if (/joomla/.test(h)) return 'Joomla';
  if (/magento/.test(h)) return 'Magento';
  if (/sveltekit|__sveltekit/.test(h)) return 'SvelteKit';
  if (/_next\/static|__next/.test(h)) return 'Next.js';
  if (/f925|unify/.test(h)) return 'UNIFY (F925)';
  return 'Custom / unknown';
}

// Many NZ small-business hosts geo-block anything outside NZ/AU (we run from Argentina), so a
// 403 / "Just a moment" is not the site — it's the wall. Fallback: the Wayback Machine's raw
// (`id_`) snapshot for structure + screenshot, and r.jina.ai (fetches from the US, gets through)
// for the *current* text.
const BLOCKED = /just a moment|403|forbidden|access denied|not available in your|blocked/i;
async function waybackUrl(url) {
  try {
    const j = await (await fetch('https://archive.org/wayback/available?url=' + encodeURIComponent(url.replace(/^https?:\/\//, '')))).json();
    const c = j?.archived_snapshots?.closest;
    if (!c?.available) return null;
    return { url: c.url.replace(/^http:/, 'https:'), ts: c.timestamp }; // rewritten version: assets load through the archive, so the screenshot is styled
  } catch { return null; }
}
async function jinaText(url) {
  try { const r = await fetch('https://r.jina.ai/' + url, { signal: AbortSignal.timeout(45000) }); return r.ok ? await r.text() : ''; } catch { return ''; }
}

async function audit(d) {
  const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1366, height: 900 }, ignoreHTTPSErrors: true, locale: 'en-NZ' });
  const page = await ctx.newPage();
  const res = { slug: d.slug, url: d.website, at: new Date().toISOString(), reasons: [] };
  const t0 = Date.now();
  let resp;
  try { resp = await page.goto(d.website, { waitUntil: 'load', timeout: 45000 }); }
  catch (e) {
    // slow hosts: settle for DOM ready, note it
    try { resp = await page.goto(d.website, { waitUntil: 'domcontentloaded', timeout: 60000 }); res.slowLoad = true; }
    catch (e2) { res.error = 'unreachable: ' + e2.message.slice(0, 80); await ctx.close(); return res; }
  }
  res.loadMs = Date.now() - t0;
  res.finalUrl = page.url(); res.status = resp?.status() || null;
  res.https = res.finalUrl.startsWith('https://');
  let headers = resp?.headers() || {};
  await sleep(2500);
  let html = await page.content();
  const origHost = new URL(res.finalUrl).host.replace(/^www\./, '');
  const blocked = (res.status >= 400) || BLOCKED.test(await page.title());
  let mobileUrl = d.website;
  if (blocked) {
    const wb = await waybackUrl(d.website);
    res.geoBlocked = true;
    if (!wb) {
      // text only, through jina: enough for content/branding/freshness; no screenshot, no structure
      const md = await jinaText(d.website);
      if (md.length < 200) { res.error = `blocked (${res.status}), no Wayback snapshot, jina empty`; await ctx.close(); return res; }
      res.via = 'jina'; res.loadMs = null;
      const body = md.replace(/^[\s\S]*?Markdown Content:\n/, '');
      const text = body.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\]\([^)]*\)/g, ']');
      const links = [...body.matchAll(/\]\((https?:[^)\s]+)\)/g)].map((m) => m[1]);
      const paths = new Set(links.filter((h) => { try { return new URL(h).host.replace(/^www\./, '') === origHost; } catch { return false; } }).map((h) => new URL(h).pathname.replace(/\/$/, '') || '/').filter((p) => !/\.(jpg|png|pdf|jpeg|webp)$/i.test(p)));
      const years = [...text.matchAll(/(?:©|copyright|\(c\))\s*(?:\d{4}\s*[-–]\s*)?(20\d\d)/gi)].map((m) => Number(m[1]));
      const anyYears = [...text.matchAll(/\b(20[12]\d)\b/g)].map((m) => Number(m[1]));
      Object.assign(res, {
        tech: detectTech(md, {}), title: (md.match(/^Title: (.*)$/m) || [])[1] || '', viewport: true, pagesLinked: paths.size, navItems: [...paths].slice(0, 40),
        hasForm: /\[?(send|submit|enquir|get in touch)/i.test(text), hasMap: /google\.com\/maps|maps\.google/.test(md), hasPhone: /\b0\d[\d ]{7,10}\b/.test(text),
        hasHours: /\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\b[^\n]{0,40}\d{1,2}(:\d{2})?\s*(am|pm)/i.test(text) || /opening hours|open hours|hours/i.test(text),
        stihlLogo: /stihl[^)]*\.(png|svg|jpg|webp)/i.test(md), stihlShopWordmark: /STIHL SHOP/.test(text), linksToStihlshop: links.filter((h) => /stihlshop\.co\.nz/i.test(h)).length,
        localCatalogue: /add to cart|shop now|buy now|checkout/i.test(text) && !/stihlshop\.co\.nz/.test(md),
        copyrightYear: years.length ? Math.max(...years) : null, newestYear: anyYears.length ? Math.max(...anyYears) : null,
        wordCount: text.split(/\s+/).filter(Boolean).length, images: (md.match(/!\[/g) || []).length, h1: (body.match(/^# (.*)$/m) || [])[1] || '',
        social: { facebook: links.find((h) => /facebook\.com/.test(h)) || '', instagram: links.find((h) => /instagram\.com/.test(h)) || '' }, liveText: true,
      });
      res.mobile = { unknown: true };
      await ctx.close();
      score(res); return res;
    }
    res.via = 'wayback'; res.snapshot = wb.ts.replace(/^(\d{4})(\d{2})(\d{2}).*/, '$1-$2-$3');
    try { resp = await page.goto(wb.url, { waitUntil: 'load', timeout: 60000 }); await sleep(2500); html = await page.content(); headers = {}; mobileUrl = wb.url; }
    catch (e) { res.error = 'wayback: ' + e.message.slice(0, 80); await ctx.close(); return res; }
    res.loadMs = null; // can't judge speed through the archive
  }
  res.tech = detectTech(html, headers);
  res.bytes = html.length;

  const info = await page.evaluate((origHost) => {
    const unwrap = (h) => h.replace(/^https?:\/\/web\.archive\.org\/web\/\d+[a-z_]*\//, '');
    const text = document.body.innerText || '';
    const links = [...document.querySelectorAll('a[href]')].map((a) => unwrap(a.href));
    const sameHost = links.filter((h) => { try { return new URL(h).host.replace(/^www\./, '') === origHost; } catch { return false; } });
    const paths = new Set(sameHost.map((h) => { try { return new URL(h).pathname.replace(/\/$/, '') || '/'; } catch { return ''; } }).filter((p) => p && !/\.(jpg|png|pdf|jpeg|webp)$/i.test(p) && !/#/.test(p)));
    const years = [...text.matchAll(/(?:©|copyright|\(c\))\s*(?:\d{4}\s*[-–]\s*)?(20\d\d)/gi)].map((m) => Number(m[1]));
    const anyYears = [...text.matchAll(/\b(20[12]\d)\b/g)].map((m) => Number(m[1]));
    return {
      title: document.title, description: (document.querySelector('meta[name="description"]') || {}).content || '',
      viewport: !!document.querySelector('meta[name="viewport"]'),
      pagesLinked: paths.size, navItems: [...paths].slice(0, 40),
      hasForm: !!document.querySelector('form input[type="email"], form textarea, form input[name*="name" i]'),
      hasMap: !!document.querySelector('iframe[src*="google.com/maps"], iframe[src*="maps.google"], [class*="map" i] iframe'),
      hasPhone: /\b0\d[\d ]{7,10}\b/.test(text),
      hasHours: /\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\b[^\n]{0,40}\d{1,2}(:\d{2})?\s*(am|pm)/i.test(text) || /opening hours|open hours|hours/i.test(text),
      stihlLogo: [...document.querySelectorAll('img')].some((i) => /stihl/i.test(i.src + ' ' + i.alt)),
      stihlShopWordmark: /STIHL SHOP/.test(text),
      linksToStihlshop: links.filter((h) => /stihlshop\.co\.nz/i.test(h)).length,
      localCatalogue: /add to cart|shop now|buy now|checkout/i.test(text) && !/stihlshop\.co\.nz/.test(links.join(' ')),
      copyrightYear: years.length ? Math.max(...years) : null, newestYear: anyYears.length ? Math.max(...anyYears) : null,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      images: document.images.length,
      h1: (document.querySelector('h1') || {}).innerText || '',
      social: { facebook: links.find((h) => /facebook\.com/.test(h)) || '', instagram: links.find((h) => /instagram\.com/.test(h)) || '' },
      about: (document.querySelector('[class*="about" i], #about, section:nth-of-type(2)') || {}).innerText?.slice(0, 1200) || '',
    };
  }, origHost);
  Object.assign(res, info);
  if (res.via === 'wayback') {
    // current text via jina, so freshness/hours/wordmark reflect today, not the snapshot
    const md = await jinaText(d.website);
    if (md.length > 200) {
      const body = md.replace(/^[\s\S]*?Markdown Content:\n/, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\]\([^)]*\)/g, ']');
      res.liveText = true;
      res.wordCount = body.split(/\s+/).filter(Boolean).length;
      res.hasHours = /\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\b[^\n]{0,40}\d{1,2}(:\d{2})?\s*(am|pm)/i.test(body) || /opening hours|open hours|hours/i.test(body);
      res.hasPhone = /\b0\d[\d ]{7,10}\b/.test(body);
      res.stihlShopWordmark = res.stihlShopWordmark || /STIHL SHOP/.test(body);
      const years = [...body.matchAll(/(?:©|copyright|\(c\))\s*(?:\d{4}\s*[-–]\s*)?(20\d\d)/gi)].map((m) => Number(m[1]));
      const anyYears = [...body.matchAll(/\b(20[12]\d)\b/g)].map((m) => Number(m[1]));
      res.copyrightYear = years.length ? Math.max(...years) : res.copyrightYear;
      res.newestYear = anyYears.length ? Math.max(...anyYears) : res.newestYear;
      res.localCatalogue = /add to cart|shop now|buy now|checkout/i.test(body) && !/stihlshop\.co\.nz/.test(md);
      const t = md.match(/^Title: (.*)$/m); if (t) res.title = t[1];
    }
  }
  const hideToolbar = (p) => p.evaluate(() => { document.getElementById('wm-ipp-base')?.remove(); document.getElementById('wm-ipp-print')?.remove(); }).catch(() => {});
  await hideToolbar(page);
  await page.screenshot({ path: path.join(OUT, d.slug + '.png'), fullPage: false }).catch(() => {});
  // mobile pass
  const mctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, ignoreHTTPSErrors: true });
  const mp = await mctx.newPage();
  try {
    await mp.goto(mobileUrl, { waitUntil: 'load', timeout: 60000 }); await sleep(2000);
    res.mobile = await mp.evaluate(() => ({ horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 10, fontTiny: getComputedStyle(document.body).fontSize && parseFloat(getComputedStyle(document.body).fontSize) < 13 }));
    await hideToolbar(mp);
    await mp.screenshot({ path: path.join(OUT, d.slug + '-m.png'), fullPage: false }).catch(() => {});
  } catch { res.mobile = { error: true }; }
  await mctx.close(); await ctx.close();

  score(res);
  return res;
}

function score(res) {
  let score = 50; const r = res.reasons;
  const add = (n, why) => { score += n; r.push(`${n > 0 ? '+' : ''}${n} ${why}`); };
  if (!res.https) add(-15, 'no HTTPS');
  if (!res.viewport) add(-15, 'no mobile viewport'); else if (res.mobile?.horizontalOverflow) add(-8, 'horizontal overflow on phone');
  if (res.pagesLinked >= 8) add(10, `${res.pagesLinked} internal pages`); else if (res.pagesLinked <= 3) add(-10, `only ${res.pagesLinked} internal pages`);
  if (res.wordCount < 150) add(-10, 'very little content'); else if (res.wordCount > 600) add(5, 'substantial content');
  if (res.hasForm) add(5, 'contact form'); else add(-5, 'no contact form');
  if (res.hasHours) add(3, 'hours shown'); else add(-5, 'no opening hours found');
  if (res.hasMap) add(3, 'map');
  if (res.stihlShopWordmark || res.stihlLogo) add(5, 'STIHL branding present'); else add(-15, 'no STIHL SHOP branding');
  if (res.linksToStihlshop > 0) add(5, 'links to stihlshop.co.nz');
  if (res.localCatalogue) add(-10, 'own product catalogue / cart (RFP §6 conflict)');
  const yr = res.copyrightYear || res.newestYear; const now = new Date().getFullYear();
  if (yr && now - yr >= 2) add(-12, `stale (newest year on page ${yr})`); else if (yr && now - yr <= 0) add(4, 'current year on page');
  if (res.loadMs == null) r.push(res.via === 'jina' ? '0 speed and layout not measured (site geo-blocks non-NZ visitors, no Wayback copy; text read via r.jina.ai)' : `0 speed not measured (audited via Wayback ${res.snapshot}, site geo-blocks non-NZ visitors)`);
  else if (res.loadMs > 6000) add(-10, `slow load ${(res.loadMs / 1000).toFixed(1)}s`); else if (res.loadMs < 2500) add(4, 'fast load');
  if (/Wix|Weebly|GoDaddy|Zyro|Hostinger/.test(res.tech)) add(-5, `builder: ${res.tech}`);
  if (/UNIFY/.test(res.tech)) add(20, 'already on UNIFY');
  res.score = Math.max(0, Math.min(100, score));
}

let n = 0;
for (const d of targets) {
  const cache = path.join(OUT, d.slug + '.json');
  if (fs.existsSync(cache) && !force) { d.siteAudit = JSON.parse(fs.readFileSync(cache, 'utf8')); continue; }
  const r = await audit(d);
  fs.writeFileSync(cache, JSON.stringify(r, null, 2));
  d.siteAudit = r; n++;
  console.log(`✓ ${d.shortName}: ${r.error ? r.error : `${r.score}/100 · ${r.tech} · ${r.pagesLinked}p · ${r.wordCount}w · ${r.loadMs == null ? 'wayback ' + r.snapshot : (r.loadMs / 1000).toFixed(1) + 's'}`}`);
}
await browser.close();
for (const d of dealers) { if (d.siteAudit) { const a = d.siteAudit; d.siteAudit = { ...a, about: undefined, navItems: a.navItems?.slice(0, 15) }; } }
fs.writeFileSync(path.join(HERE, 'dealers.json'), JSON.stringify(dealers, null, 2));
console.log(`${n} audited, ${targets.length} sites`);
