import { CITIES } from './discovery.ts';
export const STARTER_CITIES = ['Lisbon', 'Paris', 'Tokyo', 'New York'] as const;
export type CityAffinity = { city: string; affinity: number };
export function cleanVisitedCities(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((city): city is string => typeof city === 'string' && Object.hasOwn(CITIES, city)))].sort();
}
export function selectHomeCities(affinities: CityAffinity[], visitedValue: string[]) {
  const visited = new Set(cleanVisitedCities(visitedValue));
  const unique = new Map<string, number>();
  for (const row of affinities) {
    if (!row || typeof row !== 'object' || !Object.hasOwn(CITIES, row.city) || !Number.isFinite(row.affinity) || row.affinity < -1 || row.affinity > 1) continue;
    // A repeated provider row cannot move a city twice through the shelf.
    if (!unique.has(row.city)) unique.set(row.city, row.affinity);
  }
  const ranked = [...unique].sort(([a, scoreA], [b, scoreB]) => scoreB - scoreA || Number(visited.has(b)) - Number(visited.has(a)) || a.localeCompare(b));
  const order = [...ranked.map(([city]) => city), ...visited, ...STARTER_CITIES];
  return [...new Set(order)].slice(0, 4).map(city => ({
    city, visited: visited.has(city), reason: unique.has(city) ? 'passport' as const : visited.has(city) ? 'visited' as const : 'starter' as const,
  }));
}
