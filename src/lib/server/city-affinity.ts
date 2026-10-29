import 'server-only';
import { CITIES } from '../discovery.ts';
import type { CityAffinity } from '../home-cities.ts';
import { CITY_DESTINATIONS } from './city-destinations.ts';
import { verifySelection } from './discovery-service.ts';
import { qloo, DiscoveryError } from './qloo.ts';
import { MIN_ENTITIES, MAX_ENTITIES } from '../quiz.ts';
export async function cityAffinities(tokens: unknown): Promise<{ cities: CityAffinity[]; checkedAt: string }> {
  if (!Array.isArray(tokens) || tokens.length < MIN_ENTITIES || tokens.length > MAX_ENTITIES) throw new DiscoveryError('invalid_passport', 400);
  const favourites = tokens.map(verifySelection);
  if (new Set(favourites.map(f => f.id)).size !== favourites.length) throw new DiscoveryError('invalid_passport', 400);
  const { data, checkedAt } = await qloo('/v2/insights', {
    'filter.type': 'urn:entity:destination',
    'filter.results.entities': Object.values(CITY_DESTINATIONS).join(','),
    'signal.interests.entities': favourites.map(f => f.id).join(','),
    take: String(Object.keys(CITY_DESTINATIONS).length),
  });
  const payload = data as { results?: { entities?: unknown[] } };
  const rows = payload?.results?.entities;
  if (!Array.isArray(rows)) throw new DiscoveryError('invalid_response', 502);
  const byId = new Map(Object.entries(CITY_DESTINATIONS).map(([city, id]) => [id, city]));
  const seen = new Set<string>();
  const cities: CityAffinity[] = [];
  for (const value of rows) {
    if (!value || typeof value !== 'object') continue;
    const row = value as { entity_id?: string; subtype?: string; properties?: { geocode?: { country_code?: string } }; query?: { affinity?: number } };
    const city = byId.get(String(row.entity_id).toUpperCase());
    const affinity = row.query?.affinity;
    if (!city || seen.has(city) || row.subtype !== 'urn:entity:destination' || row.properties?.geocode?.country_code !== CITIES[city].country || typeof affinity !== 'number' || !Number.isFinite(affinity) || affinity < -1 || affinity > 1) continue;
    seen.add(city); cities.push({ city, affinity });
  }
  return { cities, checkedAt };
}
