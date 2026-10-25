import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { twinFixtures, chooseReference } from "./twin-fixtures";
test.use({ video: "on" });
const baseline = process.env.TWIN_AB_BASE_URL;
test.skip(!baseline, "A/B is opt-in: start the immutable baseline and set TWIN_AB_BASE_URL.");
for (const width of [390, 1440]) test(`A/B identical six-trait search at ${width}`, async ({ browser }, testInfo) => {
 const metrics: Record<string, unknown>[] = [];
 for (const [variant, base] of [["A", baseline!], ["B", "http://127.0.0.1:3000"]]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce", recordVideo: { dir: ".private/twin-ab/videos", size: { width, height: 900 } } });
  const page = await context.newPage();
  await twinFixtures(page); await chooseReference(page, base);
  const editor = variant === "A" ? page.locator(".grid").filter({ has: page.getByRole("button", { name: "Find its twin", exact: true }) }) : page.locator(".twin-editor");
  const editorBox = await editor.boundingBox();
  await page.screenshot({ path: `.private/twin-ab/${variant}-${width}-editor.png`, fullPage: true });
  const submit = page.getByRole("button", { name: "Find its twin", exact: true });
  await submit.click();
  await expect(page.getByRole("heading", { name: "Twin match 1", exact: true })).toBeVisible();
  const name = await page.getByRole("heading", { name: "Twin match 1", exact: true }).boundingBox();
  const card = variant === "A" ? page.locator(".swap-results-list .place-card").first() : page.locator(".twin-spotlight .place-card");
  const actions = await card.locator(".place-actions").boundingBox();
  const why = await card.locator(".place-why").first().boundingBox();
  metrics.push({ variant, width, editorHeight: editorBox!.height, resultNameTop: name!.y, immediateName: name!.y >= 0 && name!.y + name!.height <= 900,
    immediateWhy: why!.y >= 0 && why!.y + why!.height <= 900, immediateActions: actions!.y >= 0 && actions!.y + actions!.height <= 840,
    otherMatchArrow: await page.getByRole("button", { name: /See other matches/ }).count(), overflow: await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) });
  await page.screenshot({ path: `.private/twin-ab/${variant}-${width}-result.png`, fullPage: true });
  await context.close();
 }
 await mkdir(".private/twin-ab", { recursive: true });
 await writeFile(`.private/twin-ab/metrics-${width}.json`, JSON.stringify(metrics, null, 2));
 await testInfo.attach(`A-B-${width}`, { body: JSON.stringify(metrics, null, 2), contentType: "application/json" });
 const a = metrics[0] as { editorHeight: number }, b = metrics[1] as { editorHeight: number; immediateName: boolean; immediateWhy: boolean; immediateActions: boolean; overflow: number };
 if (width === 390) expect(b.editorHeight / a.editorHeight).toBeLessThanOrEqual(.65);
 expect(b.immediateName).toBe(true); expect(b.immediateWhy).toBe(true); expect(b.immediateActions).toBe(true); expect(b.overflow).toBe(0);
});
