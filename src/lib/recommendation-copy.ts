import type { Entity } from './discovery';
type Favourite = { entity: Pick<Entity, 'id' | 'name'> };
// Name only favourites explicitly attributed by the provider. Repeated reasons
// belong to the list; a unique attribution may stay beside its place.
export function recommendationCopy(places: Entity[], favourites: Favourite[]) {
  const names = (place: Entity) => favourites.filter(f => place.evidence.some(id => id.toLowerCase() === f.entity.id.toLowerCase())).slice(0,2).map(f => f.entity.name);
  const reasons = places.map(place => names(place).join(' and '));
  const repeated = new Set(reasons.filter(reason => reason && reasons.filter(r => r === reason).length > 1));
  const shared = [...new Set(places.filter((_,i) => repeated.has(reasons[i])).flatMap(names))];
  return {
    summary: shared.length ? `Your favourites helped shape these picks: ${shared.join(' · ')}.` : null,
    why: (place: Entity) => { const reason = names(place).join(' and '); return reason && !repeated.has(reason) ? `Because you like ${reason}` : null; },
  };
}
