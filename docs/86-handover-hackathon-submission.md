# Handover — Qloo hackathon submission readiness, 30 Oct 2026

Branch: `claude/blissful-gauss-dymbeo` · Last commit of this round: see `git log` (the handover itself is the newest). Read after [docs/85](85-handover-desktop-length.md).

## Why this round existed

The owner asked whether the project can win the Qloo hackathon and what to improve. Sources read this round:

- Devpost page https://qloo.devpost.com/ (opened in the in-app browser; plain fetch returns 403).
- Official kit https://github.com/qloo/qloo-hackathon-kit (README, docs/SUBMISSION, SAFE_USE, API_ACCESS, TROUBLESHOOTING, the three starters).

## What the hackathon asks (as read, not as remembered)

- "Qloo Agentic Hackathon: Agents, but with taste." Deadline **31 Oct 2026, 04:45 Italian time** (the page shows GMT+1; this matches DECISIONS.md, 30 Oct 23:45 EDT). Prizes $15k / $6k / $4k; top 3 finalists present live on 5 Nov; Jason Calacanis may add $25k.
- Required: live demo URL, **public repo**, text description, externally hosted, **open-source licence visible in the repo's About**. No video needed.
- Judging: Technological Implementation, Design, Potential Impact, Quality of the Idea. Key line: if the project would work the same without Qloo, it is the wrong project.
- The kit lists three "routes" (chat agent `qloo explore`, CLI `qloo exec`/`qloo api`, MCP `qloo mcp`). These are ways in, not prize categories. Beesyde fits **CLI / backend** (server calls the Qloo API directly) but does not use the `@qloo/qloo-harness` package. This is stated openly in the submission document.
- The kit's submission guide has six points; they are covered in [SUBMISSION.md](SUBMISSION.md).

## Owner decision

**No agent.** The owner said an agent is not needed. Do not build `qloo explore`/MCP integration or an agent loop for this submission. The submission document says so plainly under limitations; it must not describe Beesyde as an autonomous agent.

## What changed

| Commit | Change |
|---|---|
| `ca18892` | Added `LICENSE` (MIT, Sara Ruffini, 2026). README now says "Released under the MIT License". GitHub detects it as MIT (checked with `gh repo view`; it showed `null` for a few seconds after the push). |
| `e5f3a77` | `src/lib/server/budget.ts`: per-visitor limits raised from 60 total / 15 Twin searches to **200 total / 50 Twin searches per 10 minutes**. `docs/82-demo-script.md` updated to match. |
| `309bfb5` | New [docs/SUBMISSION.md](SUBMISSION.md) in the kit's six-point format, linked from the README. |
| this commit | This handover, README pointer, `DECISIONS.md` entry, no-agent note in SUBMISSION.md. |

## The "These picks couldn't load" incident

- Symptom: every city (Paris, New York) and Twin showed "These picks couldn't load".
- Cause: `POST /api/discovery` returned **429 `rate_limited`** with `retry-after: 600`. That is the app's own per-visitor budget (`budget.ts`), exhausted by the owner's repeated testing. It is not a Qloo error and not a code regression: no `src/` file had changed that day.
- Qloo key: `npm run verify:qloo` from the owner's machine returned HTTP 200 on all five checks (search restaurant/museum, coverage Paris/Tokyo/New York). It was **not** verified that the key configured on Vercel is the same as the local one.
- After the limit change was deployed (Vercel status "success"), `/paris` showed 9 restaurants. **Twin and New York were not re-tested after the deploy.**
- Risk that remains: judges behind one shared IP, or reloading quickly, can still hit the (higher) budget, and more allowed calls means more Qloo quota use. The Qloo monthly quota was not looked up.

## Still to do (owner-run, nothing below has been done)

1. **Submit on Devpost before 31 Oct 04:45 (Italian time)**: demo URL https://beesyde.vercel.app, repo https://github.com/sararr25/TPD, description from [SUBMISSION.md](SUBMISSION.md). No submission was made by Claude.
2. Try Twin on production once (e.g. Lisbon → Pastéis de Belém → Find its twin) and New York, after the 10-minute limit window has passed.
3. Clean-clone test of the setup steps in SUBMISSION.md section 5 (`git clone`, `npm ci`, `.env.local`, `npm run dev`). Written from the README; **not executed**. `.env.example` was read and contains only empty values.
4. If anything fails on the live site, check Vercel env var `QLOO_API_KEY` first.
5. Keep the wording honest if the description is edited: route CLI/backend, direct API, not the harness package, no agent.

## Not verified

- No clean-clone setup run; no Devpost submission; no re-test of Twin/New York after the deploy.
- The benchmark (docs/11) has no human votes, so no quality claim is made anywhere.
- Open GitHub issues were listed but not changed: #104 (demo script), #93, #88, #86, #85, #79, #74, #60, #59. Physical-device and account acceptance (#59) is still untested.
- Working tree still has an uncommitted `.claude/launch.json` change that predates this round; it was deliberately not committed.
