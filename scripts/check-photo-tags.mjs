// #18: logo-like photos and off-category chips, on synthetic data.
import assert from "node:assert/strict";
import { logoLike, imageInfo } from "../src/lib/server/photo-check.ts";
import { chipTags, validPlace, explorePlace, barNotRestaurant } from "../src/lib/discovery.ts";

// Minimal PNG / JPEG headers with a chosen size, padded to `bytes`.
function png(w, h, colour, bytes) {
  const b = new Uint8Array(bytes);
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
  const v = new DataView(b.buffer);
  v.setUint32(16, w);
  v.setUint32(20, h);
  b[24] = 8;
  b[25] = colour;
  return b;
}
function jpeg(w, h, bytes) {
  const b = new Uint8Array(bytes);
  b.set([0xff, 0xd8, 0xff, 0xe0, 0, 4, 0, 0, 0xff, 0xc0, 0, 11, 8]); // APP0 stub, then SOF0
  const v = new DataView(b.buffer);
  v.setUint16(13, h);
  v.setUint16(15, w);
  return b;
}
assert.deepEqual(imageInfo(jpeg(420, 280, 9000)), { w: 420, h: 280, alpha: false });
assert.deepEqual(imageInfo(png(300, 300, 6, 9000)), { w: 300, h: 300, alpha: true });
assert.equal(imageInfo(new Uint8Array(50)), null);

const photo = jpeg(420, 280, 38000); // ~0.32 B/px: a real photo
assert.equal(logoLike("https://images.qloo.com/i/abc-420x-.jpg", "image/jpeg", photo), false);
assert.equal(logoLike("https://x/hard-rock-logo.jpg", "image/jpeg", photo), true); // URL hint
assert.equal(logoLike("https://x/a.svg", "image/svg+xml", photo), true);
assert.equal(logoLike("https://x/a.png", "image/png", png(420, 420, 6, 30000)), true); // alpha
assert.equal(logoLike("https://x/a.jpg", "image/jpeg", jpeg(420, 420, 6000)), true); // flat: 0.03 B/px
assert.equal(logoLike("https://x/a.jpg", "image/jpeg", jpeg(120, 120, 9000)), true); // tiny
assert.equal(logoLike("https://x/a.webp", "image/webp", new Uint8Array(30000)), false); // unknown format passes

// Tags: a bar Qloo also lists as a restaurant.
const t = (type, slug, name) => ({ id: `urn:tag:${type}:${slug}`, name, type: `urn:tag:${type}` });
const restaurant = t("genre", "place:restaurant", "Restaurant");
const bar = t("category", "place:bar", "Bar");
const sushiChip = t("cuisine:qloo", "sushi", "Sushi");
const dish = t("specialty_dish:place", "sushi", "Sushi");
const casual = t("ambience:qloo", "casual", "Casual");
const place = (tags) => ({
  id: "00000000-0000-4000-8000-000000000001",
  name: "Fictional Bar",
  type: "place",
  address: "Synthetic",
  city: "Lisbon",
  country: "PT",
  lat: 38.7,
  lon: -9.1,
  price: 2,
  popularity: 0.5,
  tags,
  closed: false,
  evidence: [],
});
const pensao = place([restaurant, bar, sushiChip, dish, casual]);
assert(barNotRestaurant(pensao));
assert(!validPlace(pensao, "Lisbon", "restaurant"));
assert(!explorePlace(pensao, "Lisbon", "restaurant"));
assert(explorePlace(pensao, "Lisbon", "bar")); // still a valid bar
assert.deepEqual(chipTags(pensao).map((c) => c.name), ["Casual"]); // no Sushi on the bar card
// Also a real restaurant (restaurant sub-genre): kept, chips kept.
const both = place([restaurant, bar, t("genre", "place:restaurant:sushi", "Sushi restaurant"), sushiChip]);
assert(!barNotRestaurant(both));
assert(explorePlace(both, "Lisbon", "restaurant"));
assert.deepEqual(chipTags(both).map((c) => c.name), ["Sushi"]);
// A plain restaurant is untouched.
assert(!barNotRestaurant(place([restaurant, sushiChip])));
console.log("PASS: logo-like photos and bar-as-restaurant picks are filtered.");
