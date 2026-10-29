import "server-only";
import { neon } from "@neondatabase/serverless";
import { UUID, type Entity } from "../discovery.ts";
import { selection, verifySelection, type Selection } from "./discovery-service.ts";
import { DiscoveryError } from "./qloo.ts";
import { MAX_ENTITIES } from "../quiz.ts";

// E06: the signed-in user's Passport in Neon (table user_passport). Only
// entities the server itself signed are accepted; reads re-sign them so a
// Passport saved days ago still works for Swap. Account data needs the real
// database: without DATABASE_URL this is a configuration error.
export function db() {
  if (!process.env.DATABASE_URL) throw new DiscoveryError("not_configured", 503);
  return neon(process.env.DATABASE_URL);
}

export async function readUserPassport(
  userId: string,
): Promise<{ passport: Selection[]; updatedAt: string } | null> {
  const rows = await db().query(
    "SELECT entities, updated_at FROM user_passport WHERE user_id = $1",
    [userId],
  );
  if (!rows.length) return null;
  const entities = (rows[0].entities as Entity[]).filter((e) => UUID.test(e?.id));
  return {
    passport: entities.map(selection),
    updatedAt: new Date(rows[0].updated_at).toISOString(),
  };
}

export async function saveUserPassport(userId: string, tokens: unknown) {
  if (!Array.isArray(tokens) || tokens.length > MAX_ENTITIES)
    throw new DiscoveryError("invalid_passport", 400);
  const entities = tokens.map(verifySelection);
  if (new Set(entities.map((e) => e.id)).size !== entities.length)
    throw new DiscoveryError("invalid_passport", 400);
  await db().query(
    `INSERT INTO user_passport (user_id, entities, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (user_id) DO UPDATE SET entities = excluded.entities, updated_at = now()`,
    [userId, JSON.stringify(entities)],
  );
}

export async function deleteUserPassport(userId: string) {
  await db().query("DELETE FROM user_passport WHERE user_id = $1", [userId]);
}
