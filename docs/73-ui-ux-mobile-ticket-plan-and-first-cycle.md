# UI/UX/mobile — ticket plan and first implementation cycle

28 October 2026 · Programme [#60](https://github.com/sararr25/TPD/issues/60). Owner approved the report and requested ticket decomposition plus starting work.

Baseline: local `ec7630d` (report), application/release `7b4e3a1`. Working branch `codex/twin-motion-ux`; default/production configuration unchanged.

## Complete feedback mapping

| Feedback | Issue | Current scope/status |
|---|---|---|
| UI-01 | [#61](https://github.com/sararr25/TPD/issues/61) | First cycle: implemented, verification in progress |
| UI-02 | [#62](https://github.com/sararr25/TPD/issues/62) | Photo rules/proposal; rights and import remain gated |
| UI-03 | [#63](https://github.com/sararr25/TPD/issues/63) | Planned |
| UI-04 | [#64](https://github.com/sararr25/TPD/issues/64) | Planned |
| UI-05 | [#65](https://github.com/sararr25/TPD/issues/65) | First cycle: implemented, verification in progress |
| UI-06 | [#66](https://github.com/sararr25/TPD/issues/66) | Planned |
| UI-07 | [#67](https://github.com/sararr25/TPD/issues/67) | Planned |
| UI-08 | [#68](https://github.com/sararr25/TPD/issues/68) | Planned |
| UX-01 | [#69](https://github.com/sararr25/TPD/issues/69) | First cycle: implemented, verification in progress |
| UX-02 | [#70](https://github.com/sararr25/TPD/issues/70) | First cycle: implemented, verification in progress |
| UX-03 | [#71](https://github.com/sararr25/TPD/issues/71) | First cycle: implemented, verification in progress |
| UX-04 | [#72](https://github.com/sararr25/TPD/issues/72) | Planned |
| UX-05 | [#73](https://github.com/sararr25/TPD/issues/73) | Planned |
| UX-06 | [#74](https://github.com/sararr25/TPD/issues/74) | Planned |
| UX-07 | [#75](https://github.com/sararr25/TPD/issues/75) | Planned |
| UX-08 | [#76](https://github.com/sararr25/TPD/issues/76) | Planned |
| UX-09 | [#77](https://github.com/sararr25/TPD/issues/77) | Planned |
| UX-10 | [#78](https://github.com/sararr25/TPD/issues/78) | Planned |
| UX-11 | [#79](https://github.com/sararr25/TPD/issues/79) | Planned |
| UX-12 | [#80](https://github.com/sararr25/TPD/issues/80) | Planned |
| MOB-01 | [#81](https://github.com/sararr25/TPD/issues/81) | First cycle: implemented, verification in progress |
| MOB-02 | [#82](https://github.com/sararr25/TPD/issues/82) | Planned |
| MOB-03 | [#83](https://github.com/sararr25/TPD/issues/83) | Planned |
| MOB-04 | [#84](https://github.com/sararr25/TPD/issues/84) | Planned |
| MOB-05 | [#85](https://github.com/sararr25/TPD/issues/85) | Human gate; evidence register #59 |
| MOB-06 | [#86](https://github.com/sararr25/TPD/issues/86) | Human gate; evidence register #59 |
| MOB-07 | [#87](https://github.com/sararr25/TPD/issues/87) | Planned |
| MOB-08 | [#88](https://github.com/sararr25/TPD/issues/88) | Human gate; evidence register #59 |

## First cycle

- #81: reproduced six pairs of intersecting first-question answer targets at 667×375 with a failing browser assertion. Short narrow viewports now retain real tile heights and scroll the reading area. Existing 18-question semantics, mute and owner-scoped draft handling stay.
- #69: discovery notice and provider-supported quiz explanation now precede the list, once, after the loading/error gate.
- #61: Place actions precede the secondary quiz invitation; the first-time quiz action is quiet only in Place. Retry/error states still use the shared PassportPrompt.
- #70: a single early quiz CTA for a new Passport above the book; left travels/right profile structure and equal desktop halves stay. Returning profiles do not get this new prompt.
- #71: taste and hidden-place controls precede data management; empty trip reset is disabled with explanation. Resetting existing organisation/visits requires a named native confirmation; Saved, notes and Passport are excluded.
- #65: primary Twin card displays Not for me and Directions labels, retaining specific accessible names and wrapping touch targets.

## Validation and boundaries

Verification in progress. Initial minimal quiz regression was red with six intersections, then green after the CSS correction. Browser fixtures intercept provider/account APIs and use synthetic browser-local data. The first sandboxed Chrome launch was denied by the environment; the authorised test launch succeeded. One initial Directions assertion was corrected to provide coordinates in its fixture; missing-coordinate places intentionally have no Directions.

No production data, schema, auth/provider, sync setting or import was changed. Physical phones, native screen readers, perceived sound, real account sessions and field performance remain NOT RUN under #59 and the new linked gate tickets. Screenshots stay under ignored `.private/audit-72/`. This document will record final checks and source publication before ticket closure; source push is distinct from production deployment.
