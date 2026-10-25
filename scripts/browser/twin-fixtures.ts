import type { Page } from "@playwright/test";
import { worldFixtures, place } from "./world-fixtures";
const traits = ["Quiet", "Casual", "Outdoor", "Natural wine", "Small rooms", "Seafood"].map((name, n) => ({ id: `urn:tag:fixture:trait:${n}`, name, type: "urn:tag:ambience:qloo" }));
export const reference = { ...place, name: "The starting place", tags: traits, price: 2 };
export const twinResults = ["Closest match", "Nearby option", "A less-known option"].map((role, n) => ({
  place: { ...place, id: `00000000-0000-4000-8000-00000000001${n}`, name: `Twin match ${n + 1}`, tags: traits.slice(0, 3), price: n + 1 },
  token: `fixture-twin-${n}`, role, why: "A quiet place with the small-room atmosphere you like.",
  different: "A smaller room with a different menu.",
}));
export async function twinFixtures(page: Page, options: { count?: number; fail?: boolean; delay?: number } = {}) {
  await worldFixtures(page, false);
  const requests: Record<string, unknown>[] = [];
  await page.route("**/api/discovery", async route => {
    const body = route.request().postDataJSON(); requests.push(body);
    if (body.action === "search") return route.fulfill({ json: { choices: [{ entity: reference, token: "fixture-reference" }] } });
    if (body.action === "swap") {
      await new Promise(r => setTimeout(r, options.delay ?? 500));
      return route.fulfill({ status: options.fail ? 503 : 200, json: options.fail ? { error: "provider_unavailable" } : {
        results: twinResults.slice(0, options.count ?? 3), checkedAt: "2026-10-25T12:00:00Z", candidateCount: 12, discarded: 0, keepMatched: 3, anchor: null, anchorDropped: false, notice: "Fixture",
      } });
    }
    if (body.action === "neighbourhoods") return route.fulfill({ json: { places: [] } });
    return route.fulfill({ json: { choices: [], results: [], places: [], checkedAt: "2026-10-25T12:00:00Z", traitsUsed: false, notice: "Fixture" } });
  });
  return requests;
}
export async function chooseReference(page: Page, base: string, category = "restaurant") {
  await page.goto(`${base}/lisbon?tab=swap&category=${category}&q=The+starting+place`);
  await page.getByRole("button", { name: "Choose", exact: true }).click();
  await page.getByRole("button", { name: "Find its twin", exact: true }).scrollIntoViewIfNeeded();
}
