import { test, expect } from "@playwright/test";
import { worldFixtures, place } from "./world-fixtures";
const base = process.env.MOTION_BASE_URL || "http://127.0.0.1:3000";

for (const width of [1440, 390]) test(`city Twin cover spreads dashed ink while preserving text and photo at ${width}`, async ({ page }) => {
  await worldFixtures(page);
  await page.setViewportSize({ width, height: 900 });
  await page.goto(base + "/paris?tab=swap");
  const cover = page.locator(".city-cover");
  const art = cover.locator(".city-ink-map");
  await expect(art).toHaveAttribute("data-ink-state", "complete", { timeout: 10000 });
  const bounds = await art.evaluate(element => {
    const card = element.parentElement!, copy = card.querySelector(".city-cover-copy")!, photo = card.querySelector(".city-cover-photo")!;
    const frame = card.getBoundingClientRect(), art = element.getBoundingClientRect();
    const before = [frame.height, copy.getBoundingClientRect().top, photo.getBoundingClientRect().left];
    (element as HTMLElement).style.display = "none";
    const after = [card.getBoundingClientRect().height, copy.getBoundingClientRect().top, photo.getBoundingClientRect().left];
    (element as HTMLElement).style.removeProperty("display");
    const exclusions = [...element.querySelectorAll<SVGRectElement>("[data-ink-exclusion]")].map(rect => ({ x: +rect.getAttribute("x")!, y: +rect.getAttribute("y")!, width: +rect.getAttribute("width")!, height: +rect.getAttribute("height")! }));
    const p = photo.getBoundingClientRect();
    const photoMasked = exclusions.some(r => r.x <= p.left - frame.left && r.y <= p.top - frame.top && r.x + r.width >= p.right - frame.left && r.y + r.height >= p.bottom - frame.top);
    return { before, after, widthRatio: art.width / frame.width, heightRatio: art.height / frame.height, photoMasked, exclusions: exclusions.length };
  });
  expect(bounds.after).toEqual(bounds.before);
  expect(bounds.widthRatio).toBeCloseTo(1, 1);
  expect(bounds.heightRatio).toBeCloseTo(1, 1);
  expect(bounds.photoMasked).toBe(true);
  expect(bounds.exclusions).toBeGreaterThan(5);
  await expect(art.locator(".cover-ink-trail")).toHaveCount(3);
  for (const trail of await art.locator(".cover-ink-trail").all()) await expect(trail).toHaveAttribute("stroke-dasharray", "2 8");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(art).toHaveAttribute("data-ink-state", "static");
  await expect(art.locator("svg")).toBeVisible();
  for (const step of await art.locator(".cover-ink-step").all()) {
    await expect(step).toHaveCSS("opacity", "0.8");
    await expect(step).toHaveAttribute("transform", /translate\(.+rotate\(/);
  }
  await page.getByRole("tab", { name: "For you", exact: true }).click();
  await expect(cover.locator(".city-ink-map")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});

test("save toast clears the mobile navigation and stays available while an action is focused", async ({ page }) => {
  await worldFixtures(page, false);
  await page.clock.install();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/lisbon");
  await page.locator(".save > button").first().click();
  const toast = page.locator(".toast");
  await expect(toast).toBeVisible();
  const box = (await toast.boundingBox())!, bar = (await page.locator(".tab-bar").boundingBox())!;
  expect(box.y + box.height).toBeLessThan(bar.y);
  await toast.getByRole("button", { name: "Undo", exact: true }).focus();
  await page.clock.fastForward(7000);
  await expect(toast).toBeVisible();
  await page.getByRole("link", { name: "beesyde", exact: true }).first().focus();
  await page.clock.fastForward(7000);
  await expect(toast).toHaveCount(0);
});

test("the city map mounts only for visible For you results with coordinates", async ({ page }) => {
  await worldFixtures(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.route("https://tiles.openfreemap.org/**", route => route.fulfill({ json: { version: 8, sources: {}, layers: [{ id: "background", type: "background", paint: { "background-color": "#e8e9eb" } }] } }));
  await page.route("**/api/discovery", async route => {
    if (route.request().postDataJSON().action !== "explore") return route.fallback();
    return route.fulfill({ json: { results: [{ place: { ...place, lat: 38.72, lon: -9.14 }, token: "fixture" }], places: [], checkedAt: "2026-10-26T00:00:00Z", traitsUsed: false, notice: "Fixture" } });
  });
  await page.goto(base + "/lisbon?tab=swap");
  await expect(page.locator(".twin-workspace:visible")).toBeVisible();
  await expect(page.locator("#city-place-map .maplibregl-canvas")).toHaveCount(0);
  await page.getByRole("tab", { name: "For you", exact: true }).click();
  await expect(page.locator("#city-place-map .maplibregl-canvas")).toBeVisible();
  await expect(page.locator("#city-place-map .map-pin")).toHaveCount(1);
  await page.getByRole("tab", { name: "Twin", exact: true }).click();
  await expect(page.locator("#city-place-map .maplibregl-canvas")).toHaveCount(0);
  await page.getByRole("tab", { name: "For you", exact: true }).click();
  await expect(page.locator("#city-place-map .maplibregl-canvas")).toBeVisible();
});

test("reduced motion disables City hover and preserves the picture window during scroll", async ({ page }) => {
  await worldFixtures(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base + "/explore");
  const card = page.locator(".h-city").first();
  await card.hover();
  await expect(card.locator("img")).toHaveCSS("transform", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/lisbon");
  await page.waitForTimeout(700);
  for (const y of [0, 210]) {
    await page.evaluate(y => scrollTo(0, y), y);
    await page.waitForTimeout(100);
    const coverage = await page.locator(".city-cover-photo img").evaluate(image => {
      const frame = image.parentElement!.getBoundingClientRect(), rect = image.getBoundingClientRect();
      return { top: rect.top <= frame.top + 8, bottom: rect.bottom >= frame.bottom - 8 };
    });
    expect(coverage).toEqual({ top: true, bottom: true });
  }
});

test("initial reduced motion retains positioned footprints", async ({ page }) => {
 await worldFixtures(page); await page.emulateMedia({reducedMotion:"reduce"}); await page.goto(base+"/paris?tab=swap");
 const steps=page.locator(".cover-ink-step"); await expect(steps.first()).toHaveCSS("opacity","0.8");
 await expect(steps.first()).toHaveAttribute("transform",/translate\(.+rotate\(/);
});

test("new Save feedback still animates after a history return", async ({ page }) => {
 await worldFixtures(page,false);await page.goto(base+"/lisbon");await expect(page.locator(".place-card").first()).toBeVisible();
 await page.getByRole("link",{name:"Cities",exact:true}).first().click();await expect(page).toHaveURL(/\/explore$/);await page.goBack();
 const save=page.locator(".place-card .save > button").first();await expect(save).toBeVisible();await save.click();
 const imprint=page.locator(".save-imprint").first();await expect(imprint).toBeAttached();
 await expect.poll(()=>imprint.evaluate(el=>+getComputedStyle(el).opacity)).toBeGreaterThan(0);
});
