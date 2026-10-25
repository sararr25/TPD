import { test, expect } from "@playwright/test";
import { worldFixtures } from "./world-fixtures";

const base = process.env.MOTION_BASE_URL || "http://127.0.0.1:3000";
test.use({ video: "on" });

// Observe displacement relative to the photo's frame: page scroll alone must
// not satisfy the test. This verifies the visible effect rather than GSAP APIs.
async function relativeOffset(photo: import("@playwright/test").Locator) {
  return photo.evaluate((image) => {
    const frame = image.closest(".h-visa-photo, .city-cover-photo, .place-hero")!;
    return image.getBoundingClientRect().top - frame.getBoundingClientRect().top;
  });
}

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`photo parallax and scroll entrances at ${viewport.width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await worldFixtures(page);
    await page.setViewportSize(viewport);
    await page.goto(base);
    await expect(page.locator(".h-picks:visible")).toHaveAttribute("aria-busy", "false");
    const photo = page.locator(".h-visa-photo img:visible");
    await expect(photo).toBeVisible();
    await page.waitForTimeout(1400);
    await photo.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    const before = await relativeOffset(photo);
    await page.evaluate(() => scrollBy(0, 300));
    await page.waitForTimeout(100);
    expect(Math.abs(await relativeOffset(photo) - before)).toBeGreaterThan(1);
    // The lower postcard shelf becomes readable and remains settled when revisited.
    const card = page.locator(".h-grid > li:visible").last();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveCSS("opacity", "1");
    await page.waitForTimeout(1000);
    const settled = await card.evaluate((el) => getComputedStyle(el).transform);
    await page.evaluate(() => scrollTo(0, 0));
    await card.scrollIntoViewIfNeeded();
    expect(await card.evaluate((el) => getComputedStyle(el).transform)).toBe(settled);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    await page.goto(base + "/lisbon");
    const cover = page.locator(".city-cover-photo img:visible");
    await expect(cover).toBeVisible();
    await page.waitForTimeout(800);
    const cityBefore = await relativeOffset(cover);
    await page.evaluate(() => scrollBy(0, 240));
    await page.waitForTimeout(100);
    expect(Math.abs(await relativeOffset(cover) - cityBefore)).toBeGreaterThan(1);
    await page.goBack();
    await expect(page.getByRole("heading", { name: "Your taste. Your next place.", exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("switching reduced motion removes scroll offsets and keeps controls readable", async ({ page }) => {
  await worldFixtures(page);
  await page.goto(base);
  await expect(page.getByRole("heading", { name: "Your taste. Your next place.", exact: true })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".h-picks:visible")).toHaveAttribute("aria-busy", "false");
  const photo = page.locator(".h-visa-photo img:visible");
  await expect(photo).toHaveCSS("transform", "none");
  await expect(photo).toBeVisible();
  const before = await relativeOffset(photo);
  await page.evaluate(() => scrollBy(0, 350));
  await page.waitForTimeout(100);
  expect(await relativeOffset(photo)).toBeCloseTo(before, 1);
  await expect(page.locator(".h-cover h1:visible")).toHaveCSS("opacity", "1");
  await page.getByLabel("Where are you going?").fill("Lisbon");
  await expect(page.getByRole("button", { name: "Open the city" })).toBeEnabled();
});

test("Place photo scrolls within its frame and is static without motion", async ({ page }) => {
  await worldFixtures(page);
  await page.setViewportSize({ width: 390, height: 600 });
  await page.route("**/missing-fixture-photo.jpg", (route) => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="#6b4a73"/></svg>' }));
  await page.goto(base + "/preview/checks");
  const photo = page.locator(".place-hero img:visible");
  await expect(photo).toBeVisible();
  await page.waitForTimeout(850);
  const before = await relativeOffset(photo);
  await page.evaluate(() => scrollBy(0, 220));
  await page.waitForTimeout(100);
  expect(Math.abs(await relativeOffset(photo) - before)).toBeGreaterThan(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(photo).toHaveCSS("transform", "none");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("Home remains readable when JavaScript is unavailable", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(base);
  await expect(page.locator("main").getByRole("heading").first()).toBeVisible();
  await expect(page.locator("main").getByRole("link", { name: /cities/i }).first()).toBeVisible();
  await context.close();
});
