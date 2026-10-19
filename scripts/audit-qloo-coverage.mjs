import { loadEnvFile } from "node:process";
import { mkdir, writeFile, readFile } from "node:fs/promises";
try {
  loadEnvFile(".env.local");
} catch {}
const base = process.env.QLOO_API_URL || "https://hackathon.api.qloo.com";
if (
  base.replace(/\/$/, "") !== "https://hackathon.api.qloo.com" ||
  !process.env.QLOO_API_KEY
)
  throw Error("Configure approved host and key");
await mkdir(".private/qloo", { recursive: true, mode: 0o700 });
const summary = [];
const ref = JSON.parse(
  await readFile(".private/qloo/search-restaurant.json", "utf8"),
).results.find((x) => x.name.toLowerCase() === "le baratin");
const tags = ref.tags.filter((x) => /ambience|cuisine/.test(x.type));
for (const city of ["Paris", "Tokyo", "New York"])
  for (const category of ["restaurant", "museum"]) {
    const params = {
      "filter.type": "urn:entity:place",
      "filter.location.query": city,
      "filter.location.radius": "0",
      "filter.tags": "urn:tag:genre:place:" + category,
      take: "10",
    };
    await request(`${city}-${category}`, params, city, category);
  }
if (tags[0])
  for (const mode of ["keep", "change"]) {
    const params = {
      "filter.type": "urn:entity:place",
      "filter.location.query": "Paris",
      "filter.location.radius": "0",
      "filter.tags": "urn:tag:genre:place:restaurant",
      "signal.interests.entities": ref.entity_id,
      "filter.exclude.entities": ref.entity_id,
      "feature.explainability": "true",
      take: "10",
      [mode === "keep" ? "signal.interests.tags" : "filter.exclude.tags"]:
        tags[0].tag_id,
    };
    await request(
      "Paris-" + mode,
      params,
      "Paris",
      "restaurant",
      mode === "change" ? tags[0].tag_id : undefined,
    );
  }
async function request(name, params, city, category, excluded) {
  const url = new URL("/v2/insights", base);
  url.search = new URLSearchParams(params).toString();
  const res = await fetch(url, {
    headers: { "X-Api-Key": process.env.QLOO_API_KEY },
    redirect: "error",
    signal: AbortSignal.timeout(25000),
  });
  const data = await res.json();
  await writeFile(
    ".private/qloo/audit-" + name + ".json",
    JSON.stringify(data),
    { mode: 0o600 },
  );
  const rows = data.results?.entities || [];
  const categoryId = "urn:tag:genre:place:" + category;
  const summaryRow = {
    name,
    status: res.status,
    count: rows.length,
    categoryPass: rows.every((e) =>
      e.tags?.some((t) => (t.id || t.tag_id) === categoryId),
    ),
    cityPass: rows.every((e) => e.properties?.geocode?.city === city),
    hasCoordinates: rows.every(
      (e) =>
        Number.isFinite(e.location?.lat) && Number.isFinite(e.location?.lon),
    ),
    hasAddress: rows.every((e) => !!e.properties?.address),
    exclusionPass: excluded
      ? rows.every((e) => !e.tags?.some((t) => (t.id || t.tag_id) === excluded))
      : null,
    localityResolved: !!data.query?.localities?.filter?.length,
  };
  summary.push(summaryRow);
  console.log(JSON.stringify(summaryRow));
  if ([401, 403, 429].includes(res.status)) throw Error("Stop: " + res.status);
}
await writeFile(
  ".private/qloo/coverage-audit-summary.json",
  JSON.stringify(
    { checkedAt: new Date().toISOString(), checks: summary },
    null,
    2,
  ),
  { mode: 0o600 },
);
