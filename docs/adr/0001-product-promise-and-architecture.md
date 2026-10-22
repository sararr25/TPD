# 0001 — Product promise and architecture: Swap and city guide at equal weight

Status: accepted, 22 Oct 2026 (owner, `/loop-me` session for #6). Spec: #3.

## Decision

- **Two equal promises.** "Your place is full? Find its twin." and "Open a city and see it through your taste." The Home shows both entrances with the same weight.
- **Swap lives inside City and Place**, not as a page of its own:
  - City page: a real in-page tab "Swap" next to "For you". It doesn't change page and keeps the city header.
  - Place page: "Find its twin" is the main action.
  - `/swap` stays as a redirect (or a results view with the starting place fixed), so old links keep working.
- **Place page.** It has its own shareable URL (`/[city]/[place]`). On mobile it opens as a bottom sheet over the list; on desktop it is a full page. It shows: photo, why it fits you, chips, map, Save, Directions, Find its twin.
- **Main navigation:** Cities · Swap · Saved · Passport. "Swap" opens the Swap tab of the current city, or asks for a city.
- **Mobile:** a bottom tab bar with the same four items. The top bar holds only the logo and sign-in.
- **Cities:** `/explore` is the index of every city (done in #11).
- **Sign-in:** a small link in the header, plus one prompt at the end of the quiz ("Save your Passport").

## Consequences

- The fake "For you / Swap" toggle (#9) becomes a real tab, not a link.
- Swap must work without a Passport (#10), because it is reachable from every city.
- #24 (mobile navigation) follows this ADR. The sign-in prompt is after the quiz, not after the 3rd save.
