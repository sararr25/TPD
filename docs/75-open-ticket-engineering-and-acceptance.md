# Open UI, UX and mobile tickets — engineering continuation

28 October 2026 · Programme [#60](https://github.com/sararr25/TPD/issues/60). Read after [docs/74](74-ui-ux-mobile-second-cycle.md), then its prior handovers. Owner requested continued work on the six open tickets. This cycle completes additional engineering and makes the remaining acceptance inputs concrete; it does not turn automatic checks into human evidence.

## Delivered changes

**#62 — image composition:** every existing provider image now stays whole in its frame (`contain`), whether a photograph or a mark. No shape-based classification or logo database is invented. A soft, cropped duplicate is decorative background only; it uses the identical URL and appears only after the source image loads, preserving lazy loading. Scroll motion moves that background, while the whole foreground stays still. Approved city covers keep their photographic treatment; fallback city captions remain visible. List, Place and Saved reuse the existing photo-continuity contract. No image import, download/rehosting, catalogue/schema change, new source or permission claim was made.

A synthetic square mark reproduced the original crop (`cover`); the corrected full-source rendering and failed-photo fallback pass. Review caught that the absolutely positioned foreground intercepted the photo link. Foreground pointer events are now disabled; a real pointer-centre test captures the correct anchor click without forcing it or calling the provider detail server.

**#86 — automatic accessibility support:** added a development-only axe/Playwright dependency and repeatable checks on Home, City, Passport, Settings, Saved, quiz, Save and comparison C. The first run found two genuine classes of issue: City tabs combined incompatible `tab`/`aria-pressed` states; Saved/reorder controls had accessible names that did not include their visible text. City now exposes `aria-selected` only, with one tab stop and ArrowLeft/Right/Home/End navigation. Reorder labels begin with the visible Move up/Move down wording. The redundant Saved image link is excluded from keyboard/AT, with the existing named heading link retained. These corrections address the findings; they do not establish VoiceOver/TalkBack acceptance.

**#85/#88 — engine and short-viewport checks:** an opt-in `playwright.compat.config.ts` runs WebKit instead of the default Chrome. It covers the same synthetic workflows, including full images, comparison C, short Save panel, notebook download/privacy and owner-isolation cases. The short-panel test uses 390×360; tabbing cannot reach a background page control, closing returns focus and panel scrolling leaves the page position unchanged. Native browser chrome may receive focus between dialog controls (reported as body); the assertion follows the existing native-dialog convention instead of adding a custom focus trap. This is not a phone keyboard simulation or a physical Safari receipt.

**#79:** source and current local configuration were checked read-only: visited-city account sync remains disabled. UI explanations continue to follow the actual response/state. WebKit checks include synthetic owner isolation and late reads/writes; no real Google session, two-device result or production environment value is inferred.

**#74:** the owner's automatic advancement choice is retained. No further quiz behavior change and no claim of a human comparative winner are included.

## Verification and independent review

Source: `595e33c` plus pointer correction `848c1bb`. Build/TypeScript and diff checks pass. Final compiled verification: **45 passed / 3 development-only skips** (`/tmp/tpd-open-compiled.log`). WebKit development: **26 passed** (`/tmp/tpd-open-webkit-final.log`), with the added pointer test passing separately (`/tmp/tpd-open-webkit-pointer.log`). Source publication and branch-preview READY/SHA are recorded in the programme receipt after push.

- First axe pass: Home/Passport/Settings clean; City and Saved exposed the issues fixed above. The initial Save-dialog audit attempted to open an unsaved item's editor in one click; the fixture now follows the real quick-save then edit flow.
- Corrected six-scenario Chrome audit passed. The expanded scope adds comparison, arrow navigation and short-panel behavior. The first strict short-panel assertion rejected the native browser-chrome focus stop in both engines; it was aligned with the existing native-dialog assertion and then passed in both.
- WebKit development run: **26 passed**, covering accessibility, images, Save, notebook and synthetic account isolation. Additional pointer-centre check passed in WebKit; full photo continuity/detail plus pointer check passed in Chrome development. Existing motion tests passed after targeting the decorative layer whose movement is intended.
- Standards review found the intercepted photo tap; corrected and independently confirmed with no residual findings. Spec review found the initial docs/74 contain-only-for-verified-logos sentence inconsistent with the new general whole-source rule; that sentence is superseded/corrected. No functional Spec finding remained.
- All browser fixtures intercept account/provider APIs; screenshots use synthetic data and stay ignored under `.private/open-tickets/`. There is no provider collection run or production/account data write in this cycle.

## What still prevents closure

The six issues remain open for the following precise inputs. A clean axe report or WebKit run cannot waive them.

| Ticket | Engineering now available | Remaining actual acceptance/input |
|---|---|---|
| #62 | Full-source media; distinct city fallback; continuity, pointer and motion checks; editorial proposal | Applicable image/metadata retention/display rights, reviewed bounded real venue-image selection and owning-account quota/cost headroom before any proposed import. Existing sources remain unchanged. |
| #74 | Owner chose auto-advance; timer correction/Back and 18-question flow tested | People perform the explicit/automatic variants and record errors/completion, or owner explicitly changes that acceptance scope. No recruited people or measured winner here. |
| #79 | Resource-specific messages; local sync flag checked; synthetic owner/late-response checks in two engines | Owner-controlled normal Google test account on two actual devices, resource-by-resource observation; no cookies/session copying or sync activation. |
| #85 | Native dialogs, focus restoration, short-height scrolling in Chrome/WebKit | iOS/Android keyboard open, note/new-list/search, suggestion bar, notch and visual viewport; field and confirmation action visible. |
| #86 | Repeatable axe checks, valid tab semantics, roving focus, matching names, enlarged-text checks | Actual VoiceOver/TalkBack task completion and native text resize, including spoken results/errors and focus visibility. |
| #88 | Chrome/WebKit notebook selection/download/privacy and workflow coverage | Physical Safari/iPhone + Chrome/Android, portrait/landscape, native print/download, perceived audio and actual account sessions. |

No Apple physical-device tooling or Android adb was available in this workspace. A device-availability question was sent to the owner; no device outcome is inferred from absence of an answer. The existing #59/docs70 register remains authoritative for NOT RUN rows.

## Guided acceptance of this candidate

Use the exact branch-preview URL and READY SHA recorded in the new #60 receipt. Do not test the unchanged public production alias and attribute this candidate's changes to it. A protected preview requires the owner's normal Vercel access; do not disable protection or publish bypass credentials.

1. Record phone model, OS/browser, tested URL/SHA, portrait/landscape, network, text size, motion and screen reader. Use a dedicated owner-controlled QA account/trip and synthetic notes.
2. Read a real photograph and any known mark on City, Saved and Place. Confirm whole source, same subject, usable photo tap and labelled fallback on failure. Do not infer that this establishes contractual rights.
3. Choose three comparison places; switch all C cards, read full names/unknown prices, reach Save/Directions, remove one and close. At enlarged text, reach every action without horizontal scrolling.
4. From quiz question one, complete the choices and observe automatic advance. Use Back, verify the selected answers, correct one and Continue. Record mistakes/uncertainty rather than rating a winner from preference alone.
5. Open Save, edit note and new list with the native keyboard. Keep the active field and confirm/close action visible, scroll within the panel, close and verify origin focus. Repeat search and landscape.
6. With VoiceOver/TalkBack actually enabled, operate City tabs, filters, comparison selector, quiz, Save errors and closing. Record what was spoken, focus destination and the first blocked task. Automated DOM/contrast checks are supporting evidence only.
7. On two normal signed-in devices compare Passport, Saved notes, trip organisation and visits separately. Visited-city sync must stay explicitly disabled/local. Verify a second account cannot see the first one's test data; clean up only the QA records through normal UI.
8. Download the selected notebook, open the actual file and print preview. Confirm private note/reason/account data/tokens/coordinates are absent; record native system-dialog behavior and actual perceived audio separately.

Keep the docs/70 receipt format: `date | device/OS/browser | candidate SHA | task | expected | observed | pass/fail/not-run | private evidence | blocker`. Keep failed and not-run rows visible. No production promotion is part of this delivery.
