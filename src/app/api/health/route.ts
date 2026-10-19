export function GET() {
  return Response.json(
    { status: "ok", service: "tpd", stage: "scaffold" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
