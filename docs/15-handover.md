# Handover — 20 October 2026 (afternoon)

Short session (about 11 minutes) that continued from `docs/14-handover.md`.

## Done in this session

Branch: `claude/handover-prossimi-passi-7562ac` (worktree). **Not pushed and not merged** into the default branch `claude/blissful-gauss-dymbeo`, so production (https://beesyde.vercel.app) still says "TPD".

| Commit | What |
|---|---|
| `7482c6e` | Merged `claude/qloo-hackathon-brainstorm-cb7019` (the branch that records the name **Beesyde**: `DECISIONS.md` section 9, `docs/04-handover.md`, product structure spec). Conflicts resolved: `.env.example` and `.gitignore` kept the newer, fuller versions; in `DECISIONS.md` table 7 now marks login, stack and name as decided, and both the 20 October updates and section 9 are kept. |
| `c38222a` | Open item 3 from `docs/14`: UI renamed to Beesyde: page title "Beesyde · Taste Passport", header logo "B" + "Beesyde", footer "Beesyde · Your taste, a different way in." (the "Working name" label is gone). The OpenStreetMap User-Agent is now `Beesyde-venue-check/0.1`. |

Not renamed on purpose: `package.json` name `tpd` (internal), the benchmark's `tpd` condition labels in `scripts/benchmark/*` (they name a data field, and renaming them would break saved results), and the old HTML mockups in `design-mockups/`.

## Verified

- `npm run typecheck`, `npm test` (all PASS), `npm run build` succeeded.
- Production build started locally: the rendered home page shows the new title, header and footer, and the word "TPD" no longer appears in it.
- Note: the build needs `.env.local` (Neon Auth variables). A new worktree doesn't have it: copy it from the main checkout (it is git-ignored).

## Not done (time limit)

- The formal `/ecc:plan-prd` and `/ecc:feature-dev` workflows were not run: with 11 minutes there was room only for the rename. Run them next for **E06 (save the Passport to the user's account)**, which is the next real feature.
- Push / merge into `claude/blissful-gauss-dymbeo` to put the rename live (this triggers a Vercel deploy).

## Open items, updated order

1. Merge this branch into `claude/blissful-gauss-dymbeo` and push → check https://beesyde.vercel.app shows "Beesyde".
2. Try the Google login yourself (needs you: entering credentials).
3. Own Google OAuth credentials before real users (redirect URI `{NEON_AUTH_BASE_URL}/callback/google`, then add the client in Neon → `beesyde` → Auth).
4. E06: save the Passport (and later collections) per signed-in user in Neon; guests keep browser storage.
5. Venue check limits (name variants, wine bars as restaurants, opening hours not checked).
6. Vercel cleanup: delete branch `claude/qloo-hackathon-venue-verify-e51150`; `claude/qloo-hackathon-brainstorm-cb7019` can also go once this merge lands.
7. Older tickets unchanged: `docs/07-ticket-board.md` (D04, I01–I04, R01).
