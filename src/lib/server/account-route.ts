import "server-only";
import { auth } from "@/lib/auth/server";
import { DiscoveryError } from "./qloo.ts";

// Shared by the signed-in-only API routes (E06): same-origin writes, a Neon
// Auth session, JSON errors. Guests get 401 and keep using browser storage.
export const headers = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};
export async function accountRoute(
  request: Request,
  run: (userId: string) => Promise<unknown>,
) {
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
    const intendedOwner = request.headers.get("x-beesyde-user");
    if (intendedOwner && intendedOwner !== session.user.id)
      return Response.json({ error: "signed_out" }, { status: 401, headers });
    const result = await run(session.user.id);
    return result instanceof Response ? result : Response.json(result, { headers });
  } catch (error) {
    if (error instanceof DiscoveryError)
      return Response.json({ error: error.code }, { status: error.status, headers });
    console.error("[account] unexpected error", error);
    return Response.json({ error: "unexpected_error" }, { status: 500, headers });
  }
}
export async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new DiscoveryError("invalid_request", 415);
  const raw = await request.text();
  if (raw.length > 120000) throw new DiscoveryError("request_too_large", 413);
  try {
    const body = JSON.parse(raw);
    if (!body || typeof body !== "object") throw Error();
    return body;
  } catch {
    throw new DiscoveryError("invalid_request", 400);
  }
}
