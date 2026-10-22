# Handover — 22 October 2026 (UI/UX reset, updated end of day)

Continues `docs/25-handover.md`. The morning session reviewed the whole UI, UX and copy, turned the findings into a spec and tickets, decided the structural and visual questions with the owner, and shipped the first fixes and the visual foundation (PR #35). The afternoon session merged PR #35, replaced the palette, added the Qloo vs AI page and closed 11 more tickets.

## Where things are

- **Branch:** everything is on `claude/blissful-gauss-dymbeo` (the owner's main branch; there is no `main`). PR **sararr25/TPD#35** is merged. Last commit: `ef91b9d`.
- **Worktree setup:** a new worktree needs `.env.local` from the main checkout (`ln -s ../../../.env.local .env.local`, git-ignored) and `npm ci`. The project uses npm, not pnpm.
- **Spec and tickets:** spec issue **#3**, sub-issues **#4–#34**. Blocking edges are GitHub-native dependencies. Read each issue's **comments** as well as its body, because later decisions changed several tickets.
- **Decisions:** `docs/adr/0001`–`0004` and `GLOSSARY.md`. These are binding for every remaining ticket. ADR 0004 now has a **palette amendment** (see below).
- **Agent skills:** `mattpocock/skills` live under `.agents/skills/`. Tracker config is in `docs/agents/`. In cloud sessions `gh` GraphQL is blocked: use `gh api` (REST) or the GitHub MCP tools.
- **Owner rules still in force:**
  - Mockups go only in chat or private artifacts, never in the repo.
  - Split work across subagents: Haiku for mechanical work, Sonnet for normal coding, Opus for design.
  - Push every finished, verified commit to `claude/blissful-gauss-dymbeo`.

## Done — morning (PR #35, merged)

| Ticket | What |
|---|---|
| #3 | Spec: full UI/UX/copy review, with 31 sub-issues |
| #4–#7 | Decided with the owner via `/loop-me`, closed. See ADR 0001–0004. |
| #8 | "Find its twin" on a card opens Swap with that place selected (`?q&category&ref`) |
| #11 | `/explore` lists every city |
| #12 | The mobile header fits at 375 px; sign-in is a small link |
| #14 | Swap results use the shared `PlaceCard` |
| #16 | ♡ saves in one tap into "{City} trip", with Undo and Change |
| #17 | Deleting a list uses the site dialog |
| #19 | Developer jargon and duplicate disclaimers removed |
| #25 | Tokens, Instrument Serif + Hanken Grotesk, one button and one toggle system, CSS split by component |

## Done — afternoon

| Commit | Ticket | What |
|---|---|---|
| `3ac0655` | (D6, docs/20) | **Qloo vs AI page** at `/compare`, linked in the footer. The same example Passport is asked of Qloo and of a free general AI model via **Pollinations.ai**, which needs no key. The request is server-side in `src/lib/server/llm.ts` and `/api/compare`. It uses `text.pollinations.ai/openai` because `gen.pollinations.ai` now asks server requests for a key (401). There is no uptime guarantee; failures are shown, not hidden. |
| `f8cb2cf`, `e2e40a1` | — | **New palette, "Berry and lemon on cool stone"**: background `#E8E9EB`, paper `#F8F8F9`, ink `#1E1630`, berry `#7E2B8F` (buttons and small marks), lemon `#FFE14D`, red stamp unchanged. **Large areas** (hero, Passport cover, city header) use the desaturated `--pass` `#6B4A73`. The big yellow band uses `--sun-soft` `#F6EDC4`. The owner asked for this: a full-saturation colour on big surfaces "is a punch in the eye". Contrast is in the `tokens.css` header. ADR 0004 is amended. The share-card PNG colours (`/api/passport-card`) are updated too. |
| `835af1f` | #13 | The Home promises the quiz it opens ("about 3 minutes"), per ADR 0002 |
| `7e6cb76` | #10 | Swap works without a Passport: the starting place alone is used, and a "Make it mine" banner appears. Covered in `check-discovery` |
| `53e78c7` | #9 | "For you / Swap a place" are real in-page tabs on the city page (`?tab=swap`, Back works). Swap is embedded via `SwapWorkspace({ fixedCity, embedded })` |
| `ee43d37` | #18 | Filtering from **live tags**. "Rua nova do Carvalho" is not a street in Qloo: it is the Pink Street bar, mis-genred as a restaurant. **Rule:** a bar category, with no restaurant category and no kitchen sub-genre, means "not a restaurant" (this also catches Pensão Amor). Supermarket, grocery, convenience and department-store genres are off-category. Lisbon keeps 21 of 30 restaurants |
| `e96066d` | #15 | Keep / Change as 44 px pills per trait (neutral default), one explanatory sentence, and a live "Keeping… Changing…" summary. Each result shows "Keeps / Changes", computed from the choices used for that search |
| `2c1b708` | #20 | **Place page** `/<city>/<qloo-id>`: photo with city-cover fallback, address, chips, Save, Directions, map and **Find its twin** (restaurants and museums only). It is loaded by id via Qloo `/entities` in `placeById`, and gives 404 for an unknown or wrong-city place. Cards on the city page, Swap and Saved link to it. There is no "Why it fits you", because Qloo gives that only on Passport searches; an honest "Make your Passport" line is shown instead |
| `119afc4` | #21 | `/swap?city=…` redirects (307) to `/<city>?tab=swap`, keeping `q/category/ref`. `/swap` with no city still asks for one |
| `51fa427` | #22, #24 | **#22:** the quiz opens as a `<dialog>` from Home, city, place and Swap ("Make your Passport"); closing returns to the same state. Pages refresh through the `tpd:passport-changed` event, and the shared finish logic is in `src/lib/quiz-finish.ts`. The end screen offers "Save with Google". "Learned from you" is on `/passport`. A taste is **strong** at ≥ 5 agreeing votes and ≥ 2× the opposite; a toast appears when a vote makes a taste strong. **#24:** below 720 px there is a bottom tab bar (Cities · Swap · Saved · Passport, 56 px items), and the top bar shows only the logo and sign-in. `viewport-fit=cover` is set |
| `ef91b9d` | #23 | `/passport` is the profile: favourites, visual Passport, share card, read-only "Learned from you", and "Your picks so far" (replaces the old placeholder preview). `/passport/settings` holds Undo for votes, hidden places, delete Passport and delete account |

## Verified (afternoon)

- `npm run typecheck`, `npm test` (exit 0) and `npm run build` pass on `ef91b9d`.
- Local production build in the browser:
  - `/compare` gives both sides for Lisbon restaurants.
  - Home and Passport show the new palette.
  - Swap without a Passport (Time Out Market → 3 alternatives).
  - City Swap tab: header kept, `?tab=swap`, Back works.
  - Keep / Change pills are 44 px; the summary and the labels per result work.
  - Lisbon card → place page → Find its twin lands in the Swap tab with the place selected.
  - Home "Swap a full place" → `/lisbon?tab=swap&q=…`.
  - Quiz panel opens and closes on `/lisbon` without leaving the page.
  - Tab bar at phone width; the footer is not covered.
  - `/passport` and `/passport/settings` with the example Passport.

## Not done / known problems

- **Vercel production not checked** after any afternoon commit. The owner is checking it next.
- **Not clicked through in a browser:**
  - the full 18-question quiz;
  - the "learned" toast live (covered only by `check-feedback`);
  - Google sign-in from the quiz end;
  - Undo, Show again, delete Passport and delete account on `/passport/settings`;
  - the place page on desktop (two columns);
  - Swap run to results inside the city tab (it was run on `/swap`).
- **Known rough edges:**
  - Sign-in from the quiz end returns to `/passport`, not the page you were on.
  - A "learned" toast can replace the "Saved… Undo" toast on the same save, because only one toast shows at a time.
  - Without a Passport, Swap result cards still say "Why it fits you" (belongs in #29, the copy rewrite).
  - The Home "Try this profile" (`/passport?guest=1`) opens the quiz. The example sits behind "I'd rather search for my favourites"; this was already so before.
  - Swap "keep" is a preference, not a filter. In one test only 1 of 3 results kept "Seafood", and the labels show this honestly.
  - Pollinations' legacy endpoint may start asking for a key, as `gen.` already does.
  - The place-page photo is whatever Qloo returns, which is not always of the place.
- **Leftovers from the morning:** per-city accent values are not set (`--city-accent` = `--pass`); `design-mockups/tokens.css` still has the Oltremare values.
- **Stray files:** untracked `pnpm-lock.yaml` and `pnpm-workspace.yaml` in the old `beesyde-mockup-workflow-e4d25b` worktree. They are safe to delete, but the auto-mode permission check blocked deleting them, so the owner should delete them by hand.
- **Preview pane quirk** (for agents): screenshots come back blank after scrolling, and on the phone preset the page reports 424×918 while the screenshot shows 375×812. Read values with JS (`elementFromPoint`, computed styles) instead of trusting the picture.

## Plan for the next steps

🔑 = needs the owner. Open tickets: #26–#34 (and the spec #3).

| # | Step | Why | Notes |
|---|---|---|---|
| 1 🔑 | Check everything on beesyde.vercel.app, on a phone too, and report screenshots of anything wrong | Nothing from the afternoon has been seen in production | — |
| 2 | Click through what is listed above as not verified, and fix what breaks | Settings flows and the quiz end are real user paths | — |
| 3 | #26 New direction on every page, #27 City page redesign, #28 Saved as a trip | The redesign. The structure (#20, #21) is now in place | The palette was just changed; keep `--pass`/`--sun-soft` for large areas |
| 4 | #29 Copy rewrite in the decided voice (ADR 0003) | Structure has settled; includes "Why it fits you" without a Passport | — |
| 5 | #30–#34: Home demo, filters, stamps (ADR 0002), share a trip, empty and loading states | Extras | See each issue's dependencies |

## Suggested skills for the next session

- `/code-review` before pushing.
- `/grilling` or `/loop-me` for any new product decision; record it as an ADR.
- `/tdd` for discovery-service changes.
- `/handoff` at the end of the session.
