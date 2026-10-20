import { accountRoute, readJson } from "@/lib/server/account-route";
import {
  listCollections,
  saveToCollection,
  removeFromCollection,
  deleteCollection,
} from "@/lib/server/user-data";
export const runtime = "nodejs";
// The signed-in user's collections of saved Swap results (E06).
export function GET(request: Request) {
  return accountRoute(request, async (userId) => ({ collections: await listCollections(userId) }));
}
export function POST(request: Request) {
  return accountRoute(request, async (userId) => {
    const body = await readJson(request);
    return { saved: await saveToCollection(userId, body.collection, body.place, body.note) };
  });
}
// With placeId: remove one place. Without: delete the whole collection.
export function DELETE(request: Request) {
  return accountRoute(request, async (userId) => {
    const body = await readJson(request);
    if (body.placeId === undefined) await deleteCollection(userId, body.collectionId);
    else await removeFromCollection(userId, body.collectionId, body.placeId);
    return { deleted: true };
  });
}
