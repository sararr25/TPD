import { test, expect } from "@playwright/test";
import { twinFixtures, chooseReference } from "./twin-fixtures";
const base = process.env.MOTION_BASE_URL || "http://127.0.0.1:3000";
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
  await expect(page.locator('.twin-trait-row[data-choice="keep"] .twin-trait-label')).toHaveText('Quiet');
  await expect(page.locator('.twin-trait-row[data-choice="change"] .twin-trait-label')).toHaveText('Casual');
  expect(await page.locator('.twin-trait-row[data-choice="change"] .twin-trait-label').evaluate(el => getComputedStyle(el).textDecorationLine)).toContain('line-through');
  const referenceBox = await page.locator('.twin-reference').boundingBox();
  const filtersBox = await page.locator('.twin-traits').boundingBox();
  if (size.width > 900) expect(filtersBox!.x).toBeGreaterThan(referenceBox!.x + referenceBox!.width);
  else expect(filtersBox!.y).toBeGreaterThanOrEqual(referenceBox!.y + referenceBox!.height);
  await expect(page.locator('.twin-budget select')).toHaveCount(0);
  await page.getByRole('button', { name: 'Price up to €€', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Price up to €€', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Any price', exact: true }).click();
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

for (const edit of ['trait', 'price']) test(`editing ${edit} during the first pending search requires an explicit update`, async ({ page }) => {
 const requests = await twinFixtures(page, { delay: 2500 });
 await chooseReference(page, base);
 await page.getByRole('button', { name: 'Find its twin', exact: true }).click();
 await expect(page.locator('.twin-outcome')).toHaveAttribute('aria-busy', 'true');
 await page.getByRole('button', { name: 'Edit search', exact: true }).click();
 if (edit === 'trait') await page.getByRole('button', { name: 'Delete: Quiet', exact: true }).click();
 else await page.getByRole('button', { name: 'Price up to €€', exact: true }).click();
 await expect(page.locator('.twin-results')).toBeVisible();
 await expect(page.getByText('Choices changed. Update results to apply them.', { exact: true })).toBeVisible();
 await expect(page.getByRole('button', { name: 'Update results', exact: true })).toBeEnabled();
 expect(requests.filter(r => r.action === 'swap')).toHaveLength(1);
 await page.getByRole('button', { name: 'Update results', exact: true }).click();
 await expect(page.locator('.twin-spotlight')).toBeVisible();
 const updated = requests.filter(r => r.action === 'swap');
 expect(updated).toHaveLength(2);
 if (edit === 'trait') expect(updated[1].choices).toContainEqual({ tagId: 'urn:tag:fixture:trait:0', mode: 'change' });
 else expect(updated[1].maxPrice).toBe(2);
});

for (const pending of [false, true]) test(`Passport changes invalidate ${pending ? 'pending' : 'completed'} Twin results without automatic requests`, async ({ page }) => {
 const requests = await twinFixtures(page, { delay: pending ? 2500 : 0 });
 await chooseReference(page, base);
 await page.getByRole('button', { name: 'Find its twin', exact: true }).click();
 if (pending) await expect.poll(() => requests.filter(r => r.action === 'swap').length).toBe(1);
 else await expect(page.locator('.twin-spotlight')).toBeVisible();
 await page.evaluate(() => {
  const choices = JSON.parse(localStorage.getItem('tpd-passport-v2')!);
  choices[0].token = 'updated-profile-token';
  localStorage.setItem('tpd-passport-v2', JSON.stringify(choices));
  localStorage.setItem('beesyde-quiz-v1', JSON.stringify({ planning: 1 }));
  window.dispatchEvent(new Event('storage'));
 });
 await expect(page.getByRole('button', { name: 'Update results', exact: true })).toBeEnabled();
 await expect(page.locator('.twin-spotlight')).not.toBeVisible();
 expect(requests.filter(r => r.action === 'swap')).toHaveLength(1);
 await page.getByRole('button', { name: 'Update results', exact: true }).click();
 await expect(page.locator('.twin-spotlight')).toBeVisible();
 const updated = requests.filter(r => r.action === 'swap');
 expect(updated).toHaveLength(2);
 expect(updated[1].passport).toContain('updated-profile-token');
 expect(updated[1].quiz).toEqual({ planning: 1 });
});

test('an expired Passport requires recovery before updating Twin results', async ({ page }) => {
 const requests = await twinFixtures(page, { delay: 0 });
 await chooseReference(page, base);
 await page.getByRole('button', { name: 'Find its twin', exact: true }).click();
 await expect(page.locator('.twin-spotlight')).toBeVisible();
 await page.evaluate(() => {
  const choices = JSON.parse(localStorage.getItem('tpd-passport-v2')!);
  choices[0].token = btoa(JSON.stringify({ expires: 1 })) + '.fixture';
  localStorage.setItem('tpd-passport-v2', JSON.stringify(choices));
  window.dispatchEvent(new Event('storage'));
 });
 await expect(page.getByRole('button', { name: 'Update results', exact: true })).toBeDisabled();
 await expect(page.locator('.twin-spotlight')).not.toBeVisible();
 await expect(page.getByRole('link', { name: 'Refresh favourites', exact: true }).first()).toBeVisible();
 expect(requests.filter(r => r.action === 'swap')).toHaveLength(1);
});
