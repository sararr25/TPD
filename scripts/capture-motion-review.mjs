// Read-only visual capture: public provider/account seams use existing fixtures.
// Run with --experimental-strip-types; no account rows or provider quota are used.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { worldFixtures } from './browser/world-fixtures.ts';

const baseline = process.env.TWIN_AB_BASE_URL;
const candidate = process.env.MOTION_BASE_URL;
if (!baseline || !candidate) throw new Error('Set both immutable baseline and candidate URLs.');
const directory = process.env.TPD_MOTION_CAPTURE_DIR || '.private/historical-motion';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = [];
try {
  for (const width of [390, 1440]) for (const [variant, base] of [['A', baseline], ['B', candidate]]) {
    const viewport = { width, height: 900 };
    const folder = `${directory}/${variant}-${width}`;
    await mkdir(folder, { recursive: true });
    const context = await browser.newContext({ viewport, reducedMotion: 'no-preference', recordVideo: { dir: folder, size: viewport } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await worldFixtures(page);
    const marks = [];
    const mark = async name => marks.push({ name, seconds: await page.evaluate(() => performance.now() / 1000) });
    try {
      // Warm compilation only. Captures compare geometry/choreography, not latency.
      await page.goto(base);
      await page.waitForTimeout(1800);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await mark('Home DOM loaded');
      let elapsed = 0;
      for (const milliseconds of [0, 200, 450, 800, 1400, 1900]) {
        await page.waitForTimeout(milliseconds - elapsed);
        await page.screenshot({ path: `${folder}/home-${milliseconds}.png` });
        elapsed = milliseconds;
      }
      const example = page.locator('.h-visa:visible');
      if (await example.count()) {
        await example.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${folder}/example.png` });
      }
      await page.locator('.h-band:visible').scrollIntoViewIfNeeded();
      await mark('Home ending entered');
      for (const index of [0, 1, 2, 3]) {
        await page.waitForTimeout(index ? 650 : 0);
        await page.screenshot({ path: `${folder}/ending-${index}.png` });
      }
      if (variant === 'B') await page.locator('.h-band .ink-journey[data-ink-state="complete"]').waitFor({ state: 'visible', timeout: 8000 });
      else await page.waitForTimeout(2500);
      await mark('Home ending settled');
      await page.screenshot({ path: `${folder}/ending-settled.png` });
      await page.waitForTimeout(700);
      await page.goto(`${base}/paris?tab=swap`);
      await mark('City DOM loaded');
      for (const index of [0, 1, 2, 3]) {
        await page.waitForTimeout(index ? 700 : 0);
        await page.screenshot({ path: `${folder}/city-${index}.png` });
      }
      if (variant === 'B') await page.locator('.city-ink-map[data-ink-state="complete"]').waitFor({ state: 'visible', timeout: 8000 });
      else await page.waitForTimeout(3000);
      await mark('City normal motion settled');
      await page.screenshot({ path: `${folder}/city-settled.png` });
      await page.waitForTimeout(700);
      const photo = page.locator('.city-cover-photo img:visible');
      const offset = async () => photo.evaluate(image => image.getBoundingClientRect().top - image.closest('.city-cover-photo').getBoundingClientRect().top);
      const before = await offset();
      await page.evaluate(() => scrollBy(0, 240));
      await page.waitForTimeout(250);
      const after = await offset();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(150);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `${folder}/city-reduced.png` });
      report.push({ variant, base, viewport, marks, photoOffsetBefore: before, photoOffsetAfter: after, pageErrors: errors, video: await page.video().path() });
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  await writeFile(`${directory}/capture.json`, JSON.stringify(report, null, 2));
}
if (report.some(item => item.pageErrors.length)) process.exitCode = 1;
console.log(JSON.stringify(report.map(({ variant, viewport, photoOffsetBefore, photoOffsetAfter, pageErrors }) => ({ variant, viewport, photoOffsetBefore, photoOffsetAfter, pageErrors }))));
