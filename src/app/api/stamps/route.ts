import { accountRoute, readJson } from "@/lib/server/account-route";
import { readUserStamps, saveUserStamps, deleteUserStamps } from "@/lib/server/user-stamps";
import { DiscoveryError } from "@/lib/server/qloo";
export const runtime = "nodejs";
// Also bind queued browser writes to the account that queued them. A late
// request after switching accounts must not import the old user's stamps.
function owner(request: Request, userId: string) {
  if (request.headers.get("x-beesyde-user") !== userId) throw new DiscoveryError("signed_out", 401);
}
export function GET(request: Request) {
  return accountRoute(request, async userId => {
    owner(request, userId);
    return { stamps: await readUserStamps(userId) };
  });
}
export function POST(request: Request) {
  return accountRoute(request, async userId => {
    owner(request, userId);
    const body = await readJson(request);
    await saveUserStamps(userId, body.stamps);
    return { stamps: await readUserStamps(userId) };
  });
}
export function DELETE(request: Request) {
  return accountRoute(request, async userId => {
    owner(request, userId);
    await deleteUserStamps(userId);
    return { stamps: [] };
  });
}
