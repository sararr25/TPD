import { test, expect } from "@playwright/test";
import { worldFixtures, sharedCode } from "./world-fixtures";
import { mkdir } from "node:fs/promises";
const base = process.env.MOTION_BASE_URL || "http://127.0.0.1:3000";
const pages = ["/explore", "/lisbon", "/swap", "/passport", "/passport/settings", "/collections", "/compare", "/trip#" + sharedCode, ...(process.env.PASSPORT_PRODUCTION ? [] : ["/preview/checks"])];
for (const viewport of [{ width: 375, height: 812 }, { width: 812, height: 375 }, { width: 768, height: 1024 }, { width: 1440, height: 1000 }]) {
  test(`Passport world layout ${viewport.width}×${viewport.height}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await worldFixtures(page);
    await page.setViewportSize(viewport);
    await mkdir(".private/passport-world", { recursive: true });
    for (const [index, path] of pages.entries()) {
      await page.goto(base + path);
      await expect(page.locator("h1").first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(750);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), path).toBe(0);
      await page.screenshot({ path: `.private/passport-world/${index}-${viewport.width}x${viewport.height}.png` });
    }
    expect(errors).toEqual([]);
  });
}
test("motion preference and large text preserve paper controls", async ({ page }) => {
  await worldFixtures(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["/explore", "/lisbon", "/collections", "/passport/settings"]) {
    await page.goto(base + path);
    await page.addStyleTag({ content: "html {font-size: 125%} input, button, select, p {font-size: max(1em, 18px)}" });
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), path).toBe(0);
  }
});
test("save impression follows a real guest save and trip remains private", async ({ page }) => {
  const writes = await worldFixtures(page, false);
  await page.goto(base + "/lisbon");
  const save = page.locator(".save > button").first();
  await expect(save).toBeVisible();
  await expect(page.locator(".save-imprint")).toHaveCount(0);
  await save.click();
  await expect(save).toHaveAttribute("data-on", "true");
  await expect(page.locator(".save-imprint").first()).toBeAttached();
  await page.goto(base + "/collections");
  await expect(page.getByRole("heading", { name: "Lisbon trip" })).toBeVisible();
  await page.goto(base + "/lisbon");
  await expect(page.locator(".save > button").first()).toHaveAttribute("data-on", "true");
  await expect(page.locator(".save-imprint")).toHaveCount(0);
  expect(writes).toEqual([]);
});

test("offscreen photos reveal once on discovery", async ({ page }) => {
  await worldFixtures(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(base + "/explore");
  const photo = page.locator(".h-city-photo[data-travel-reveal]").last();
  await expect(photo).toBeAttached();
  await page.waitForTimeout(800);
  expect(await photo.evaluate(el => (el as HTMLElement).style.clipPath)).toBe("");
  await photo.scrollIntoViewIfNeeded();
  await expect.poll(() => photo.evaluate(el => (el as HTMLElement).style.clipPath)).not.toBe("");
  await expect.poll(() => photo.evaluate(el => (el as HTMLElement).style.clipPath)).toBe("");
  await page.evaluate(() => scrollTo(0, 0));
  await photo.scrollIntoViewIfNeeded();
  expect(await photo.evaluate(el => (el as HTMLElement).style.clipPath)).toBe("");
});

test("coded journey plays once and reduced motion keeps static artwork", async ({ page }) => {
  await worldFixtures(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/explore");
  const journey = page.locator(".journey-animation");
  await expect(journey).toHaveAttribute("data-journey-state", "complete", { timeout: 8000 });
  const cover = journey.locator(".journey-book-cover");
  const resting = await cover.getAttribute("style");
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await journey.scrollIntoViewIfNeeded();
  await expect(journey).toHaveAttribute("data-journey-state", "complete");
  expect(await cover.getAttribute("style")).toBe(resting);
  const bounds = await journey.locator("svg").boundingBox();
  expect(bounds!.width).toBeLessThanOrEqual(260);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(journey).toHaveAttribute("data-journey-state", "static");
  expect(await cover.evaluate(el => (el as SVGElement).style.transform)).toBe("");
  expect(await journey.locator(".journey-ink-route").evaluate(el => (el as SVGElement).style.strokeDashoffset)).toBe("");
});
