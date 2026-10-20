import { accountRoute, headers } from "@/lib/server/account-route";
import { deleteAccount } from "@/lib/server/user-data";
export const runtime = "nodejs";
// Deletes the signed-in user and all their data (E06), then expires the Neon
// Auth cookies so the cached session cannot outlive the account.
export function DELETE(request: Request) {
  return accountRoute(request, async (userId) => {
    await deleteAccount(userId);
    const response = Response.json({ deleted: true }, { headers });
    const names = (request.headers.get("cookie") || "")
      .split(";")
      .map((c) => c.split("=")[0].trim())
      .filter((name) => name.startsWith("__Secure-neon-auth"));
    for (const name of names)
      response.headers.append("Set-Cookie", `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
    return response;
  });
}
