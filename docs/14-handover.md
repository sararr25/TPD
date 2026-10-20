# Handover — 20 October 2026

State of the app after the session that took over from Codex (which stopped when its credits ran out).

## Live

- **Production:** https://beesyde.vercel.app (Vercel project `beesyde`, team "Sara's projects").
- Deploys automatically on every push to the GitHub default branch `claude/blissful-gauss-dymbeo` (there is no `main` branch; that branch plays the role of main).
- Verified live: all pages return 200, Google sign-in button renders with no console errors, a full Restaurant Swap from Le Baratin works (Qloo + OpenStreetMap check + Neon cache; 2.6 s first call, 1.3 s cached).

## What was added in this session

| Commit | What |
|---|---|
| `0e87bea` | **E09 venue check.** Every Swap result is looked up on OpenStreetMap (Nominatim, free, no key) by exact name within 250 m and compared on category and house number/postcode. Cards show *agree / conflict / ambiguous / not listed / could not check*. Nothing is removed or reordered. Live it already flags *Du Pain et des Idées* (a bakery) and *La Crèmerie, rue de Lancry* (a cheese shop). |
| `d98a7e1` | **Shared cache and rate limits on Neon.** Neon project `beesyde` (Frankfurt, free plan). Tables in `db/schema.sql`: provider response cache, shared provider pacing (Qloo 300 ms, Nominatim 1.1 s), per-visitor budget (60 requests and 15 Swaps per 10 min → HTTP 429). IPs stored only as salted hashes. |
| `51a3557` | **Optional Google sign-in** via Neon Auth (managed Better Auth, `@neondatabase/auth`). Button in the header; guests can still use everything. |
| `7c8919f` | `.gitignore` for the Vercel link folder and local env files. |

Details and reasoning are in `DECISIONS.md` (sections dated 20 October).

## Environment variables

Set on Vercel (Production and Preview, encrypted) and in the local `.env.local` (git-ignored). Names only:

- `QLOO_API_KEY`, `QLOO_API_URL`
- `DATABASE_URL` — Neon `beesyde`
- `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`
- optional `NOMINATIM_EMAIL` (contact address sent to OpenStreetMap, as its policy asks)

## How to check it yourself

```bash
npm install
npm test               # all unit tests, no network
npm run verify:store   # live check of the Neon store (cleans up after itself)
npm run db:migrate     # (re)apply db/schema.sql — safe to run again
npm run dev            # then open http://localhost:3000 (not the 192.168.x.x address: Next.js blocks dev scripts from other hosts)
```

## Open items, in suggested order

1. **Try the Google login yourself** on https://beesyde.vercel.app. I could only verify up to Google's account page (entering credentials is not something I do). After signing in, the header should show "Signed in as …".
2. **Own Google OAuth credentials before real users.** Login currently uses Neon's *shared* development credentials: Google's consent screen shows Neon, not Beesyde. Create a Google Cloud OAuth client, set the redirect URI to `{NEON_AUTH_BASE_URL}/callback/google`, and add the client ID/secret in Neon → project `beesyde` → Auth → OAuth providers.
3. **Rename the app to Beesyde in the code.** The name is decided (commit `80a8326` on branch `claude/qloo-hackathon-brainstorm-cb7019`) but that branch is **not merged**; the UI still says "TPD". Merge that branch, then update title, header, footer.
4. **What login is for (E06).** Sign-in exists but nothing is saved per user yet: Passport and collections still live in the browser. Next is saving the Passport to the user's account.
5. **Venue check limits.** Exact-name matching misses name variants (e.g. "Danysz Gallery" vs OSM "Galerie Magda Danysz"); wine bars count as restaurants; opening hours/permanent closure are not checked (planned: Google Places for level L1).
6. **Vercel cleanup.** The working branch `claude/qloo-hackathon-venue-verify-e51150` also triggers deploys; harmless, but it can be deleted now that its commits are on the default branch.
7. Earlier open tickets are unchanged: `docs/07-ticket-board.md` (D04 QA, I01–I04 provider checks, R01 submission).

## Accounts and resources created

- Neon project `beesyde` (`plain-waterfall-05655111`), Neon Auth enabled; trusted domains: `http://localhost:3000`, `http://localhost:3218`, `https://beesyde.vercel.app`.
- Vercel project `beesyde` (`prj_Wv6tbA9VxWtoTDo9syifybfjGTwE`) linked to `sararr25/TPD`.
- No paid service was enabled.
