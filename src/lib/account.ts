import { MESSAGES, type Selection } from "./discovery-client";

// Browser side of the signed-in-only API (E06): Passport, hidden places,
// collections and account deletion. Hidden places also live in this browser,
// so guests can use "Not for me" too.
async function call<T>(path: string, method: "GET" | "PUT" | "POST" | "DELETE", body?: object): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Your account could not be reached. Please try again.");
  }
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      MESSAGES[data.error] || "Your account could not be updated. Please try again.",
    );
  return data as T;
}

export async function loadAccountPassport(): Promise<Selection[] | null> {
  return (await call<{ passport: Selection[] | null }>("/api/passport", "GET")).passport;
}
export async function saveAccountPassport(passport: Selection[]) {
  await call("/api/passport", "PUT", { passport: passport.map((s) => s.token) });
}
export async function deleteAccountPassport() {
  await call("/api/passport", "DELETE");
}

export type Hidden = { id: string; name: string };
export const HIDDEN_KEY = "beesyde-hidden-v1";
export function readHidden(raw: string | null): Hidden[] {
  try {
    const a: unknown = JSON.parse(raw || "null");
    if (!Array.isArray(a)) return [];
    const seen = new Set<string>();
    return a
      .filter(
        (h): h is Hidden =>
          !!h &&
          typeof h.id === "string" &&
          /^[0-9a-f-]{36}$/i.test(h.id) &&
          typeof h.name === "string" &&
          h.name.length <= 200 &&
          !seen.has(h.id) &&
          !!seen.add(h.id),
      )
      .slice(0, 100);
  } catch {
    return [];
  }
}
function localHidden() {
  return readHidden(localStorage.getItem(HIDDEN_KEY));
}
function storeHidden(list: Hidden[]) {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(list));
}
// This browser's hidden places, plus the account's when signed in.
export async function loadHidden(signedIn: boolean): Promise<Hidden[]> {
  const local = localHidden();
  if (!signedIn) return local;
  const { hidden } = await call<{ hidden: Hidden[] }>("/api/hidden", "GET");
  const ids = new Set(hidden.map((h) => h.id));
  return [...hidden, ...local.filter((h) => !ids.has(h.id))];
}
export async function hidePlace(place: Hidden, token: string, signedIn: boolean) {
  storeHidden([...localHidden().filter((h) => h.id !== place.id), place]);
  if (signedIn) await call("/api/hidden", "POST", { place: token });
}
export async function unhidePlace(id: string, signedIn: boolean) {
  storeHidden(localHidden().filter((h) => h.id !== id));
  if (signedIn) await call("/api/hidden", "DELETE", { id });
}

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
export async function loadCollections(): Promise<Collection[]> {
  return (await call<{ collections: Collection[] }>("/api/collections", "GET")).collections;
}
export async function saveToCollection(collection: string, token: string, note: string) {
  await call("/api/collections", "POST", { collection, place: token, note });
}
export async function removeFromCollection(collectionId: string, placeId: string) {
  await call("/api/collections", "DELETE", { collectionId, placeId });
}
export async function deleteCollection(collectionId: string) {
  await call("/api/collections", "DELETE", { collectionId });
}

export async function deleteAccount() {
  await call("/api/account", "DELETE");
}
