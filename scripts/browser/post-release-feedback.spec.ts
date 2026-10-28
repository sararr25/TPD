import { test, expect } from "@playwright/test";
import { worldFixtures } from "./world-fixtures";
import { twinFixtures } from "./twin-fixtures";
const base = process.env.MOTION_BASE_URL || "http://127.0.0.1:3220";

for (const viewport of [{ width: 375, height: 812 }, { width: 812, height: 375 }, { width: 1440, height: 900 }]) {
  test(`one favourites invitation and working editor at ${viewport.width}`, async ({ page }) => {
    await worldFixtures(page, false);
    await page.addInitScript(() => localStorage.setItem("tpd-passport-v2", "[]"));
    await page.setViewportSize(viewport);
    await page.goto(base + "/passport");
    const invitation = page.getByRole("button", { name: "Add what you love", exact: true });
    await expect(invitation).toHaveCount(1);
    await expect(page.locator(".pf-tools")).toContainText("Add 3 more");
    await expect(page.getByText(/Complete your favourites|Your profile is here/)).toHaveCount(0);
    await expect(page.locator(".pf-left-foot")).not.toContainText(/favourites/);
    await invitation.scrollIntoViewIfNeeded();
    const box = await invitation.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    await invitation.click();
    await expect(page.getByRole("dialog", { name: "Add what you love" })).toBeVisible();
    await expect(page.locator(".passport-editor h1")).toBeFocused();
    await page.getByRole("button", { name: "Close editor", exact: true }).click();
    await expect(invitation).toBeFocused();
    await page.goto(base + "/lisbon?tab=swap");
    await expect(page.locator(".twin-workspace:visible")).toBeVisible();
    await expect(page.getByText(/Complete your favourites|Your profile is here/)).toHaveCount(0);
    const filters = await page.getByRole("group", { name: "Category", exact: true }).boundingBox();
    const steps = await page.locator(".twin-steps:visible").boundingBox();
    expect(steps!.y - filters!.y - filters!.height).toBeGreaterThanOrEqual(24);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });

  test(`larger Place route precedes the title, reduced motion and enlarged text at ${viewport.width}`, async ({ page }) => {
    test.skip(!!process.env.PASSPORT_PRODUCTION, "Uses the development-only Place fixture.");
    await worldFixtures(page, false);
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(base + "/preview/checks?photo=known&details=1");
    const route = page.locator(".place-journey-route:visible");
    await expect(route).toBeVisible();
    const art = await route.boundingBox(), title = await page.locator(".place-main h1:visible").boundingBox();
    expect(art!.y + art!.height).toBeLessThan(title!.y);
    expect(art!.width).toBeGreaterThan(viewport.width === 375 ? 260 : 320);
    await expect(route).toHaveCSS("stroke-width", "2.4px");
    await expect(route.locator("[data-travel-route]").first()).toHaveCSS("stroke-dashoffset", "0px");
    await page.addStyleTag({ content: "html{font-size:200%}" });
    await expect(page.getByRole("link", { name: "Find its twin", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}

test("incomplete Passport does not repeat favourites calls on City or Home", async ({ page }) => {
  await twinFixtures(page);
  await page.addInitScript(() => {
    const choices = JSON.parse(localStorage.getItem("tpd-passport-v2") || "[]");
    localStorage.setItem("tpd-passport-v2", JSON.stringify(choices.slice(0, 2)));
  });
  for (const path of ["/", "/lisbon"]) {
    await page.goto(base + path);
    await expect(page.getByText(/Complete your favourites|Your profile is here/)).toHaveCount(0);
  }
});
