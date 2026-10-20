// Personal relevance per destination × category: two opposite Passports
// against the no-signal baseline from audit-qloo-destinations.mjs (run that first).
// Raw responses stay in .private/qloo (git-ignored).
import { loadEnvFile } from "node:process";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { buildProfile, qlooParams } from "../src/lib/quiz.ts";
import { offCategory } from "../src/lib/discovery.ts";
try {
  loadEnvFile(".env.local");
} catch {}
const base = process.env.QLOO_API_URL || "https://hackathon.api.qloo.com";
if (
  base.replace(/\/$/, "") !== "https://hackathon.api.qloo.com" ||
  !process.env.QLOO_API_KEY
)
  throw Error("Configure approved host and key");
await mkdir(".private/qloo/destinations-passport", { recursive: true, mode: 0o700 });

const PASSPORTS = {
  A: [["Khruangbin", "artist"], ["Nina Simone", "artist"], ["Before Sunrise", "movie"]],
  B: [["Daft Punk", "artist"], ["Bad Bunny", "artist"], ["Mad Max: Fury Road", "movie"]],
};
// Each Passport also carries quiz answers, so the grid measures what the app sends (C7).
// A: calm, adventurous, thrifty. B: lively, familiar, treat-seeker.
const QUIZ = {
  A: { crowds: 5, company: 1, "food-adventure": 5, openness: ["ask-local", "get-lost"], budget: 1 },
  B: { crowds: 1, company: 5, "food-adventure": 1, budget: 5 },
};
const MODE = process.argv.includes("--traits") ? "traits" : "plain";
const CITIES = [
  "Paris", "Lisbon", "Porto", "Barcelona", "Madrid", "New York",
  "Tokyo", "Osaka", "Ho Chi Minh City", "Hanoi", "Phu Quoc",
];
const TAGS = {
  restaurant: "urn:tag:genre:place:restaurant",
  bar: "urn:tag:category:place:bar",
  museum: "urn:tag:genre:place:museum",
  hotel: "urn:tag:genre:place:hotel",
};

async function qloo(path, params) {
  const url = new URL(path, base);
  url.search = new URLSearchParams(params).toString();
  const res = await fetch(url, {
    headers: { "X-Api-Key": process.env.QLOO_API_KEY },
    redirect: "error",
    signal: AbortSignal.timeout(25000),
  });
  if ([401, 403, 429].includes(res.status)) throw Error("Stop: " + res.status);
  await new Promise((r) => setTimeout(r, 300));
  return res.json();
}

// Exact name match only, as in the app's guest Passport.
const ids = {};
for (const [key, list] of Object.entries(PASSPORTS)) {
  ids[key] = [];
  for (const [name, type] of list) {
    const data = await qloo("/search", { query: name, types: "urn:entity:" + type });
    const hit = (data.results ?? []).find((e) => e.name?.toLowerCase() === name.toLowerCase());
    if (!hit) throw Error(`Passport ${key}: "${name}" not found`);
    ids[key].push(hit.entity_id);
  }
}

const top = (rows, n) => rows.slice(0, n).map((e) => e.entity_id);
const pct = (a, b) => (a.length ? Math.round((100 * a.filter((x) => b.includes(x)).length) / a.length) : null);
const summary = [];
for (const city of CITIES)
  for (const [category, tag] of Object.entries(TAGS)) {
    const slug = `${city}-${category}`.toLowerCase().replace(/\W+/g, "-");
    const baseline = JSON.parse(await readFile(`.private/qloo/destinations/${slug}.json`, "utf8"))
      .results?.entities ?? [];
    const runs = {};
    for (const key of Object.keys(PASSPORTS)) {
      const data = await qloo("/v2/insights", {
        "filter.type": "urn:entity:place",
        "filter.tags": tag,
        "filter.location.query": city,
        "filter.location.radius": "0",
        "signal.interests.entities": ids[key].join(","),
        take: "20",
        ...(MODE === "traits" ? qlooParams(buildProfile(QUIZ[key]), category) : {}),
      });
      await writeFile(
        `.private/qloo/destinations-passport/${slug}-${key}${MODE === "traits" ? "-traits" : ""}.json`,
        JSON.stringify(data),
        { mode: 0o600 },
      );
      // Same cleaning rule as the app (restaurants and bars both use "restaurant" rules).
      runs[key] = (data.results?.entities ?? [])
        .filter((e) => category === "museum" || category === "hotel" ||
          !offCategory({ tags: (e.tags ?? []).map((t) => ({ id: t.id || t.tag_id })) }, "restaurant"))
        .slice(0, 10);
    }
    const row = {
      city,
      category,
      countA: runs.A.length,
      countB: runs.B.length,
      // Share of the Passport's top 10 that was not in the no-signal top 10.
      newVsBaselineA: runs.A.length ? 100 - pct(top(runs.A, 10), top(baseline, 10)) : null,
      newVsBaselineB: runs.B.length ? 100 - pct(top(runs.B, 10), top(baseline, 10)) : null,
      // Share of A's top 10 that B also returns: low = Passports really differ.
      overlapAB: pct(top(runs.A, 10), top(runs.B, 10)),
      sampleA: runs.A.slice(0, 3).map((e) => e.name),
      sampleB: runs.B.slice(0, 3).map((e) => e.name),
    };
    summary.push(row);
    console.log(JSON.stringify(row));
  }
await writeFile(
  `.private/qloo/destinations-passport-${MODE}-summary.json`,
  JSON.stringify({ checkedAt: new Date().toISOString(), mode: MODE, passports: PASSPORTS, quiz: QUIZ, checks: summary }, null, 2),
  { mode: 0o600 },
);
