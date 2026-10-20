// Coverage of every destination × category decided in docs/17-site-skeleton.md.
// Raw responses stay in .private/qloo (git-ignored); prints one summary row per check.
import { loadEnvFile } from "node:process";
import { mkdir, writeFile } from "node:fs/promises";
try {
  loadEnvFile(".env.local");
} catch {}
const base = process.env.QLOO_API_URL || "https://hackathon.api.qloo.com";
if (
  base.replace(/\/$/, "") !== "https://hackathon.api.qloo.com" ||
  !process.env.QLOO_API_KEY
)
  throw Error("Configure approved host and key");
await mkdir(".private/qloo/destinations", { recursive: true, mode: 0o700 });

const CITIES = [
  "Paris", "Lisbon", "Porto", "Barcelona", "Madrid", "New York",
  "Tokyo", "Osaka", "Ho Chi Minh City", "Hanoi", "Phu Quoc",
];
// Qloo names the parent city in the local language in neighbourhood ancestors.
const LOCAL_NAMES = {
  Lisbon: ["lisboa"], Tokyo: ["東京", "武蔵国"], Osaka: ["大阪"], "Ho Chi Minh City": ["hồ chí minh"],
  Hanoi: ["hà nội"], "Phu Quoc": ["phú quốc"],
};
// Neighbourhoods are not a place tag: they are checked as localities.
const CATEGORIES = {
  restaurant: { "filter.type": "urn:entity:place", "filter.tags": "urn:tag:genre:place:restaurant" },
  bar: { "filter.type": "urn:entity:place", "filter.tags": "urn:tag:category:place:bar" },
  museum: { "filter.type": "urn:entity:place", "filter.tags": "urn:tag:genre:place:museum" },
  hotel: { "filter.type": "urn:entity:place", "filter.tags": "urn:tag:genre:place:hotel" },
  neighbourhood: { "filter.type": "urn:entity:locality" },
};

const summary = [];
for (const city of CITIES)
  for (const [category, filters] of Object.entries(CATEGORIES)) {
    const url = new URL("/v2/insights", base);
    url.search = new URLSearchParams({
      ...filters,
      "filter.location.query": city,
      "filter.location.radius": "0",
      take: "20",
    }).toString();
    const res = await fetch(url, {
      headers: { "X-Api-Key": process.env.QLOO_API_KEY },
      redirect: "error",
      signal: AbortSignal.timeout(25000),
    });
    const data = await res.json().catch(() => ({}));
    const slug = `${city}-${category}`.toLowerCase().replace(/\W+/g, "-");
    await writeFile(`.private/qloo/destinations/${slug}.json`, JSON.stringify(data), { mode: 0o600 });
    const rows = data.results?.entities || [];
    const share = (f) => (rows.length ? Math.round((100 * rows.filter(f).length) / rows.length) : 0);
    const tag = filters["filter.tags"];
    // A neighbourhood counts only if it sits inside the city (not the city, region or province itself).
    const names = [city.toLowerCase().split(" ")[0], ...(LOCAL_NAMES[city] ?? [])];
    const inside = (e) =>
      e.name?.toLowerCase() !== city.toLowerCase() &&
      e.properties?.ancestors?.some((a) => names.some((n) => a.name?.toLowerCase().includes(n)));
    const row = {
      city,
      category,
      status: res.status,
      count: rows.length,
      localityResolved: !!data.query?.localities?.filter?.length,
      categoryPct: tag ? share((e) => e.tags?.some((t) => (t.id || t.tag_id) === tag)) : null,
      neighbourhoods: category === "neighbourhood" ? rows.filter(inside).length : null,
      addressPct: share((e) => !!e.properties?.address),
      cities: [...new Set(rows.map((e) => e.properties?.geocode?.city).filter(Boolean))].slice(0, 3),
      sample: (category === "neighbourhood" ? rows.filter(inside) : rows).slice(0, 3).map((e) => e.name),
    };
    summary.push(row);
    console.log(JSON.stringify(row));
    if ([401, 403, 429].includes(res.status)) throw Error("Stop: " + res.status);
    await new Promise((r) => setTimeout(r, 300));
  }
await writeFile(
  ".private/qloo/destinations-summary.json",
  JSON.stringify({ checkedAt: new Date().toISOString(), checks: summary }, null, 2),
  { mode: 0o600 },
);
