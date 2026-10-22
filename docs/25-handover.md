# Handover — 22 October 2026

Continued from `docs/20-handover.md` and `docs/24-structure-and-experience-reset.md`.

## Where things are

- **Branch rule (from the user):** every finished, verified commit is pushed to `claude/blissful-gauss-dymbeo`. There is no `main`.
- **Worktree used:** `claude/beesyde-mockup-workflow-e4d25b`. A new worktree needs `.env.local` from the main checkout (copy or `ln -s ../../../.env.local .env.local`; it is git-ignored) and `npm ci`. Without it, Qloo calls fail with "Discovery is not configured" and `npm run build` fails on missing `NEON_AUTH_*`.
- **Mockup rule (from the user):** mockups and "show me" requests are shown in the chat or as private claude.ai artifacts, never written into the repo or pushed. Two mockup commits from 21 Oct were removed (`90f6b4f`).
- **Working rule (from the user):** split larger tasks across subagents by model: Haiku for mechanical work, Sonnet for normal coding, Opus for design and reasoning.

## Done in this session

| Commit | What |
|---|---|
| `90f6b4f` | Removed the Home mockup files committed by mistake (`design-mockups/H1…`, `H2…`, `home-final*`). |
| `edb0b84` | **New Home ("Passport" direction A).** Dark passport cover hero with two entrances (Pick a city / Swap a full place), live Lisbon example as a "visa" card, 3 steps, city photo grid with region filters, Passport call to action, Qloo note. |
| `ef4751a` | **Blank-photo fallback.** Server checks each Qloo place photo once (`src/lib/server/photo-check.ts`); failed, non-image or < 4 KB photos become `null`. Pages then show the city cover (`src/lib/city-covers.ts`). |
| `d69113d` | **Consistent shell and pages.** New header (wordmark, sticky, nav: Cities · Swap a place · Saved · Your Passport), footer with links and the Qloo note, one button system, one `.page-head` pattern, dark city header, sentence-case labels, clearer expired-Passport message with "Refresh my Passport". |
| `ed39975` | Swap Restaurants/Museums toggle uses `.pill`; city page hides the empty map when there are no places. |

### How the pieces work

1. **Home** (`src/app/page.tsx`): `HomeSearch` switches between `HomeCitySearch` (datalist of `CITIES`, accepts local names, inline "We don’t cover that city yet" message) and `HomeSwapSearch` (unchanged logic → `/swap?city&q`). `HomeExample` is still the real guest-profile example through Lisbon. `HomeCities` renders covers from `city-covers.ts` with Europe / Asia / Americas filters.
2. **Photo check:** `withUsablePhotos()` runs in `discovery-service.ts` on Explore places, Explore neighbourhoods and Swap results, before the signed selection is built. It fetches the `-420x-` variant (3 s timeout) and caches the verdict per URL for the server process. The first sight of a new photo can add up to 3 s. A solid-black Qloo photo measured 1,359 bytes; real ones 30–45 KB.
3. **Client fallback:** `PlaceCard` and `HomeExample` show `cityCover(city)` when `image` is null or the `<img>` errors; text label only if the city has no cover (Phu Quoc).
4. **Shell:** links live in `src/components/nav-links.ts`, shared by header and footer. "Saved" is a label only; the route is still `/collections`. The sticky header moved the city map's sticky offset to 96 px.

## Verified

- `npm run typecheck`, `npm test`, `npm run build` pass (with real `.env.local`).
- Browser, local production build: Home, `/passport`, `/swap`, `/lisbon`, `/collections` render in the new style. Home example shows real Lisbon picks, and the black bar photo is replaced by the Lisbon cover. No horizontal scroll at 375 px on all five pages.

## Not done / not verified

- **Flows not clicked through after the restyle:** making a Passport, running a Swap, saving a place, signing in. Logic was not changed, but those steps were only seen at their first screen.
- **City page with real picks + map** not seen after `d69113d` / `ed39975`: the test browser's Passport is expired.
- Home search suggestions and region filters were not clicked in the real app (only in the artifact mockup).
- Vercel production not checked after these commits.
- **OpenStreetMap has no photos**, so it cannot replace Qloo photos. A small map for photo-less places is a possible follow-up, not built.
- Untracked `pnpm-lock.yaml` and `pnpm-workspace.yaml` in this worktree were created by `pnpm` and are safe to delete; the project uses npm (`package-lock.json`).
- `PRODUCT.md` / `DESIGN.md` for the Impeccable skill were not created.

## Plan for the next steps

🔑 = needs the user.

| # | Step | Why | Size | Done when |
|---|---|---|---|---|
| 1 🔑 | **Click-through on production**: Home → Pick a city → quiz → Passport → city picks → Save → Saved → Swap. On a phone too. | Every page was restyled; the flows between them were not walked. | S | Each step works on beesyde.vercel.app; fixes pushed. |
| 2 | **Delete stray pnpm files** in the worktree. | Clutter. | XS | Gone. |
| 3 | **Qloo vs LLM demo page (D6)** (carried from docs/20). | Shows why Qloo matters. | M | Separate page, honest labels, no key in client. |
| 4 | **Map for photo-less places** (optional). | OSM can show where a place is when Qloo and the city cover are missing. | S | Only when no photo; no extra API key. |
| 5 | Remaining items from docs/20 (events, geolocation, tidy-ups). | — | S–M | As there. |
