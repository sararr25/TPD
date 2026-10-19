# Beesyde — Handover (2026-10-19)

**Product:** Beesyde, a taste-powered alternative discovery engine ("Keep what you love. Change what doesn't work.").
**Event:** Qloo Agentic Hackathon 2026. Submission deadline: 30 October 2026, 23:45 EDT (check the official Devpost countdown).

## Read first

1. `DECISIONS.md`: all decisions; section 9 has the latest ones (scope, navigation, Neon, name).
2. `docs/superpowers/specs/2026-10-19-product-structure-design.md`: approved design (pipeline, screens, tables, tests).
3. `docs/03-data-sources-and-verification.md`: verification levels L0–L3 and the provider registry.
4. `docs/01-research-and-brainstorm.md`, section 2.5: the 8 Qloo verification queries.

## State right now

| Item | State |
|---|---|
| Product structure | Decided and specified |
| Name | **Beesyde** decided. `beesyde.com` was free per whois on 2026-10-19 and has **not** been bought |
| Qloo API key | `.env` exists (git-ignored, verified); the user pastes `QLOO_API_KEY` there |
| Code | None yet: no scaffold, no `package.json` |
| Database | Neon chosen; no project created yet |
| Visual identity | Not started (use the style-explorer approach: compare options side by side before choosing) |

Note: `.env` was created in the worktree `.claude/worktrees/qloo-hackathon-brainstorm-cb7019/`. If work continues in the main `TPD/` folder, copy `.env` there. It is not in git.

## Next steps, in order

1. **User:** paste the Qloo key into `.env`; decide whether to buy `beesyde.com` (costs money, the user's call).
2. **Qloo verification:** run the 8 queries against `hackathon.api.qloo.com` (header `X-Api-Key`). Record the coverage per city and category, the quota and rate limits, and whether `feature.explainability` works. Then choose the final demo cities. Do not commit raw Qloo responses.
3. **Scaffold:** Next.js + TypeScript with pnpm. Create the Neon project with Neon Auth and Google, then the tables from spec section 4. Deploy an empty app to Vercel early.
4. **Qloo adapter** (`qloo/`) with a parameter echo check and a private cache in Neon (`qloo_cache`).
5. **Passport** (guest/local), then **Swap for restaurants** with Keep/Change chips and the three result roles.
6. **Intent field** and the three mode buttons; **Explore** and **Discovery** on the same pipeline.
7. **Transfer** and museums/culture; **Qloo vs LLM** benchmark cases.
8. Login on first Save, migration of the local Passport, collections, feedback, shareable Passport card.
9. Remaining categories only if the data holds. Then error states, README, open-source license, public deploy, English description.

## Open questions

- Final demo cities (after step 2).
- Qloo quota and rate limits.
- Viator Affiliate activation and Ticketmaster coverage in Portugal, France and Spain.
- Visual identity and the bee mascot.
- A formal trademark check for "Beesyde", if the project continues after the hackathon.
