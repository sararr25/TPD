import { accountRoute, readJson } from "@/lib/server/account-route";
import {
  readUserPassport,
  saveUserPassport,
  deleteUserPassport,
} from "@/lib/server/user-passport";
export const runtime = "nodejs";
// The signed-in user's Passport (E06).
export function GET(request: Request) {
  return accountRoute(request, async (userId) => (await readUserPassport(userId)) ?? { passport: null });
}
export function PUT(request: Request) {
  return accountRoute(request, async (userId) => {
    const body = await readJson(request);
    await saveUserPassport(userId, body.passport);
    return { saved: true };
  });
}
export function DELETE(request: Request) {
  return accountRoute(request, async (userId) => {
    await deleteUserPassport(userId);
    return { deleted: true };
  });
}
