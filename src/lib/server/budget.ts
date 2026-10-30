import "server-only";
import { createHash } from "node:crypto";
import { DiscoveryError } from "./qloo.ts";
import { store } from "./store.ts";

// Per-visitor request budget, shared across server instances.
// Each Swap costs one Qloo call plus up to three OpenStreetMap lookups.
export const WINDOW_MS = 10 * 60 * 1000;
export const LIMITS = { all: 200, swap: 50 };

// The IP is hashed with a server secret before storage; the raw IP is never kept.
export function visitor(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  return createHash("sha256")
    .update((process.env.QLOO_API_KEY || "") + "|visitor|" + ip)
    .digest("hex")
    .slice(0, 32);
}

export async function checkBudget(request: Request, isSwap: boolean) {
  const id = visitor(request);
  if ((await store().spend("all:" + id, WINDOW_MS)) > LIMITS.all)
    throw new DiscoveryError("rate_limited", 429);
  if (isSwap && (await store().spend("swap:" + id, WINDOW_MS)) > LIMITS.swap)
    throw new DiscoveryError("rate_limited", 429);
}
