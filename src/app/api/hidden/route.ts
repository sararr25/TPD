import { accountRoute, readJson } from "@/lib/server/account-route";
import { listHidden, hidePlace, unhidePlace } from "@/lib/server/user-data";
export const runtime = "nodejs";
// Places the signed-in user marked "Not for me" (E06); excluded from their Swaps.
export function GET(request: Request) {
  return accountRoute(request, async (userId) => ({ hidden: await listHidden(userId) }));
}
export function POST(request: Request) {
  return accountRoute(request, async (userId) => {
    const body = await readJson(request);
    return { hidden: await hidePlace(userId, body.place) };
  });
}
export function DELETE(request: Request) {
  return accountRoute(request, async (userId) => {
    const body = await readJson(request);
    await unhidePlace(userId, body.id);
    return { deleted: true };
  });
}
