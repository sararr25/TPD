# TPD

Taste-powered alternative discovery. Working name; early implementation for the Qloo hackathon.

## Local development

Node.js 22.19+ and npm are required. Stack: Next.js App Router, TypeScript, React; intended hosting: Vercel (not deployed yet).

```sh
npm ci
cp .env.example .env.local
# Configure the server-only Qloo credentials in .env.local.
npm run dev
```

Open http://localhost:3000. Current routes: `/`, `/passport`, `/passport?guest=1`, `/swap`, `/api/health`.

Live Qloo entity search powers a browser-local Passport with 3–5 choices and two guest profiles. The Paris Restaurant and Museum Swap resolves a reference, exposes Keep/Change tags and returns up to three distinct alternatives with L0 provenance. Restaurant budget tiers, city/country/category and excluded tags are checked locally. The same Passport transfers between the two categories with a new reference. Operational verification, authentication, shared hosted cache and collections are not connected.

The HTML design walkthrough remains in `design-mockups/A4-product-prototype.html`; it is separate from the Next.js app and uses its own local storage key.

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

These scripts make limited, sequential live API requests and consume quota. The feature probe requires the access probe first. No automatic retries. Raw responses and diagnostic summaries are saved only in ignored `.private/qloo/` with restricted file permissions. Never commit or upload these responses. Do not use that directory as a durable cache on Vercel; hosted private storage remains to be chosen.

Credentials stay in `.env.local` or server environment variables. Never use `NEXT_PUBLIC_` for secrets. The scripts reject hosts other than `https://hackathon.api.qloo.com`, send `X-Api-Key`, reject redirects and use GET query parameters. The app calls Qloo through the same-origin `/api/discovery` route; it projects the needed fields and marks responses `private, no-store`. Cache and pacing are private and per-process. Shared storage and distributed quota protection are required before public deployment.

## Vercel

Import the repository using the Next.js preset and npm lockfile. Configure Qloo secrets as server environment variables when the integration is ready. No deployment or Vercel project was created by this increment.

## Project state

- `DECISIONS.md`: product decisions.
- `docs/27-handover.md`: current handover (tickets #26–#34, 23 October 2026).
- `docs/05-design-handover.md`: historical design handover.
- `docs/07-ticket-board.md`: implementation board.
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
