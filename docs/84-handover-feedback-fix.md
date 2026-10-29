# Handover — fix the 29 Oct feedback round properly

Date: 2026-10-29 · Branch: `claude/blissful-gauss-dymbeo` · Last commit: `ec376bc`

## Why this handover exists

The owner gave visual feedback on Cities, Passport, Places and the Twin (Matches) page.
Commit `ec376bc` claimed to address it, but the owner found that most of it was not done.
The plan behind that commit is in `docs/83-feedback-scale-plan.md`. Keep its decisions; ignore its "done" claims.

**Root causes of the failure. Do not repeat them:**
1. **Wrong page.** "Cities" means the cities index (`/explore`, "Choose your next city", `src/components/home-cities.tsx` ~L60). The previous session edited the single-city page (`/lisbon`, `src/components/city-view.tsx`) instead.
2. **Guessing.** It guessed what the "white pear" was instead of asking, and guessed wrong.
3. **Token-only scale pass.** It changed a few tokens, but many components hard-code `font-size`, `min-height` and padding, so the screen barely changed.
4. **Fake verification.** It looked at 40–60% scaled screenshots, checked one tab of one page, then wrote "checked every page". It never opened `/explore`, the Twin tab of a city, the "Other matches" list, the toast, or the Passport with 10 favourites.
5. **No mockups.** It shipped design decisions (the helix) without showing a mockup first. The owner's rule is mockups inline in chat first, approval second, code third.

## Owner's original feedback (verbatim, translated)

- **Cities:** the hero isn't OK. What is that horrible white "pear"? Change the animation: the yellow line makes no sense on Cities. Make the hero a bit smaller; it's too tall.
- **Passport:** the passport is too big. "Add what you love": why only 5?
- **Places:** tags far too big. Save / Not for me / Compare far too big, and it's unclear what they do. Make them coloured: everything is black and white, boring.
- **Matches (Twin):** the 3 little lines and the mini arrow are ugly. Play with DNA / family tree, since we talk about "twin". The yellow Save absolutely not; you can't tell saved from not saved. Buttons smaller. "Other matches" cards too big. **In general everything is enormous, so you don't know where to look. Rethink this.**

## Decisions already made (grill round, do not reopen)

- Twin visual: **DNA double helix** (shared traits = rungs). The concept is approved, but the current execution is not. Redesign it via mockup.
- Favourites: **3 min, 10 max**.
- Cities hero: **subtle city outline / pins** instead of the yellow route; hero ~40% shorter.
- Action buttons: **small coloured pills, icon + short label**, with a clear saved state.

## Current state after `ec376bc` (verified by the owner's screenshots)

| Area | State | Keep / redo |
|---|---|---|
| Action pills (`.btn-act` in `src/styles/buttons.css`, used in `place-card.tsx`, `save-button.tsx`, `place-comparison.tsx`) | Coloured pills with labels exist | Keep; re-check the saved state reads clearly |
| Tag chips (`src/styles/place-card.css`) | Smaller, colour-coded | Keep; verify on every card type |
| Favourites limit 3–10 (`MAX_ENTITIES` in `src/lib/quiz.ts`, used by the UI, quiz, `user-passport.ts`, `city-affinity.ts`, `discovery-service.ts`, `api/compare`) | Logic + tests pass | Keep; **not tested in the browser** |
| `/explore` Cities hero | **Untouched.** Yellow `JourneyRoute`, the white box with `JourneyAnimation` (= the "pear"), giant title, big region toggles | **Redo** |
| `/[city]` hero, For you tab | Shorter, the round stamp removed, `CityPins` added | Owner didn't ask for this page; harmless, but see the Twin tab bug |
| `/[city]` hero, **Twin tab** | `CityPins` overlaps the existing `CityInkMap` (footprints); the 3rd pin is clipped; still very tall; giant "Lisbon" | **Bug — fix** |
| Twin helix (`TwinHelix` in `swap-workspace.tsx`, `.twin-helix*` in `swap.css`) | Generic sine wave, grey rungs, one lit rung reads as a glitch, no explanation | **Redesign via mockup** |
| "See other matches" link / Other matches cards | Text still large; cards never checked | **Redo** |
| Global scale | Token tweak only; pages still feel enormous | **Redo page by page** |
| Toast (`src/components/toast.tsx`, `src/styles/toast.css`) | Huge; X on its own row; covers content; never auto-dismisses when it has actions | **Fix** |
| Passport book (`passport-folio.css`, appended block at the end) | Narrower (max 980px) | Re-check against the owner's expectation |

## Work to do

Do it in this order. Each step: **mockup in chat → owner approves → code → full-size verification.**

### 0. Setup
- Dev server: an instance may already run on port 3219 (`npm run dev -- -p 3219`). The project uses **npm** (package-lock.json); do not run pnpm, it creates stray lockfiles and fails on ignored builds.
- Verify at **1280×800 and 375×812, screenshots at scale 1** (or zoomed crops). Never judge from mini screenshots.

### 1. Size scale rethink (the core complaint)
- Audit every page touched below for hard-coded sizes: `grep -nE "font-size: ?[0-9]{2}px|clamp\(|min-height: ?(4[4-9]|5[0-9])px" src/styles/*.css`. Note `home.css`, `city.css`, `swap.css`, `passport-folio.css`, `toast.css`, `toggles.css`, `quiz*.css`.
- Propose in a mockup one hierarchy per page: **one** clear focal element, everything else visibly secondary.
- Targets: page hero ≤ ~40vh on desktop; h1 ≤ ~48px on desktop; secondary controls ~32px tall; body text 14–16px.
- Replace hard-coded sizes with tokens, so future changes are global.

### 2. `/explore` Cities hero (`src/components/home-cities.tsx` ~L60, styles in `home.css`, `travel-world.css`)
- Remove `JourneyRoute` (the yellow book→compass→pin line) and `JourneyAnimation` (the white rounded box on the right with the passport illustration: the "pear").
- Make the hero much shorter, the title smaller, the region toggles (`All / Europe / Asia / Americas`) smaller.
- Replace them with the approved "subtle city outline / pins" idea. Mockup it first, in the hero's actual proportions.

### 3. `/[city]` hero, Twin tab (`city-view.tsx`, `city.css`, `ink-journey.css`)
- `CityPins` must not render when `data-ink-cover` (Twin tab) is set, or the two drawings collide. Fix the clipped pin (the svg viewBox/height).
- The ink-map hero is too busy (footprints, grid, buildings, roundabout, arrows) and too tall. Simplify it and shrink it to match the For you tab.
- Verify **both tabs**.

### 4. Twin / Matches page (`swap-workspace.tsx` ~L558–660, `swap.css`)
- **Helix redesign:** mockup 2–3 options in chat first (e.g. a helix whose rungs are labelled with the shared traits; a small family-tree "your place → twin → cousins" for Other matches; a "% shared DNA" readout). It must explain *why* they match without extra reading.
- Rewrite the adjacent copy ("Listed in both places · Social") so it is human.
- "See other matches (n) ↓": smaller text, less banner-like (`.twin-other-link`).
- Other matches cards: smaller. Open them and verify they are compact and use the pills.
- Saved state on the twin card: obvious without the toast.

### 5. Toast (`src/components/toast.tsx`, `src/styles/toast.css`)
- **Auto-dismiss after 5 seconds, including toasts with actions** (Undo / Change). Today `toast.action || toast.secondary` blocks the timer (toast.tsx ~L61). Keep pause-on-hover/focus, so keyboard users can still reach Undo.
- Put the close X **on the same row** as the text and buttons (top right), not on its own line.
- Make it compact: smaller text, small buttons (reuse the small button size), less padding.
- Position it so it doesn't cover key content (e.g. bottom corner on desktop, above the bottom nav on mobile).

### 6. Passport
- Check the book size with the owner (mockup if they still find it big).
- **Test in the browser:** add 10 favourites; check the counter shows "x of 10", the 11th is blocked, and saving works signed-in and signed-out. If Qloo rate limits, wait or use the existing example data; say so explicitly if it can't be tested.

### 7. Places / pills final check
- Every card type (city For you, Twin spotlight, Other matches, saved lists, place page): pills render small and coloured, labels visible, saved = filled purple + "Saved", tooltips explain what each one does.

## Definition of done

- Owner approved a mockup for each of steps 1–4 (and for 5 and 6 if visual).
- `npm test` and `npm run build` pass. (There is no lint script.)
- Full-size screenshots, desktop + mobile, of: `/explore`, `/lisbon` (For you **and** Twin tab), a Twin result with Other matches open, the toast after Save, `/passport` with 10 favourites. Send them to the owner.
- The final report states plainly what was **not** verified. Never write "checked every page" unless every listed page was opened at full size.
- Commit with conventional messages; push to `claude/blissful-gauss-dymbeo` only after the owner has seen the screenshots.
