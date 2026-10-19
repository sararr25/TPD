import "server-only";
import { createHash } from "node:crypto";
import type { Entity, Tag } from "../discovery.ts";
export class DiscoveryError extends Error {
  code: string;
  status: number;
  constructor(code: string, status = 502) {
    super(code);
    this.code = code;
    this.status = status;
  }
}
type Json = Record<string, unknown>;
const object = (v: unknown): Json =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : {};
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const text = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 ? v : null;
const number = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;
const cache = new Map<
  string,
  { expires: number; data: unknown; checkedAt: string }
>();
const inflight = new Map<
  string,
  Promise<{ data: unknown; checkedAt: string }>
>();
let nextSlot = 0;
let blockedUntil = 0;
const MAX_CACHE = 100;
const TTL = 15 * 60 * 1000;
export async function qloo(
  path: "/search" | "/v2/insights" | "/v2/tags",
  params: Record<string, string>,
): Promise<{ data: unknown; checkedAt: string }> {
  const base = (
    process.env.QLOO_API_URL || "https://hackathon.api.qloo.com"
  ).replace(/\/$/, "");
  const key = process.env.QLOO_API_KEY;
  if (!key) throw new DiscoveryError("not_configured", 503);
  if (base !== "https://hackathon.api.qloo.com")
    throw new DiscoveryError("invalid_configuration", 503);
  const url = new URL(path, base);
  for (const [k, v] of Object.entries(params).sort())
    url.searchParams.set(k, v);
  const id = createHash("sha256")
    .update(key + "|" + url)
    .digest("hex");
  const existing = cache.get(id);
  if (existing && existing.expires > Date.now()) return existing;
  const pending = inflight.get(id);
  if (pending) return pending;
  if (blockedUntil > Date.now()) throw new DiscoveryError("quota", 429);
  const task = (async () => {
    const now = Date.now();
    const slot = Math.max(now, nextSlot);
    if (slot - now > 2500) throw new DiscoveryError("busy", 429);
    nextSlot = slot + 300;
    await new Promise((r) => setTimeout(r, Math.max(0, slot - now)));
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { "X-Api-Key": key },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new DiscoveryError("provider_unavailable", 502);
    }
    if (!res.ok) {
      if (res.status === 429) {
        blockedUntil = Date.now() + 60000;
        throw new DiscoveryError("quota", 429);
      }
      if (res.status === 401 || res.status === 403)
        throw new DiscoveryError("provider_access", 503);
      throw new DiscoveryError("provider_rejected", 502);
    }
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      throw new DiscoveryError("invalid_response");
    }
    if (object(data).success === false)
      throw new DiscoveryError("invalid_response");
    const result = { data, checkedAt: new Date().toISOString() };
    for (const [k, v] of cache) if (v.expires <= Date.now()) cache.delete(k);
    if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!);
    cache.set(id, { ...result, expires: Date.now() + TTL });
    return result;
  })();
  inflight.set(id, task);
  try {
    return await task;
  } finally {
    inflight.delete(id);
  }
}
export function normalizeEntity(value: unknown): Entity | null {
  const e = object(value),
    p = object(e.properties),
    geo = object(p.geocode),
    loc = object(e.location),
    q = object(e.query),
    ex = object(q.explainability);
  const id = text(e.entity_id),
    name = text(e.name);
  if (!id || !name) return null;
  const tags: Tag[] = list(e.tags).flatMap((v) => {
    const t = object(v),
      id = text(t.id) || text(t.tag_id);
    return id && text(t.name)
      ? [{ id, name: text(t.name)!, type: text(t.type) || "" }]
      : [];
  });
  const subtype =
    text(e.subtype) || list(e.types).find((t) => typeof t === "string") || "";
  const lat = number(loc.lat),
    lon = number(loc.lon);
  return {
    id: id.toUpperCase(),
    name: name.slice(0, 200),
    type: String(subtype).replace("urn:entity:", ""),
    context: text(e.disambiguation)?.slice(0, 300) || null,
    address: text(p.address),
    city: text(geo.city),
    country: text(geo.country_code),
    lat: lat !== null && Math.abs(lat) <= 90 ? lat : null,
    lon: lon !== null && Math.abs(lon) <= 180 ? lon : null,
    price: number(p.price_level),
    popularity: number(e.popularity),
    tags,
    closed: p.is_closed === true,
    evidence: ex.warning
      ? []
      : list(ex["signal.interests.entities"]).flatMap((v) => {
          const id = text(object(v).entity_id);
          return id ? [id.toUpperCase()] : [];
        }),
  };
}
export function entities(data: unknown): Entity[] {
  const root = object(data),
    results = root.results;
  const values = Array.isArray(results) ? results : object(results).entities;
  return list(values)
    .map(normalizeEntity)
    .filter((e): e is Entity => !!e);
}
export function localityMatches(data: unknown, city: string): boolean {
  const q = object(object(data).query);
  return list(object(q.localities).filter).some((v) => object(v).name === city);
}
export async function searchEntities(query: string, type: string) {
  const { data, checkedAt } = await qloo("/search", {
    query,
    types: "urn:entity:" + type,
    take: "8",
  });
  return { entities: entities(data).filter((e) => e.type === type), checkedAt };
}
