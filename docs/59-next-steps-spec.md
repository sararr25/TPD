# Beesyde — next steps after the reconciled release

Planning date: 26 October 2026. Execution started after owner authorization; the working acceptance receipt records progress, local fixes and remaining gates.

## Problem Statement

Beesyde's Home, Cities/Twin, Taste Chemistry and personal Taste Passport have been integrated and published, but the open tracker still describes much of that work as planned or local-only. Visitors need confidence that the complete experience works on actual phones, with assistive technology and genuine account boundaries. The owner needs an ordered programme that separates delivered functionality, remaining acceptance and optional expansion, without rebuilding approved work.

## Solution

Complete an evidence-led acceptance cycle on the reconciled release, reconcile existing tickets against their latest amendments, fix confirmed defects, then prepare bounded proposals for the remaining coverage and catalogue work. Preserve the approved Passport visual direction and current discovery contracts.

## User Stories

1. As a project owner, I want an accurate delivery register, so that I know what remains after publication.
2. As a project owner, I want each existing ticket assessed against its latest approved scope, so that old requirements do not restart completed work.
3. As a visitor, I want both city discovery and Find its twin to remain easy to reach, so that I can choose either journey.
4. As a returning visitor, I want legacy Twin links and navigation context preserved, so that existing routes remain useful.
5. As a Twin seeker, I want Keep, Delete and Ignore to retain their meanings, so that I can control a search confidently.
6. As a Passport owner, I want Delete confined to my current search, so that it cannot erase my profile.
7. As a Twin seeker, I want my main match visible after searching, so that I can act immediately.
8. As a keyboard user, I want See other matches to move focus to those results, so that I can continue without searching the page.
9. As a visitor, I want errors and retries to preserve my choices, so that interruptions do not waste my work.
10. As a visitor, I want four consistent indicative price levels and honest unknowns, so that I can understand budget information.
11. As a city explorer, I want supported categories and filters to agree with the returned places, so that the interface remains trustworthy.
12. As an event seeker, I want the Paris-only coverage and real event dates made clear, so that I understand what is available.
13. As a phone user, I want controls usable in portrait and landscape, so that I can complete discovery on my device.
14. As a Safari user, I want quiz dialogs, maps and saving to work reliably, so that browser choice does not block me.
15. As a VoiceOver user, I want meaningful labels, announcements and focus order, so that I can complete the same journeys.
16. As a motion-sensitive visitor, I want a readable static equivalent, so that decoration does not prevent use.
17. As a returning visitor, I want Back and Forward to preserve readable content, so that animations do not hide my next action.
18. As a quiz participant, I want failed saves to preserve answers and allow retry, so that I can finish my Taste Passport.
19. As a quiz participant, I want mute and deliberate sound boundaries to work on my device, so that audio stays under my control.
20. As a Passport owner, I want insight previews to load only when opened and retain the chosen city, so that discovery stays deliberate.
21. As a visitor, I want explicit travel history kept distinct from opened-city stamps, so that my Passport represents my choices honestly.
22. As an account holder, I want a clear statement of whether visited-city sync is available, so that I understand where my data is saved.
23. As a shared-device user, I want account changes to clear the previous person's results, so that private taste and travel data stay isolated.
24. As a trip owner, I want shared links and postcard images to omit private notes, so that deliberate sharing remains safe.
25. As a visitor on a slower phone, I want responsive controls during map and animation work, so that the experience remains usable.
26. As a project owner, I want independent visual and source review with traceable findings, so that automated checks are complemented by human judgement.
27. As a project owner, I want catalogue rights, coverage and costs checked before import, so that a Lisbon pilot can proceed on a concrete basis.
28. As a project owner, I want release claims tied to observed evidence, so that synthetic tests are not mistaken for real-device or ranking-quality proof.

## Implementation Decisions

- Baseline: local clean checkout on `codex/twin-motion-ux`, HEAD `a7c45c6`; integrated application `975386f`. Latest handover records a matching READY production deployment and public-alias smoke. This planning task does not independently reverify Vercel or the live app. GitHub default branch verified as `claude/blissful-gauss-dymbeo`.
- Reuse existing issues #36–43 as the implementation/acceptance register. This spec coordinates their continuation rather than creating duplicate implementation tickets. Reconcile actual source, latest owner amendments, release receipts and outstanding criteria before changing status; close only criteria supported by evidence.
- Reconcile #37 terminology/contracts, #39 four real price tiers, #40 editor and #41 main match against the released implementation. The original five-tier sections in #36/#39 are superseded by the explicit four-tier amendment. Preserve the amendment when improving ticket clarity.
- For #38, distinguish delivered Restaurants/Bars/Cafés/Museums/Hotels Twin support from the separate dated Paris Events pilot. Keep unsupported-city Events and personalized event twins explicit follow-ups; no broad expansion is required to accept the already approved pilot. If original acceptance still demands broader coverage, record a scoped follow-up and owner decision rather than silently marking it done.
- For #42/#43, identify which independent review criteria have since been satisfied by release reviews and which remain. Review the final integrated source and visible experience, including Home, rather than treating earlier component reviews as automatic whole-release acceptance.
- Preserve the current Taste Chemistry quiz, original illustrations, save/audio boundaries and Passport folio with deliberate inline discovery. Earlier unused Passport/quiz remakes do not define the current product.
- Reuse current browser fixtures and discovery/venue contracts. Confirmed defects determine changes to navigation, quiz, Passport, visited-city persistence, Twin, maps or motion; no speculative redesign or broad refactoring.
- Visited-city persistence already has a server-side `VISITED_CITIES_SYNC` gate. Inspect actual deployment configuration read-only before making an account-sync claim. Do not enable it or reapply its existing schema as part of acceptance. Distinguish real visits from activity stamps and verified taste affinity.
- Real-account checks use normal sign-in and deliberate owner-controlled actions. Synthetic regression remains isolated and intercepts provider/account endpoints. Do not copy cookies, fabricate sessions or write personal production data during routine QA.
- Catalogue remains a proposal: 30–50 Lisbon places, existing Neon metadata approach, no new provider or bucket. Revalidate applicable retention/image rights, actual coverage, exact migration, costs/headroom and refresh rules before presenting the approval packet. Historical inventory counts are not current verified catalogue coverage.
- Read the relevant installed Next.js guides before any subsequent code change. Keep default branch, production branch, provider/auth choices, brand and privacy contracts unchanged.

## Testing Decisions

- Primary seam: existing Playwright browser journeys, asserting visitor actions and visible outcomes rather than animation-library calls or internal class names. Reuse Twin flow, Taste Chemistry, Passport folio, personal Home, motion, Cities/Twin release, Events and acceptance scenarios.
- Necessary lower seam: existing discovery/venue and persistence service checks for signed references, category eligibility, four-tier/unknown-price handling, trait aliases, exclusions through every fallback and account isolation. Browser fixtures cannot independently prove these backend behaviours.
- These two seams were confirmed by the owner in #36 on 25 October and explicitly reconfirmed on 26 October for this programme: existing browser journeys plus discovery service tests for categories, prices and exclusions. No new test seam is proposed.
- Browser coverage includes 0/1/3 matches, loading, empty/error/retry, stale and out-of-order responses, hidden places, failed images, account/city/profile changes, deliberate preview loading and Save/share privacy.
- Responsive coverage reuses 320/375/390/768/1440 widths, short landscape, 200% text, keyboard, initial/runtime reduced motion and Back/Forward. Verify content and actions remain accessible rather than requiring impossible single-screen layouts at extreme zoom.
- Physical acceptance separately covers iPhone Safari, an Android phone, macOS Safari and VoiceOver. Record actual hardware, OS/browser version, task, outcome and limitation. Check touch/swipe, native dialogs/focus, audio/mute, map/list, Save, travel editing and quiz save retry. Emulation is supporting evidence only.
- Field performance: record navigation, input responsiveness, layout shifts and map/motion activity on representative real hardware/network conditions, with a repeatable procedure. Establish the baseline before proposing numeric budgets; do not label lab data as field metrics.
- Run the complete current compiled browser suite with explicit skip reasons, plus development-only fixtures separately. Reuse opt-in immutable A/B tests only when the correct baseline exists; do not rebuild a baseline to create an uplift claim. The latest handover's initial development result was 102 pass/6 fail/2 skips, followed by 33 compiled targeted passes/5 development-fixture skips and 36 public-alias synthetic passes; it was not an all-green whole-suite run.
- After confirmed fixes, run relevant regressions, complete unit/service suite, typecheck, production build and diff check. Repeat broader checks only where changed shared behaviour warrants them. Store recordings and screenshots privately; publish only anonymized summaries.
- This specification performs no fresh application tests and makes no new real-device, cross-device, production or recommendation-quality acceptance claim.

## Out of Scope

A new visual direction; replacing the quiz or Passport; five invented price tiers; new auth/provider choices; Google Places; global Events or event twins implementation; bulk catalogue import; enabling account visit sync; unapproved production schema/storage changes; publishing application changes; changing default/Vercel settings; reopening historical closed tickets; a statistical A/B experiment or ranking-quality uplift claim. Expansion and configuration changes need their concrete follow-up scope.

## Further Notes

### Ordered programme and exit gates

| Priority | Work | Dependency | Reviewable deliverable / exit gate |
|---|---|---|---|
| P0 · 1 | Reconcile #36–43 with the final release and amendments | None | One criterion-by-criterion matrix: delivered, evidence missing, defect or deferred coverage; current source/release references; accurate blockers. No automatic closure. |
| P0 · 2 | Establish a complete integrated regression result | Step 1 | Full compiled-browser report plus separate development fixtures; unit/type/build checks; every failure and skip explained. Reuse fixtures and avoid live quota. |
| P0 · 3 | Complete independent integrated source and visual review | Steps 1–2 | Findings by severity, private desktop/mobile recordings, explicit acceptance against current ADRs; fixes linked to existing tickets. |
| P0 · 4 | Run physical-device, Safari/VoiceOver and field-performance acceptance | Step 2; device/owner access | Recorded device matrix and complete critical journeys; inaccessible equipment remains explicitly unverified. Fix blockers and rerun affected checks. |
| P1 · 5 | Verify genuine-account/travel-sync boundaries | Steps 1–2; normal signed-in owner session | Read-only configuration finding, accurate sync disclosure, and scoped same-account checks only where supported/authorized; no configuration toggle. Historical account checks remain historical. |
| P1 · 6 | Resolve remaining Events coverage scope | Step 1 | Current category/city capability matrix, Paris-pilot acceptance and explicit follow-up for broader cities/event twins. No new integration by implication. |
| P2 · 7 | Prepare Lisbon catalogue decision packet | Current rights, coverage and cost evidence | Bounded selection, rights/photo review, exact schema and import limits, maintenance and rollback proposal; obtain concrete approval before writes. |
| P2 · 8 | Consolidate acceptance handover and submission gaps | Steps 1–6; step 7 can remain a proposal | Updated tracker/handover, closed criteria only with evidence, remaining limits, and a licence/submission-readiness checklist without selecting a licence for the owner. |

Execute in order; assign the real responsible person when work starts. Independent review and physical testing require their respective reviewer/device access. No calendar deadlines are invented. The critical path is tracker reconciliation → integrated regressions → review/device findings → targeted fixes → acceptance receipt. Catalogue expansion is outside that critical path.

Source context: current project README and handovers 28, 54, 55, 57, 58; Lisbon catalogue proposal; glossary and ADRs 0001–0004; live GitHub issues #36–43 including #36's implementation comment and #39's owner amendment. The latest handover supersedes earlier stale-checkout and unpublished-work warnings.
