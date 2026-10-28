# Passport theatre C — 28 October 2026

Owner explicitly selected C after the earlier B reply, and authorised implementation plus publication of all pending work on main and live. Reference: [approved C preview](https://beesyde-9c7jl6z0d-sararuffini-projects.vercel.app/preview/checks?quizEnergy=1&variant=C). The three-question comparison is not the application state model.

## Implementation

The real 18-question quiz now uses the selected berry stage, paper illustrated answer panels, lemon selection/progress and original vector city. Motion springs give answer feedback; finite GSAP city entrance, route drawing and traveller motion respond to questions and answers. Background visibility pauses the scene; reduced motion keeps static art. Existing typography, answer semantics, scoring, owner-scoped drafts, automatic advance from the first question, Back, partial selection, swipe/Undo, audio and save/retry are retained. Short landscape hides decorative art and keeps useful content scrollable.

Motion 14.7.1 is the only added application dependency. No auth/provider/schema change, production sync activation or catalogue write is included. All authorised backlog commits on codex/twin-motion-ux are included; unrelated historical worktree lockfiles and prototype experiments are excluded. Main and the configured production branch will receive the same verified commit without changing project configuration.

## Verification and release

Chrome development: 48/48 existing quiz, S24-feedback, enlarged-text and automated-accessibility checks passed. Build including TypeScript and unit/service checks pass. A new scene regression reproduced a runtime reduced-motion defect in the library hook; a reactive useSyncExternalStore media subscription now stops the active traveller and updates answer feedback. Focused Chrome scene checks pass 2/2, covering initial reduced motion, background pause/resume, runtime switching and unmount. Compiled cross-browser checks and exact publication receipts follow below.

The original physical S24 FAIL in docs/76 remains historical evidence. Concept C is owner-selected; physical S24 validation of this implementation, TalkBack, keyboard, account synchronisation and download/audio checks remain open in #59/#74/#79/#85/#86/#88. Photo rights/selection remain open in #62. Synthetic browser checks do not close those gates.

## Release regression loop

The compiled whole-product Chrome run executed 213 scenarios: 197 passed, 12 were explicitly skipped (development fixtures and opt-in A/B), and four failed. Two failures reproduced the same real compact City thumbnail gap: its fixed-inset image was still displaced by parallax. Displacement is now zero only at the compact layout breakpoint (600px); full/ink City covers retain their overscanned motion. The other failures were stale test assumptions: Paris-only events entry searched in Lisbon, and scrolling a streamed Home SVG before hydration. Both expectations are corrected without changing those product behaviors.

After rebuilding, all 22 scenarios in the affected City, Events, motion and theatre suites pass. All 201 executed scenarios are therefore covered by the complete run plus focused successful reruns; this is not claimed as a second clean whole-suite run. Final build/TypeScript passes. Scene motion checks pass in Chrome and WebKit using the actual SVG transform attribute (WebKit does not expose it as the computed CSS transform).

Independent review: Standards 0 residual findings; Spec 0 residual findings. The final compact-layout breakpoint matches the CSS exactly. Tests use synthetic browser fixtures, not production account/provider writes.
