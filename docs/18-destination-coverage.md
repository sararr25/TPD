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

## Next checks

1. Same grid **with a Passport signal** (guest profile) to measure personal relevance per city.
2. Neighbourhood level filter.
3. Ticketmaster coverage per city, once the key exists.
