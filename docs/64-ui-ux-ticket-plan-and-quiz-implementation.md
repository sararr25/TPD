# UI/UX plan and urgent quiz corrections — 27 October 2026

Owner approved the audit and requested tickets plus implementation of the most urgent work. This is a local continuation of published `dfb92e2`, not a deployment receipt.

## Tracker

Coordinator [#45](https://github.com/sararr25/TPD/issues/45) has 13 native sub-issues, native blocking dependencies and `ready-for-agent` labels. Existing #36–44 remain their own acceptance/history register. No historical ticket was reopened or closed by implication.

The owner confirmed the test seams: existing Playwright journeys with provider/account fixtures, service assertions only when persistence changes. Specs follow to-spec. New functions with unresolved data/rights contracts begin with prototypes and concrete proposals.

| Ticket | Scope | Status |
|---|---|---|
| [#46](https://github.com/sararr25/TPD/issues/46) | Final quiz count and CTA | Implemented locally |
| [#47](https://github.com/sararr25/TPD/issues/47) | Shared accessible quiz dialog | Implemented locally |
| [#48](https://github.com/sararr25/TPD/issues/48) | Recoverable draft and persistent mute | Implemented locally |
| [#49](https://github.com/sararr25/TPD/issues/49) | Comfortable mobile targets | Implemented locally; see docs/65 |
| [#50](https://github.com/sararr25/TPD/issues/50) | Earlier Home actions and City results | Implemented locally; see docs/65 |
| [#51](https://github.com/sararr25/TPD/issues/51) | SVG actions and photo consistency | Implemented locally; see docs/66 |
| [#52](https://github.com/sararr25/TPD/issues/52) | Reasons, Twin differences and Passport copy | Implemented locally; see docs/66 |
| [#53](https://github.com/sararr25/TPD/issues/53) | Save panels, feedback and motion | Implemented; see docs/68 |
| [#54](https://github.com/sararr25/TPD/issues/54) | Compare 2–3 places | Implemented; see docs/68 |
| [#55](https://github.com/sararr25/TPD/issues/55) | Resume search and temporary preferences | Implemented; see docs/68 |
| [#56](https://github.com/sararr25/TPD/issues/56) | Organise saved places | Implemented; contract docs/67, receipt docs/68 |
| [#57](https://github.com/sararr25/TPD/issues/57) | Explicit post-visit feedback | Implemented; contract docs/67, receipt docs/68 |
| [#58](https://github.com/sararr25/TPD/issues/58) | Travel notebook export | After organisation; rights first |

## Implemented behaviour

- Final favourites count the actual deduplicated union of quiz and additional selections. The heading counts down, then says Your choices are ready. N of 5 selected agrees with the 3–5 save requirement.
- Passport opens the same native quiz dialog as Home/Settings. The duplicate overlay/completion path is removed. The browser makes the background inert; opening/completion focus is explicit, Escape respects saving, and closing returns focus to the trigger or a persistent title.
- Drafts retain question, answers, swipe decisions/Undo and top-up. Reopening offers Continue your quiz or Start again; resume itself makes no sound.
- Drafts are browser-only, separately keyed for guest and each account, with no implicit migration. They are separate from completed Passports and pending account saves. Schema validation and a seven-day restore window reject malformed/expired records.
- Browser mute preference persists separately. Start and successful-result audio retain their existing deliberate boundaries.
- Successful completion removes its draft; failures retain it. Blocked storage is disclosed while current choices remain usable. Passport/account deletion clears relevant drafts.
- Account changes mask/close the dialog. A generation guard rejects a late discovery result after owner changes, including A→B→A. Existing account-write ownership contracts remain.

Brand, illustrations, IDs, scoring, provider payloads, 3–5 requirement, schema and auth choices are preserved. No Tailwind/shadcn installation was needed.

## Verification

Initial development quiz run: 11 pass, 2 test-assertion failures. One incorrectly assumed Playwright role locators omit a native dialog's implicit inert background; it now verifies focus cannot move behind it. The other expected Redo after all questions were skipped, when Settings correctly says Take the quiz. Corrected targeted rerun passes; subsequent development quiz run passes 19/19.

Compiled production run: **56 pass, 5 intentional skips**, across quiz, Passport folio, acceptance and review refinements. The five skips are development-only Place fixtures: return navigation plus four broken-photo widths. Extra scenarios cover 320px top-up resume and two synthetic account owners. Screenshots of the 320px resume/final screens were inspected. This is a targeted integrated run, not a fresh whole-repository browser run.

Full unit/service suite passes, including a late-owner response regression in the existing completion-service seam. Production build, typecheck and whitespace checks pass. Logs are private at `/tmp/tpd-audit-*`; screenshots stay ignored.

Execution corrections: first Chrome launch was sandbox-blocked and rerun with execution permission. The first compiled invocation was interrupted after local bind denial. A second lacked the suite's production flag and reached development-only preview routes; interrupted and rerun with `PASSPORT_PRODUCTION=1`. These are harness corrections, not an all-green initial run or application-defect claims.

## Boundary and continuation

Local implementation only: no push, deployment, production config or schema change. Tickets stay open for integration/review; comments distinguish local implementation from publication. #49/#50 were subsequently implemented; see [the mobile and first-action continuation](65-mobile-targets-and-first-actions.md).

Physical phones, native Safari/VoiceOver/TalkBack, actual audio, genuine account/cross-device checks and field performance remain under #43/#44. Fixtures do not prove those paths or ranking quality.
