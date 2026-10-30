# Beesyde — Qloo hackathon submission

**Live demo:** https://beesyde.vercel.app · **Code:** https://github.com/sararr25/TPD (MIT, see [LICENSE](../LICENSE))
**Route (Qloo hackathon kit):** CLI / backend. A Next.js server calls the Qloo API directly and returns projected JSON to the browser. It does not use the `@qloo/qloo-harness` package; the closest equivalent is `qloo api` (raw API responses). No chat agent and no MCP server.

## 1. Problem

Travel apps ask what you want to eat. They start from the category, not from the person. Two things go wrong:

- Generic "best of" lists ignore what you already love.
- When the place you wanted is full, closed or too far, you start over from zero.

Beesyde starts from taste instead: the music, films and books you love become a **Taste Passport** (an 18-question quiz plus saves and feedback). That Passport shapes each city's picks, and **Twin** finds a place with the same character as a place you already like, so "it's full" no longer means "start again".

## 2. Qloo workflows used, and why

The server (`src/lib/server/qloo.ts`) only talks to `https://hackathon.api.qloo.com` and rejects any other host.

| Qloo endpoint | Used for | Why Qloo |
| --- | --- | --- |
| `/search` | Resolve a typed favourite or place to a Qloo entity | Entity IDs are the stable key for every later request |
| `/entities` | Read one entity (and its tags) by ID | Traits on a Twin are Qloo's own tags, not model-invented descriptions |
| `/v2/insights` with `filter.type=urn:entity:place`, `filter.location.query`, `filter.tags`, `signal.interests.entities`, `filter.price_level.*`, `filter.popularity.*`, `filter.exclude.*` | City picks and Twin matches: places ranked by affinity to the user's favourites | Cross-domain taste (a band or a film) is the signal for a restaurant or bar. A general LLM has no such graph |
| `/v2/insights` with `filter.type=urn:entity:destination` | Ranking which cities fit a Passport | Same signal, different entity type |

How it is used in the product flow:

- **One ranking per favourite.** Qloo is asked once for each favourite, so every pick can say which favourite it came from ("Because you like …"). If no request returns a place, the card shows no reason instead of an invented one.
- **Twin.** Starting from a place, the user keeps or deletes the traits (Qloo tags) they care about. Deleted traits are sent as `filter.exclude.tags`; the reference place is used as signal.
- **Qloo vs LLM page (`/compare`).** The same favourites are given to a general chat model and to Qloo, side by side, so judges can see the difference themselves. It is a demonstration, not a statistical result.

## 3. Request → result (redacted)

Example: the user opens Lisbon, the first suggestion is Pastéis de Belém, and they press **Find its twin**.

1. Browser → our server: `POST /api/discovery` with the signed reference place, the category, and the chosen keep/delete traits. No name, email or account ID is included.
2. Server → Qloo: `GET /v2/insights` with, in essence:
   ```
   filter.type=urn:entity:place
   filter.location.query=Lisbon
   filter.location.radius=0
   filter.tags=<category tags>   operator.filter.tags=union
   filter.exclude.entities=<reference id>,<hidden ids>
   signal.interests.entities=<entity ids>
   filter.exclude.tags=<tags the user deleted>
   ```
   The API key goes in the `X-Api-Key` header, server-side only.
3. Server: keeps only the fields the UI needs, checks addresses against OpenStreetMap, and returns `private, no-store` JSON.
4. Result recorded on production on 28 October 2026 ([docs/81](81-post-release-live-verification.md)): three real Twin results for Pastéis de Belém; the featured match is shown first and two more sit behind "See other matches".

Entity and tag choices: favourites come from Qloo `/search`; the user picks from the returned candidates. A search hit is a candidate, not proof of a match, so the user confirms it.

## 4. Demo

Use the live site; no video is needed. A 90-second path is in [docs/82-demo-script.md](82-demo-script.md):

1. Home → **See Lisbon through this Passport** (example Passport, credited picks).
2. Open a restaurant → **Find its twin** → keep one trait → featured twin.
3. Footer → **How it works** (sources and limits).
4. **Make your Passport** → the quiz.

Please avoid reloading city pages in quick succession: the site limits each visitor to 200 requests and 50 Twin searches per 10 minutes to protect the Qloo quota.

## 5. Setup from a clean environment

Node.js 22.19 or newer.

```sh
git clone https://github.com/sararr25/TPD.git
cd TPD
npm ci
cp .env.example .env.local
# Fill QLOO_API_KEY with your own event key. Never commit it, never prefix it with NEXT_PUBLIC_.
npm run dev
```

Open http://localhost:3000. Without `DATABASE_URL` the app uses an in-memory cache and rate limiter for local testing; Google sign-in and account storage need Neon (`DATABASE_URL`, `NEON_AUTH_*`) and are not needed to try the Passport, cities or Twin as a guest. Checks: `npm test`, `npm run typecheck`, `npm run build`. Live Qloo checks (they use quota): `npm run verify:qloo`.

## 6. Known limitations and what the results do not establish

- Qloo results are aggregate taste affinities. They are not evidence about a person's identity, health, finances or future behaviour, and Beesyde does not present them that way. Guest Passports stay in the visitor's browser (signed-in users use private account storage); Qloo receives entity IDs, tags, city names and the short text a visitor types into the favourites search (2–120 characters), which is sent to `/search`.
- Our own layer is separate from Qloo: city and category eligibility checks, OpenStreetMap address verification, price tiers and the wording of reasons are product interpretation, not Qloo output.
- No live opening hours, availability, prices or booking. Price tiers are indicative. "Full" is the user's situation; the app cannot know it.
- Events are a Paris-only pilot using the city's open data. Other cities show unsupported coverage explicitly.
- Coverage varies by city and category; a search can legitimately return few or no places.
- There is no autonomous agent loop and no use of `qloo explore` or `qloo mcp`; this was a deliberate product decision, not an omission. The "Qloo vs LLM" comparison uses a free third-party chat endpoint with no uptime guarantee and is illustrative only.
- A 16-case benchmark exists in the repo ([docs/11](11-qloo-benchmark.md)); its human votes are not collected, so no win-rate or quality-uplift claim is made.
- Not yet run: physical-device, assistive-technology and cross-device account acceptance (issue #59).
- The site depends on the event Qloo quota. If it is exhausted, pages show an explicit error rather than substitute data.
