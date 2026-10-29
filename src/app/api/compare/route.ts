import { DiscoveryError } from "@/lib/server/qloo";
import { askLlm } from "@/lib/server/llm";
import { checkBudget } from "@/lib/server/budget";
import { CITIES } from "@/lib/discovery";
import { MAX_ENTITIES } from "@/lib/quiz";
export const runtime = "nodejs";
const headers = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};
const CATEGORIES = ["restaurant", "museum", "bar"];

// LLM side of the Qloo vs LLM page. Qloo's side uses /api/discovery.
export async function POST(request: Request) {
  try {
    let sameOrigin = false;
    try {
      const parsed = new URL(request.headers.get("origin") || "");
      sameOrigin = ["http:", "https:"].includes(parsed.protocol) && parsed.host === request.headers.get("host");
    } catch {}
    if (!sameOrigin) return Response.json({ error: "origin" }, { status: 403, headers });
    let body;
    try {
      body = JSON.parse((await request.text()).slice(0, 4000));
    } catch {
      throw new DiscoveryError("invalid_request", 400);
    }
    const { favourites, city, category } = body ?? {};
    if (
      !Array.isArray(favourites) ||
      favourites.length < 1 ||
      favourites.length > MAX_ENTITIES ||
      !favourites.every((f) => typeof f === "string" && f.length > 0 && f.length <= 120) ||
      typeof city !== "string" ||
      !Object.hasOwn(CITIES, city) ||
      !CATEGORIES.includes(category)
    )
      throw new DiscoveryError("invalid_request", 400);
    await checkBudget(request, true);
    const picks = await askLlm(favourites, city, category);
    return Response.json({ picks }, { headers });
  } catch (error) {
    if (error instanceof DiscoveryError)
      return Response.json({ error: error.code }, { status: error.status, headers });
    console.error("[compare] unexpected error", error);
    return Response.json({ error: "unexpected_error" }, { status: 500, headers });
  }
}
