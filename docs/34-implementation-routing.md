# Plan-Orchestrate Result
**Plan**: `docs/28-handover.md`
**Steps**: 8
**Scope**: all
**Emitted**: 5 · **Blocked**: 3

Generated planning commands only; never executed as slash commands. Implementation is carried out directly under the user’s explicit request and recorded in docs/36. A router block does not prohibit independently authorized tests or reviews.

## Steps overview

| # | Title | Tags | Command | Status |
|---|---|---|---|---|
| 1 | Refresh baseline | review | `/code-review` | BLOCKED |
| 2 | Diagnose Passport | fix | `/orch-fix-defect` | emitted |
| 3 | Navigation and reading | change | `/orch-change-feature` | emitted |
| 4 | Passport recovery | fix | `/orch-fix-defect` | emitted |
| 5 | Private Home preview | impl | `/orch-add-feature` | emitted |
| 6 | Lisbon pilot proposal | plan | `/plan` | emitted |
| 7 | Approved catalogue import | db | `/orch-add-feature` | BLOCKED |
| 8 | Integrated verification and release | build, test, review | `/build-fix` | BLOCKED |

## Step 1 — Refresh baseline

**Intent**: Verify source, issues/comments and production deployment separately.
**Tags**: review
**Command rationale**: This step cannot be emitted as an authorized scoped command.

```text
BLOCKED — /code-review cannot carry plan scope; run manually if wanted: /code-review
```

## Step 2 — Diagnose Passport

**Intent**: Start with a deterministic failure before selecting the repair.
**Tags**: fix
**Command rationale**: `/orch-fix-defect` carries this step’s identity and acceptance criteria.

```bash
/orch-fix-defect "[Plan: docs/28-handover.md#step-2] Reproduce delayed account loading and partial quiz saves with synthetic fixtures; Acceptance: a failing test drives the real finishQuiz path; ranked hypotheses and confirmed cause recorded; original scenario passes after the fix."
```

## Step 3 — Navigation and reading

**Intent**: Change existing navigation while preserving provider and brand decisions.
**Tags**: change
**Command rationale**: `/orch-change-feature` carries this step’s identity and acceptance criteria.

```bash
/orch-change-feature "[Plan: docs/28-handover.md#step-3] Preserve City category, per-category filters, tab, List/Map and reading position across Place visits; Acceptance: internal return and browser Back/Forward tested separately; nested navigation correct; layouts and image fallbacks checked at 320/390/768/1440 px."
```

## Step 4 — Passport recovery

**Intent**: Recovery and account isolation are acceptance criteria, not optional polish.
**Tags**: fix
**Command rationale**: `/orch-fix-defect` carries this step’s identity and acceptance criteria.

```bash
/orch-fix-defect "[Plan: docs/28-handover.md#step-4] Unify Passport states across Home, City, Place and Passport; Acceptance: incomplete profiles retain their quiz; account delays and errors never start an unwanted quiz; partial saves resume after reload and stay bound to the intended account."
```

## Step 5 — Private Home preview

**Intent**: Build the approved storyboard as a private reviewable feature.
**Tags**: impl
**Command rationale**: `/orch-add-feature` carries this step’s identity and acceptance criteria.

```bash
/orch-add-feature "[Plan: docs/28-handover.md#step-5] Create the private three-scene Home preview: Your taste, Your city, Your next place; Acceptance: City/Swap access and skip link work immediately; responsive and reduced-motion scenes remain readable; GSAP cleanup runs on navigation and public Home is not replaced before review."
```

## Step 6 — Lisbon pilot proposal

**Intent**: Research and design precede the explicitly gated production migration.
**Tags**: plan
**Command rationale**: `/plan` carries this step’s identity and acceptance criteria.

```bash
/plan "[Plan: docs/28-handover.md#step-6] Prepare a bounded inventory of existing Lisbon provider projections and a concrete catalogue proposal; Acceptance: deduplicated counts and coverage gaps recorded; photo/provenance review rules explicit; exact schema, access, request cap, cost limits and refresh policy presented before writes."
```

## Step 7 — Approved catalogue import

**Intent**: BLOCKED — requires confirmation of the concrete production proposal; no migration command emitted.
**Tags**: db
**Command rationale**: This step cannot be emitted as an authorized scoped command.

```text
BLOCKED — requires confirmation of docs/35 and the proposed production scope.
```

## Step 8 — Integrated verification and release

**Intent**: Verify tests, typecheck, build, browser journeys, review and deployment receipts; real-device/Google acceptance stays separate.
**Tags**: build, test, review
**Command rationale**: This step cannot be emitted as an authorized scoped command.

```text
BLOCKED — /build-fix cannot carry plan scope; run manually if wanted: /build-fix
```

## Batch execution

Excludes blocked steps 1, 7 and 8. These commands are references, not a record of execution.

```bash
/orch-fix-defect "[Plan: docs/28-handover.md#step-2] Reproduce delayed account loading and partial quiz saves with synthetic fixtures; Acceptance: a failing test drives the real finishQuiz path; ranked hypotheses and confirmed cause recorded; original scenario passes after the fix."
/orch-change-feature "[Plan: docs/28-handover.md#step-3] Preserve City category, per-category filters, tab, List/Map and reading position across Place visits; Acceptance: internal return and browser Back/Forward tested separately; nested navigation correct; layouts and image fallbacks checked at 320/390/768/1440 px."
/orch-fix-defect "[Plan: docs/28-handover.md#step-4] Unify Passport states across Home, City, Place and Passport; Acceptance: incomplete profiles retain their quiz; account delays and errors never start an unwanted quiz; partial saves resume after reload and stay bound to the intended account."
/orch-add-feature "[Plan: docs/28-handover.md#step-5] Create the private three-scene Home preview: Your taste, Your city, Your next place; Acceptance: City/Swap access and skip link work immediately; responsive and reduced-motion scenes remain readable; GSAP cleanup runs on navigation and public Home is not replaced before review."
/plan "[Plan: docs/28-handover.md#step-6] Prepare a bounded inventory of existing Lisbon provider projections and a concrete catalogue proposal; Acceptance: deduplicated counts and coverage gaps recorded; photo/provenance review rules explicit; exact schema, access, request cap, cost limits and refresh policy presented before writes."
```
