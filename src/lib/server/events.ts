import "server-only";

const endpoint = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records";
export const eventSource = {
  name: "Ville de Paris · Que Faire à Paris",
  url: "https://opendata.paris.fr/explore/dataset/que-faire-a-paris-/",
  license: "ODbL",
  licenseUrl: "https://opendatacommons.org/licenses/odbl/1-0/",
};
export type CulturalEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  timezone: "Europe/Paris";
  schedule: string;
  venue: string;
  address: string;
  lat: number | null;
  lon: number | null;
  types: string[];
  price: "free" | "paid" | "unknown";
  priceDetail: string;
  url: string;
  updatedAt: string | null;
};
export type EventsResult = {
  supported: boolean;
  events: CulturalEvent[];
  checkedAt: string;
  source: typeof eventSource;
  period: { from: string; to: string };
  bounded: true;
};
export class EventsError extends Error {}

function text(value: unknown, max = 300): string {
  if (typeof value !== "string") return "";
  // Project to plain text only. React escapes the result; never inject source HTML.
  return value.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(nbsp|amp|quot|apos|lt|gt);/gi, (_, name: string) => ({ nbsp: " ", amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" })[name.toLowerCase()] || " ")
    .replace(/\s+/g, " ").trim().slice(0, max);
}
function date(value: unknown): string | null {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value)) ? value : null;
}
function safeUrl(value: unknown): string | null {
  try {
    if (typeof value !== "string") return null;
    const url = new URL(value);
    return url.protocol === "https:" && ["paris.fr", "www.paris.fr"].includes(url.hostname) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
function normalize(row: unknown, from: number, to: number): CulturalEvent | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const id = text(String(r.id ?? ""), 80), title = text(r.title, 200);
  const start = date(r.date_start), end = date(r.date_end), url = safeUrl(r.url);
  const venue = text(r.address_name), street = text(r.address_street);
  if (!id || !title || !start || !end || !url || (!venue && !street) || text(r.address_city).toLowerCase() !== "paris") return null;
  const a = Date.parse(start), b = Date.parse(end);
  if (b < a || b < from || a > to) return null;
  const point = r.lat_lon && typeof r.lat_lon === "object" ? r.lat_lon as Record<string, unknown> : {};
  const lat = typeof point.lat === "number" && Math.abs(point.lat) <= 90 ? point.lat : null;
  const lon = typeof point.lon === "number" && Math.abs(point.lon) <= 180 ? point.lon : null;
  const price = text(r.price_type).toLowerCase();
  return {
    id: `paris-event:${id}`, title, start, end, timezone: "Europe/Paris",
    schedule: text(r.date_description, 500), venue: venue || street,
    address: [street, text(r.address_zipcode), "Paris"].filter(Boolean).join(", "),
    lat, lon,
    types: [...new Set(text(r.qfap_tags, 500).split(";").map(t => t.trim()).filter(Boolean))].slice(0, 12),
    price: price === "gratuit" ? "free" : price === "payant" ? "paid" : "unknown",
    priceDetail: text(r.price_detail, 350) || (price && price !== "gratuit" && price !== "payant" ? text(r.price_type) : ""),
    url, updatedAt: date(r.updated_at),
  };
}

/** Bounded municipal browse, deliberately separate from place/Twin taste ranking. */
export async function discoverEvents(city: string, now = new Date()): Promise<EventsResult> {
  const from = new Date(now);
  // Stable hour bucket lets Next reuse the municipal response across visitors.
  from.setUTCMinutes(0, 0, 0);
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 30);
  const result: EventsResult = { supported: city.trim().toLowerCase() === "paris", events: [], checkedAt: now.toISOString(), source: eventSource, period: { from: from.toISOString(), to: to.toISOString() }, bounded: true };
  if (!result.supported) return result;
  const url = new URL(endpoint);
  url.searchParams.set("limit", "50");
  url.searchParams.set("where", `date_end >= date'${from.toISOString()}' AND date_start <= date'${to.toISOString()}' AND address_city = 'Paris'`);
  url.searchParams.set("order_by", "date_start ASC");
  url.searchParams.set("select", "id,title,date_start,date_end,date_description,address_name,address_street,address_zipcode,address_city,lat_lon,qfap_tags,price_type,price_detail,url,updated_at");
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" }, redirect: "error",
      signal: AbortSignal.timeout(8000), next: { revalidate: 900 },
    });
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) throw new EventsError("events_unavailable");
    const reader = response.body?.getReader();
    if (!reader) throw new EventsError("events_unavailable");
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 2_000_000) { await reader.cancel(); throw new EventsError("events_unavailable"); }
      chunks.push(value);
    }
    const data = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { results?: unknown };
    if (!Array.isArray(data.results)) throw new EventsError("events_unavailable");
    const seen = new Set<string>();
    for (const row of data.results.slice(0, 50)) {
      const event = normalize(row, from.getTime(), to.getTime());
      if (event && !seen.has(event.id)) { seen.add(event.id); result.events.push(event); }
    }
    return result;
  } catch { throw new EventsError("events_unavailable"); }
}
