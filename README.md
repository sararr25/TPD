# Beesyde

Find places you’ll love, or a twin for the one that’s full. Next.js/TypeScript web app for the Qloo hackathon, with a Taste Passport, city guides, Twin, saved trips and deliberate sharing.

**Live demo:** https://beesyde.vercel.app · **Default/release branch:** `claude/blissful-gauss-dymbeo`. Remote `main` also exists; do not change the default or production configuration.

## Start here before continuing work

1. Read [the current handover](docs/28-handover.md), then the linked previous handover.
2. Read `GLOSSARY.md`, `docs/adr/` and `docs/agents/issue-tracker.md`.
3. Check the actual GitHub issues **and their comments** in `sararr25/TPD`. GitHub is the current tracker; the old D/E/I board is historical.
4. Verify the checkout against the GitHub default branch before changing code. An old branch can contain newer commit dates without containing the current product. Do not merge the obsolete `claude/pensive-lovelace-k81d2t` implementation into the release.

Name, Google sign-in, Neon and the visual direction are already decided. ADR 0004’s berry/lemon amendments supersede its original palette. Google Places is outside the demo; Qloo and OpenStreetMap are the connected discovery sources.

Latest continuation: [historical-ticket closure, A/B and release handover](docs/71-handover-historical-closure.md). Technical evidence is in docs/69; owner-run physical/account acceptance remains explicitly not run in [#59](https://github.com/sararr25/TPD/issues/59) and docs/70. The preceding #46–58 release is recorded in docs/68.

Latest product review: [UI, UX and mobile audit — 28 October](docs/72-ui-ux-mobile-review-2026-10-28.md). Contains 28 prioritised feedback items, live-browser observations, responsive measurements and proposed acceptance criteria. This is an assessment, not an implementation or a new physical-device acceptance receipt.

Latest implementation/publication: [Passport theatre C](docs/78-passport-theatre-release.md). Owner-selected C applies to all 18 real quiz questions; physical acceptance remains separate.

Implementation continuation: [S24 quiz feedback and corrections](docs/76-s24-quiz-feedback-and-fixes.md), following [open-ticket engineering and guided acceptance](docs/75-open-ticket-engineering-and-acceptance.md), following [second cycle and comparison C](docs/74-ui-ux-mobile-second-cycle.md), following the [28-ticket mapping and first cycle](docs/73-ui-ux-mobile-ticket-plan-and-first-cycle.md), programme [#60](https://github.com/sararr25/TPD/issues/60). Working-branch implementation and checks are separate from the production release above and the physical/account gates in #59.

Latest release verification: [publication and real-provider verification](docs/81-post-release-live-verification.md). The real-provider test found and corrected a Twin trait-validation defect; the live Pastéis de Belém path now returns three twins. Exact Gardens and physical/account acceptance remain separate.

Latest implementation continuation: [post-release owner feedback and tickets #89–92](docs/80-post-release-ticket-plan.md). Linked Twin identity, one favourites invitation, spacing and enlarged shared journey art; local verification is separate from publication.

Latest desktop continuation: [Passport cover and desktop length](docs/85-handover-desktop-length.md) (Passport back to full width and shorter, Home/Cities tightened).

Latest demo preparation: [90-second demo script](docs/82-demo-script.md) and `/how-it-works` (programme [#93](https://github.com/sararr25/TPD/issues/93)).

## Local development

Node.js 22.19+ and npm are required. Stack: Next.js App Router, TypeScript, React; deployed on Vercel with Neon Postgres and optional Neon Auth/Google sign-in.

```sh
npm ci
cp -n .env.example .env.local
# Configure the existing server-only Qloo, Neon database and Neon Auth settings.
# Do not overwrite a configured .env.local or copy credentials into chat.
npm run dev
```

Open http://localhost:3000. Main routes: `/`, `/explore`, `/[city]` (For you / Twin tabs), `/[city]/[place]`, `/swap`, `/passport`, `/passport/settings`, `/collections`, `/trip` and `/compare`.

The 18-question quiz builds a Taste Passport, refined by saves and feedback. Guests keep it and trips on this browser; signed-in users use private account storage. Guide visits and saved places add deduplicated Passport stamps. Trip links and postcard PNGs exclude private notes. City/category eligibility is validated locally; Qloo/OSM checks remain L0, without live hours, prices or booking guarantees.

The earlier HTML prototypes are historical design work, separate from the app. They do not define the current interface or live provider behavior.

## Checks

```sh
npm test
npm run build
npm run typecheck
```

Tests cover local-data parsing, filtering, signed selections, distinct roles, adapter cache and the earlier HTML prototype. The main live flow has also been checked manually in the browser; see docs/09 for the precise acceptance boundary.

## Qloo checks

```sh
npm run verify:qloo
npm run verify:qloo-features
npm run verify:qloo-coverage
# With the local app running on 127.0.0.1:3000:
npm run verify:qloo-transfer
```

These scripts make limited, sequential live API requests and consume quota. The feature probe requires the access probe first. No automatic retries. Raw responses and diagnostic summaries are saved only in ignored `.private/qloo/` with restricted file permissions. Never commit or upload these responses. Do not use that directory as a durable cache on Vercel. Shared provider cache, pacing and visitor request budgets already use private Neon Postgres tables.

Credentials stay in `.env.local` or server environment variables. Never use `NEXT_PUBLIC_` for secrets. The scripts reject hosts other than `https://hackathon.api.qloo.com`, send `X-Api-Key`, reject redirects and use GET query parameters. The app calls Qloo through the same-origin `/api/discovery` route; it projects the needed fields and marks responses `private, no-store`. Cache and pacing are shared through Neon when DATABASE_URL is configured. Local tests can use an explicit memory fallback; production fails if shared storage is missing. Never apply database schema changes merely to run local UI checks.

## Vercel

The existing `beesyde` project is linked to `sararr25/TPD` and deploys from `claude/blissful-gauss-dymbeo`. Keep all secrets server-only. Inspect the deployment’s Git SHA and READY state, then verify the public alias; a successful local build alone is not production or real-device acceptance.

## Project state

- **UI/UX continuation:** `docs/66-icons-photos-and-honest-copy.md` — #51/#52 implemented locally after #49/#50 (docs/65) and the quiz corrections; #45–58 plan and quiz receipt in docs/64. Verification and publication boundary are recorded in these continuations.

- **Current publication continuation:** `docs/62-passport-and-backlog-release.md` — owner-approved Passport corrections and all pending integration work; final deployment receipt in #44.

- **Post-release acceptance in progress:** `docs/60-post-release-acceptance.md`, programme #44. Integration fixes and fresh checks; publication superseded by docs/62. Coverage/catalogue decision packet: `docs/61-coverage-catalogue-and-submission.md`.

- **Latest continuation:** `docs/58-all-changes-live-handover.md` — all pending work reconciled with the current live quiz/Passport; original workspace is authoritative again.

- `docs/57-passport-inline-matches-release.md`: approved Passport refinement/publication, inline Qloo previews and mobile/stamp UX.

- `docs/56-passport-folio-qloo-matches.md`: new personal Passport folio and real Qloo category-match routes, implemented in the isolated release worktree; local only.

- `docs/55-cities-twin-live-handover.md`: Cities/Twin publication and preservation of the live Taste Chemistry quiz.

- `docs/54-taste-quiz-live-handover.md`: approved compact illustrated quiz, audio boundaries, verification and publication receipt.

- `docs/51-marked-labels-live-release.md`: approved marked-label Twin controls, desktop side-by-side layout and live publication receipt.
- `docs/50-personal-home-implementation-and-visited-schema.md`: latest personal Home, explicit real visits, approved/applied Neon schema and eight passing synthetic browser checks; production sync settings unchanged.
- `docs/49-approved-photos-and-personal-city-ranking.md`: approved eleven-city photographs and source credits; pending product questions are superseded by docs/50.

- `docs/47-auto-review-implementation.md`: local follow-through on stability, first viewport, mobile choreography and Twin scene; Home city shortlist/grid and replacement photographs await owner choices.

- `docs/45-twin-implementation-and-ab.md`: current Twin/motion implementation, A/B evidence and local verification boundary.
- `docs/40-twin-motion-ux-spec.md`: approved scope and owner amendment to use four real euro tiers.

- `docs/37-home-passport-a.md`: owner-selected evolution of the current Passport Home, implemented and verified locally; not yet published.
- `DECISIONS.md`: product decisions.
- `docs/36-implementation-verification.md`: implementation, technical A/B comparison and acceptance boundaries.
- `docs/35-lisbon-catalogue-proposal.md`: bounded inventory and unapplied schema/storage proposal.
- `docs/34-implementation-routing.md`: generated scoped ECC planning commands.
- `docs/28-handover.md`: current continuation, approved scope and implementation next steps, 24 October 2026.
- `docs/29-ab-comparison-report.md`: final ticket closure and three-scenario source comparison; no statistical user-test claim.
- `docs/30-site-evaluation.md`: UI, UX and functionality assessment, with live/source evidence and limits.
- `docs/31-evaluation-plan.md`: eight-step evaluation protocol and improvement priorities.
- `docs/32-evaluation-commands.md`: generated ECC planning commands; not executed.
- `docs/33-approved-scope-and-demo-direction.md`: accepted navigation/Passport improvements, GSAP Home storyboard and Lisbon catalogue pilot.
- `docs/27-handover.md`: implemented tickets #26–#34 and Change-tag follow-up.
- `docs/05-design-handover.md`: historical design handover.
- `docs/07-ticket-board.md`: current tracker pointers and clearly archived legacy board.
- `docs/08-qloo-verification.md`: access checks and remaining evidence.
- `docs/09-restaurant-swap-implementation.md`: live pilot, cache and validation limits.
- `docs/10-museum-transfer-implementation.md`: Museum Swap, same-Passport Transfer and live checks.
- `docs/11-qloo-benchmark.md`: private 16-case benchmark, baseline imports and blind evaluation.
- `docs/12-cli-baseline.md`: supported CLI alternative to blocked ChatGPT web, isolation and provenance.
- `docs/13-search-verification-review.md`: assisted web-search baseline, common metadata audit and private human review.

Implementation follows the [Next.js installation guide](https://nextjs.org/docs/app/getting-started/installation). Qloo usage follows the [hackathon developer guide](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide) and [parameter reference](https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md).

A project license has not yet been chosen; open-source submission readiness remains open.

## Private benchmark

With the local app running on `127.0.0.1:3000`, `npm run benchmark -- collect RUN_ID` collects 16 TPD scenarios sequentially and checkpoints them under ignored `.private/benchmark/`. It consumes Qloo quota. `npm run benchmark -- report RUN_ID` reads the current state without provider calls. Baseline imports, blind packets and vote aggregation are documented in docs/11. Missing LLM/search responses are never filled automatically, and output sensitivity is not a quality-uplift claim.

`npm run benchmark:cli -- RUN_ID` collects the LLM condition using the installed Codex CLI and its existing ChatGPT sign-in. Each case runs in a fresh process without tools or Qloo. The source is explicitly labelled Codex CLI / gpt-6-sol, not ChatGPT web; see docs/12 for controls and limits. No API key is created or passed to the model subprocess.

All three 16-case conditions are collected. The third is explicitly labelled assisted web-search extraction; the common audit uses Qloo metadata and is not independent ground truth. `npm run benchmark:verify -- RUN_ID` checks all conditions with identical lookup rules, consuming quota only for missing checkpoints. `npm run benchmark:review -- RUN_ID` serves the anonymous study at `127.0.0.1:3212/study` after a blind packet is generated; it exposes no source key or directory. `collectionComplete` means collection only: independent fact checks and human votes remain open.
