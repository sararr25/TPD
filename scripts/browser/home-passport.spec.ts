import { test, expect, type Page } from "@playwright/test";

const base = process.env.MOTION_BASE_URL || "http://127.0.0.1:3000";
async function fixtures(page: Page, options: { brokenPhotos?: boolean; unavailable?: boolean; longNames?: boolean; empty?: boolean } = {}) {
  const writes: string[] = [];
  await page.route(/https:\/\/(?:images\.qloo\.com|(?:upload|thumb)\.wikimedia\.org)\//, (route) => options.brokenPhotos ? route.abort() : route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="#6b4a73"/></svg>',
  }));
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/api/auth/")) return route.fulfill({ json: null });
    if (path === "/api/discovery") {
      const body = request.postDataJSON();
      if (options.unavailable) return route.fulfill({ status: 503, json: { error: "provider_unavailable" } });
      if (body.action === "guest") return route.fulfill({ json: { choices: [1, 2, 3].map((n) => ({
        entity: { id: `favourite-${n}`, name: `Fixture favourite ${n}` }, token: `fixture-${n}`,
      })) } });
      if (options.empty) return route.fulfill({ json: { results: [] } });
      const category = body.category || "place";
      return route.fulfill({ json: { results: [{ place: {
        id: `fixture-${category}`, name: options.longNames ? "A very long example place name ".repeat(7) : `Fixture ${category}`,
        image: "https://images.qloo.com/fixture-photo.jpg",
      } }] } });
    }
    if (request.method() !== "GET") writes.push(path);
    return route.fulfill({ json: { stamps: [], collections: [], lists: [], feedback: { votes: [], dismissed: [] } } });
  });
  return writes;
}

for (const width of [320, 390, 768, 1440]) {
  test(`Passport A remains usable at ${width}px with long live results`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const writes = await fixtures(page, { longNames: true });
    await page.goto(base);
    await expect(page.locator(".h-picks li:visible")).toHaveCount(3);
    await expect(page.locator(".h-picks li:visible").first()).toContainText("A very long example place name");
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    expect(await page.locator(".h-hero:visible").evaluate((el) => el.scrollWidth <= el.clientWidth + 8)).toBe(true);
    const lines = await page.locator(".h-cover h1:visible").evaluate((el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
    expect(lines).toBeLessThanOrEqual(3.1);
    await page.getByRole("button", { name: "Find its twin", exact: true }).first().click();
    await expect(page.getByRole("search", { name: "Twin" })).toBeVisible();
    await page.locator("#home-swap-q").fill("Example restaurant");
    await expect(page.getByRole("search", { name: "Twin" }).getByRole("button", { name: "Find its twin" })).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    expect(writes).toEqual([]);
  });
}

test("city form retains validation and navigation", async ({ page }) => {
  await fixtures(page);
  await page.goto(base);
  await page.getByLabel("Where are you going?").fill("Unknown city");
  await page.getByRole("button", { name: "Open the city" }).click();
  await expect(page.getByRole("search", { name: "Open a city" }).getByRole("alert")).toContainText("We don’t cover that city yet");
  await page.getByLabel("Where are you going?").fill("Lisbon");
  await page.getByRole("button", { name: "Open the city" }).click();
  await expect(page).toHaveURL(base + "/lisbon");
});

test("missing photos and provider errors keep the Passport entrances available", async ({ page }) => {
  await fixtures(page, { brokenPhotos: true, unavailable: true });
  await page.goto(base);
  await expect(page.locator(".h-visa").getByRole("alert")).toContainText("The example could not load");
  await expect(page.getByText("City photograph unavailable", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open the city" })).toBeEnabled();
  await expect(page.locator(".h-visa").getByRole("link", { name: "Explore Lisbon" })).toBeVisible();
});

test("reduced motion, keyboard entry and Home return leave no hidden content", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await fixtures(page);
  await page.goto(base);
  await expect(page.locator(".h-picks li:visible")).toHaveCount(3);
  await expect(page.locator(".h-stamp:visible")).toHaveCSS("opacity", "1");
  const city = page.getByLabel("Where are you going?");
  await city.pressSequentially("Lisbon");
  await expect(city).toHaveValue("Lisbon");
  await city.press("Escape");
  await city.press("Tab");
  await expect(page.getByRole("button", { name: "Open the city" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(base + "/lisbon");
  await page.goBack();
  await expect(page.locator(".h-cover h1:visible")).toBeVisible();
  await expect(page.locator(".h-stamp:visible")).toBeVisible();
  expect(errors).toEqual([]);
});

for (const width of [390, 1440]) test(`empty Home example stays readable at ${width}`, async ({ page }) => {
 await fixtures(page, { empty: true });
 await page.setViewportSize({ width, height: 900 });
 await page.goto(base);
 const message = page.getByText('No picks for this example today.', { exact: true });
 await expect(message).toBeVisible();
 await page.evaluate(() => document.fonts.ready);
 const lines = await message.evaluate(el => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
 expect(lines).toBeLessThanOrEqual(2.1);
 await expect(page.locator('.h-picks').getByRole('link', { name: 'Explore Lisbon' })).toBeVisible();
});
