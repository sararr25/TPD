# SVG actions, photo continuity and honest copy — 27 October 2026

Owner explicitly requested [#51](https://github.com/sararr25/TPD/issues/51) and [#52](https://github.com/sararr25/TPD/issues/52), part of [#45](https://github.com/sararr25/TPD/issues/45). This continues the uncommitted #46–50 work on `codex/twin-motion-ux`, based on published `dfb92e2`. Local implementation only; this is not a publication receipt.

## #51 — actions and photographs

- Shared decorative SVG action family, based on the existing mobile navigation drawings: 24-unit viewBox, 1.75 stroke, 20px actions and 24px navigation. Save uses the same bookmark as Saved navigation; filled/outline distinguishes saved/unsaved. Accessible action names and expansion state stay on their controls.
- Save, Hide, Directions, share, close, operative arrows, add/remove and settings use the shared component. Quiz and Passport artwork, city stamps, map pins and illustrative routes retain their own visual vocabulary. No icon dependency or artwork rewrite.
- Cards, Saved, inline previews and Place share photo presentation. A successful Qloo venue-image URL can follow navigation within the mounted app, keyed by city/place and isolated by account. The bounded in-memory map holds at most 60 URLs, is discarded on reload/account switch, and rejects late loads from superseded owner scopes. Only HTTPS `images.qloo.com` URLs enter this context. Failed URLs are removed.
- No image bytes, signed tokens, notes, new persistent storage, external bucket, scraping, provider or contract change. Existing Saved token previews and existing image rights remain the source; server Place identity/lookup remains authoritative. Direct reload may still show a city photo when the lookup lacks a usable venue photo.
- Fallback now reads “Lisbon city photo · place photo unavailable”, or “No place photo” if both images fail. It never claims a city photo depicts the venue.

## #52 — reasons and compromises

- Repeated provider-attributed favourite reasons move to one list introduction in City and Passport previews. Unique attributions remain beside the corresponding place; absent evidence creates no invented specific explanation. Exact IDs are compared without case sensitivity. Distinguishing chips and available place data remain visible.
- Twin keeps Keep/Delete/Ignore. The editor exposes Prefer/Exclude and explicitly says the Passport stays the same. Search details still explain Keep as a preference, not a guarantee. Card copy describes shared traits rather than implying a personal compatibility score.
- A visible price comparison states higher/lower/same tier relative to the starting place, using only known integer values 1–4. Unknown/invalid data produces “Price comparison unavailable”. Museum/hotel flows do not acquire unsupported price controls. Difference text remains visible; source/check details stay behind disclosure.
- Restaurant facets say “Food & atmosphere”; each category has a meaningful “Any…” placeholder. Filtering and source tag semantics are unchanged.
- Partial Passport headings say “Your taste, taking shape” and show the number of answered questions out of 18, with Settings & privacy for revisiting the quiz. A skipped question is absent; explicit No answers count as an answer. Three favourites without quiz answers get an honest ready-favourites state. Full profiles keep their existing title/motto/scoring.
- Shared Passport PNGs apply the same distinction. Partial cards show answer-grounded observations and completeness instead of default axes/interest percentages or a confident traveller type. Export still contains quiz answers only.
- “Your Beesyde activity” distinguishes guides opened/saved places from “Places you’ve been”. Add/Edit visited cities names the actual action. Opening a guide still never creates a real visit.
- Events is separate from local category controls. Paris has its own pilot button; other cities and Twin link directly to the separate Paris agenda. No new city/event coverage, source or date semantics.

## Verification

Provider/account fixtures and existing Playwright journeys remain the approved seam. The existing development-only Place fixture also exercises a successful photo, SPA navigation through Saved, reuse when the detail photo fails, and a reload returning to the explicitly labelled city fallback. No live accounts, recommendation quotas or personal writes.

New browser scenarios cover 320/390/1440 action names and saved state, partial/empty/full Passport, explicit No versus skipped questions, repeated/unique/absent provider attribution, category copy, visible higher price tiers, and real PNG rendering. Existing suites cover other widths, keyboard/focus, retries, URL/history, enlarged text and reduced motion.

Initial runs exposed stale test selectors for typographic arrows and renamed actions, an ambiguous Add/Edit selector, an incorrect test event name and a photo test that reloaded before navigation committed. These test assumptions were corrected; final receipts are recorded below separately. No claim is made that those initial runs were green.

Compiled integrated run across acceptance, Cities/Twin release, Events, the new icon/copy scenarios, quiz, Passport folio, personal Home and review refinements: **94 pass, 6 intentional skips** out of 100. The skips are development-only Place fixtures (the five existing return/broken-photo cases plus the new continuity case). The development continuity journey passed independently after its navigation wait was corrected. The subsequent rebuilt final artifact passed **8/8 focused checks**, including the final Remove SVG/editor refinement, Save state changes and partial/full PNGs.

Full existing unit/service suite, typecheck, production build and `git diff --check` pass. These are scoped integration results, not a claim that every browser file or physical device was tested. Final source changes after the integrated run were the remaining operative SVGs on favourite removal and the development Home-story preview; the final rebuild and focused checks cover the active editor change.

Private screenshots in `.private/priorities/` and the actual partial/full 1080×1350 PNGs were inspected. Fixture photographs are deliberate placeholders, not evidence about live venue photo quality. Logs: `/tmp/tpd-51-*`; the corrected development photo run is `/tmp/tpd-photo-debug2.log`.

## Boundaries and continuation

Preview: http://127.0.0.1:3214. Tickets remain open for integration/review, consistent with #46–50. No commit, push, schema/config change or deployment occurred. Physical devices, native Safari/VoiceOver/TalkBack, field performance and real-account/cross-device acceptance remain separate gates.

Next planned ticket is #53 (Save panels, feedback and motion), followed by the dependent comparison/search-resume work. Read current issue comments and preserve the existing local changes before continuing.
