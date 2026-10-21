import "server-only";
import { UUID } from "../discovery.ts";
import { verifySelection, verifySavedSelection } from "./discovery-service.ts";
import { DiscoveryError } from "./qloo.ts";
import { db } from "./user-passport.ts";

// E06: the rest of a signed-in user's data — hidden places ("Not for me"),
// collections of saved Swap results, and deleting the account. Places are
// accepted only as selections the server signed (each Swap result has one).
export const LIMITS = { hidden: 100, collections: 20, items: 100, name: 60, note: 280 };

export type Hidden = { id: string; name: string };
export type CollectionItem = {
  placeId: string;
  name: string;
  address: string | null;
  lat: number | null;
  lon: number | null;
  note: string | null;
  savedAt: string;
};
export type Collection = { id: string; name: string; createdAt: string; items: CollectionItem[] };

function uuid(value: unknown) {
  if (typeof value !== "string" || !UUID.test(value)) throw new DiscoveryError("invalid_request", 400);
  return value;
}

export async function listHidden(userId: string): Promise<Hidden[]> {
  const rows = await db().query(
    "SELECT place_id, name FROM user_hidden_place WHERE user_id = $1 ORDER BY created_at",
    [userId],
  );
  return rows.map((r) => ({ id: r.place_id, name: r.name }));
}

export async function hidePlace(userId: string, token: unknown) {
  const place = verifySelection(token);
  const sql = db();
  const [{ n }] = await sql.query("SELECT count(*)::int AS n FROM user_hidden_place WHERE user_id = $1", [userId]);
  if (n >= LIMITS.hidden) throw new DiscoveryError("hidden_limit", 400);
  await sql.query(
    `INSERT INTO user_hidden_place (user_id, place_id, name) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, place_id) DO NOTHING`,
    [userId, place.id, place.name],
  );
  return { id: place.id, name: place.name };
}

export async function unhidePlace(userId: string, placeId: unknown) {
  const id = uuid(placeId);
  await db().query("DELETE FROM user_hidden_place WHERE user_id = $1 AND place_id = $2", [userId, id]);
}

export async function listCollections(userId: string): Promise<Collection[]> {
  const rows = await db().query(
    `SELECT c.id, c.name, c.created_at, i.place_id, i.name AS item_name, i.address, i.lat, i.lon, i.note, i.created_at AS saved_at
       FROM collection c LEFT JOIN collection_item i ON i.collection_id = c.id
      WHERE c.user_id = $1
      ORDER BY c.created_at, i.created_at`,
    [userId],
  );
  const byId = new Map<string, Collection>();
  for (const r of rows) {
    let c = byId.get(r.id);
    if (!c) byId.set(r.id, (c = { id: r.id, name: r.name, createdAt: new Date(r.created_at).toISOString(), items: [] }));
    if (r.place_id)
      c.items.push({
        placeId: r.place_id,
        name: r.item_name,
        address: r.address,
        lat: r.lat,
        lon: r.lon,
        note: r.note,
        savedAt: new Date(r.saved_at).toISOString(),
      });
  }
  return [...byId.values()];
}

export async function saveToCollection(userId: string, nameValue: unknown, token: unknown, noteValue: unknown) {
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  if (!name || name.length > LIMITS.name) throw new DiscoveryError("invalid_collection", 400);
  if (noteValue !== undefined && (typeof noteValue !== "string" || noteValue.length > LIMITS.note))
    throw new DiscoveryError("invalid_collection", 400);
  const note = typeof noteValue === "string" && noteValue.trim() ? noteValue.trim() : null;
  // Lists may move from a guest's browser days later (docs/22): accept an
  // expired but genuinely signed selection here only.
  const place = verifySavedSelection(token);
  const sql = db();
  const existing = await sql.query("SELECT id FROM collection WHERE user_id = $1 AND name = $2", [userId, name]);
  let id: string;
  if (existing.length) id = existing[0].id;
  else {
    const [{ n }] = await sql.query("SELECT count(*)::int AS n FROM collection WHERE user_id = $1", [userId]);
    if (n >= LIMITS.collections) throw new DiscoveryError("collection_limit", 400);
    const created = await sql.query(
      `INSERT INTO collection (user_id, name) VALUES ($1, $2)
       ON CONFLICT (user_id, name) DO UPDATE SET name = excluded.name RETURNING id`,
      [userId, name],
    );
    id = created[0].id;
  }
  const [{ n }] = await sql.query("SELECT count(*)::int AS n FROM collection_item WHERE collection_id = $1", [id]);
  if (n >= LIMITS.items) throw new DiscoveryError("collection_limit", 400);
  await sql.query(
    `INSERT INTO collection_item (collection_id, place_id, name, address, lat, lon, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (collection_id, place_id) DO UPDATE SET note = excluded.note`,
    [id, place.id, place.name, place.address, place.lat, place.lon, note],
  );
  return { collectionId: id, name };
}

export async function removeFromCollection(userId: string, collectionId: unknown, placeId: unknown) {
  const ids = [uuid(collectionId), uuid(placeId)];
  await db().query(
    `DELETE FROM collection_item i USING collection c
      WHERE i.collection_id = c.id AND c.user_id = $1 AND c.id = $2 AND i.place_id = $3`,
    [userId, ...ids],
  );
}

export async function deleteCollection(userId: string, collectionId: unknown) {
  const id = uuid(collectionId);
  await db().query("DELETE FROM collection WHERE user_id = $1 AND id = $2", [userId, id]);
}

// Deleting the Neon Auth user cascades to its sessions, Google link, Passport,
// hidden places and collections (all foreign keys are ON DELETE CASCADE).
export async function deleteAccount(userId: string) {
  const id = uuid(userId);
  await db().query(`DELETE FROM neon_auth."user" WHERE id = $1`, [id]);
}
