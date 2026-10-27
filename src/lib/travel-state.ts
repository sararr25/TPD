// Private organisation metadata only. Never copy provider tokens or Saved notes.
export type TripOrder = { groups: string[]; places: { id: string; group: string }[] };
export type PlaceVisit = { id: string; at: string; verdict: 'again' | 'not-for-me' | null; reason: string };
export type TravelState = { version: 1; trips: Record<string, TripOrder>; visits: PlaceVisit[] };
export const emptyTravel = (): TravelState => ({ version: 1, trips: {}, visits: [] });
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown, max: number): v is string => typeof v === 'string' && !!v.trim() && v.length <= max && !/[\u0000-\u001f\u007f]/.test(v);
const uuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export function validateTravel(value: unknown): TravelState {
  const invalid = () => { throw new Error('Your trip organisation could not be read.'); };
  if (!record(value) || value.version !== 1 || !record(value.trips) || !Array.isArray(value.visits) || Object.keys(value.trips).length > 20 || value.visits.length > 100) return invalid();
  const trips: Record<string, TripOrder> = {};
  for (const [id, trip] of Object.entries(value.trips)) {
    if (!text(id,100) || ['__proto__','constructor','prototype'].includes(id) || !record(trip) || !Array.isArray(trip.groups) || !Array.isArray(trip.places) || trip.groups.length > 10 || trip.places.length > 100) return invalid();
    const groups = trip.groups;
    if (groups.some(g => !text(g,60)) || new Set(groups).size !== groups.length) return invalid();
    const places = trip.places.map(p => {
      if (!record(p) || !uuid(p.id) || typeof p.group !== 'string' || (p.group !== '' && !groups.includes(p.group))) return invalid();
      return { id:p.id.toLowerCase(), group:p.group };
    });
    if (new Set(places.map(p=>p.id)).size !== places.length) return invalid();
    trips[id] = { groups: groups as string[], places };
  }
  const visits = value.visits.map(v => {
    if (!record(v) || !uuid(v.id) || typeof v.at !== 'string' || !Number.isFinite(Date.parse(v.at)) || v.at.length > 30 || ![null,'again','not-for-me'].includes(v.verdict as string|null) || typeof v.reason !== 'string' || v.reason.length > 280) return invalid();
    return { id:v.id.toLowerCase(), at:new Date(v.at).toISOString(), verdict:v.verdict as PlaceVisit['verdict'], reason:v.reason };
  });
  if (new Set(visits.map(v=>v.id)).size !== visits.length) return invalid();
  return { version:1, trips, visits };
}
export function parseTravel(raw: string | null): TravelState {
  if (!raw) return emptyTravel();
  return validateTravel(JSON.parse(raw));
}
export function organise<T extends {placeId:string}>(items:T[], order?:TripOrder): T[] {
  const rank = (item:T) => { const p=order?.places.findIndex(p=>p.id===item.placeId.toLowerCase()) ?? -1; return p<0?1000:p; };
  const groupRank=(item:T)=>{const group=order?.places.find(p=>p.id===item.placeId.toLowerCase())?.group||'';return group ? (order?.groups.indexOf(group)??0)+1 : 0;};
  return [...items].sort((a,b)=>groupRank(a)-groupRank(b)||rank(a)-rank(b));
}
