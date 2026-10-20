import { auth } from "@/lib/auth/server";
import { DiscoveryError } from "@/lib/server/qloo";
import {
  readUserPassport,
  saveUserPassport,
  deleteUserPassport,
} from "@/lib/server/user-passport";
export const runtime = "nodejs";
const headers = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};
// The signed-in user's Passport (E06). Guests get 401 and keep using browser storage.
async function handle(request: Request, run: (userId: string) => Promise<unknown>) {
  try {
    if (request.method !== "GET") {
      let sameOrigin = false;
      try {
        sameOrigin =
          new URL(request.headers.get("origin") || "").host ===
          request.headers.get("host");
      } catch {}
      if (!sameOrigin)
        return Response.json({ error: "origin" }, { status: 403, headers });
    }
    const { data: session } = await auth.getSession();
    if (!session?.user?.id)
      return Response.json({ error: "signed_out" }, { status: 401, headers });
    return Response.json(await run(session.user.id), { headers });
  } catch (error) {
    if (error instanceof DiscoveryError)
      return Response.json({ error: error.code }, { status: error.status, headers });
    console.error("[passport] unexpected error", error);
    return Response.json({ error: "unexpected_error" }, { status: 500, headers });
  }
}
export function GET(request: Request) {
  return handle(request, async (userId) => (await readUserPassport(userId)) ?? { passport: null });
}
export function PUT(request: Request) {
  return handle(request, async (userId) => {
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      throw new DiscoveryError("invalid_request", 415);
    const raw = await request.text();
    if (raw.length > 120000) throw new DiscoveryError("request_too_large", 413);
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      throw new DiscoveryError("invalid_request", 400);
    }
    await saveUserPassport(userId, body?.passport);
    return { saved: true };
  });
}
export function DELETE(request: Request) {
  return handle(request, async (userId) => {
    await deleteUserPassport(userId);
    return { deleted: true };
  });
}
