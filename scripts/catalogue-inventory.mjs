// Read-only, bounded provider-cache inventory. Never reads account tables.
import { neon } from "@neondatabase/serverless";
import { entities } from "../src/lib/server/qloo.ts";
import { explorePlace } from "../src/lib/discovery.ts";
import { mkdir, writeFile } from "node:fs/promises";
const sql = neon(process.env.DATABASE_URL);
const rows = await sql.query(
  "SELECT data, checked_at, expires_at FROM provider_cache ORDER BY checked_at DESC LIMIT 300",
);
const unique = new Map();
let occurrences = 0;
const categories = ["restaurant", "bar", "museum", "hotel"];
for (const row of rows)
  for (const e of entities(row.data)) {
    const eligible = categories.filter((c) => explorePlace(e, "Lisbon", c));
    if (!eligible.length) continue;
    occurrences++;
    if (!unique.has(e.id))
      unique.set(e.id, {
        ...e,
        evidence: [],
        categories: eligible,
        checkedAt: row.checked_at,
        cacheExpiresAt: row.expires_at,
        editorialStatus: "pending",
        photoStatus: e.image ? "unreviewed" : "missing",
      });
  }
const items = [...unique.values()];
const report = {
  readAt: new Date().toISOString(),
  cacheRowsInspected: rows.length,
  limit: 300,
  eligibleUnique: items.length,
  duplicateOccurrences: occurrences - items.length,
  byCategory: Object.fromEntries(
    categories.map((c) => [
      c,
      items.filter((e) => e.categories.includes(c)).length,
    ]),
  ),
  withPhotoUrl: items.filter((e) => e.image).length,
  withCoordinates: items.filter((e) => e.lat !== null && e.lon !== null).length,
  withPrice: items.filter((e) => e.price !== null).length,
  editoriallyReviewed: 0,
  photoRightsVerified: 0,
  requestsMadeToQloo: 0,
  oldest: items.map((e) => e.checkedAt).sort()[0] || null,
};
await mkdir(".private/catalogue", { recursive: true, mode: 0o700 });
await writeFile(
  ".private/catalogue/lisbon-inventory.json",
  JSON.stringify({ report, items }, null, 2),
  { mode: 0o600 },
);
console.log(JSON.stringify(report, null, 2));
