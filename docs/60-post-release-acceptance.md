# Post-release acceptance — working receipt

26 October 2026 · Programme #44 · Driver: current Codex session.
Baseline: `a7c45c6` on `codex/twin-motion-ux`; application release `975386f`.
This document records new work separately from historical release evidence.

## Reconciliation of the current tracker

GitHub default branch was freshly verified as `claude/blissful-gauss-dymbeo`.
Read current open issues and comments; #44 is assigned to the authenticated owner.
The sole existing #36 comment describes local work on 25 October; handover 58
supersedes its unpublished boundary. No old implementation needs rebuilding.

| Ticket / criterion | Current evidence | Remaining action |
|---|---|---|
| #37 Twin wording and legacy routes | Glossary/ADR amendments; shared Twin navigation; existing legacy-link browser journeys | Fresh integrated regression, then evidence-based closure |
| #38 supported venue categories | Shared capability registry; signed reference/service tests for Bars/Cafés/Hotels; existing Twin browser paths | Fresh regression and accurate coverage statement |
| #38 Events | Separate Paris municipal adapter, date/type/admission filters, bounded 50-record/30-day selection, attribution and unsupported-city state | Retain Paris pilot; broader cities and personalized event twins are deferred scope, not delivered |
| #39 price | Explicit owner amendment to four native levels; shared price formatter; category-specific capabilities and unknown handling | Remove ambiguity from old five-tier criteria in acceptance receipt; verify existing tests |
| #40 compact explicit editor | Keep/Delete/Ignore marked labels; desktop side-by-side/mobile stack; historical immutable comparison | Fresh keyboard/touch-emulation and state regressions; physical touch remains separate |
| #41 immediate match | Existing main-match, other-match/focus, empty/error tests | Review has identified pending-edit and Passport-change stale-result risks; reproduce before fix |
| #42 motion | Integrated Home plus previously published Cities/Twin; static footprints, finite route, cleanup and map gating tests | Fresh integrated review and regression; phone/assistive/performance evidence missing |
| #43 integration/review | Release-specific review receipts and targeted tests exist | Fresh full compiled suite, two independent source reviews, recorded visible review; device limits stay explicit |
| #36 parent | Delivered implementation and publication are documented | Close only after children's actual remaining gates; do not require superseded five tiers |

A ticket being open does not mean its code is absent. None is automatically
closed by publication or by this matrix.

## Fresh configuration observation

Read project-scoped Vercel environment metadata without decrypting or printing
values. `VISITED_CITIES_SYNC` is absent from the listed production/preview keys.
The existing server contract enables account visit sync only for exact value `1`;
therefore project configuration does not enable it. No configuration was changed.
This does not claim genuine-account or cross-device acceptance, nor inspect
private account data. Existing account-local fallback disclosure remains required.

## Test and review log

- Complete unit/service command passed; log `/tmp/tpd-next-unit.log`.
- Typecheck passed; log `/tmp/tpd-next-typecheck.log`.
- Initial browser attempt could not launch/reach localhost under sandbox restrictions;
  stopped it. This infrastructure failure is not an application regression result.
- Initial authorized compiled run used localhost:3194; its configuration failure and the corrected final run are recorded below. Log `/tmp/tpd-next-browser-authorized.log`.
- Independent Standards and Spec source reviews use `git diff e835875...HEAD`,
  interpreted through the latest handover/ADR amendments. Runtime verification
  and fixes are recorded below when complete.

## Physical acceptance protocol

Not executed in this receipt. For each available iPhone, Android, macOS Safari
and VoiceOver run, record actual device, OS/browser version, date, network and
result. Never substitute Chrome emulation or WebKit automation for these claims.

1. Start as a guest: Home → City → Twin → choose a starting place → Keep/Delete/
   Ignore → search → first match → other matches → Save → Saved; test Back/Forward.
2. Complete the 18-question quiz, Back/Skip/swipe/keyboard as applicable, mute,
   failed-save retry and saved-result sound. Listen on actual hardware.
3. Open Passport insights deliberately, change city, retry failure and open all
   matches; edit visited stamps and verify persistence/reload disclosure.
4. Repeat core actions with reduced motion, landscape and enlarged text. With
   VoiceOver, check names/order/announcements, dialogs, dismissal and focus return.
5. Capture navigation/input responsiveness and layout shifts with the device/network
   identified; record offscreen/background map/motion activity. These are bounded
   observations, not population field metrics or invented performance budgets.
6. Genuine account checks require a normal owner-controlled signed-in session;
   isolate guest/account changes and verify only supported persistence. No cookie
   copying, account fabrication or incidental personal production writes.

Equipment/owner access remains an explicit dependency. Continue synthetic/source
work independently; do not mark physical acceptance passed without observation.

## Confirmed defects and local fixes

The independent reviews identified and browser-reproduced four integration defects:

1. Home's visited-city fragment targeted a heading inside a closed stamp dialog.
   The current folio now recognizes that existing fragment and opens the dialog.
2. Expired/incomplete favourites recovery landed on the closed favourites disclosure.
   Recovery links now target its explicit anchor; the folio opens/focuses it on
   entry and same-page activation, including Next's intercepted Link navigation.
3. Editing traits or price during the first pending Twin search failed to mark
   the eventual original response stale. Submitted searches now mark edits stale
   before any response exists; Update results remains explicit.
4. Same-owner Passport tokens/quiz changes left previous Twin results current.
   The submitted profile identity now invalidates data and aborts the old request;
   replacement requests require an explicit Update. Requests use current selections.

A related expired-profile case now disables submission until recovery rather than
entering busy without a request. Seven permanent browser regressions cover the two
recovery paths, pending trait/price edits, completed/pending profile updates and
expired-profile recovery. Six original regressions were observed failing against
the previous compiled release before fixes. All seven plus the development photo
fixture pass on the updated development app (8/8). The other five development-only
Place fixtures pass separately (5/5).

The quiz test harness now accepts the same `MOTION_BASE_URL` as the rest of the
suite, retaining its explicit `TPD_BROWSER_BASE` override. The first complete run
had 92 passes, 8 intended skips and 11 quiz failures solely because those scenarios
used an inactive default port; logs show connection-refused before app interaction.
The final compiled run below supersedes that configuration failure, not its history.

New Passport copy follows the glossary's visitor-facing vocabulary; the provider
credit remains in the footer. The category-enumeration duplication noted by the
reviewer is a heuristic maintenance concern, deferred to avoid unrelated refactoring.

## Independent review rechecks

### Standards

Independent source review and browser reproduction confirmed the two broken
recovery paths. Source/browser recheck passes on the updated app: visible stamp
dialog and expanded/focused favourites editor; mobile screenshots are readable.
Vocabulary correction rechecked. Private evidence: review-home-link-fixed.png and
review-expired-link-fixed.png under `.private/qa/`.

### Spec

Independent source review confirmed the two stale Twin behaviours. Recheck found
the submitted-profile guard, effect cleanup/abort and explicit update coherent;
no remaining actionable finding in those fixes. The adjacent not-ready submit
case was covered and guarded by the integrator after the review suggestion.

Initial findings: Standards 2 actionable (one vocabulary), plus 1 heuristic;
Spec 2 actionable, with 1 adjacent readiness edge. Actionable findings are fixed
locally. Broad independent visual review of all integrated surfaces could not
complete because the reviewer reached its usage limit; its bounded recovery UI
review is complete. This remains an explicit #43 gap, not a completed whole-site
independent visual acceptance.

## Deployment observation

Fresh read-only Vercel alias lookup resolves the public production alias to READY
`dpl_HjnVdRUK9aAUtqULFPUPeZwsQJRR`, branch `claude/blissful-gauss-dymbeo`, SHA
`a7c45c64b51276007941c2ea419df22a4ef0d6e6`. This is the handover commit with the
previously integrated application; the fixes in this receipt are local only.
No deployment or environment setting was changed.

## External acceptance limits

Safari 26.5's native driver is installed, but the supported native-app connection
timed out before any browser interaction. No native Safari pass is claimed.
Physical phones, VoiceOver, actual audio output, field performance and fresh real
account/cross-device paths remain unverified. The prepared protocol above is ready
for actual equipment/owner access. Existing synthetic tests do not remove those gates.

Current Events and the catalogue decision packet are in the companion coverage
receipt. Fresh Lisbon inventory has zero eligible rows; no import is ready.

## Final local gate

Full compiled suite after recovery/Twin/harness fixes: **110 passed, 8 skipped**, zero failures; log `/tmp/tpd-next-browser-final.log`. Six skips are development-only fixtures and two require the opt-in immutable A/B baseline. All six development fixtures passed separately.

Subsequent integrator screenshot inspection found a cramped Home empty-example message using the category's narrow grid column. Both 390/1440 regressions failed before its fix. The empty row now uses full width. After this isolated CSS/markup change, a fresh build and **17/17 targeted Home/integration checks** pass; log `/tmp/tpd-next-home-final.log`. The complete suite was not repeated after this isolated change.

Complete unit/service suite, typecheck, build and diff check pass on final source. Logs: `/tmp/tpd-next-unit-complete.log`, `/tmp/tpd-next-typecheck-complete.log`, `/tmp/tpd-next-build-home-fix.log`. Nine new permanent regressions pass: seven state/recovery cases and two empty-layout cases.

Integrator visually inspected synthetic desktop/mobile Home, ending, Twin editor/main match and populated Passport. Corrected Home message and next action are readable. Private screenshots and recordings remain under `.private/qa/next-*` and `.private/next-visual-results/`. Fixture photo panels do not verify external-photo quality or rights. This is integrator review, not the incomplete independent whole-site review.

Final preview: **http://127.0.0.1:3195**; development preview stopped. Use this instead of the earlier handover's 3194 preview. Working source remains uncommitted on `codex/twin-motion-ux`. No push/deployment occurred. README and handover 28 point here. #39's obsolete five-tier body is reconciled; no ticket closed by implication.

Next gates: independent whole-site visual review when reviewer capacity is available; actual device/assistive/performance protocol; scoped genuine-account checks. Catalogue import still lacks current selection, applicable contractual rights and verified cost headroom. Exact bounded proposal remains unapplied in the companion packet.

## Owner layout correction

Owner clarified that the Passport must use equal left/right halves. Corrected the
40/60 split to 50/50; reduced the tall left title cover to a compact berry strip
with a single-line Taste Passport heading. The visited-city page retains its full
half-width beneath the strip and stretches with the book. Right-page analysis
and mobile stacked order remain. This supersedes the earlier narrow-left layout.

Owner additionally requested only bold Your Passport in the title strip, with
no Beesyde/Made for you metadata. Replaced the two bare native accordion links
with paper panels: a deliberate favourites/quiz editor button and directly
visible guide/save activity. The existing recovery anchor opens the editor dialog;
closing restores focus to its action button. No data semantics changed.

Final title/panel correction: build, typecheck and diff check pass; 17/17 targeted
Passport/account/editor-recovery/quiz scenarios pass on compiled localhost:3195.
Actual desktop/mobile screenshots inspected; native accordion markers are gone.
Log: `/tmp/tpd-passport-panels-browser.log`. Changes remain local only.

## 27 October — profile settings and favourites

Owner moved the returning-user quiz action to Settings & privacy. Passport now
shows Add what you love for its focused favourites editor, with no retake action
or quiz-edit copy there. Settings opens the existing shared quiz dialog; initial
Passport creation remains available in the empty profile. Existing recovery
anchors still open the favourites editor. Updated browser journeys follow this
real route rather than preserving the previous editor's quiz shortcut.

The new settings route uses the existing shared quiz dialog and save contract.
Initial heading focus is applied after showModal, since focus attempted while the
native dialog was closed was ignored. Targeted quiz checks exposed this during
route migration; fixed rather than weakening the keyboard-focus assertion.
Build, typecheck and whitespace checks pass. Final browser receipt follows.

Final settings/favourites separation: 30/30 compiled browser scenarios pass,
including the full 18-question save-failure/retry path, sound boundaries, keyboard,
touch, account states, favourites recovery and explicit Settings-only retake entry.
Log: `/tmp/tpd-passport-settings-browser-final.log`. Local preview remains :3195;
no publication or configuration change.
