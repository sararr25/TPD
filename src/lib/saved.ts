import type { Entity } from "./discovery";
import {
  loadCollections,
  saveToCollection,
  removeFromCollection,
  deleteCollection,
  type CollectionItem,
} from "./account";

// Saved lists (docs/22 F1-F3). Guests save in this browser; signed in, lists
// live in the account and this browser's lists move there. A guest item keeps
// its signed selection so the server can verify it when it moves.
export type SavedItem = CollectionItem & { token?: string };
export type SavedList = { id: string; name: string; items: SavedItem[]; local: boolean };
export const LISTS_KEY = "beesyde-lists-v1";
// Same limits as the account (src/lib/server/user-data.ts LIMITS).
const LIMITS = { lists: 20, items: 100, name: 60, note: 280 };

export function readLocalLists(raw: string | null): SavedList[] {
  try {
    const a: unknown = JSON.parse(raw || "null");
    if (!Array.isArray(a)) return [];
    return a
      .filter(
        (l) =>
          l && typeof l.id === "string" && typeof l.name === "string" &&
          l.name.trim() && l.name.length <= LIMITS.name && Array.isArray(l.items),
      )
      .slice(0, LIMITS.lists)
      .map((l) => ({
        id: l.id,
        name: l.name,
        local: true,
        items: (l.items as SavedItem[])
          .filter((i) => i && typeof i.placeId === "string" && typeof i.name === "string" && typeof i.token === "string")
          .slice(0, LIMITS.items),
      }));
  } catch {
    return [];
  }
}
function localLists(): SavedList[] {
  return readLocalLists(localStorage.getItem(LISTS_KEY));
}
function storeLocal(lists: SavedList[]) {
  try {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  } catch {
    throw new Error("This browser could not save your list. Check that site storage is allowed.");
  }
}

// Moves this browser's lists into the account. Items the server refuses stay
// here and are reported, never dropped.
export async function moveLocalLists(): Promise<{ moved: number; failed: string[] }> {
  let moved = 0;
  const failed: string[] = [];
  const kept: SavedList[] = [];
  for (const list of localLists()) {
    const left: SavedItem[] = [];
    for (const item of list.items) {
      try {
        await saveToCollection(list.name, item.token!, item.note ?? "");
        moved++;
      } catch {
        failed.push(item.name);
        left.push(item);
      }
    }
    if (left.length) kept.push({ ...list, items: left });
  }
  storeLocal(kept);
  return { moved, failed };
}

export async function loadLists(signedIn: boolean): Promise<SavedList[]> {
  if (!signedIn) return localLists();
  const account = (await loadCollections()).map((c) => ({ ...c, local: false }));
  // Items that could not move yet stay visible as this device's lists.
  return [...account, ...localLists()];
}

export async function addToList(
  name: string,
  place: Entity,
  token: string,
  note: string,
  signedIn: boolean,
) {
  const clean = name.trim();
  if (!clean || clean.length > LIMITS.name || note.length > LIMITS.note)
    throw new Error("Give the list a name (up to 60 characters) and keep the note under 280.");
  if (signedIn) return void (await saveToCollection(clean, token, note));
  const lists = localLists();
  let list = lists.find((l) => l.name === clean);
  if (!list) {
    if (lists.length >= LIMITS.lists) throw new Error("You have 20 lists already. Remove one first.");
    list = { id: `local-${crypto.randomUUID()}`, name: clean, items: [], local: true };
    lists.push(list);
  }
  if (!list.items.some((i) => i.placeId === place.id)) {
    if (list.items.length >= LIMITS.items) throw new Error("This list is full. Remove something first.");
    list.items.push({
      placeId: place.id,
      name: place.name,
      address: place.address,
      lat: place.lat,
      lon: place.lon,
      note: note.trim() || null,
      savedAt: new Date().toISOString(),
      token,
    });
  }
  storeLocal(lists);
}

export async function removeFromList(list: SavedList, placeId: string) {
  if (!list.local) return removeFromCollection(list.id, placeId);
  storeLocal(
    localLists().map((l) => (l.id === list.id ? { ...l, items: l.items.filter((i) => i.placeId !== placeId) } : l)),
  );
}

export async function deleteList(list: SavedList) {
  if (!list.local) return deleteCollection(list.id);
  storeLocal(localLists().filter((l) => l.id !== list.id));
}

// Writes the note on a saved place (#16: the note comes after saving). The
// account upserts the note when the place is already in the list; on this
// device the item is edited in place.
export async function setNote(list: SavedList, place: Entity, token: string, note: string) {
  if (note.length > LIMITS.note) throw new Error("Keep the note under 280 characters.");
  if (!list.local) return void (await saveToCollection(list.name, token, note));
  storeLocal(
    localLists().map((l) =>
      l.id === list.id
        ? { ...l, items: l.items.map((i) => (i.placeId === place.id ? { ...i, note: note.trim() || null } : i)) }
        : l,
    ),
  );
}
