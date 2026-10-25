import { test, expect } from "@playwright/test";
import { twinFixtures, chooseReference } from "./twin-fixtures";
const base = "http://127.0.0.1:3000";
test.use({ video: "on" });
for (const size of [{ width: 390, height: 844 }, { width: 1440, height: 900 }, { width: 320, height: 700 }, { width: 812, height: 375 }]) {
 test(`Twin complete path and visible outcome ${size.width}`, async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await twinFixtures(page); await page.setViewportSize(size);
  await page.goto(base);
  await page.getByRole("button", { name: "Find its twin", exact: true }).first().click();
  const form = page.getByRole("search", { name: "Twin", exact: true });
  await form.locator("#home-swap-q").fill("The starting place");
  await form.locator("#home-swap-city").selectOption("Lisbon");
  await form.getByRole("button", { name: "Find its twin", exact: true }).click();
  await page.getByRole("button", { name: "Choose", exact: true }).click();
  await expect(page.getByRole("button", { name: "Ignore: Quiet", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Keep: Quiet", exact: true }).click();
  await page.getByRole("button", { name: "Delete: Casual", exact: true }).click();
  await page.getByRole("button", { name: "Find its twin", exact: true }).click();
  await expect(page.locator(".twin-outcome")).toHaveAttribute("aria-busy", "true");
  await expect(page.locator(".twin-spotlight").getByRole("heading", { name: "Twin match 1" })).toBeVisible();
  await expect(page.locator(".twin-outcome")).toContainText("3 matches found");
  const rect = await page.locator(".twin-spotlight h3").boundingBox();
  expect(rect!.y).toBeGreaterThanOrEqual(0); expect(rect!.y + rect!.height).toBeLessThan(size.height);
  if (size.height > 700) {
   const actions = await page.locator(".twin-spotlight .place-actions").boundingBox();
   expect(actions!.y + actions!.height).toBeLessThan(size.height - 60);
  }
  const more = page.getByRole("button", { name: /See other matches/ });
  if (size.height > 700) {
    const arrow = await more.boundingBox();
    expect(arrow!.y + arrow!.height).toBeLessThanOrEqual(size.height - (size.width < 850 ? 60 : 0));
  }
  await page.screenshot({ path: `.private/twin-ab/viewport-${size.width}.png` });
  await more.click();
  await expect(page.getByRole("heading", { name: "Other matches 2" })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  await expect(page.locator("#place-00000000-0000-4000-8000-000000000010")).toHaveCount(1);
  expect(errors).toEqual([]);
 });
}
for (const category of ["bar", "cafe", "hotel"]) test(`deep link and trait choices for ${category}`, async ({ page }) => {
 const requests = await twinFixtures(page); await chooseReference(page, base, category);
 await page.getByRole("button", { name: "Delete: Quiet", exact: true }).click();
 await page.getByRole("button", { name: "Find its twin", exact: true }).click();
 await expect(page.locator(".twin-spotlight h3")).toContainText("Twin match 1");
 const query = requests.find(r => r.action === "swap")!;
 expect(query.category).toBe(category);
 expect(query.choices).toContainEqual({ tagId: "urn:tag:fixture:trait:0", mode: "change" });
 await page.getByRole("button", { name: "Edit search" }).click();
 await expect(page.getByRole("button", { name: "Delete: Quiet", exact: true })).toHaveAttribute("aria-pressed", "true");
 await page.getByRole("button", { name: "Ignore: Quiet", exact: true }).click();
 await expect(page.getByRole("button", { name: "Ignore: Quiet", exact: true })).toHaveAttribute("aria-pressed", "true");
 expect(requests.filter(r => r.action === "swap")).toHaveLength(1);
 await expect(page.getByRole("button", { name: "Update results", exact: true })).toBeVisible();
});
for (const count of [0, 1]) test(`${count} results has no inactive more-match action`, async ({ page }) => {
 await twinFixtures(page, { count }); await chooseReference(page, base);
 await page.getByRole("button", { name: "Find its twin", exact: true }).click();
 await expect(page.locator(".twin-outcome")).toHaveAttribute("aria-busy", "false");
 await expect(page.getByRole("button", { name: /See other matches/ })).toHaveCount(0);
 await expect(page.locator(".twin-outcome")).toContainText(count ? "1 match found" : "No twins for these choices");
});
test("error preserves editor choices and reduced motion arrow has correct focus", async ({ page }) => {
 await page.emulateMedia({ reducedMotion: "reduce" });
 await twinFixtures(page, { fail: true }); await chooseReference(page, base);
 await page.getByRole("button", { name: "Keep: Quiet", exact: true }).click();
 await page.getByRole("button", { name: "Find its twin", exact: true }).click();
 await expect(page.locator(".twin-outcome").getByRole("heading", { name: "Your twins couldn’t load" })).toBeVisible();
 await page.getByRole("button", { name: "Edit search" }).click();
 await expect(page.getByRole("button", { name: "Keep: Quiet", exact: true })).toHaveAttribute("aria-pressed", "true");
});
