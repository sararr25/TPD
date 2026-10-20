# Handover — 20 October 2026 (afternoon)

Short session (about 11 minutes) that continued from `docs/14-handover.md`.

## Done in this session

Branch: `claude/handover-prossimi-passi-7562ac` (worktree). The rename (`4631cf7`) is **live**: pushed to the default branch `claude/blissful-gauss-dymbeo`, Vercel deploy READY, https://beesyde.vercel.app shows "Beesyde". The E06 commit `f982f09` is pushed to this branch only, **not yet in production**.

| Commit | What |
|---|---|
| `7482c6e` | Merged `claude/qloo-hackathon-brainstorm-cb7019` (the branch that records the name **Beesyde**: `DECISIONS.md` section 9, `docs/04-handover.md`, product structure spec). Conflicts resolved: `.env.example` and `.gitignore` kept the newer, fuller versions; in `DECISIONS.md` table 7 now marks login, stack and name as decided, and both the 20 October updates and section 9 are kept. |
| `f982f09` | **E06: Passport saved to the account.** New table `user_passport` (applied to Neon), API `/api/passport` (GET/PUT/DELETE, signed-in only, same-origin writes), Passport and Swap pages load/save it when signed in. Rules in `DECISIONS.md` ("E06 — Passport saved to the account"). Checks: `npm test` (new offline test) and `npm run verify:passport` (live round trip with a temporary user, cleaned up). |
| `c38222a` | Open item 3 from `docs/14`: UI renamed to Beesyde: page title "Beesyde · Taste Passport", header logo "B" + "Beesyde", footer "Beesyde · Your taste, a different way in." (the "Working name" label is gone). The OpenStreetMap User-Agent is now `Beesyde-venue-check/0.1`. |

Not renamed on purpose: `package.json` name `tpd` (internal), the benchmark's `tpd` condition labels in `scripts/benchmark/*` (they name a data field, and renaming them would break saved results), and the old HTML mockups in `design-mockups/`.

## Verified

- `npm run typecheck`, `npm test` (all PASS), `npm run build` succeeded.
- Production build started locally: the rendered home page shows the new title, header and footer, and the word "TPD" no longer appears in it.
- Note: the build needs `.env.local` (Neon Auth variables). A new worktree doesn't have it: copy it from the main checkout (it is git-ignored).

## Not done

- The formal `/ecc:plan-prd` and `/ecc:feature-dev` workflows were not run (11-minute limit for the first part).
- E06 was **not tested with a real signed-in user**: there are no users yet, and signing in needs your Google account. Tested: offline input checks, live database round trip, API refuses guests (401) and other sites (403), Passport and Swap pages still work as a guest with no console errors.

## Google sign-in: what you need to do

**A. Try it** (after E06 is in production): open https://beesyde.vercel.app, click *Sign in with Google*, sign in. Expected: header shows "Signed in as …"; on the Passport page the note says "Saved to your account and this browser."; build a Passport, open the site in another browser, sign in, and the same Passport appears.

**B. Your own Google credentials** (before real users; today Google's consent screen says "Neon"):
1. https://console.cloud.google.com → create a project "Beesyde".
2. *APIs & Services → OAuth consent screen*: External, app name "Beesyde", your support email, publish (or add yourself as test user).
3. *Credentials → Create credentials → OAuth client ID* → type *Web application*.
   - Authorised JavaScript origins: `https://beesyde.vercel.app`
   - Authorised redirect URI: `https://ep-cool-voice-bay69zag.neonauth.c-8.eu-central-1.aws.neon.tech/neondb/auth/callback/google`
4. Copy the client ID and secret into Neon console → project `beesyde` → *Auth* → *OAuth providers* → Google → use your own credentials. Type the secret there yourself; do not paste it into chat or a file.

**C. Email + password sign-up is switched on** in Neon Auth (default), with no email verification. The app shows only Google, but anyone can create an account through the API with any email. Recommended: turn it off (Neon console → Auth → Email & password), so Google is the only way in.

## Open items, updated order

1. Put E06 in production (push `f982f09` to `claude/blissful-gauss-dymbeo`), then try the login (section A).
2. Turn off email + password sign-up (section C).
3. Own Google OAuth credentials (section B).
4. Rest of E06: collections, feedback, deleting the account from inside the app.
5. Venue check limits (name variants, wine bars as restaurants, opening hours not checked).
6. Vercel cleanup: delete branch `claude/qloo-hackathon-venue-verify-e51150`; `claude/qloo-hackathon-brainstorm-cb7019` can also go once this merge lands.
7. Older tickets unchanged: `docs/07-ticket-board.md` (D04, I01–I04, R01).
