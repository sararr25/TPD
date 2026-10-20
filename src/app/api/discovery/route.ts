import { DiscoveryError } from "@/lib/server/qloo";
import { lookup, guest, swap } from "@/lib/server/discovery-service";
import { checkBudget } from "@/lib/server/budget";
export const runtime = "nodejs";
const headers = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    let sameOrigin = false;
    try {
      const parsed = new URL(origin || "");
      sameOrigin =
        ["http:", "https:"].includes(parsed.protocol) &&
        parsed.host === request.headers.get("host");
    } catch {}
    if (!sameOrigin)
      return Response.json({ error: "origin" }, { status: 403, headers });
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return Response.json(
        { error: "invalid_request" },
        { status: 415, headers },
      );
    const raw = await request.text();
    if (raw.length > 120000)
      return Response.json(
        { error: "request_too_large" },
        { status: 413, headers },
      );
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      throw new DiscoveryError("invalid_request", 400);
    }
    if (!body || typeof body !== "object")
      throw new DiscoveryError("invalid_request", 400);
    await checkBudget(request, body.action === "swap");
    let result;
    if (body.action === "guest") result = await guest(body.profile);
    else if (body.action === "search") {
      if (
        typeof body.query !== "string" ||
        body.query.trim().length < 2 ||
        body.query.length > 120 ||
        !["artist", "movie", "book", "place"].includes(body.type)
      )
        throw new DiscoveryError("invalid_request", 400);
      if (body.reference !== undefined && typeof body.reference !== "boolean")
        throw new DiscoveryError("invalid_request", 400);
      if (body.reference && body.type !== "place")
        throw new DiscoveryError("invalid_request", 400);
      result = await lookup(
        body.reference ? body.query.trim() + " Paris" : body.query.trim(),
        body.type,
        body.reference === true,
        body.category,
      );
    } else if (body.action === "swap")
      result = await swap(
        body.reference,
        body.passport,
        body.choices,
        body.maxPrice,
        body.category,
        body.exclude ?? [],
      );
    else throw new DiscoveryError("invalid_request", 400);
    return Response.json(result, { headers });
  } catch (error) {
    if (error instanceof DiscoveryError)
      return Response.json(
        { error: error.code },
        {
          status: error.status,
          headers:
            error.code === "rate_limited"
              ? { ...headers, "Retry-After": "600" }
              : headers,
        },
      );
    console.error("[discovery] unexpected error", error);
    return Response.json(
      { error: "unexpected_error" },
      { status: 500, headers },
    );
  }
}
