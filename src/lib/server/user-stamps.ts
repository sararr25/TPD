import "server-only";
import { cleanStamp, STAMP_LIMIT, type Stamp } from "../stamps.ts";
import { db } from "./user-passport.ts";
import { DiscoveryError } from "./qloo.ts";

export async function readUserStamps(userId: string): Promise<Stamp[]> {
  const rows = await db().query(
    "SELECT kind, city, place_id, name, created_at FROM user_stamp WHERE user_id = $1 ORDER BY created_at DESC, stamp_key LIMIT $2",
    [userId, STAMP_LIMIT],
  );
  return rows.map(r => cleanStamp({ kind: r.kind, city: r.city, placeId: r.place_id, name: r.name, createdAt: new Date(r.created_at).toISOString() })).filter((s): s is Stamp => s !== null);
}
export async function saveUserStamps(userId: string, value: unknown): Promise<void> {
  if (!Array.isArray(value) || !value.length || value.length > 50) throw new DiscoveryError("invalid_request", 400);
  const stamps = value.map(cleanStamp).filter((s): s is Stamp => s !== null);
  if (stamps.length !== value.length) throw new DiscoveryError("invalid_request", 400);
  // Project every field: signed selections, notes and incidental properties
  // are never part of activity history. The server timestamps are retained
  // on duplicate imports, including simultaneous browser requests.
  const rows = stamps.map(s => ({
    stamp_key: s.kind === "city" ? `city:${s.city}` : `place:${s.placeId}`,
    kind: s.kind,
    city: s.city,
    place_id: s.kind === "place" ? s.placeId : null,
    name: s.kind === "place" ? s.name : null,
    created_at: s.createdAt,
  }));
  // An import may contain a repeated key; reduce it before ON CONFLICT so
  // PostgreSQL never tries to update the same row twice in one statement.
  const unique = new Map<string, typeof rows[number]>();
  for (const row of rows) {
    const before = unique.get(row.stamp_key);
    if (!before || row.created_at < before.created_at) unique.set(row.stamp_key, row);
  }
  await db().query(
    `INSERT INTO user_stamp (user_id, stamp_key, kind, city, place_id, name, created_at)
     SELECT $1, s.stamp_key, s.kind, s.city, s.place_id, s.name, s.created_at
     FROM jsonb_to_recordset($2::jsonb) AS s(stamp_key text, kind text, city text, place_id uuid, name text, created_at timestamptz)
     ON CONFLICT (user_id, stamp_key) DO UPDATE SET created_at = LEAST(user_stamp.created_at, excluded.created_at)`,
    [userId, JSON.stringify([...unique.values()])],
  );
}
export async function deleteUserStamps(userId: string): Promise<void> {
  await db().query("DELETE FROM user_stamp WHERE user_id = $1", [userId]);
}
