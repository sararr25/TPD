# Handover — 21 October 2026

Continued from `docs/15-handover.md`.

## Where things are

- **Branch rule (from the user, until told otherwise):** every finished, verified commit is pushed to the main branch `claude/blissful-gauss-dymbeo` (fast-forward). There is no branch called `main`.
- **In production:** https://beesyde.vercel.app runs `26bd4bb` (Vercel deployment READY, target production). Everything below is live.
- **Worktree used:** `claude/passport-test-visual-profile-4d381b` (same commits as the main branch).
- **Database:** new table `user_feedback` applied to Neon (`npm run db:migrate`, additive).

## Done in this session

| Commit | What |
|---|---|
| `9ee999e` | **Quiz + visual passport.** 18 questions (was 12), situational ones ("first evening in a new city", "it rains all afternoon"…), a third answer **"Both, it depends on the day"** on every this-or-that. Trait model with no AI: 4 axes (Planner↔Spontaneous, Calm↔Lively, Thrifty↔Treat-seeker, Familiar↔Adventurous) + 4 interests (Culture, Food, Nature, Nightlife) → traveller type, e.g. "The Curious Flâneur". Passport page shows a passport data page (`passport-profile.tsx`) instead of the list of answers. |
| `2d51c3e` | **Site skeleton** `docs/17-site-skeleton.md`: 15 capabilities, who does what (Beesyde / Qloo / other sources), decisions D1–D7 closed with the user. |
| `f4677cd`, `befda2f` | **Qloo coverage audit** for 11 cities × restaurants, bars, museums, hotels, neighbourhoods, without and with two opposite Passports. Results and findings in `docs/18-destination-coverage.md`. |
| `90ee8f8` | **Quiz traits steer Qloo (C7)** (`qlooParams`): calm/adventurous → `filter.popularity.max`, familiar → `filter.popularity.min`, thrifty/treat → price level (restaurants & bars only), museums untouched, fallback to the Passport alone if < 3 results. **Category cleaning** (`offCategory`): hotels, toy shops, libraries, schools, canteens no longer pass as restaurants/bars. Two opposite profiles now share 0% of restaurants, bars and hotels in all 11 cities (was 30–90%). |
| `3f4bf8b` | **Swap in 11 cities**: city picker; per-city rules in `CITIES` (`src/lib/discovery.ts`): country + accepted place-city names (Tokyo's 23 wards, Porto parishes; Sintra is not Lisbon, the Hamptons are not New York). "Few museums" note for Osaka, Ho Chi Minh City, Hanoi; "no museums" for Phu Quoc. Banner now "11 CITIES". |
| `e49bca9` | **Explore a city** `/explore` (D2): pick a city + Restaurants/Bars/Museums/Hotels → 9 places from the Passport and quiz traits, no reference needed. First item in the nav; the Passport's "This feels like me" leads here. |
| `84ab894` | **Gradual feedback (D3)** `src/lib/feedback.ts`: "Yes, more like this" and "Not for me" on every Explore and Swap result. One vote = weak (reorders at most 3 positions). 5 agreeing votes on a taste tag (and ≥ 2× the opposite) = strong: "less" → `filter.exclude.tags`; "more" → those places first. Shown on the Passport ("Learned from your votes") with Undo. Stored in the browser and, signed in, in the account (`/api/feedback`, table `user_feedback`). |
| `26bd4bb` | **Swap Keep chips fixed**: Qloo ignores `signal.interests.tags` next to entity signals (checked live), so Keep did nothing. Now applied to Qloo's answer: with 3+ matching candidates only those compete for the 3 roles; otherwise they lead and the page says how many matched. |

## Verified

- `npm run typecheck`, `npm test` (19/19 PASS), `npm run build` after every commit.
- Live Qloo: coverage grids (`npm run verify:qloo-destinations`, `npm run verify:qloo-destinations-passport [-- --traits]`), Swap with a reference + 3 results in all 11 cities, Explore in Paris/Tokyo/Osaka/Phu Quoc, "more: Wine" → 9/9 wine places, Keep "Classic"/"Coffee and tea"/"Lively" → 3/3.
- Live database: `npm run verify:feedback` (temporary user, save/read/replace/delete, cascade on user deletion).
- Browser (local production build): quiz with "Both", visual passport (desktop and 375 px, no horizontal scroll), Swap city picker, Explore, Yes/Not for me, strong signal + Undo on the Passport.

## Not done / not verified

- **Nothing tested with a real signed-in Google user in this session** (account storage of feedback verified only through the database script).
- **Illustrations in the quiz** (still emoji): asked as "not urgent".
- **Neighbourhoods** not offered anywhere yet: Qloo localities mix real neighbourhoods with provinces/regions; needs a level filter (`docs/18`).
- **Events**: needs a Ticketmaster key — the user creates it and puts it in `.env.local` / Vercel env (never in chat or the repo).
- **Hotels** have no Qloo price level: price traits are not applied to them.
- **Museums don't personalise** in Osaka, Ho Chi Minh City, Hanoi (3–5 total) and are absent in Phu Quoc: stated in the UI.
- "Little Italy" (New York) still appears as a restaurant: Qloo tags it as a market, and markets are kept on purpose (Mercado de San Miguel).
- Quiz trait weights and thresholds are a first calibration, not validated with real users.
- Old guest/sample signals in `src/lib/passport.ts` (`SIGNALS`) still exist for the old prototype storage.
- Two untracked files in the worktree, `pnpm-lock.yaml` and `pnpm-workspace.yaml`, were created by mistake (the project uses npm); deleting them was blocked by the permission system. Safe to delete.

## Decisions taken with the user (details in `docs/17`)

- Home after the Passport = Explore a city (D2). All brief destinations from the start (D1). All categories in v1 (D4). Feedback gradual, strong at 5 agreeing votes (D3). Ticketmaster free tier for events. Hotels: affinity + Google Maps link, never "Book". Qloo vs LLM: separate demo page (D6). Quiz traits steer Qloo (D5). OSM now, Google Places only if a free tier fits (D7).

## Next steps, suggested order

1. Try it signed in on https://beesyde.vercel.app: quiz → Passport → Explore → a few Yes / Not for me → Passport "Learned from your votes" → another device.
2. Neighbourhoods: locality level filter, then add to Explore.
3. Ticketmaster key (user) → events in Explore.
4. User journey and UI pass (`ux-pro`, `ui-pro`), including quiz illustrations and the landing page (still the old "Make my Passport" landing).
5. Share card for the visual passport (E07).
6. Qloo vs LLM demo page (D6).
7. Geolocation ("I'm already here") in Explore.

## Useful commands

```bash
npm test
npm run build
npm run db:migrate
npm run verify:feedback
npm run verify:qloo-destinations
npm run verify:qloo-destinations-passport -- --traits
```

A new worktree needs `.env.local`: link or copy it from the main checkout (git-ignored).
