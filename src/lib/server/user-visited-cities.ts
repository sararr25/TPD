import 'server-only';
import { CITIES } from '../discovery.ts';
import { cleanVisitedCities } from '../home-cities.ts';
import { db } from './user-passport.ts';
import { DiscoveryError } from './qloo.ts';
export const visitsSyncEnabled = () => process.env.VISITED_CITIES_SYNC === '1';
export function validateVisitedCities(value: unknown): string[] {
  const clean = cleanVisitedCities(value);
  if (!Array.isArray(value) || value.length > Object.keys(CITIES).length || clean.length !== value.length) throw new DiscoveryError('invalid_visited_cities', 400);
  return clean;
}
export async function readUserVisitedCities(userId: string) {
  if (!visitsSyncEnabled()) return { cities: null, syncAvailable: false };
  const rows = await db().query('SELECT cities FROM user_visited_cities WHERE user_id = $1', [userId]);
  return { cities: cleanVisitedCities(rows[0]?.cities ?? []), syncAvailable: true };
}
export async function saveUserVisitedCities(userId: string, value: unknown) {
  const cities = validateVisitedCities(value);
  if (!visitsSyncEnabled()) throw new DiscoveryError('visited_sync_unavailable', 503);
  // One row / atomic replacement: no partial delete+insert and no visit counts.
  await db().query(`INSERT INTO user_visited_cities (user_id, cities) VALUES ($1, $2::text[])
    ON CONFLICT (user_id) DO UPDATE SET cities = excluded.cities`, [userId, cities]);
}
export async function deleteUserVisitedCities(userId: string) {
  // Privacy deletion must still remove earlier data if sync is later disabled.
  // Before the approved migration, only an absent table is safe to ignore.
  try { await db().query('DELETE FROM user_visited_cities WHERE user_id = $1', [userId]); }
  catch (error) { if (!error || typeof error !== 'object' || !('code' in error) || error.code !== '42P01') throw error; }
}
