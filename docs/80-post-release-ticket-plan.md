# Post-release feedback: ticket proposal and first implementation

28 October 2026. Source: owner feedback in docs/79. GitHub default/release branch verified as `claude/blissful-gauss-dymbeo`; remote main and release both `91bd91e`. Local main starts at the same commit. Open issues and comments read; existing rights, physical-device and account acceptance gates remain separate. No existing parent issue modified.

Owner approved the four-ticket breakdown and dependency. Published as [#89](https://github.com/sararr25/TPD/issues/89), [#90](https://github.com/sararr25/TPD/issues/90), [#91](https://github.com/sararr25/TPD/issues/91), [#92](https://github.com/sararr25/TPD/issues/92), all with `ready-for-agent`. Native blocking edge: #91 is blocked by #90. No parent issue modified. The four slices below retain the approved scope.

## 1. Keep suggested places as the Twin starting place

**What to build:** Find its twin opens preferences for the linked place even when name search cannot find it. Applies to Place, card links and resumed searches.

**Blocked by:** None.

- [ ] Use the linked identity and validate city/category on the server.
- [ ] Never silently replace the starting place with a different same-name place.
- [ ] Keep manual name searches working and errors recoverable.
- [ ] Lock down empty-name-search and city/category boundary regressions; verify the original Gardens record when identified.

## 2. One gentle favourites invitation

**What to build:** Passport contains one rounded, warm invitation to add favourites. Other sections and cards do not repeat completion prompts; genuine loading, save, expiry and error recovery remain available.

**Blocked by:** None.

- [ ] One completion invitation in Passport, with a clear route into its editor.
- [ ] Remove duplicate completion messages across Home, City, Twin and Place.
- [ ] Keep new, incomplete, ready and error states understandable.
- [ ] Finite, subtle motion; static reduced-motion presentation; keyboard access.

## 3. Give Twin and Passport clear spacing and action hierarchy

**What to build:** Category filters, search steps, starting place and preferences read as separate sections. Passport no longer clusters competing messages and oversized actions under Explore cities.

**Blocked by:** 2, because the consolidated invitation determines the final composition.

- [ ] Consistent spacing tiers and proportionate primary/secondary actions.
- [ ] Accessible targets and visible focus without inflated visual buttons.
- [ ] Verify 375px portrait, landscape, desktop and enlarged text without overlap or horizontal overflow.

## 4. Make the shared journey illustration readable

**What to build:** Larger book/route/pin illustrations and a longer, thicker route have a deliberate place above the Place title; revise every shared occurrence consistently.

**Blocked by:** None.

- [ ] Place illustration above the title using the available width.
- [ ] Review all shared contexts, including City, Cities, Twin, Compare and loading.
- [ ] Finite drawing/reveal, cleanup and legible reduced-motion art.
- [ ] Preserve the separately approved quiz theatre C.

## First implementation: linked Twin reference

Owner authorised beginning implementation. A service-level synthetic regression reproduced a linked place disappearing when `/search` returns no matches, while `/entities` can return it. Before the fix the command `node --experimental-strip-types --conditions=react-server scripts/check-linked-reference.mjs` fails with `0 !== 1`; after the fix it passes. This establishes the failure pattern, not the identity or live-provider behaviour of the owner's particular Gardens.

Client now forwards the linked reference ID through the existing budgeted, same-origin discovery API. The service uses direct ID lookup when supplied, checks returned identity and city/category eligibility, and signs the validated selection. Ordinary name search remains unchanged. Removed automatic selection of another same-name place. No schema, provider, auth or deployment changes.

Validation: full existing npm test passed; new linked-reference service regression passed and added to npm test; typecheck and production build passed; two Chrome browser regressions passed on the existing local server with intercepted synthetic APIs. Initial sandbox Chrome launch failed before tests ran; rerun outside sandbox succeeded. No real account writes or live provider requests were used. Original Gardens needs its precise record to confirm the real scenario.

UI preparation: invoked ui-ux-pro-max design-system and animation/accessibility searches. Suggestions are advisory: the generated newsletter structure and replacement palette/type do not fit this existing app. Preserve project ADRs, current fonts and berry/lemon brand; use spacing hierarchy, focus, accessible targets and finite reduced-motion-aware feedback. Full gpt-taste UI preflight remains for the visual implementation; no UI layout or styling has been changed in this first functional slice.

Changes are local and uncommitted. Tickets are published following owner approval; no production publication is claimed.

## Visual implementation: #90, #91, #92

The shared PassportPrompt no longer renders favourite-completion advertising in the needs-favourites state. Error, saving, partial-save and expired-selection recovery remain intact. Passport keeps one tools panel and Add what you love action, now rounded with a finite GSAP entrance and subtle hover feedback; reduced motion stays static. Removed the repeated invitation under Explore cities and replaced repeated editor/preview copy with local instructions. The empty favourites list describes its contents rather than adding another call to action.

Twin separates category filters from steps with 24px clearance, then a divider and 24/32px gaps before its intro/editor. Passport tools use a 32/48px section rhythm, a restrained rounded surface and text-sized actions retaining >=44px targets.

The shared journey SVG now fills more available width with a 2.4-unit rounded stroke and a compass in place of the empty centre circle. Place renders it above the location/title. Cities, City/Twin, standalone Twin, Compare and loading inherit larger versions; compact and landscape overrides no longer shrink it to a tiny ornament or hide it. Existing finite GSAP route drawing/marker entrance and media-context cleanup remain, with a static reduced-motion rendition. Quiz theatre C is untouched.

Private synthetic screenshots inspected at 375/1440: `.private/feedback-invitation-375.png`, `.private/feedback-invitation-1440.png`, `.private/feedback-place-375.png`, `.private/feedback-place-1440.png` (initial captures precede the tiny centre-compass refinement). No account information or provider payloads are shown.

Final verification: full npm test, TypeScript and final production build pass; git diff --check passes. The 53-case Chrome run finished 52 passed / 1 failed solely due to a strict selector matching a hidden streamed copy of Place. After selecting the visible instance, the final focused run passes all 9 linked-reference and UI-feedback cases, including the previously failed case. This is complete-run plus focused-rerun evidence, not a second clean 53-case run. New coverage includes one invitation, editor focus/return, category-to-step clearance, larger route above title, 200% root text size, reduced motion and no horizontal overflow at 375/812/1440. Screenshots were visually inspected. No application defect was found by the initial selector failure. Physical device/assistive-technology acceptance remains separate; the original Gardens record has not been identified or live-reproduced.

## Authorised publication preparation

Owner requested push live followed by real verification. Independent code-review Standards and Spec each found one issue: mark development-only Place checks as skipped in production; separate ID-reference validation from manual text-search name limits. Both corrected, with the actual POST route regression failing before and passing after the fix. Linked place identity now works even with a short, long or missing display name; ordinary text-search limits remain. Final build passes and both review axes report zero residual actionable findings. Publication and live-provider receipts follow separately.
