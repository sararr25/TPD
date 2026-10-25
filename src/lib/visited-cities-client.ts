import { cleanVisitedCities } from './home-cities.ts';
export const VISITED_CHANGED = 'beesyde:visited-cities-changed';
const key = (owner: string) => `beesyde-visited-cities-v1:${owner}`;
type Local = { cities: string[]; pending: boolean; revision: string };
export type VisitedSnapshot = { cities: string[]; syncAvailable: boolean; pending: boolean; message: string };
export function readVisited(owner: string): Local {
  try {
    const data = JSON.parse(localStorage.getItem(key(owner)) || 'null');
    return { cities: cleanVisitedCities(data?.cities), pending: data?.pending === true, revision: typeof data?.revision === 'string' ? data.revision : '' };
  } catch { return { cities: [], pending: false, revision: '' }; }
}
function store(owner: string, value: Local, notify = true) {
  try { localStorage.setItem(key(owner), JSON.stringify(value)); }
  catch { throw new Error('This browser could not save your visited cities. Keep this page open and try again.'); }
  if (notify) window.dispatchEvent(new Event(VISITED_CHANGED));
}
const writes = new Map<string, Promise<unknown>>();
async function accountRequest(owner: string, method: 'GET' | 'PUT' | 'DELETE', cities?: string[]) {
  const response = await fetch('/api/visited-cities', {
    method, headers: { 'X-Beesyde-User': owner, ...(cities ? { 'Content-Type': 'application/json' } : {}) },
    body: cities ? JSON.stringify({ cities }) : undefined,
  });
  if (!response.ok) throw new Error('Your visited cities could not sync to this account. Your choices stay on this browser; try again.');
  return await response.json() as { cities?: unknown; syncAvailable?: boolean };
}
function account(owner: string, method: 'GET' | 'PUT' | 'DELETE', cities?: string[]) {
  if (method === 'GET') return accountRequest(owner, method);
  const task = (writes.get(owner) ?? Promise.resolve()).catch(() => {}).then(() => accountRequest(owner, method, cities));
  writes.set(owner, task);
  return task;
}
export async function loadVisited(owner: string): Promise<VisitedSnapshot> {
  const local = readVisited(owner);
  if (owner === 'guest') return { ...local, pending: false, syncAvailable: false, message: '' };
  try {
    const data = await account(owner, 'GET');
    if (!data.syncAvailable) return { ...readVisited(owner), syncAvailable: false, message: 'Account sync for visited cities is not enabled yet. These choices stay on this browser for this account.' };
    // Never discard an unsuccessful save or a newer edit while a read is in flight.
    const current = readVisited(owner);
    if (current.pending || current.revision !== local.revision) return { ...current, syncAvailable: true, message: current.pending ? 'Your changes are on this browser. Save again to sync them to your account.' : '' };
    const cities = cleanVisitedCities(data.cities);
    store(owner, { cities, pending: false, revision: local.revision }, false);
    return { cities, pending: false, syncAvailable: true, message: '' };
  } catch (error) {
    return { ...readVisited(owner), syncAvailable: false, message: error instanceof Error ? error.message : 'Visited cities could not load.' };
  }
}
export async function saveVisited(owner: string, value: string[], syncAvailable: boolean): Promise<VisitedSnapshot> {
  const cities = cleanVisitedCities(value), revision = crypto.randomUUID();
  const pending = owner !== 'guest';
  store(owner, { cities, pending, revision });
  if (!pending) return { cities, pending: false, syncAvailable: false, message: 'Visited cities saved on this browser.' };
  if (!syncAvailable) return { cities, pending, syncAvailable: false, message: 'Saved on this browser for this account. Account sync is not available yet.' };
  await account(owner, 'PUT', cities);
  if (readVisited(owner).revision === revision) store(owner, { cities, pending: false, revision: crypto.randomUUID() });
  return { cities: readVisited(owner).cities, pending: readVisited(owner).pending, syncAvailable: true, message: 'Visited cities saved to your account.' };
}
export function clearVisited(owner: string) {
  store(owner, { cities: [], pending: false, revision: crypto.randomUUID() });
}
export async function deleteVisited(owner: string) {
  if (owner !== 'guest') await account(owner, 'DELETE');
  clearVisited(owner);
}
