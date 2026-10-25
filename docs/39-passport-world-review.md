# Independent Passport A UI/UX review

Reviewer: separate UI/UX agent, 25 October 2026. Read-only app review; no app code changed.

## Scope and evidence

Reviewed the shared checkout implementation and screenshot matrix in `.private/passport-world/`: Cities, Lisbon, Swap, Passport, Settings, Saved, Compare, shared trip and Place at 375×812, 812×375 landscape and desktop. Inspected `TravelMotion`, Home motion, quiz changes, saved-state rendering and the two new stylesheet layers. Used the requested `ui-ux-pro-max` skill, including its design-system and animation/accessibility/loading searches. Its generated replacement palette, fonts and horizontal-scroll concept are not applicable: the owner selected Passport A and retaining that direction takes precedence.

A fresh headless local browser measurement attempt was blocked by the process sandbox (Chrome launch SIGABRT), so this review does not claim independent browser interaction, screen-reader, contrast audit or fresh test-suite execution. Existing fixture screenshots and code are evidence, not proof of real-device acceptance. Rive authoring/export is still being completed by the integrator and is outside this snapshot's approval.

## Assessment

The direction is coherent. Berry covers, lemon bookmarks, security lines, paper leaves and book gutters now connect the utility pages to the selected Home. Passport's two-page spread is particularly convincing. Mobile layouts preserve readable forms, native controls and honest guest/private/shared labels. The reference to travel is materially stronger than a generic card dashboard, without adding a new theme. Keep the existing typography and palette.

Reduced-motion handling is correctly explicit in the GSAP wrappers and global CSS. Decorative SVGs are hidden from assistive technology; ordinary saved buttons and text remain the primary feedback. The contextual route, branch and imprint vocabulary is appropriate. No endless decorative loop or forced scrolling was found in the inspected additions.

## Findings to resolve

### R1 · P2 · A saved-state load replays a save confirmation

`SaveButton` renders `.save-imprint` whenever `saved.length > 0`. `TravelMotion` stamps every newly mounted imprint. Consequently opening a Place already present in a list produces the same animated SAVED confirmation as a new successful save. The fixture screenshot `8-1440x1000.png` visibly contains that impression on the initially saved place.

Render the transient imprint from a successful save event during the current interaction, rather than persistent membership. Preserve the ordinary Saved button for initial state. Trigger only after a confirmed quick-save/add-to-list; a failed write, initial load, list-note edit or navigation should not produce a new imprint. Verify existing saved-place load and fresh save separately.

### R2 · P2 · Most journey/page reveals finish before users reach them

`TravelMotion.collect()` immediately starts all matching nodes anywhere in the subtree. Photos lower on the city shelf and page leaves below the fold therefore animate offscreen at mount; the user misses the discovery choreography and sees the final static cards. This weakens the specific request for meaningful travel/discovery motion and spends rendering work on unseen content. Home already uses scroll-triggered card entrances, so the behaviors also differ.

Gate offscreen decorative route/marker, photo and leaf entrances on intersection, once per element. Keep visible action confirmation imprints immediate. Do not delay, disable or hide controls while waiting; ensure reduced-motion content is fully readable, and disconnect observers/revert contexts on navigation. Verify a below-fold card starts when it enters the viewport and repeated scroll does not replay it.

### R3 · P3 · Short landscape viewport shows decoration before the task

In `2-812x375.png`, the Swap cover fills virtually the entire visible area below the two-row header; the city selector and starting-place field are not visible. The title, large stamp and route compete for a short viewport despite adequate horizontal space.

Use a short-height landscape adjustment: reduce cover padding/vertical gap and route/stamp footprint, or place the route inline with the title block. Preserve the Passport identity while exposing at least the beginning of the city/starting-place controls sooner. This is polish rather than a navigation blocker.

## Initial publication gate (superseded by owner scope update below)

Resolve R1 and R2; address R3 if practical. Then rerun the fixture/regression checks, verify reduced-motion/static state, and separately validate the genuine exported Rive runtime asset and fallback. The integrator should append resolution evidence below; this review does not approve an unverified Rive file.

## Integrator resolutions

- R1 implemented: transient imprint state is set only by a successful save operation, keyed per action. Existing list membership alone renders no imprint. Regression now revisits the saved place and asserts no new imprint.
- R2 implemented: IntersectionObserver queues decorative entrances until visible, once per element; action confirmations remain immediate. Both observers disconnect and GSAP context reverts on navigation. Added below-fold/once regression; final run pending.
- R3 implemented: short-landscape media query reduces padding, title, stamp and itinerary size. Updated fixture screenshot pending final run.
- Rive runtime validation and final publication gate remain pending the correct exported asset.

### Independent follow-up, 25 October

Inspected the implemented corrections in source. R1 now records an imprint event only inside the successful-save path and keys it to the place and event; persistent membership no longer creates one. R2 now queues decorative entrances in an IntersectionObserver and tracks completion with a WeakSet, while save feedback stays immediate; both observers disconnect during cleanup. R3 has a targeted landscape/short-height rule that reduces all three contributors to the oversized cover. These address the reported causes; fresh visual/test results remain the integrator's verification responsibility.

Also inspected `JourneyAnimation` and `JourneyCanvas`: a static illustration occupies reserved space, the runtime loads lazily for a visible illustration and respects reduced motion, and load errors retain the fallback. No additional concrete code defect was identified in this follow-up. This is not validation of the missing `.riv` asset: verify its correct artboard/timeline, actual finite playback and error fallback before claiming Rive is complete.

Final integrator checks: 14 production Home/world browser tests passed, including
fresh-save versus existing-save confirmation and below-fold once-only reveal.
Production build, typecheck and unit checks passed. Rive asset/playback is still
pending owner export; this is not a completed publication approval.


## Final scope update: code-authored GSAP/SVG

The integrator reports explicit owner approval to replace the incomplete Rive delivery with an original GSAP/SVG animation. Rive export/playback is therefore no longer an acceptance gate for the approved scope. The earlier Rive discussion above records the historical limitation; it is not a claim that Rive shipped.

Reviewed the replacement `JourneyAnimation`: one finite timeline opens the cover, traces the itinerary, settles the pin and prints the arrival mark. Intersection observation pauses playback outside the viewport and disconnects at completion; matchMedia and useGSAP cleanup restore the static illustration for reduced motion. The animation remains decorative and does not imply a real saved visit. No additional timeline defect found by source inspection.

R4 · P2 · The new inline SVG initially retained intrinsic 640×360 dimensions while the existing responsive CSS targeted only `> img`; the fixed 260px container would crop it. Requested the integrator extend the responsive sizing rule to `> svg`. Verify the complete booklet and pin fit the illustration card at tablet and desktop widths after applying this fix. Final build and animation tests are running with the integrator; this follow-up does not claim those pending results.

R4 resolution independently confirmed in the shared checkout: `.journey-animation > svg { display:block; width:100%; height:100%; }` is now present. Package manifest/lock contain no Rive dependency, and the unused Rive canvas/runtime asset is absent from the inspected app paths. All findings from this source review are addressed. Final animation/build execution evidence remains owned by the integrator.

Final integrator evidence for approved GSAP scope: production build, TypeScript,
full unit command, diff whitespace check and 15/15 production browser tests pass.
The coded-journey regression verifies completion, no replay and reduced-motion
static restoration; SVG bounds are checked. No Rive asset is published.
