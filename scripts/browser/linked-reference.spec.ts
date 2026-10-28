import { test, expect } from "@playwright/test";
import { twinFixtures, reference } from "./twin-fixtures";
const base = process.env.MOTION_BASE_URL || "http://127.0.0.1:3000";

test("linked suggested place carries its ID into Twin and opens preferences", async ({ page }) => {
  const requests = await twinFixtures(page);
  await page.goto(`${base}/lisbon?tab=swap&category=restaurant&q=${encodeURIComponent(reference.name)}&ref=${reference.id.toUpperCase()}`);
  await expect(page.locator(".twin-reference-recap strong")).toHaveText(reference.name);
  expect(requests.find(r => r.action === "search")).toMatchObject({ referenceId: reference.id.toUpperCase(), city: "Lisbon", category: "restaurant" });
  await expect(page.getByRole("button", { name: "Choose", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Find its twin", exact: true }).click();
  await expect(page.locator(".twin-spotlight h3")).toHaveText("Twin match 1");
});

test("a different place with the same name never replaces a linked starting place", async ({ page }) => {
  await twinFixtures(page);
  await page.goto(`${base}/lisbon?tab=swap&category=restaurant&q=${encodeURIComponent(reference.name)}&ref=00000000-0000-4000-8000-000000000999`);
  await expect(page.getByRole("button", { name: "Choose", exact: true })).toBeVisible();
  await expect(page.locator(".twin-reference-recap")).toHaveCount(0);
});
