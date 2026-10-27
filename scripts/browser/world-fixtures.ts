import type { Page } from "@playwright/test";
export const fixtureId = "00000000-0000-4000-8000-000000000001";
export const place = {
  id: fixtureId, name: "A small fixture place for an afternoon in Lisbon", type: "place", city: "Lisbon", country: "PT",
  address: "Fixture street, Lisbon", context: null, lat: null, lon: null, price: 2, popularity: null,
  image: "https://images.qloo.com/fixture.jpg", closed: false, tags: [], evidence: [],
};
export const favourites = [1, 2, 3].map(n => ({ entity: { ...place, id: `00000000-0000-4000-8000-00000000000${n + 3}`, name: `Fixture favourite ${n}`, type: "artist", image: null }, token: `fixture-${n}` }));
export async function worldFixtures(page: Page, saved = true) {
  const writes: string[] = [];
  await page.addInitScript(({ favourites, fixtureId, saved }) => {
    localStorage.setItem("tpd-passport-v2", JSON.stringify(favourites));
    localStorage.setItem("beesyde-quiz-v1", JSON.stringify({ planning: 2 }));
    if (saved) localStorage.setItem("beesyde-lists-v1", JSON.stringify([{ id: "fixture-trip", name: "Lisbon trip", local: true, items: [{ placeId: fixtureId, name: "A saved fixture with a deliberately long name for narrow phones", address: "Lisbon", lat: null, lon: null, note: "A private fixture note", token: "fixture", savedAt: "2026-10-25T00:00:00Z" }] }]));
  }, { favourites, fixtureId, saved });
  await page.route(/https:\/\/(?:images\.qloo\.com|(?:upload|thumb)\.wikimedia\.org)\//, route => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="#6b4a73"/></svg>' }));
  await page.route("**/api/**", async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (path === "/api/travel-state") return route.fulfill({json:{state:{version:1,trips:{},visits:[]},revision:0}});
    if (path.startsWith("/api/auth/")) return route.fulfill({ json: null });
    if (path === "/api/discovery") {
      const body = request.postDataJSON();
      if (body.action === "guest") return route.fulfill({ json: { choices: favourites } });
      if (body.action === "neighbourhoods") return route.fulfill({ json: { places: [] } });
      if (body.action === "search") return route.fulfill({ json: { choices: [] } });
      return route.fulfill({ json: { results: [{ place, token: "fixture" }], places: [], checkedAt: "2026-10-25T00:00:00Z", traitsUsed: false, notice: "Fixture" } });
    }
    if (request.method() !== "GET") writes.push(path);
    return route.fulfill({ json: { passport: [], answers: null, stamps: [], collections: [], lists: [], hidden: [], votes: [], dismissed: [], feedback: { votes: [], dismissed: [] } } });
  });
  return writes;
}
export const sharedCode = Buffer.from(JSON.stringify({ version: 1, name: "Lisbon fixture trip", places: [{ id: fixtureId, name: "A shared fixture place with a long name", city: "Lisbon" }] })).toString("base64url");
