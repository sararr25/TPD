# Beesyde

Find places you’ll love, or a twin for the one that’s full. Next.js/TypeScript web app for the Qloo hackathon, with a Taste Passport, city guides, Swap, saved trips and deliberate sharing.

**Live demo:** https://beesyde.vercel.app · **Release branch:** `claude/blissful-gauss-dymbeo` (there is no `main`).

## Start here before continuing work

1. Read [the current handover](docs/28-handover.md), then the linked previous handover.
2. Read `GLOSSARY.md`, `docs/adr/` and `docs/agents/issue-tracker.md`.
3. Check the actual GitHub issues **and their comments** in `sararr25/TPD`. GitHub is the current tracker; the old D/E/I board is historical.
4. Verify the checkout against the GitHub default branch before changing code. An old branch can contain newer commit dates without containing the current product. Do not merge the obsolete `claude/pensive-lovelace-k81d2t` implementation into the release.

Name, Google sign-in, Neon and the visual direction are already decided. ADR 0004’s berry/lemon amendments supersede its original palette. Google Places is outside the demo; Qloo and OpenStreetMap are the connected discovery sources.

## Local development

Node.js 22.19+ and npm are required. Stack: Next.js App Router, TypeScript, React; deployed on Vercel with Neon Postgres and optional Neon Auth/Google sign-in.

```sh
npm ci
cp .env.example .env.local
# Configure the existing server-only Qloo, Neon database and Neon Auth settings.
# Do not overwrite a configured .env.local or copy credentials into chat.
npm run dev
```

Open http://localhost:3000. Main routes: `/`, `/explore`, `/[city]` (For you / Swap tabs), `/[city]/[place]`, `/swap`, `/passport`, `/passport/settings`, `/collections`, `/trip` and `/compare`.

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

- `DECISIONS.md`: product decisions.
- `docs/28-handover.md`: current continuation and alignment audit, 23 October 2026.
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
