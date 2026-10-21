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

## Cleaning rule + quiz traits (C7), 21 Oct 2026

Both are in the app now and in the grid script (`npm run verify:qloo-destinations-passport -- --traits`).

**Cleaning rule** (`offCategory`): for restaurants and bars, drop a place that also carries a top-level genre `hotel`, `library`, `toy_store`, `hobby_store`, `clothing_store`, `wedding_service` or `educational_institution`, or whose only restaurant kind is `cafeteria`. An allowlist was tried first and rejected: it removed pubs, jazz clubs and flamenco tablaos, and "shopping"/"market" also cover real food places (Mercado de San Miguel, Kopke Wine House).

**Quiz traits → Qloo** (`qlooParams`):
| Profile | Parameter |
|---|---|
| Calm or adventurous (energy ≤ 40 or curiosity ≥ 60) | `filter.popularity.max` = 1 − 0.3 × strength (0.70–0.94) |
| Familiar (curiosity ≤ 35) | `filter.popularity.min` = 0.8 |
| Thrifty (spend ≤ 35), restaurants/bars only | `filter.price_level.max` = 2 |
| Treat-seeker (spend ≥ 65), restaurants/bars only | `filter.price_level.min` = 3 |
| Museums | nothing |

A budget the user picks in Swap wins over the quiz's price leaning. If fewer than 3 results survive, the Swap reruns with the Passport alone.

**Result, A (calm, adventurous, thrifty) vs B (lively, familiar, treat-seeker):** A∩B goes from 30–90% to **0% for restaurants, bars and hotels in all 11 cities**. Museums are unchanged (by design).

Two things the first trait run showed and that the rules above fix: hotels have no Qloo price level, so a price filter returned 0 hotels; and a popularity cap on museums left 0–5 odd results (a cement museum for Barcelona).

**In the app (Paris Swap from Le Baratin, guest Passport):** no quiz → Du Pain et des Idées, La Cave à Michel, La Crèmerie; calm + thrifty → Le Sentier, Le Petit Balcon, Chez Taeko (popularity 0.13–0.27, price 1–2); lively + treat → Les Enfants du Marché, Le Châteaubriand, Brutos (popularity 0.82–0.98, price 3–4).

Side effect to watch: tight filters shrink the pool in small places (Porto bars and Phu Quoc with the treat-seeker profile: 1–4 results). The app's fallback covers it; the Explore page will need the same.

## Next checks

1. ~~Neighbourhood level filter~~ Done 21 Oct, see "Neighbourhoods in Explore" below.
2. Ticketmaster coverage per city, once the key exists.
3. ~~Open the Swap to the other 10 cities~~ Done 21 Oct: city picker in Swap; per-city rules in `CITIES` (`src/lib/discovery.ts`): country + accepted place-city names (Tokyo's 23 wards, Porto's municipal parishes; Sintra/Cascais are not Lisbon, the Hamptons are not New York). Museums: "few" note for Osaka, Ho Chi Minh City, Hanoi; "none" for Phu Quoc. Live check: a reference + Swap returned 3 results in all 11 cities (restaurants), Barcelona and Osaka museums too.

## Finding: `signal.interests.tags` has no effect next to entity signals (21 Oct 2026)

Live check, Paris restaurants with a Khruangbin signal: adding `signal.interests.tags` (Japanese cuisine or Wine, weight none / 2 / 5) returned exactly the same top 8 as without it. `filter.exclude.tags` does work (no "Coffee" place survives an exclusion).

Consequences:
- **Feedback (D3)**: a strong "less" tag is sent as `filter.exclude.tags`; a strong "more" tag is applied by Beesyde, moving places that carry it to the top of what Qloo returned (`nudge` in `src/lib/feedback.ts`). Checked live: with "more: Wine" all 9 Explore results carry Wine (7 of 9 without).
- **Swap "Keep" chips** used the same parameter and did nothing. Fixed 21 Oct: Keep is no longer sent to Qloo; if 3+ candidates carry a kept feature only those compete for the three roles, otherwise they lead and the page says how many matched. Live check from Le Baratin: keeping "Classic", "Coffee and tea" or "Lively" gives 3/3 results with that feature (1–2/3 before).

## Neighbourhoods in Explore (21 Oct 2026)

**Level filter.** Qloo's `admin_level` means different things per country (Paris arrondissements 9, Madrid districts 9, Lisbon parishes 8, Hanoi districts 6), so a single number does not work. Each city in `CITIES` has a `hood`: the city proper as it appears among a locality's ancestors (Paris at 8, Lisboa 7, Porto 7, Barcelona 8, Madrid 8, New York City 5, 大阪市 7, Thành phố Hồ Chí Minh 4, Hà Nội 4, Phú Quốc 6). Only localities under it count, which drops the region, the province and nearby towns (Sintra, Cascais, Alcobendas, Westchester). Tokyo's wards hang off the old province 武蔵国 like Hachioji and Machida, so Tokyo uses any ward (`…区`) as the ancestor plus its 23 ward names. Also dropped: counties, "Community Board/Council", names with no Latin letters (Japanese chōme blocks). A Qloo description is not required: most Paris localities have none.

**Qloo does not personalise localities.** Opposite Passports (Taylor Swift / Barbie / Twilight vs Metallica / Pulp Fiction / Infinite Jest) get the same localities in the same order. So Beesyde ranks neighbourhoods itself: it runs the Passport's Explore searches for restaurants, bars and museums (quiz traits and votes included), gives each place to the nearest neighbourhood centre within 1.5 km (weighted by its rank), and shows up to 6 neighbourhoods with the Passport's places near them. Centres are points, so this is "close to", not "inside". The page says so.

**Two fixes after the first live check.** (1) The centre won for everyone: opposite Passports shared ~5 of 6 neighbourhoods. Now the same three searches also run without a Passport (the baseline, cached), and a neighbourhood ranks by how many more of *your* places it gets than the baseline predicts (observed minus expected, the idea behind lift / TF-IDF). (2) Boroughs and districts sat next to their own neighbourhoods ("Manhattan" beside SoHo): a locality is now dropped when another kept locality lists it as an ancestor, so the finer area wins. A place Qloo lists as both restaurant and bar counts once.

**Live check (all 11 cities; Passports Taylor Swift/Barbie/Twilight + lively, familiar, treat-seeker vs Metallica/Pulp Fiction/Infinite Jest + calm, adventurous, thrifty):** 6 neighbourhoods everywhere except Phu Quoc (Qloo has only 2 usable: Dương Đông, An Thới). Shared neighbourhoods out of 6: Paris 2, Lisbon 3, Porto 5, Barcelona 2, Madrid 2, New York 4, Tokyo 1, Osaka 2, Ho Chi Minh City 1, Hanoi 3 (before the fixes: about 5 everywhere). Without quiz answers the gain is smaller (3–5 shared), because the Passport alone moves Qloo's places less than the quiz traits do. Porto stays similar: its centre is small. No "Manhattan" or counties left.
