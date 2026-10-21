# Handover — 21 October 2026 (afternoon)

Continued from `docs/19-handover.md`.

## Where things are

- **Branch rule (from the user):** every finished, verified commit is pushed to the main branch `claude/blissful-gauss-dymbeo`. There is no branch called `main`.
- **In production:** https://beesyde.vercel.app serves `/explore` with the Neighbourhoods category (checked: page returns 200 and contains it).
- **Worktree used:** `claude/leggi-handover-e6e145`. A new worktree needs `.env.local` linked from the main checkout (`ln -s ../../../.env.local .env.local`) and `npm ci`.

## Done in this session

| Commit | What |
|---|---|
| `de91cc8` | **Neighbourhoods in Explore.** Details and numbers in `docs/18-destination-coverage.md` → "Neighbourhoods in Explore". |

How it works, in short:

1. **Which localities count** (`isNeighbourhood`, `withoutParents` in `src/lib/discovery.ts`): each city in `CITIES` has a `hood` = the city proper as a Qloo ancestor (name + `admin_level`, which differs per country). Only localities under it are kept; counties, community boards/councils and non-Latin names are dropped; a locality that contains another kept one is dropped (Manhattan above SoHo). Tokyo uses any ward (`…区`) plus its 23 ward names.
2. **Ranking** (`rankNeighbourhoods`): Qloo does **not** personalise localities (same order for opposite Passports, checked live). So the app runs the Passport's Explore searches for restaurants, bars and museums, assigns each place to the nearest neighbourhood centre within 1.5 km, and compares with the same searches **without** a Passport (baseline). Ranked by "more of your places than the baseline predicts" (observed − expected). Up to 6 neighbourhoods, each with "Close to your picks: …".
3. **UI:** Neighbourhoods chip; card shows Qloo's description when present, nearby picks, Maps link, "Not for me" (hides, no taste vote). No "Yes, more like this": localities have no taste tags.

## Verified

- `npx tsc --noEmit`, `npm test` (20/20 PASS, new checks for the filter, parent pruning, baseline ranking, de-duplication), `npm run build`.
- Live, all 11 cities, two opposite Passports with quiz answers: 6 neighbourhoods everywhere except Phu Quoc (2). Shared out of 6: Paris 2, Lisbon 3, Porto 5, Barcelona 2, Madrid 2, New York 4, Tokyo 1, Osaka 2, Ho Chi Minh City 1, Hanoi 3 (about 5 before the baseline).
- Browser (local production build): Paris Neighbourhoods, no duplicated picks, no horizontal scroll at 375 px.

## Not done / not verified

- **Still nothing tested with a real signed-in Google user** (carried over from docs/19).
- Production `/explore` Neighbourhoods not clicked through on Vercel (only the page HTML checked).
- One Neighbourhoods request costs **7 Qloo calls** (1 localities + 3 Passport + 3 baseline; localities and baseline are cached). The visitor budget counts it as one Explore. Watch Qloo usage.
- Without quiz answers the ranking differs less (3–5 of 6 shared). Porto stays similar (small centre). Phu Quoc has only 2 usable areas.
- Paris names mix levels ("2nd arrondissement of Paris" next to "Le Marais"): correct but uneven.
- Untracked `pnpm-lock.yaml` / `pnpm-workspace.yaml` in the old worktree are still safe to delete (docs/19).

## Plan for the next steps

Ordered by value for the hackathon demo vs effort. 🔑 = needs the user.

| # | Step | Why | Size | Done when |
|---|---|---|---|---|
| 1 🔑 | **Signed-in walkthrough on production**: quiz → Passport → Explore (all 5 categories incl. Neighbourhoods) → a few Yes / Not for me → Passport "Learned from your votes" → second device. | Account storage of feedback and the whole flow have never been tested with a real Google user. | S (user drives, Claude watches/fixes) | Every step works on beesyde.vercel.app; bugs fixed and pushed. |
| 2 | **User journey + UI pass** (`ux-pro`, `ui-pro`): new landing (still the old "Make my Passport" one), quiz illustrations instead of emoji, consistent Explore cards, mobile. | The demo is judged on first impression; landing and quiz are what judges see first. | L | Landing explains Beesyde in one screen; quiz has illustrations; checked at 375 px and desktop. |
| 3 | **Share card for the visual passport (E07)**: image of the passport data page to download/share. | Shareable artefact = memorable demo moment, low risk. | M | "Share my Passport" produces a PNG with the traveller type; works on mobile. |
| 4 | **Qloo vs LLM demo page (D6)**: same Passport, side by side. | Shows why Qloo matters (the hackathon's point). | M | Separate page, honest labels, no API key in client. |
| 5 🔑 | **Events in Explore** (Ticketmaster free tier). The user creates the key and puts it in `.env.local` and Vercel env — never in chat or the repo. | Adds "what's on tonight"; only blocked on the key. | M | Coverage check per city, Events chip in Explore, empty-state where none. |
| 6 | **Geolocation "I'm already here"** in Explore: sort by distance from the user. | Useful on the trip, small with the code already there. | S | Permission asked only on click; denied = normal list. |
| 7 | **Tidy-ups**: Neighbourhood names at one level for Paris; remove old `SIGNALS` guest storage in `src/lib/passport.ts` if unused; recalibrate quiz weights after real users. | Quality, not features. | S–M | Each as its own small commit. |

Suggested next session: start with **1** (needs the user for ~10 minutes), then **2**.

## Useful commands

```bash
npm test
npm run build
npm run verify:qloo-destinations
npm run verify:qloo-destinations-passport -- --traits
npm run verify:feedback
```
