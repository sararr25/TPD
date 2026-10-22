import "server-only";
import type { Entity } from "../discovery.ts";

// Qloo sometimes returns a useless photo (e.g. a solid-black JPEG, ~1.3 KB;
// real ones at 420 px are 30-45 KB). images.qloo.com sends no CORS headers,
// so only the server can look. One verdict per URL per server process.
const MIN_BYTES = 4096;
// Logo-like photos (#18): a venue logo on a flat background. Heuristics on what
// the response already gives us, no image library: SVG, a "logo" word in the
// URL, PNG with an alpha channel (Qloo photos are JPEG), a small image, or a
// JPEG/PNG so smooth it compresses to < 0.05 bytes/pixel (real 420 px photos
// run ~0.2-0.4). Thresholds are estimates, not calibrated on live data; a
// logo photographed or padded with texture will pass, a very smooth photo
// (fog, empty sky) could be dropped, which only means the city cover shows.
const MIN_SIDE = 200;
const MIN_BYTES_PER_PIXEL = 0.05;

// Width/height/alpha from the first bytes of a PNG or JPEG; null if neither.
export function imageInfo(b: Uint8Array): { w: number; h: number; alpha: boolean } | null {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (b.length > 26 && v.getUint32(0) === 0x89504e47) {
    const type = b[25]; // IHDR colour type: 4 grey+alpha, 6 RGBA
    return { w: v.getUint32(16), h: v.getUint32(20), alpha: type === 4 || type === 6 };
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i + 9 < b.length; ) {
      if (b[i] !== 0xff) return null;
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
        return { w: v.getUint16(i + 7), h: v.getUint16(i + 5), alpha: false };
      i += 2 + v.getUint16(i + 2);
    }
  }
  return null;
}

export function logoLike(url: string, contentType: string, bytes: Uint8Array): boolean {
  if (contentType.includes("svg") || /logo/i.test(url.split("?")[0])) return true;
  const info = imageInfo(bytes);
  if (!info) return false; // unknown format (webp, ...): size check only
  if (info.alpha || Math.min(info.w, info.h) < MIN_SIDE) return true;
  return bytes.length / (info.w * info.h) < MIN_BYTES_PER_PIXEL;
}
const verdicts = new Map<string, Promise<boolean>>();

function cheapUrl(url: string) {
  return url.replace(/-\d+x-/, "-420x-");
}

async function check(url: string): Promise<boolean> {
  try {
    const res = await fetch(cheapUrl(url), { signal: AbortSignal.timeout(3000) });
    if (!res.ok || !(res.headers.get("content-type") ?? "").startsWith("image/")) return false;
    const bytes = new Uint8Array(await res.arrayBuffer());
    return bytes.length >= MIN_BYTES && !logoLike(url, res.headers.get("content-type") ?? "", bytes);
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
