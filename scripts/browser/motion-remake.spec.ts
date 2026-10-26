import { test, expect } from "@playwright/test";
import { worldFixtures, favourites, place } from "./world-fixtures";
// Quiz question/save/retry regressions live in taste-quiz.spec.ts.
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
  await page.getByRole("tab", { name: "For you", exact: true }).click();
  await expect(cover.locator(".city-ink-map")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
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

test("reduced-motion touch swipes keep the card still and deliberate horizontal swipes choose once", async ({ page, context }) => {
  await worldFixtures(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/passport");
  await page.getByText("Edit favourites & quiz", { exact: true }).click();
  await page.getByRole("button", { name: "Redo the quiz", exact: true }).click();
  await page.getByRole("button", { name: /Start my quiz/ }).click();
  for (let i = 0; i < 18 && !await page.locator(".taste-card").count(); i++) await page.getByRole("button", { name: "Skip", exact: true }).click();
  const card = page.locator(".taste-card");
  await card.scrollIntoViewIfNeeded();
  const old = await card.locator("h3").textContent();
  const box = (await card.boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + 20, y }] });
  await expect(card).toHaveCSS("transform", "none");
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(card.locator("h3")).toHaveText(old!);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - 120, y }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(card.locator("h3")).not.toHaveText(old!);
  await expect(card).toHaveCSS("transform", "none");
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

test("Passport portrait precedes its editor and existing favourites remain editable", async ({ page }) => {
  const writes = await worldFixtures(page);
  await page.goto(base + "/passport");
  await expect(page.locator(".pf-analysis")).toBeVisible();
  await expect(page.locator(".pf-editor").first()).not.toHaveAttribute("open");
  await page.getByText("Edit favourites & quiz", { exact: true }).click();
  await expect(page.locator(".pf-editor .chips button")).toHaveCount(3);
  await page.getByRole("button", { name: "Remove " + favourites[0].entity.name, exact: true }).click();
  await expect(page.locator(".pf-editor .chips button")).toHaveCount(2);
  await expect(page.getByText(/Choose 1 more favourites/)).toBeVisible();
  expect(writes).toEqual([]);
});

test("a slow Home example stays non-blocking and its photo shimmer pauses offscreen", async ({ page }) => {
  await worldFixtures(page);
  let release: () => void = () => {};
  const ready = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/discovery", async route => {
    if (route.request().postDataJSON().action === "explore") await ready;
    await route.fallback();
  });
  try {
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Open the city", exact: true })).toBeEnabled();
    const photo = page.locator(".h-visa-photo.skeleton:visible");
    await expect(photo).toBeVisible();
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await expect.poll(() => photo.evaluate(element => getComputedStyle(element, "::after").animationPlayState)).toBe("paused");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => photo.evaluate(element => getComputedStyle(element, "::after").animationIterationCount)).toBe("1");
  } finally { release(); }
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

test("Home ending has positioned static footprints with reduced motion", async ({ page }) => {
  await worldFixtures(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  const ending = page.locator('.ink-home-ending .ink-journey');
  await ending.scrollIntoViewIfNeeded();
  await expect(ending).toHaveAttribute('data-ink-state', 'static');
  await expect(ending.locator('.ink-mobile-map')).toBeVisible();
  const steps = ending.locator('.ink-mobile-map .ink-footstep');
  expect(await steps.count()).toBeGreaterThan(10);
  expect(await steps.evaluateAll(nodes => nodes.every(n => !!n.getAttribute('transform') && Number(getComputedStyle(n).opacity) > 0))).toBe(true);
  await expect(ending.locator('.ink-mobile-map .ink-walk')).toHaveAttribute('stroke-dasharray', '2 9');
});

test("Home ending draws once and retains its dashed route after completion", async ({ page }) => {
  await worldFixtures(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  const ending = page.locator('.ink-home-ending .ink-journey');
  await ending.scrollIntoViewIfNeeded();
  await expect(ending).toHaveAttribute('data-ink-state', 'complete', { timeout: 8000 });
  await ending.locator('..').screenshot({ path: '.private/qa/all-changes-home-ending.png' });
  await expect(ending.locator('.ink-desktop-map .ink-walk')).toHaveAttribute('stroke-dasharray', '2 9');
  await page.evaluate(()=>scrollTo(0,0));
  await ending.scrollIntoViewIfNeeded();
  await expect(ending).toHaveAttribute('data-ink-state', 'complete');
  await page.emulateMedia({ reducedMotion:'reduce' });
  await expect(ending).toHaveAttribute('data-ink-state', 'static');
  expect(await ending.locator('.ink-desktop-map .ink-footstep').evaluateAll(nodes=>nodes.every(n=>Number(getComputedStyle(n).opacity)>0))).toBe(true);
});
