import { cleanStamp, mergeStamps, parseStamps, stampKey, type Stamp } from "./stamps.ts";

export const STAMPS_KEY = "beesyde-stamps-v1";
export const STAMPS_CHANGED = "beesyde:stamps-changed";
const pendingKey = (userId?: string) => userId ? `${STAMPS_KEY}:${userId}` : STAMPS_KEY;
const writes = new Map<string, Promise<unknown>>();
export function readLocalStamps(userId?: string): Stamp[] {
  try { return parseStamps(localStorage.getItem(pendingKey(userId))); } catch { return []; }
}
function store(stamps: Stamp[], userId?: string) {
  try { localStorage.setItem(pendingKey(userId), JSON.stringify(stamps)); }
  catch { throw new Error("This browser could not save your Passport stamp. Allow site storage and try again."); }
  window.dispatchEvent(new Event(STAMPS_CHANGED));
}
async function api(method: "GET" | "POST" | "DELETE", userId: string, stamps?: Stamp[]): Promise<Stamp[]> {
  let response: Response;
  try {
    response = await fetch("/api/stamps", {
      method,
      headers: { "X-Beesyde-User": userId, ...(stamps ? { "Content-Type": "application/json" } : {}) },
      body: stamps ? JSON.stringify({ stamps }) : undefined,
    });
  } catch { throw new Error("Your stamps are on this device. We couldn’t reach your account to sync them."); }
  if (!response.ok) throw new Error("Your stamps could not sync to your account. They stay on this device; try again later.");
  const data = await response.json();
  return parseStamps(JSON.stringify(data.stamps ?? []));
}
function serial<T>(userId: string, run: () => Promise<T>): Promise<T> {
  const next = (writes.get(userId) ?? Promise.resolve()).catch(() => {}).then(run);
  writes.set(userId, next);
  return next;
}
// A successful account import clears only that import. New stamps from a
// second tab stay pending. Account history never becomes a guest's history.
function clearImported(imported: Stamp[], userId?: string) {
  const keys = new Set(imported.map(stampKey));
  store(readLocalStamps(userId).filter(s => !keys.has(stampKey(s))), userId);
}
async function sync(userId: string): Promise<Stamp[]> {
  const guest = readLocalStamps();
  const pending = readLocalStamps(userId);
  const imported = mergeStamps(guest, pending);
  let account = await api("GET", userId);
  for (let i = 0; i < imported.length; i += 50) account = await api("POST", userId, imported.slice(i, i + 50));
  if (guest.length) clearImported(guest);
  if (pending.length) clearImported(pending, userId);
  return account;
}
export async function loadStamps(userId?: string): Promise<Stamp[]> {
  return userId ? serial(userId, () => sync(userId)) : readLocalStamps();
}
export async function recordStamp(value: unknown, userId?: string): Promise<void> {
  const stamp = cleanStamp(value);
  if (!stamp) throw new Error("This Passport stamp could not be saved.");
  store(mergeStamps(readLocalStamps(userId), [stamp]), userId);
  if (userId) await serial(userId, () => sync(userId));
}
export function clearLocalStamps(userId?: string): void {
  store([], userId);
}
export async function deleteStamps(userId?: string): Promise<void> {
  if (userId) await serial(userId, () => api("DELETE", userId));
  clearLocalStamps(userId);
  if (userId) clearLocalStamps();
}
