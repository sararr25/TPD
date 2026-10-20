# Handover — 20 October 2026 (afternoon)

Continued from `docs/14-handover.md`.

## Done in this session

Branch: `claude/handover-prossimi-passi-7562ac` (worktree). In production (https://beesyde.vercel.app, from the default branch `claude/blissful-gauss-dymbeo`): the Beesyde rename and the E06 Passport-in-account (`27f0abe`). The rest of E06 (collections, "Not for me", account deletion, commit `49889b6`) is **live** since the push of `ce9a91e` to `claude/blissful-gauss-dymbeo` (checked on the live site as a guest: Swap from Le Baratin, "Not for me" hides Du Pain et des Idées and the next Swap returns La Marine instead; "Show again" works; `/collections` asks to sign in; all account APIs answer 401 to guests and 403 to other sites; no console errors).

| Commit | What |
|---|---|
| (latest) | **Rest of E06.** Collections: "Save to a collection" on each Swap result (name + optional note), new page `/collections`. Feedback: "Not for me" hides a place from future Swaps (sent to Qloo as `filter.exclude.entities`); guests keep the list in the browser, signed-in users also in the account; "Show again" on the Passport page. "Delete my account" on the Passport page deletes the user and everything linked (cascade) and expires the auth cookies. New tables `user_hidden_place`, `collection`, `collection_item` (applied to Neon). APIs `/api/hidden`, `/api/collections`, `/api/account` (signed-in only, same-origin writes, shared helper `src/lib/server/account-route.ts`). Rules in `DECISIONS.md` ("E06 — Collections, …"). Checks: `npm test` (new `check-user-data`) and `npm run verify:userdata` (live, temporary user, cleaned up). |
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
- E06 was **not tested with a real signed-in user**: there are no users yet, and signing in needs your Google account. Tested: offline input checks, live database round trips (Passport, hidden places, collections, account deletion with full cascade), every account API refuses guests (401) and other sites (403), Passport and Swap pages work as a guest with no console errors.
- No thumbs-up feedback (see `DECISIONS.md`): saving to a collection is the positive signal for now.

## Google sign-in: what you need to do

**A. Try it** (after E06 is in production): open https://beesyde.vercel.app, click *Sign in with Google*, sign in. Expected: header shows "Signed in as …"; on the Passport page the note says "Saved to your account and this browser."; build a Passport, open the site in another browser, sign in, and the same Passport appears. Then, signed in: run a Swap, use "Save to a collection" on a result and check `/collections`; click "Not for me" on another and check it is listed under "Hidden from your Swaps" on the Passport page. "Delete my account" (Passport page) removes everything; try it last, or with a second Google account.

**B. Your own Google credentials** (before real users; today Google's consent screen says "Neon"):
1. https://console.cloud.google.com → create a project "Beesyde".
2. *APIs & Services → OAuth consent screen*: External, app name "Beesyde", your support email, publish (or add yourself as test user).
3. *Credentials → Create credentials → OAuth client ID* → type *Web application*.
   - Authorised JavaScript origins: `https://beesyde.vercel.app`
   - Authorised redirect URI: `https://ep-cool-voice-bay69zag.neonauth.c-8.eu-central-1.aws.neon.tech/neondb/auth/callback/google`
4. Copy the client ID and secret into Neon console → project `beesyde` → *Auth* → *OAuth providers* → Google → use your own credentials. Type the secret there yourself; do not paste it into chat or a file.

**C. Email + password sign-up is switched on** in Neon Auth (default), with no email verification. The app shows only Google, but anyone can create an account through the API with any email. You chose to leave it on for now (20 Oct); reconsider when accounts hold more than a Passport and collections.

## Open items, updated order

1. Try the login and the E06 features (section A).
2. Own Google OAuth credentials (section B).
3. Email + password sign-up: still on by choice (section C).
4. E07 shareable Passport card (depends on E06).
5. Venue check limits (name variants, wine bars as restaurants, opening hours not checked).
6. Vercel cleanup: delete branch `claude/qloo-hackathon-venue-verify-e51150`; `claude/qloo-hackathon-brainstorm-cb7019` can also go once this merge lands.
7. Older tickets unchanged: `docs/07-ticket-board.md` (D04, I01–I04, R01).
