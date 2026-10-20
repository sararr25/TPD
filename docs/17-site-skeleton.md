# Beesyde — Site skeleton (draft v0, 20 Oct 2026)

Goal: fix **what the site does** and **who does what** (Beesyde code, Qloo, other sources) before redesigning the user journey and UI. Builds on `docs/02-b2c-product-structure.md`; this file replaces its §3–4 once the open decisions below are closed.

Legend: ✅ built and live · 🟡 built, limited · ⬜ not built.

## 1. Capability map

| # | Capability | What the user gets | Beesyde (our code) | Qloo | Other sources | Status |
|---|---|---|---|---|---|---|
| C1 | Taste Passport — quiz | 18 questions → traveller type, 4 axes, 4 interests | Trait scoring (no AI), storage local + account | — | — | ✅ |
| C2 | Taste Passport — signals | 3–5 artists/films/books/places | Search UI, signed choices | Entity search (`/search`) → entity IDs | — | ✅ |
| C3 | Visual passport | Passport "data page" on the profile | Rendering | — | — | ✅ |
| C4 | Swap | "The place I wanted is full/not for me" → 3 alternatives | Reference resolution, Keep/Change chips, 3 roles, constraints | Insights with entity + tags signals, `filter.exclude.tags`, price, popularity, location | OpenStreetMap: identity/address check | 🟡 11 cities (21 Oct), restaurants + museums |
| C5 | Transfer | Same taste, another category | Category switch | Same signals, different `filter.type`/tags | — | 🟡 restaurant → museum, Paris |
| C6 | Explore Within ("I'm already here") | Places for me in this city, no reference | Same pipeline without reference | Insights with Passport only, `sort_by=distance` | Geolocation (browser) | ✅ /explore (21 Oct): 11 cities × restaurants, bars, museums, hotels; no geolocation yet |
| C7 | Profile → results | Calm → fewer crowded places; thrifty → cheaper; adventurous → wider swaps | Map axes to Qloo params | `filter.popularity`, `bias.trends`, `filter.price_level`, `diversify` | — | ✅ in Swap (docs/18) |
| C8 | Feedback | "Not for me" hides a place; "Yes" strengthens | Hidden list, exclusions | `filter.exclude.entities`; positive → add entity to signals | — | 🟡 negative only |
| C9 | Collections | Save places by trip/city | Account storage | — | — | ✅ |
| C10 | Account | Google login, delete everything | Neon Auth + Postgres | — | Google | ✅ |
| C11 | Shareable passport (E07) | Image/link of the passport | Image export, public link without private data | — | — | ⬜ |
| C12 | Destinations | Which cities work | Coverage check per city/category | Insights coverage | — | ✅ 11 cities in Swap (docs/18) |
| C13 | Practical info | Opening hours, map, directions | Show + label "not verified" | — | Google Places (L1) or OSM; maps link | 🟡 address only |
| C14 | Events | Concerts/shows tonight | — | — | Ticketmaster | ⬜ |
| C15 | Qloo vs LLM | Side-by-side proof for the demo | Cached cases | — | LLM | 🟡 data collected, no UI |

## 2. Responsibility split (rule)

- **Qloo**: taste affinity only — which entities/places fit the signals, tags, popularity, price level. Never availability, hours, or "is it open".
- **Beesyde**: the person's profile (quiz traits), constraints, the three roles, explanations, storage, and every honest label ("not verified").
- **Other sources**: facts about the place (identity, address, hours, events). Free/keyless first (OSM), paid only if needed.

## 3. Open decisions (recommendation first)

| # | Decision | Recommendation | Why |
|---|---|---|---|
| D1 | Next cities after Paris | Run the coverage check on 5 cities (Lisbon, Barcelona, New York, Tokyo, Ho Chi Minh) and keep only those where Qloo returns ≥ 3 good results per category | "Yes / Not for me" is weak with one city; don't claim cities we haven't tested |
| D2 | Main entry after the passport | **Explore Within** as home ("Pick a city → places for you"), Swap as second action | Swap needs a reference place; most users don't have one yet. Explore uses the passport immediately |
| D3 | Positive feedback | "Yes, more like this" adds the place as a Passport signal (max 5, oldest out) | Makes feedback visible in the next results |
| D4 | Categories in v1 | Restaurants/bars + museums/culture + neighbourhoods | Already proven or cheap; hotels and events later |
| D5 | Quiz ↔ signals | Quiz traits steer Qloo parameters (C7); entity cards stay the Qloo signals | Keeps "no AI" and makes the quiz matter |
| D6 | Qloo vs LLM in the product | Demo-only page, not in the main flow | It's proof for judges, not a user need |
| D7 | Practical info | OSM now, Google Places only for hours if a free tier fits | Running costs near zero |

## 3b. Decided (round 1, 20 Oct)

- **D2 — Home = Explore a city.** After the passport, the main page is "pick a city → places for you". Swap becomes an action on a place.
- **D1 — All the brief's destinations from the start:** Paris, Portugal (Lisbon, Porto), Spain (Barcelona, Madrid), New York, Japan (Tokyo, Osaka), Vietnam (Ho Chi Minh City, Hanoi, Phu Quoc). Each city/category still gets a Qloo coverage check; where results are thin the UI says so instead of showing weak picks.
- **D4 — All categories in v1:** restaurants & bars, museums & culture, neighbourhoods, hotels, events.
- **D3 — Feedback is gradual.** One "Yes" / "Not for me" is a *weak* signal (much lighter than the passport's own choices). When several answers agree on something similar (same Qloo tag, e.g. "natural wine", "rooftop"), it becomes a *strong* signal and changes the passport: promoted to a Keep tag (yes) or an excluded tag (no).

## 3c. Decided (round 2, 20 Oct)

- **D3 threshold: 5 agreeing answers** on the same Qloo tag make it a strong passport signal (Keep tag for yes, excluded tag for no). The passport shows it and the user can undo it.
- **Events: Ticketmaster Discovery API (free tier).** The user creates the key; it goes in `.env.local` / Vercel env, never in the repo. Weak coverage in Japan and Vietnam is stated in the UI.
- **Hotels: affinity from Qloo + external Google Maps link.** Label "prices and availability not verified"; never a "Book" button.
- **D6 — Qloo vs LLM: separate demo page**, outside the user journey.
- **D5, D7:** recommendations accepted by default (quiz traits steer Qloo parameters; OSM now, Google Places only if a free tier fits).

## 4. After the skeleton

1. Close D1–D7.
2. User journey (one flow per capability) → `ux-pro`.
3. UI pass, illustrations in the quiz → `ui-pro`.
