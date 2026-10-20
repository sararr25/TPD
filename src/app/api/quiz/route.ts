import { accountRoute, readJson } from "@/lib/server/account-route";
import { readUserQuiz, saveUserQuiz, deleteUserQuiz } from "@/lib/server/user-quiz";
export const runtime = "nodejs";
// The signed-in user's Passport quiz answers.
export function GET(request: Request) {
  return accountRoute(request, async (userId) => ({ answers: await readUserQuiz(userId) }));
}
export function PUT(request: Request) {
  return accountRoute(request, async (userId) => {
    const body = await readJson(request);
    await saveUserQuiz(userId, body.answers);
    return { saved: true };
  });
}
export function DELETE(request: Request) {
  return accountRoute(request, async (userId) => {
    await deleteUserQuiz(userId);
    return { deleted: true };
  });
}
