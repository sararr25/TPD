import "server-only";
import type { Entity } from "../discovery.ts";

// Qloo sometimes returns a useless photo (e.g. a solid-black JPEG, ~1.3 KB;
// real ones at 420 px are 30-45 KB). images.qloo.com sends no CORS headers,
// so only the server can look. One verdict per URL per server process.
const MIN_BYTES = 4096;
const verdicts = new Map<string, Promise<boolean>>();

function cheapUrl(url: string) {
  return url.replace(/-\d+x-/, "-420x-");
}

async function check(url: string): Promise<boolean> {
  try {
    const res = await fetch(cheapUrl(url), { signal: AbortSignal.timeout(3000) });
    if (!res.ok || !(res.headers.get("content-type") ?? "").startsWith("image/")) return false;
    return (await res.arrayBuffer()).byteLength >= MIN_BYTES;
  } catch {
    // A failed check only drops this one photo (the city cover shows instead); it must not fail discovery.
    return false;
  }
}

export function photoUsable(url: string): Promise<boolean> {
  let verdict = verdicts.get(url);
  if (!verdict) {
    verdict = check(url);
    verdicts.set(url, verdict);
  }
  return verdict;
}

// Sets `image` to null on entities whose photo is unusable. Checks run in parallel.
export async function withUsablePhotos<T extends Entity>(list: T[]): Promise<T[]> {
  return Promise.all(
    list.map(async (e) => (e.image && !(await photoUsable(e.image)) ? { ...e, image: null } : e)),
  );
}
