import { accountRoute, readJson } from "@/lib/server/account-route";
import { readUserFeedback, saveUserFeedback, deleteUserFeedback } from "@/lib/server/user-feedback";
export const runtime = "nodejs";
// The signed-in user's gradual "Yes" / "Not for me" feedback (D3).
export function GET(request: Request) {
  return accountRoute(request, async (userId) => ({ feedback: await readUserFeedback(userId) }));
}
export function PUT(request: Request) {
  return accountRoute(request, async (userId) => {
    const body = await readJson(request);
    await saveUserFeedback(userId, body.feedback);
    return { saved: true };
  });
}
export function DELETE(request: Request) {
  return accountRoute(request, async (userId) => {
    await deleteUserFeedback(userId);
    return { deleted: true };
  });
}
