# S24 quiz feedback and corrections

28 October 2026 · Programme #60 · Open acceptance #59/#74/#86/#88. Read after [docs/75](75-open-ticket-engineering-and-acceptance.md), then its linked handovers.

## Physical report

Owner reported a Samsung S24, Android 17, Chrome version unknown (believed current). In response to the supplied `a0455be` preview link, the owner reported redundant Next during automatic advancement, awkward text/button alignment, small low-interaction circle controls, small text and text from a preceding swipe sticking to the following card. A follow-up explicitly identified the **five Definitely / Mostly / It depends options**, rather than the selection indicators on image tiles.

Record this as **owner-reported quiz FAIL**, not a completed Home/portrait/landscape acceptance. Exact Chrome version, orientation, native keyboard, text/motion settings and on-device SHA inspection were not supplied. The supplied candidate was `a0455be`; no positive result for the new fixes is inferred. Other physical/account tasks remain NOT RUN.

## Diagnosis and implemented behavior

Application revision `227fba0`.

1. **Swipe residue:** a deterministic browser regression was red in both normal and reduced motion. Nina Simone and Soul & jazz were already correct, but the DOM still held `YES · Keep — release to confirm` and the previous intent overlay. Imperative pointer feedback had not been reset when React reused the card. A layout effect now resets gesture, feedback text, intent and transforms before the next card paints, including Undo. The body entrance no longer repeats for every swipe.
2. **Text escaping the card:** larger labels exposed a second layout issue: a constrained deck let Nina Simone's title intercept the No button. The card/deck now have natural height and grow with their content; artwork retains a useful minimum and the reading area scrolls. A pointer/geometry regression proves title/note stay inside the card and controls below remain usable.
3. **Redundant advancement action:** automatic pick/scale/pair/swipe stages no longer show Continue. Partial multi-select answers keep an explicit **Use 1 choice / Use 2 choices** action because the original contract allows fewer than the maximum. **Keep these answers** appears only when reviewing an already completed answer after Back/resume, preserving review without an immediate automatic-forward loop. Final Build my Passport remains explicit. Pending automatic advancement pauses while hidden and resumes on return, avoiding a completed deck with no available path forward.
4. **Five scale controls:** replaced the circle glyphs with five full contextual answer buttons. Each shows intensity and the corresponding original endpoint in words; neutral remains It depends / A bit of both. Mobile rows are at least 64 px high, with 16 px main labels and 14 px context. Selection has a check, border and background as well as native pressed state. Numerical values and the meaning of all 18 questions are unchanged.
5. **Typography and alignment:** answer labels/instructions and primary controls use 16 px, supporting status/counter text at least 14 px; button text/icons use explicit alignment. Small/short layouts scroll useful content. On short landscape screens the decorative wordmark gives space to the counter and actions; text is not shrunk to fit. Body/title focus resets on question changes, and the enlarged-text first-cycle regression remains covered.

Quiz content, favourites, scoring, owner-scoped drafts, mute and account/provider/data contracts are preserved. No production configuration, schema or user record was changed.

## Verification and review

- Original focused regression: **3 failed** (swipe feedback in two motion modes, redundant Continue), `/tmp/tpd-s24-red.log`.
- Swipe-only correction: **2 passed**. First wider Chrome run: 45 pass / 2 fail; the failures exposed the enlarged-text header constraint and card/control collision. Targeted corrected scenarios then passed **3/3** (`/tmp/tpd-s24-layout-fix.log`). No test was forced through an overlapping control.
- Final WebKit development: **48 passed** (`/tmp/tpd-s24-webkit-final.log`), including all 18 questions/top-up, Back, draft recovery, owner isolation, timer interruption, both motion modes, small/landscape viewports, doubled text and automated accessibility checks.
- Production build including TypeScript passes (`/tmp/tpd-s24-build.log`). Final Chrome compiled: **47 passed / 1 development-only skip** (`/tmp/tpd-s24-compiled-final.log`); unit/service checks pass (`/tmp/tpd-s24-unit.log`). Source-push and READY branch-preview receipts are recorded in #60 after delivery.
- Independent code-review Standards and Spec axes both report **0 residual findings** on `a0455be...227fba0`. The physical corrections still require the owner's S24 retest.

Browser fixtures use synthetic/local QA data and intercepted APIs. Screenshot `.private/s24-quiz/scale-384.png` is synthetic and ignored. WebKit/Chrome results are supporting engineering evidence, not a replacement for the failed physical run.

## Focused S24 retest

Use the new exact READY branch-preview URL/SHA in the #60 receipt. Keep the earlier FAIL visible. No browser-data reset is needed or requested; a different preview origin may naturally have a separate local draft.

1. Start/open the quiz: at full multi-selection it advances automatically and no generic Next/Continue appears. With one partial choice, Use 1 choice deliberately finishes that question. Go Back, check the selected answers and use Keep these answers when appropriate.
2. At Your ideal day abroad, read all five contextual buttons and tap one; verify size, alignment and selected feedback. Repeat in landscape and with increased text, scrolling when needed.
3. Swipe Yes and No through several music/film cards, then Undo. Each current card has only its own name/note and neutral drag feedback until the next gesture. Buttons below it stay clickable, without title/note overlap.

Report each task pass/fail with what was observed. Exact Chrome version can be recorded from Chrome → Settings → About Chrome when convenient; do not replace unknown with an inferred latest version. Native keyboard, TalkBack, account synchronisation and notebook checks remain separate open rows.
