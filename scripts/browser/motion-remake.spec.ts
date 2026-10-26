import { test, expect } from "@playwright/test";
import { worldFixtures, favourites, place } from "./world-fixtures";
import { QUESTIONS } from "../../src/lib/quiz";
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

test("quiz change and Back focus the question and preserve the previous answer", async ({ page }) => {
  await worldFixtures(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/passport");
  await page.getByRole("button", { name: "Redo the quiz", exact: true }).click();
  await expect(page.locator("#quiz-title")).toBeFocused();
  const heading = (await page.locator("#quiz-title").boundingBox())!;
  expect(heading.y).toBeGreaterThan(61);
  expect(heading.y + heading.height).toBeLessThan(788);
  await page.getByRole("slider").fill("4");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator("#quiz-title")).toBeFocused();
  await page.getByRole("button", { name: /Back/, exact: false }).click();
  await expect(page.locator("#quiz-title")).toBeFocused();
  await expect(page.getByRole("slider")).toHaveValue("4");
  await page.getByRole("button", { name: "Close quiz", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your Taste Passport", exact: true })).toBeVisible();
});

test("reduced-motion touch swipes keep the card still and deliberate horizontal swipes choose once", async ({ page, context }) => {
  await worldFixtures(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/passport");
  await page.getByRole("button", { name: "Redo the quiz", exact: true }).click();
  for (let i = 0; i < 18 && !await page.locator(".swipe-card").count(); i++) await page.getByRole("button", { name: "Skip", exact: true }).click();
  const card = page.locator(".swipe-card");
  await card.scrollIntoViewIfNeeded();
  const old = await card.getAttribute("aria-label");
  const box = (await card.boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + 20, y }] });
  await expect(card).toHaveCSS("transform", "none");
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(card).toHaveAttribute("aria-label", old!);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - 120, y }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(card).not.toHaveAttribute("aria-label", old!);
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
  await expect(page.locator(".passport-spread > :first-child .pp")).toBeVisible();
  await expect(page.locator(".passport-favourites")).not.toHaveAttribute("open");
  await page.getByText("Edit your favourites", { exact: false }).click();
  await expect(page.locator(".passport-favourites .chips button")).toHaveCount(3);
  await page.getByRole("button", { name: "Remove " + favourites[0].entity.name, exact: true }).click();
  await expect(page.locator(".passport-favourites .chips button")).toHaveCount(2);
  await expect(page.getByText(/Choose 1 more favourites/)).toBeVisible();
  expect(writes).toEqual([]);
});

test("quiz modal returns focus after close and supports immediate reopening", async ({ page }) => {
  await worldFixtures(page);
  await page.goto(base);
  const trigger = page.getByRole("button", { name: "Make your Passport", exact: true }).first();
  await trigger.click();
  await expect(page.locator("dialog[open] #quiz-title")).toBeFocused();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await expect(page.locator("dialog[open] #quiz-title")).toHaveText("Where do you wake up?");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(page.locator("dialog[open] #quiz-title")).toBeFocused();
  await expect(page.locator("dialog[open] #quiz-title")).toHaveText("Your ideal day abroad");
  await page.getByRole("button", { name: "Close quiz", exact: true }).click();
  await expect(trigger).toBeFocused();
});

test("remade quiz still builds and saves a guest Passport with its chosen answers", async ({ page }) => {
  await worldFixtures(page);
  await page.route("**/api/discovery", async route => {
    const request = route.request().postDataJSON();
    if (request.action === "quiz") return route.fulfill({ json: { choices: favourites } });
    return route.fulfill({ json: { choices: [], results: [], places: [] } });
  });
  await page.goto(base + "/passport");
  await page.getByRole("button", { name: "Redo the quiz", exact: true }).click();
  await page.getByRole("slider").fill("4");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  for (let i = 0; i < 18 && await page.getByRole("button", { name: "Skip", exact: true }).count(); i++) await page.getByRole("button", { name: "Skip", exact: true }).click();
  const picks = page.locator(".quiz-grid .quiz-tile");
  for (let i = 0; i < 3; i++) await picks.nth(i).click();
  await page.getByRole("button", { name: "Build my Passport", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your Taste Passport", exact: true })).toBeFocused();
  const stored = await page.evaluate(() => ({ answers: JSON.parse(localStorage.getItem("beesyde-quiz-v1")!), choices: JSON.parse(localStorage.getItem("tpd-passport-v2")!) }));
  expect(stored.answers.planning).toBe(4);
  expect(stored.choices).toHaveLength(3);
  await expect(page.locator(".pp")).toBeVisible();
});

test("a failed finish after the final swipe can retry the same choices", async ({ page }) => {
  await worldFixtures(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const requests: unknown[] = [];
  await page.route("**/api/discovery", async route => {
    const body = route.request().postDataJSON();
    if (body.action === "quiz") {
      requests.push(body.cards);
      return requests.length === 1 ? route.fulfill({ status: 503, json: { error: "provider_unavailable" } }) : route.fulfill({ json: { choices: favourites } });
    }
    return route.fulfill({ json: { choices: [], places: [], results: [] } });
  });
  await page.goto(base + "/passport");
  await page.getByRole("button", { name: "Redo the quiz", exact: true }).click();
  for (const question of QUESTIONS) {
    if (question.kind === "swipe") {
      for (const card of question.cards) await page.getByRole("button", { name: "Yes →", exact: true }).click();
    } else await page.getByRole("button", { name: "Skip", exact: true }).click();
  }
  await expect(page.locator(".quiz-deck-complete button")).toBeEnabled();
  await page.locator(".quiz-deck-complete button").click();
  await expect(page.getByRole("heading", { name: "Your Taste Passport", exact: true })).toBeFocused();
  expect(requests).toHaveLength(2);
  expect(requests[1]).toEqual(requests[0]);
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
