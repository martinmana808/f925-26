// Capture desktop screenshots of the dealer sites already live on the platform,
// for the proof section of the /unify page.
import { chromium } from 'playwright-core';
import path from 'node:path';

const OUT = '/Users/martinmana/Documents/Projects/f925-26/.claude/worktrees/unify/public/assets/images/unify';
const SITES = [
  { slug: 'site-waihi', url: 'https://stihlshopwaihi.co.nz' },
  { slug: 'site-rotorua', url: 'https://stihlshoprotorua.co.nz' },
  { slug: 'site-tauranga', url: 'https://stihlshoptauranga.co.nz' },
];

const browser = await chromium.launch({
  executablePath: `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`,
  headless: true,
});
const ctx = await browser.newContext({
  viewport: { width: 1366, height: 900 },
  deviceScaleFactor: 2,
});

for (const s of SITES) {
  const page = await ctx.newPage();
  try {
    await page.goto(s.url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(2500);
    // dismiss a cookie banner if one is in the way
    for (const label of ['Accept', 'Accept all', 'Got it', 'OK']) {
      const b = page.getByRole('button', { name: label, exact: false }).first();
      if (await b.count().catch(() => 0)) {
        await b.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(600);
        break;
      }
    }
    const file = path.join(OUT, s.slug + '.png');
    await page.screenshot({ path: file, fullPage: false });
    console.log('ok  ', s.slug, s.url);
  } catch (e) {
    console.log('FAIL', s.slug, e.message);
  }
  await page.close();
}
await browser.close();
