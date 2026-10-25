import { discoverEvents } from "@/lib/server/events";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
export async function GET(request: Request) {
  const city = new URL(request.url).searchParams.get("city");
  if (!city || city.length > 80 || !/^[\p{L}\p{M} -]+$/u.test(city)) return Response.json({ error: "invalid_city" }, { status: 400, headers });
  try { return Response.json(await discoverEvents(city), { headers }); }
  catch { return Response.json({ error: "events_unavailable" }, { status: 503, headers }); }
}
