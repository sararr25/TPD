# UI/UX/mobile — ticket plan and first implementation cycle

28 October 2026 · Programme [#60](https://github.com/sararr25/TPD/issues/60). Owner approved the report and requested ticket decomposition plus starting work.

Baseline: local `ec7630d` (report), application/release `7b4e3a1`. Working branch `codex/twin-motion-ux`; default/production configuration unchanged.

## Complete feedback mapping

| Feedback | Issue | Current scope/status |
|---|---|---|
| UI-01 | [#61](https://github.com/sararr25/TPD/issues/61) | Implemented locally; source push pending approval |
| UI-02 | [#62](https://github.com/sararr25/TPD/issues/62) | Photo rules/proposal; rights and import remain gated |
| UI-03 | [#63](https://github.com/sararr25/TPD/issues/63) | Planned |
| UI-04 | [#64](https://github.com/sararr25/TPD/issues/64) | Planned |
| UI-05 | [#65](https://github.com/sararr25/TPD/issues/65) | Implemented locally; source push pending approval |
| UI-06 | [#66](https://github.com/sararr25/TPD/issues/66) | Planned |
| UI-07 | [#67](https://github.com/sararr25/TPD/issues/67) | Planned |
| UI-08 | [#68](https://github.com/sararr25/TPD/issues/68) | Planned |
| UX-01 | [#69](https://github.com/sararr25/TPD/issues/69) | Implemented locally; source push pending approval |
| UX-02 | [#70](https://github.com/sararr25/TPD/issues/70) | Implemented locally; source push pending approval |
| UX-03 | [#71](https://github.com/sararr25/TPD/issues/71) | Implemented locally; source push pending approval |
| UX-04 | [#72](https://github.com/sararr25/TPD/issues/72) | Planned |
| UX-05 | [#73](https://github.com/sararr25/TPD/issues/73) | Planned |
| UX-06 | [#74](https://github.com/sararr25/TPD/issues/74) | Planned |
| UX-07 | [#75](https://github.com/sararr25/TPD/issues/75) | Planned |
| UX-08 | [#76](https://github.com/sararr25/TPD/issues/76) | Planned |
| UX-09 | [#77](https://github.com/sararr25/TPD/issues/77) | Planned |
| UX-10 | [#78](https://github.com/sararr25/TPD/issues/78) | Planned |
| UX-11 | [#79](https://github.com/sararr25/TPD/issues/79) | Planned |
| UX-12 | [#80](https://github.com/sararr25/TPD/issues/80) | Planned |
| MOB-01 | [#81](https://github.com/sararr25/TPD/issues/81) | Implemented locally; source push pending approval |
| MOB-02 | [#82](https://github.com/sararr25/TPD/issues/82) | Planned |
| MOB-03 | [#83](https://github.com/sararr25/TPD/issues/83) | Planned |
| MOB-04 | [#84](https://github.com/sararr25/TPD/issues/84) | Planned |
| MOB-05 | [#85](https://github.com/sararr25/TPD/issues/85) | Human gate; evidence register #59 |
| MOB-06 | [#86](https://github.com/sararr25/TPD/issues/86) | Human gate; evidence register #59 |
| MOB-07 | [#87](https://github.com/sararr25/TPD/issues/87) | Planned |
| MOB-08 | [#88](https://github.com/sararr25/TPD/issues/88) | Human gate; evidence register #59 |

## First cycle

- #81: reproduced six pairs of intersecting first-question answer targets at 667×375 with a failing browser assertion. Short narrow viewports now retain real tile heights and scroll the reading area. Each question resets the reading position before its title receives focus. Existing 18-question semantics, mute and owner-scoped draft handling stay.
- #69: discovery notice and provider-supported quiz explanation now precede the list, once, after the loading/error gate.
- #61: Place actions precede the secondary quiz invitation; the first-time quiz action is quiet only in Place. Retry/error states still use the shared PassportPrompt.
- #70: a single early quiz CTA for a new Passport above the book; left travels/right profile structure and equal desktop halves stay. Returning profiles do not get this new prompt.
- #71: taste and hidden-place controls precede data management; empty trip reset is disabled with explanation. Resetting existing organisation/visits requires a named native confirmation; Saved, notes and Passport are excluded. Cancellation returns focus to the trigger; success focuses the stable data-management heading.
- #65: primary Twin card displays Not for me and Directions labels, retaining specific accessible names and wrapping touch targets.

## Validation and boundaries

Final compiled check: **69 passed / 2 development-only skips**, 71 total. The two skipped checks (detailed Place and photo continuity) passed on the development server; the final affected development run was **14/14**. Counts overlap and are not additional unique passes. The compiled run includes all 18 quiz questions/top-up at 667×375, 844×390 and 320×568, including a doubled-text CSS stress scenario with heading-visibility assertions, guest/returning Passport, labels, filters, drafts, retries, owner isolation and Home/motion checks. CSS text enlargement is a layout stress test, not actual iOS text sizing or assistive acceptance.

`npm test`, `npm run typecheck`, production `npm run build` and `git diff --check` pass. Implementation commits: `1c96887` and review corrections `21e5f6f`. Logs: `/tmp/tpd-audit72-unit-final.log`, `/tmp/tpd-audit72-build-final.log`, `/tmp/tpd-audit72-compiled-final.log`, `/tmp/tpd-audit72-review-fixes.log`. Preview: http://127.0.0.1:3221 (compiled); localhost:3220 was used for development-only checks.

Initial minimal quiz regression was red with six intersections, then green after the CSS correction. The first 70-case development run was 67 pass / 3 fail: a new notice increased pre-result height; integrating it into the existing guest banner fixed the real regression. Two old checks required all answer buttons simultaneously in the viewport; those now verify every target is reachable inside the intentionally scrollable reading area, while header/navigation remain visible. The affected 14 checks then passed. An initial Directions assertion was corrected to provide coordinates in its fixture; missing-coordinate places intentionally have no Directions.

The first compiled attempt started before the new server could bind (sandbox EPERM): 14 connection-refused failures, 54 pass, 2 skips, and one transient size assertion on a normal-motion transform. It is not represented as green. The target-size test now uses reduced motion to measure static targets; the final compiled server reported Ready before the entirely successful 69/2 run. Chrome/test-server sandbox restrictions were resolved through the normal authorised execution path. Browser fixtures intercept provider/account APIs and use synthetic browser-local data.

No production data, schema, auth/provider, sync setting or import was changed. Physical phones, native screen readers, perceived sound, real account sessions and field performance remain NOT RUN under #59 and the new linked gate tickets. Screenshots stay under ignored `.private/audit-72/`. The automatic approval review rejected the push to `sararr25/TPD`, branch `codex/twin-motion-ux`, because the current authorisation covers local implementation and issue creation, not source publication. No source files were pushed. The six implementation issues remain open with a local-completion receipt pending explicit push approval. Source commits before this documentation-only clarification end at `319867a`; implementation is `21e5f6f`. No production deployment is claimed.


## Standards

The code-review skill ran a separate Standards agent against `ec7630d...1c96887`, then `21e5f6f` corrections. Initial findings: (1) the new reading scroll could leave the next focused question outside the viewport; (2) reset success disabled the trigger before focus restoration. Both were reproduced with isolated local fixtures and fixed. The follow-up also checked a synthetic swipe transition. No additional actionable documented-standard violation or baseline smell remained. **Residual Standards findings: 0.**

## Spec

A separate Spec agent checked only the six authorised first-cycle items against docs/72, not all 28 pending work items. Initial findings: reset focus, text enlargement missing on newly rendered top-up labels, and Place acceptance lacking coordinates/geometry. Corrected the focus destination, applied the text helper to top-up, and extended the existing development-only Place fixture with optional address/chips/coordinates. The test now checks Twin, Save and Directions above the mobile tab bar at 390×844. **Residual Spec findings: 0.** Neither review certifies physical-device/account acceptance.

## Next cycle

Start with #82's local mobile-comparison prototype, then #83 first-result density and #84 category discoverability; keep #66 photo composition and #64 type in the same visual comparison. These remain planned. #62 needs an editorial/rights proposal before any import. #85/#86/#88 reuse the actual-device/account evidence register #59 and remain human gates. Production remains the release documented in docs/71 until an explicit publication cycle verifies SHA/READY/alias separately.
