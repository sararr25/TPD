# UI, UX and mobile — second implementation cycle

28 October 2026 · Programme [#60](https://github.com/sararr25/TPD/issues/60). Read after [docs/73](73-ui-ux-mobile-ticket-plan-and-first-cycle.md), against the feedback and acceptance criteria in [docs/72](72-ui-ux-mobile-review-2026-10-28.md).

The owner explicitly authorised the push, then asked to continue the remaining tickets. The first-cycle source was pushed and verified at `beed89d687afca7b2ddebb595b59d7fffb41d89a` on `codex/twin-motion-ux`; its six issues are closed. This supersedes docs/73's historical pending-push notice. The configured release/default branch `claude/blissful-gauss-dymbeo` is unchanged. This is working-branch delivery, not production promotion.

## Product decisions and implemented scope

The owner selected **C — one place at a time** for mobile comparison. Three runnable alternatives were preserved on local throwaway branch `codex/comparison-mobile-prototype-20261028`, commits `22b801a` and `70510e2`. They use synthetic data and are not included in the application branch or pushed. The application implements C at narrow widths and retains simultaneous columns on desktop. Full names, individual reasons, listed traits, addresses, unknown prices and Save/Directions remain available. A price overview supports switching; the selected heading receives focus. Removal, closing and clearing restore focus. The tray shows the selected names, minimises and retains selection across client navigation within the existing owner-scoped in-memory contract.

| Feedback / issue | Delivered engineering change |
|---|---|
| UI-03 #63 | Full Home/Passport book retained; compact operational City cover, quieter Settings and secondary Saved sign-in prompt. Twin's approved ink cover is retained. |
| UI-04 #64 | Long names wrap; operational chips/location and comparison details remain readable; comparison supports enlarged text without horizontal overflow. No smaller type is used to fit the new mobile composition. |
| UI-06 #66 | Main Twin thumbnail uses a bounded horizontal photo on mobile instead of a very tall narrow crop. |
| UI-07 #67 | Display-only label cleanup/deduplication and a narrow Seafood/Fresh seafood rule; raw IDs, constraints and facets are unchanged. Place exposes additional original traits in a disclosure. |
| UI-08 #68 | Qloo/AI comparison starts with one action and quiet explanatory columns; empty Saved has a secondary account prompt. |
| UX-04 #72 | Starting place → Preferences → Matches steps; selected reference collapses; Change/Keep reference controls preserve deliberate choices. |
| UX-05 #73 | Concise Keep/Delete/Ignore teaching beside the controls; no dropdowns or new semantics. |
| UX-07 #75 | Named/minimisable tray, one-selection guidance, stable clear/close focus and preserved owner isolation. |
| UX-08 #76 | Inline map preview stays on Map across two pins; close/Escape returns focus to the pin; Place return URL includes map/filter/selected-place context. Existing Save feedback retained. |
| UX-09 #77 | Paris-only Events invitation stays in Paris; removed from other City/Twin destinations. |
| UX-10 #78 | Existing supported reasons retained. Cards without a reason show actual address/context; no invented personal explanation. |
| UX-12 #80 | Recent search or saved trip in the Home opening line, with place/city and preference/exclusion counts. Explicit Resume still resolves the reference afresh; no automatic search. Space reserved for asynchronous content to avoid shifting the book. |
| MOB-02 #82 | Owner-selected C; verified at 320/390/768/1440 widths with full names, unknown values, switching and actionable controls. |
| MOB-03 #83 | Compact For you header, tighter operational spacing, shallower list photographs; full first fixture-place title appears above the mobile bar at 390×844. |
| MOB-04 #84 | All six category buttons wrap visibly; active state and native button behavior preserved. |
| MOB-07 #87 | Map waits until near the viewport or explicitly focused; list is independent. Existing finite decorative motion and reduced-motion fallback retained; budgets below. Physical field measurement remains #59. |

## Implemented but awaiting human acceptance

**UX-06 #74:** The owner chose automatic advancement from the first question after seeing the prototype. Multiple-answer questions advance at the required final pick; single-answer and swipe behavior remains automatic. Back and Continue remain available. The selection status explicitly announces “Moving on”; deselecting before the timer fires cancels the transition, and Back retains answers. The 18-question meaning, drafts and answers remain unchanged. The alternative prototype remains local. The decision is owner preference, not a measured experimental winner; error/completion comparison with people is NOT RUN, so the ticket retains that human acceptance gate.

**UX-11 #79:** Settings now distinguish Passport loading/error/partial/saving/local/account, Saved local-list policy, trip state/error and actual visited-city sync capability. Passport's visited section exposes the same state. Synthetic checks cover guest, disabled visited sync and failed account Passport reads. No migration or sync flag was enabled. Real two-device account acceptance is NOT RUN; keep the ticket open with #59.

**MOB-05 #85, MOB-06 #86, MOB-08 #88:** Chrome viewport/keyboard and enlarged-text checks are engineering evidence only. Safari/iPhone, Chrome/Android, native keyboards/sheets, VoiceOver/TalkBack, actual download/print/audio and real cross-device account checks remain NOT RUN in [docs/70](70-physical-account-acceptance.md) / #59. Do not close these gates from emulation.

## Photo packet — UI-02 #62 remains open

No import, download/rehosting, provider choice or catalogue schema was changed. Preserve the existing approved city photographs, their credits and fallback. A square image is not reliable evidence of a logo; do not invent image classifications from dimensions.

Editorial review per candidate must record provider/place ID, original URL, applicable display/retention permission, source/credit, review date, relevance to the actual venue and crop. Prefer a legible venue/interior/contextual photograph at card and detail ratios. Reject unrelated or low-quality imagery; use the existing labelled city/no-photo fallback when no acceptable photo is available. Only an explicitly verified logo may use a contain treatment. Never use a different venue's photograph to make a result appear complete.

The bounded Lisbon proposal in [docs/61](61-coverage-catalogue-and-submission.md) remains: target 40, acceptable 30–50, maximum 50 unique IDs; existing proposed server-only table; no bucket/new paid provider; original URLs only after applicable rights are established. Proposed collection is at most four sequential category requests, no automatic retry, stopping on authentication/quota errors; at most 50 image checks after rights approval. No such requests were made here. The old 94-place inventory is stale; docs/61's nine cache rows/zero eligible places is a dated observation, not a refreshed current inventory. Remaining inputs are verified contractual rights, an actual bounded candidate selection and owning-account cost/quota headroom. This packet does not request an import before those inputs exist.

## Loading and motion budget

Keep inputs/CTA usable from first render. Decoration is finite and does not gate interaction. Existing shared token durations remain control 150 ms, panel 220 ms, reveal 340 ms, hero 550 ms and route 850 ms; the existing 3.6-second journey is decorative and reduced-motion has static art. No new perpetual animation or provider request per map pin was added. Map import/initialisation starts within 200 px of the viewport, with a keyboard-focus activation path and a non-IntersectionObserver fallback.

Field targets remain **LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at p75**. They are targets, not measured field results. Physical protocol: same phone/browser/data/network, three cold Home→City→Place journeys, record viewport and motion setting, loading/interaction/layout measures and perceived interruptions; compare like paths and report all runs. The local CLS regression measures synthetic Chrome cold loads; it cannot establish field p75 or device fluidity.

## Verification and publication receipt

Application revision `a8922e1`; delivery on the authorised working branch `codex/twin-motion-ux`. The programme issue #60 records the external source-push receipt. Local screenshots/prototypes contain synthetic data and remain ignored under `.private/audit-next/`; no private provider payload or account data is published.

### Standards

The code-review skill ran a separate Standards review against `beed89d...8d6c0c6`. It found that a valid long recent-search name could exceed the reserved Home space after the session resolved. The correction bounds the visible summary (full text retained in DOM/title), restores counts, and keeps the city first on touch. A delayed-session/200-character-name regression now verifies identical book position; all seven Home stability/entrance checks pass. Follow-up review at `e8a5c89` found no residual Standards issue. Visual inspection also caught a selected-button hover contrast issue; an explicit selected/hover rule and CSS assertion cover it.

### Spec

The independent Spec review found two initial gaps: shared Keep/Delete choices were reset when selecting another reference, and the compact Home entry had lost preference/exclusion counts. Both were corrected with focused regressions. The follow-up caught the city hidden after a long name on mobile; city-first text and an assertion corrected it. Final Spec review reported zero residual findings. Neither axis certifies real phones, accounts or a statistically valid user experiment.

### Correction and test history

The first broad development run was 88 pass / 1 fail (Home cold layout shift). A first compiled attempt was 85 pass / 6 fail: three development-only fixture checks were inadvertently included without the production flag, and the taller Home reservation hid entry actions at some sizes. These are not reported as successful runs. The Home was compacted with a bounded summary and verified against both stability and first-viewport action checks. All three development-only checks passed separately. The subsequent compiled run with the correct production flag was **100 pass / 4 development-only skips**, with synthetic provider/account APIs, before the owner's final automatic-quiz choice. The quiz-specific revalidation after that choice is recorded in the final receipt below.

### Final receipt

- Unit/service checks: `npm test` passed (`/tmp/tpd-next-unit.log`). Final build, including TypeScript: `npm run build` passed (`/tmp/tpd-next-build-owner-final.log`). Diff whitespace checks passed.
- General compiled verification: **100 passed / 4 development-only skips**, seven suites (`/tmp/tpd-next-compiled-final.log`). Sixteen new-cycle checks passed separately in development (`/tmp/tpd-next-new-final.log`). Three additional development-only checks passed (`/tmp/tpd-next-dev-only.log`); the first-cycle Place fixture also passed in its development suite.
- Owner's final automatic-quiz choice: **32 passed / 1 development-only skip** on the final compiled build (`/tmp/tpd-next-owner-compiled.log`). Development was 32 pass / 1 test-harness failure because the initial status locator matched unrelated live regions; scoping it to `.taste-status` passed the isolated correction regression (`/tmp/tpd-next-auto-correction.log`). Final compiled run uses that corrected test.
- Independent review: Standards 0 residual, Spec 0 residual, including the final owner choice. Preview: http://127.0.0.1:3221. This is a local compiled preview, not a provider deployment.
- Tracker delivery: 16 second-cycle engineering tickets complete (#63/#64/#66/#67/#68/#72/#73/#75/#76/#77/#78/#80/#82/#83/#84/#87); with the first six, **22 of 28**. Six remain open: #62 rights/actual image selection; #74 comparative human quiz acceptance; #79 real account acceptance; #85/#86/#88 physical gates shared with #59.

No production promotion, database/schema write, auth/provider change, catalogue import or sync activation was performed. Production SHA/READY/alias were not asserted for this working-branch cycle.
