# Qloo coverage — all destinations × categories (20 Oct 2026)

Run with `npm run verify:qloo-destinations` (live Qloo hackathon API, raw responses in `.private/qloo/destinations/`, git-ignored). Each check asks Qloo for up to 20 entities of one category inside one city (`filter.location.radius=0`), **without** a taste signal: it measures whether data exists, not how good the personal match is.

## Results (entities returned, max 20)

| City | Restaurants | Bars | Museums | Hotels | Neighbourhoods* |
|---|---|---|---|---|---|
| Paris | 20 | 20 | 20 | 20 | 18 |
| Lisbon | 20 | 20 | 20 | 20 | 18 |
| Porto | 20 | 20 | 20 | 20 | 18 |
| Barcelona | 20 | 20 | 20 | 20 | 17 |
| Madrid | 20 | 20 | 20 | 20 | 18 |
| New York | 20 | 20 | 20 | 20 | 19 |
| Tokyo | 20 | 20 | 20 | 20 | 17 |
| Osaka | 20 | 20 | **11** | 20 | 17 |
| Ho Chi Minh City | 20 | 20 | **10** | 20 | 19 |
| Hanoi | 20 | 20 | **8** | 20 | 19 |
| Phu Quoc | 20 | 20 | **0** | 20 | **8** |

Every place returned has the requested category tag and a street address (100% in every place check). Events are not a Qloo category: they need Ticketmaster (key still to create, see `docs/17`).

\* Neighbourhoods = Qloo localities that sit inside the city. Qloo names the parent city in the local language (Lisboa, 大阪, Hà Nội…; Tokyo wards hang off the old province 武蔵国), so the script matches those names.

## What this means

- **All 11 destinations can go live** for restaurants, bars and hotels.
- **Museums:** thin in Osaka, Ho Chi Minh City and Hanoi (8–11), none in Phu Quoc. For these the UI must say "few museums in our data", and in Phu Quoc the museum category is hidden.
- **Neighbourhoods** exist everywhere, but the list mixes real neighbourhoods (Le Marais, Eixample, Hoàn Kiếm, District 1) with larger areas (Community of Madrid, Barcelonès, Sintra/Cascais for Lisbon, "New York County"). Before showing them we need a filter on the locality level.

## Quality caveats (spot check of the samples)

- Category-only queries favour famous places (Arc de Triomphe and Café de Flore in Paris). The Passport signal is what makes results personal; that is the next check.
- In Osaka and Phu Quoc the "restaurants" and "bars" are often hotel or resort restaurants (Hilton Osaka, InterContinental Phu Quoc). Acceptable for Phu Quoc; for Osaka we should down-weight hotels in the restaurant category.
- Bars use the tag `urn:tag:category:place:bar` (`urn:tag:genre:place:bar` does not exist and returns nothing).

## With a Passport signal (21 Oct 2026)

Run with `npm run verify:qloo-destinations-passport` (needs the baseline above first). Two opposite Passports, top 10 per city × category:
- **A** — Khruangbin, Nina Simone, *Before Sunrise*
- **B** — Daft Punk, Bad Bunny, *Mad Max: Fury Road*

"New" = share of the Passport's top 10 not in the no-signal top 10 (does the Passport move away from the famous places?). "A∩B" = share of A's top 10 that B also returns (do two different people get different places? lower is better).

| City | Restaurants new / A∩B | Bars | Museums | Hotels |
|---|---|---|---|---|
| Paris | 90% / 50% | 100% / 50% | 35% / 70% | 100% / 50% |
| Lisbon | 95% / 50% | 80% / 40% | 70% / 70% | 90% / 60% |
| Porto | 80% / 60% | 80% / 70% | 20% / 90% | 95% / 50% |
| Barcelona | 100% / 80% | 95% / 40% | 50% / 80% | 90% / 30% |
| Madrid | 80% / 40% | 80% / 40% | 50% / 80% | 95% / 60% |
| New York | 90% / 40% | 90% / 30% | 70% / 40% | 90% / 20% |
| Tokyo | 100% / 50% | 100% / 50% | 60% / 80% | 85% / 40% |
| Osaka | 100% / 50% | 85% / 50% | 0% / 100% (5 results) | 85% / 50% |
| Ho Chi Minh City | 85% / 50% | 80% / 80% | 0% / 100% (4) | 100% / 60% |
| Hanoi | 90% / 70% | 75% / 80% | 0% / 100% (3) | 90% / 70% |
| Phu Quoc | 60% / 80% | 55% / 80% | — (0) | 65% / 80% |

"New" is the average of A and B.

### What it shows

1. **The Passport works against "famous by default".** For restaurants, bars and hotels 80–100% of the top 10 changes once a Passport is added (Paris: Café de Flore → Café Bords de Seine; Barcelona → flamenco tablaos and Bar Boqueria).
2. **But two opposite people still share about half their results** (A∩B 40–60% in the big cities, 70–80% in Hanoi, HCMC bars and Phu Quoc). Three entities alone are a weak signal on a small pool. This is the strongest argument for **C7** (quiz traits steering popularity, price and diversity) and for Keep/Change tags.
3. **Museums don't personalise in thin cities.** Osaka, Ho Chi Minh City and Hanoi return only 3–5 museums with a Passport, identical for A and B. Show them as "the museums in our data", not as "picked for you".
4. **Category noise that a user would notice:** Goethe-Institut and a university cafeteria as Madrid "restaurants", Pokémon Center as an Osaka restaurant, "Little Italy" (a neighbourhood) as a New York restaurant, hostels and hotels under "bars", a Phu Quoc hotel as a "bar". Results need a cleaning step (e.g. drop places whose main category differs, or that are hotels when the category isn't hotel).

## Next checks

1. Cleaning rule for category noise, then rerun.
2. C7: add popularity/price/diversify from quiz traits and check that A∩B drops.
3. Neighbourhood level filter.
4. Ticketmaster coverage per city, once the key exists.
