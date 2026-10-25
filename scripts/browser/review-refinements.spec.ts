import { test, expect } from "@playwright/test";
import { twinFixtures, chooseReference } from "./twin-fixtures";
import { worldFixtures } from "./world-fixtures";
const base = process.env.MOTION_BASE_URL || "http://127.0.0.1:3000";
for (const viewport of [{ width: 375, height: 812 }, { width: 390, height: 844 }]) {
  test(`Home entrance clears bottom navigation at ${viewport.width}`, async ({ page }) => {
    await worldFixtures(page);
    await page.setViewportSize(viewport);
    await page.goto(base);
    const cta = page.getByRole("button", { name: "Open the city", exact: true });
    await expect(cta).toBeVisible();
    await page.waitForTimeout(1500);
    const button = await cta.boundingBox();
    const bar = await page.locator('.tab-bar:visible').boundingBox();
    expect(button!.y + button!.height).toBeLessThanOrEqual(bar!.y);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await page.locator('.h-entrance').getByRole('button', { name: 'Find its twin', exact: true }).click();
    const twinCta = await page.getByRole('search', { name: 'Twin', exact: true }).getByRole('button', { name: 'Find its twin', exact: true }).boundingBox();
    expect(twinCta!.y + twinCta!.height).toBeLessThanOrEqual(bar!.y);
  });
}
test('cold header reserves auth and navigation before hydration', async ({ page }) => {
  await worldFixtures(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('**/api/auth/**', async route => {
    await new Promise(resolve => setTimeout(resolve, 1100));
    await route.fulfill({ json: null });
  });
  await page.goto(base);
  const slot = page.locator('.site-header .auth');
  await expect(slot).toBeVisible();
  const before = await slot.boundingBox();
  const headerBefore = await page.locator('.site-header').boundingBox();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  const after = await slot.boundingBox();
  const headerAfter = await page.locator('.site-header').boundingBox();
  expect(after!.x).toBeCloseTo(before!.x, 0);
  expect(headerAfter!.height).toBeCloseTo(headerBefore!.height, 0);
});

for (const width of [320, 390, 768, 1440]) test(`Twin featured photo, Save and honest connection at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await twinFixtures(page, { delay: 900 });
  await chooseReference(page, base);
  await page.getByRole('button', { name: 'Keep: Quiet', exact: true }).click();
  await page.getByRole('button', { name: 'Keep: Seafood', exact: true }).click();
  await page.getByRole('button', { name: 'Find its twin', exact: true }).click();
  await expect(page.locator('.twin-thread')).toContainText('The starting place');
  await expect(page.locator('.twin-thread')).toHaveAttribute('data-state', 'searching');
  await expect(page.locator('.twin-thread')).toHaveAttribute('data-state', 'success');
  await expect(page.locator('.twin-thread-traits')).toContainText('Quiet');
  await expect(page.locator('.twin-thread-traits')).not.toContainText('Seafood');
  await expect(page.locator('.twin-difference')).toContainText('A smaller room with a different menu.');
  await expect(page.locator('.twin-spotlight .place-photo')).toBeVisible();
  const save = page.locator('.twin-spotlight .save > button');
  await expect(save).toContainText('Save');
  await page.waitForTimeout(800);
  const actions = await save.boundingBox();
  expect(actions!.y + actions!.height).toBeLessThan(width <= 720 ? 787 : 844);
  await page.getByRole('button', { name: /See other matches/ }).click();
  await expect(page.getByRole('heading', { name: 'Other matches 2' })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});

test('mobile page entrance waits for its visible chapter and remains static with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await worldFixtures(page);
  await page.goto(base);
  await page.waitForTimeout(1500);
  const bookmark = page.locator('.h-bookmark');
  const stamp = page.locator('.h-stamp');
  // At rest the lower photo/stamp has not already completed its story.
  const bookmarkBefore = await bookmark.evaluate(el => getComputedStyle(el).transform);
  await page.evaluate(() => scrollBy(0, 220));
  const bookmarkBox = await bookmark.boundingBox();
  expect(bookmarkBox!.y).toBeLessThan(844);
  await expect.poll(() => bookmark.evaluate(el => getComputedStyle(el).transform)).not.toBe(bookmarkBefore);
  await page.evaluate(() => scrollTo(0, 0));
  const top = await stamp.boundingBox();
  expect(top!.y).toBeGreaterThan(844);
  await expect(stamp).toHaveCSS('opacity', '0');
  await stamp.scrollIntoViewIfNeeded();
  await expect(stamp).toHaveCSS('opacity', '1');
  await page.waitForTimeout(700);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(bookmark).toHaveCSS('transform', 'none');
  await stamp.scrollIntoViewIfNeeded();
  await expect(stamp).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(bookmark).toHaveCSS('transform', 'none');
  await expect(stamp).toHaveCSS('opacity', '1');
});

test('Delete-only search keeps its actual input in the result story', async ({ page }) => {
  await twinFixtures(page, { delay: 700 });
  await chooseReference(page, base);
  await page.getByRole('button', { name: 'Delete: Seafood', exact: true }).click();
  await page.getByRole('button', { name: 'Find its twin', exact: true }).click();
  await expect(page.locator('.twin-thread-exclusions')).toContainText('Seafood');
  await expect(page.locator('.twin-thread')).toHaveAttribute('data-state', 'success');
  await expect(page.locator('.twin-thread-traits')).toContainText('Twin match 1');
  await expect(page.locator('.twin-thread-exclusions')).toContainText('Seafood');
});

test('cold loads keep layout shift below the review target', async ({ browser }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await worldFixtures(page);
    await page.addInitScript(() => {
      const state = { cls: 0, sources: [] as string[] };
      Object.assign(window, { reviewStability: state });
      new PerformanceObserver(list => list.getEntries().forEach(entry => {
        const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean; sources: { node?: Element }[] };
        if (!shift.hadRecentInput) {
          state.cls += shift.value;
          state.sources.push(...(shift.sources ?? []).map(source => source.node?.className || source.node?.nodeName || 'unknown'));
        }
      })).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(base);
    await page.waitForTimeout(3500);
    const measurement = await page.evaluate(() => (window as unknown as { reviewStability: { cls: number; sources: string[] } }).reviewStability);
    expect(measurement.cls, JSON.stringify(measurement)).toBeLessThanOrEqual(.1);
    expect(measurement.sources).not.toContain('auth compact');
    expect(measurement.sources).not.toContain('FOOTER');
    await context.close();
  }
});

test('enlarged text keeps Home action reachable without clipping', async ({ page }) => {
  await worldFixtures(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(base);
  // Text-only scaling includes the approved display/UI sizes defined in px,
  // which changing the root rem size alone would leave untouched.
  await page.evaluate(() => {
    const sizes = [...document.querySelectorAll<HTMLElement>('body *')].map(element => {
      const style = getComputedStyle(element);
      return { element, size: parseFloat(style.fontSize), line: parseFloat(style.lineHeight) };
    });
    sizes.forEach(({ element, size, line }) => {
      element.style.fontSize = `${size * 2}px`;
      if (Number.isFinite(line)) element.style.lineHeight = `${line * 2}px`;
    });
  });
  const cta = page.getByRole('button', { name: 'Open the city', exact: true });
  await cta.scrollIntoViewIfNeeded();
  await expect(cta).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});
