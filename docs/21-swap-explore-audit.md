# 21 — Swap & Explore audit: logic, UX, UI (21 Oct 2026)

Scope: Swap (`src/components/swap-workspace.tsx`, `src/lib/server/discovery-service.ts#swap`),
Explore (`src/components/explore-view.tsx`, `discovery-service.ts#explore`), shared
logic (`src/lib/discovery.ts#selectRoles`), landing (`src/app/page.tsx`).
Method: code reading + the reported case (Swap "Pizza 4P's" in Ho Chi Minh City).
Not done: no live Qloo run in this audit (each call costs budget). Every fix below
must be verified live before it counts as done.

---

## Part A — Logic bugs (fix first: they make the product look broken)

### A1. Keep/Change chips are about drinks, not about the place — CRITICAL
**Cause.** `chipTags()` (`discovery-service.ts:35-43`) takes the *first 6* tags whose type is
`ambience`, `cuisine:place`, `offerings:place` or `beverage_offering`, in the order Qloo
returns them. Drink/offering tags (beer, wine, cocktails, coffee) are numerous and come first.
The cuisine of a pizzeria is a **genre** tag (`urn:tag:genre:place:restaurant:pizza`), which
is not in `CHIP_TYPE` at all, so "pizza" can never be a chip.
~~Second defect: client/server chip mismatch.~~ Checked while fixing: not a bug. `lookup()`
already strips the reference to its category tag plus `chipTags()`, so the client list matches.
**Status (21 Oct): fixed.** Chips moved to `discovery.ts#chipTags` (ranked groups, generic
drinks dropped, de-duplicated by name). Live, Pizza 4P's Ben Thanh now shows: Fusion, Pizza,
Modern, Classy, Quick bite, Craft beer.
**Fix.**
1. Server returns an explicit `chips` array per reference (one source of truth); client renders only that.
2. Rank chips by usefulness, max 6: cuisine/sub-genre (`genre:place:restaurant:*`) → ambience → offerings → beverages last, at most 1–2 drink chips.
3. Drop generic tags almost every place has (e.g. beer, wine, dine-in, takeout) with a deny-list in `discovery.ts` (build the list from real HCMC/Paris responses, don't guess names).
4. Plain labels, grouped: *Food · Atmosphere · Extras*.
**Check:** `scripts/check-discovery.mjs` case: pizzeria reference → first chip is pizza/Italian, ≤1 drink chip.

### A2. "Because you like Pizza 4P's, Bad Bunny, Mad Max, Amélie" — CRITICAL
**Cause.** `selectRoles()` (`discovery.ts:311-320`) prints every signal that Qloo's explainability
lists for the place. Signals = reference + whole Passport, so the text (a) names the place you
are swapping away from and (b) names cross-domain artists/films as if they were the reason.
Qloo's explainability means "this entity nudged the score". That's true, but it means nothing to a person.
**Fix.**
1. Never name the reference in "why". Instead an anchor line: "Like Pizza 4P's: pizza, casual" (= kept chips this place actually has).
2. Explanation = **shared tags first** (concrete, checkable).
3. Passport names only as a soft second line, max 1, only for taste-heavy categories (museum, bar, neighbourhood), phrased honestly ("Fits your taste for Amélie"). Restaurants: no artist/film names.
4. No shared tag → "Close to your taste profile". No invented names.
**Check:** unit test on `selectRoles`: reference never in `why`; restaurant `why` has no artist/movie names.

### A3. The reference is drowned out by the Passport — HIGH
**Cause.** `signals = [ref, ...passport]` (`discovery-service.ts:221`): the reference weighs the
same as each of 3–5 Passport items. A swap must look like the place first, like you second.
**Fix.** Check Qloo's docs for signal weighting (docs/08) before coding; do not assume a syntax.
Fallback that needs no new API: query with the reference as the main signal, then re-rank the 20
results by Passport affinity. Also prefer candidates sharing the reference's sub-genre (pizza),
falling back to "Italian / casual" when fewer than 3 exist, and say so in the status line.

**Status (21 Oct): fixed.** Live checks (HCMC, Pizza 4P's + Khruangbin signals, 20 results):
reference + Passport → 0 with pizza; reference alone → 1; signal weights → rejected by Qloo
(`provider_rejected`); `filter.tags=urn:tag:cuisine:qloo:pizza` → 20 of 20, still ranked by
taste. Comma-separated `filter.tags` = OR. So Swap now filters on the starting place's
defining cuisine (`discovery.ts#anchorCuisines`: kept cuisine chips, else the cuisine its other
tags mention most), dropping traits then the cuisine when fewer than 3 places are left. Live
result: Sasa Cafe, Italiani's Pizza, Pizza Inn — all pizza. The fallback path is covered by
the mocked tests only, not checked live.

### A4. Roles are arbitrary — MEDIUM
"Best practical match" = nearest; "Unexpected" = least popular (could be a dead listing).
**Fix:** "Unexpected" = best result from a *different* sub-genre that still matches ≥1 kept chip, with a popularity floor.

### A5. Raw error codes shown to users — MEDIUM
`setStatus(error.message)` in a status line. **Fix:** map each code to human copy, shown next to the button.

### A6. ~~Explore has the same "why" problem~~ — not a bug
Checked while fixing: Explore shows no "why" line at all. Nothing to change.

**A2 status (21 Oct): fixed.** Live Swap from Pizza 4P's: "Like Pizza 4P's Ben Thanh: pizza.",
no artist/film names. Still open (A3): only 1 of 3 results was a pizzeria (a bar and a phở
shop filled the other roles).

---

## Part B — UX: users don't understand what the site does or what to do

Scores (GAN-style rubric, 1–10): purpose clarity **3** · flow **3** · feedback **2** ·
visual structure **4** · trust in results **3** (dragged down by A1/A2).

### B1. What is this site? — CRITICAL
"Travel by taste, not by top-10 lists" is a slogan, not a description.
**Fix:** hero says it literally: "Tell us films, music and places you love. We find restaurants,
bars and museums in your next city that fit *you*." Add a 3-panel concrete example
(your favourites → your Passport → a real place card with its reason). One primary button
("Start — 3 min"); "sample profile" becomes a text link.

### B2. Four sections, no map — HIGH
Passport, Explore, Swap, Collections look equal; Swap (the "my restaurant is full" moment) is
hidden in a sentence. **Fix:** nav in journey order (*Passport → Explore → Swap → Saved*);
landing gets two entry cards: "Planning a trip → Explore" and "Plan B right now → Swap";
each page starts with one sentence of purpose + a numbered stepper.

### B3. "Swap it" seems to do nothing — CRITICAL
Results render below the fold; only the button label changes.
**Fix:** on click → disabled button with spinner, 3 **skeleton cards** rendered immediately and
scrolled into view (`scrollIntoView`, respect `prefers-reduced-motion`); on success focus the
results heading ("3 alternatives to Pizza 4P's"). On mobile, results replace the steps with a
"← Change what to keep" link. Same pattern in Explore.

### B4. Keep / Change / Ignore is confusing — HIGH
**Fix:** question "What did you like about it?"; chips are toggles (tap = keep ✓); "avoid" is a
secondary action; show "Keeping 2 things".

### B5. Step 1 friction — MEDIUM
Type → Find → Choose. **Fix:** search-as-you-type (debounced, min 2 chars) with autocomplete;
selecting reveals Step 2 and scrolls to it.

### B6. Result cards — MEDIUM
Lead with name, one-line reason (A2), distance, price, then actions (Save · Not for me · Map).
Role badges in plain words: "Most similar", "Closest", "A surprise".

---

## Part C — UI: structure and hierarchy

- **C1. No page template.** Adopt one: title + one-line purpose → stepper → work area (inputs left, results right on desktop; stacked on mobile) → footnote.
- **C2. Too many meta labels and muted paragraphs.** One meta label per section; move the Qloo/OSM disclaimers into one collapsible "About these results".
- **C3. Button hierarchy.** `ticket` / `stamp` / `text` are mixed for primary actions. Rule: one filled primary per view, outline secondary, text tertiary.
- **C4. Spacing.** Use the docs/06 tokens on an 8-pt scale consistently.
- **C5. Empty states.** Every results area says the next action ("Pick a place above to see alternatives").

---

## Part D — Execution plan (orchestrate-ready)

Logic first (trust), then feedback, then structure.

| # | Step | Files | Agent chain | Done when |
|---|------|-------|-------------|-----------|
| 1 | Server chips, ranked, deny-list (A1) | discovery-service.ts, discovery.ts, swap-workspace.tsx | planner → tdd-guide → typescript-reviewer | check passes; pizzeria → pizza chip first |
| 2 | Honest "why" (A2, A6) | discovery.ts#selectRoles, explore | tdd-guide → code-reviewer | tests: no reference / no artists in restaurant why |
| 3 | Reference weighting + sub-genre (A3, A4) | discovery-service.ts#swap | docs-lookup → tdd-guide → code-reviewer | live HCMC pizzeria swap returns pizza/Italian |
| 4 | Human error messages (A5) | discovery-client.ts, views | typescript-reviewer | every error code has copy |
| 5 | Swap/Explore feedback (B3) | swap-workspace.tsx, explore-view.tsx, globals.css | react-reviewer → e2e-runner | click → skeletons visible in viewport |
| 6 | Chips & step-1 interaction (B4, B5) | swap-workspace.tsx | react-reviewer → e2e-runner | one-click select, toggle chips |
| 7 | Landing + nav (B1, B2) | page.tsx, layout.tsx | ui-ux-designer → react-reviewer | hero answers "what does it do" in 5 s |
| 8 | Template, buttons, spacing, empty states, cards (C1–C5, B6) | globals.css, pages | ui-ux-designer → a11y-architect | screenshots desktop + 375 px, no overflow |

Ready-to-paste prompts:

```
/orchestrate custom "planner,tdd-guide,typescript-reviewer" "Step 1 of docs/21-swap-explore-audit.md (A1): server is the single source of Swap chips, ranked sub-genre/cuisine > ambience > offerings > beverages (max 2 drinks), deny-list of generic tags; client renders server chips only. Add a check-discovery case for a pizzeria."
```
```
/orchestrate custom "tdd-guide,code-reviewer" "Step 2 of docs/21 (A2, A6): rewrite selectRoles 'why' around tags shared with the reference; never name the reference; name at most one Passport item and only for museum/bar/neighbourhood. Apply to Explore too."
```
```
/orchestrate custom "docs-lookup,tdd-guide,code-reviewer" "Step 3 of docs/21 (A3, A4): make the Swap reference dominate ranking (verify Qloo weighting in docs first, else re-rank by Passport after a reference-led query), prefer same sub-genre, redefine the Unexpected role."
```
```
/orchestrate custom "typescript-reviewer" "Step 4 of docs/21 (A5): map every DiscoveryError code to plain-English copy shown next to the action button."
```
```
/orchestrate custom "react-reviewer,e2e-runner" "Step 5 of docs/21 (B3): on Swap it / Explore change show 3 skeleton cards, scroll them into view (respect reduced motion), focus the results heading on success."
```
```
/orchestrate custom "react-reviewer,e2e-runner" "Step 6 of docs/21 (B4, B5): search-as-you-type for the reference, auto-advance to step 2, chips become keep toggles with a secondary avoid."
```
```
/orchestrate custom "ui-ux-designer,react-reviewer" "Step 7 of docs/21 (B1, B2): literal hero copy + 3-panel example, single primary CTA, nav in journey order, two entry cards (Explore / Swap)."
```
```
/orchestrate custom "ui-ux-designer,a11y-architect" "Step 8 of docs/21 (C1-C5, B6): one page template, button hierarchy, spacing tokens, empty states, result card layout; verify at desktop and 375 px."
```
