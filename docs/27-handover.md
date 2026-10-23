# Handover — 23 October 2026: tickets #26–#34

Continues `docs/26-handover.md`. Work was based on `1dbb00d`, in
`.claude/worktrees/pr-35-merge-handover-34e31b`, not the older main checkout
(`claude/pensive-lovelace-k81d2t`). Owner's release branch remains
`claude/blissful-gauss-dymbeo`.

## Owner decisions in this session

- Continue the open tickets #26–#34; do not redo closed #9, #10, #13, #15,
  #18, #20, #21, #22, #23 or #24.
- #31 filters appear only on the city page, not Swap. Neighbourhood means
  **within 2 km of its centre**, explicitly labelled; no boundary claim.
- #33 shares only trip name and places. Notes remain private in links and PNGs.
- #26 keeps small per-city accents, with muted berry on large surfaces.
  Recorded in ADR 0004; accent text contrast on paper is at least 5.67:1.
- Explicit authorization received to add `user_stamp` to the configured
  database and activate account stamp syncing.

## Implemented

| Ticket | Implementation |
|---|---|
| #26 | Compact inner headings, Passport paper layout, postcard Cities/Place, stamped 404/error. Scoped site header avoids a sticky nested Passport header. Swap uses the Atlas layout: struck starting place, numbered twins/map, search-specific Keep/Change recap. Small city inks stay on paper marks; covers stay berry. |
| #27 | City photo, two-sentence intro, counts from the loaded visible results, warm Passport prompt, noun categories, prominent evidence-based personal reason. Phone List/Map starts with cards; map mounts when opened. |
| #28 | Saved trip photo cards and numbered map, links, notes/directions/remove/delete retained. City-photo fallback is labelled. `/place/[id]` safely resolves older account records without a stored city. |
| #29 | English local-friend vocabulary and concrete promises. Guest Swap says “Why this twin”; copy no longer overstates map/address confirmation or absolute ranking/proximity. |
| #30 | Home one-click Time Out Market example uses real lookup + Swap, no visitor Passport/feedback. Actual kept/changed tags are shown, including unmet Keep preferences. Failures and zero results have a message/action. |
| #31 | Indicative maximum-price and near-neighbourhood controls filter the loaded city picks and map consistently. Choices stay per category when switching away and back. Unknown prices excluded only when a price filter is active. No unsupported open-now option. |
| #32 | Opened-guide and saved-place activity stamps, deduplication, guest persistence, authenticated API and account-specific pending imports. Passport shows them; account/Passport deletion covers stamps. Account ownership is masked during switching. Reduced motion disables stamp animation. |
| #33 | Explicit public preview, read-only `/trip#…` snapshot, clipboard/native-share fallback, browser-local 1080×1350 postcard PNG. Exact bounded whitelist rejects private/extra fields. PNG shows first 12 with a count if the trip is longer. |
| #34 | Shared stamped empty states with next actions, skeletons/status for searches and loading in City, Swap, Passport, Compare, Saved and shared trips. Hidden preferences are preserved. |

## Validation

- Full `npm test` passed; test command now includes stamps and shared-trip privacy tests.
- Final targeted Saved/stamps/shared-trip checks, typecheck, `npm run build`
  and `git diff --check` passed.
- Standards and spec reviews found and fixed malformed saved-city/address
  crashes, account stamp display across ownership changes, unfinished Saved
  states, and missing Atlas/map and city accent requirements.
- Browser QA used 1440×1000 and 390×844. Verified City header/photo, personal
  reason, filters reducing results, per-category restoration, no horizontal
  overflow, mobile cards first; live Home example; Swap three real twins,
  matching numbered map and search recap; place links; Saved card/map;
  shared preview/read-only link; guest activity stamps after reopening Passport;
  Cities and 404 styling.
- Postcard download completed in browser. Actual downloaded file verified as
  PNG, 1080×1350, and visually inspected. Native OS sharing was not invoked.
- New `user_stamp` table was added using only its scoped CREATE statement.
  Verified expected columns and account-delete `ON DELETE CASCADE`; no existing
  table was altered. No user activity was fabricated for database QA.

Screenshots and postcard are private under
`.private/qa/2026-10-23-tickets-26-34/`; they are **not** committed or attached to
a public PR. No mockups or raw provider responses were added to the repository.
Local logs are `/tmp/tpd-continuation-final-tests.log` and
`/tmp/tpd-continuation-build-final.log`.

## Acceptance boundaries and follow-up

- Real signed-in browser persistence across two devices, Google OAuth and
  account deletion were not exercised. API validation/storage isolation tests
  and the real schema check do not replace these owner paths.
- Final production acceptance on a real phone remains the owner's step from
  handover 26. Local development browser QA is not production acceptance.
- The overlapping Change-tag issue found during UI QA is resolved by the
  follow-up below. This matches visible labels, not inferred semantic synonyms.
- Keep remains a preference, not a guaranteed filter. The Home example says so
  and reports when seafood is not listed for an alternative.
- Existing rough edges from handover 26 (quiz sign-in callback, one-toast
  replacement, provider/photo limitations) were not silently declared fixed.
- Shared snapshots cannot be revoked by deleting or editing the original trip;
  the preview states this. They are user-supplied plans, not verified travel facts.

## Suggested skills

`implement-spec`, `code-review` and, for discovery semantics, `tdd` at the public
Swap/service seam. Read AGENTS and the bundled Next docs before changes.

## Release receipt

- Implementation commit `22e9f78` pushed to `claude/blissful-gauss-dymbeo`.
- Vercel deployment `dpl_8R79QvQ2GdXya8Fg17upAuvDKJyy` is READY and assigned
  to `https://beesyde.vercel.app`; its Git SHA matches `22e9f78`.
- Public Home smoke verified the new headline and live Swap entry. This is a
  production smoke check, not full real-phone or authenticated acceptance.
- GitHub #27, #28, #29, #30, #31, #33 and #34 closed with implementation receipts.
  #26 and #32 remain open as `ready-for-human`: private screenshot/visual
  acceptance and real signed-in/cross-device acceptance respectively. Parent #3
  stays open. No closed tickets from the earlier session were reopened.


## Follow-up — Change trait aliases, 23 October 2026

Owner selected tests at the public Swap service plus a live Lisbon check.

- A failing service regression reproduced Change Casual accepting another
  Qloo ID with the label Casual. After the fix it passes.
- One shared `hasTrait` rule now drives explicit Change exclusions, Keep
  ranking/counts, shared-trait explanations and both Swap/Home result labels.
  It matches an exact ID or equal labels after Unicode/case, whitespace and
  underscore/hyphen normalization. It does not invent synonyms or use substring
  matching: Casual dining remains distinct from Casual.
- Filtering runs on every cuisine/quiz fallback. No fallback relaxes Change.
- Regression coverage includes alternate IDs, padded/separator labels, Keep
  counts/explanations, distinct longer names and empty fallback results.
- Full tests passed; final targeted discovery checks, typecheck and build passed.
- Live local API check: exact Time Out Market reference in Lisbon, Change
  Casual, empty Passport; 3 results from 11 locally eligible candidates, zero
  same-label conflicts. Results remain L0; no hours/booking facts are inferred.
- Reproduce with the local app at 127.0.0.1:3100 and
  `node --experimental-strip-types scripts/verify-change-aliases.mjs`. This uses
  Qloo quota and makes two sequential app requests, without automatic retries.
  Raw receipts/tokens stay in ignored `.private/qloo/change-alias-check.json`.
- Standards/spec review findings (separator-boundary whitespace and an overly
  broad text assertion in the live check) were corrected. Existing #26/#32
  human acceptance boundaries remain unchanged.
