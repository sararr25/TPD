"use client";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  LIVE_PASSPORT_KEY,
  CITIES,
  type Choice,
  type Result,
  type PlaceCategory,
} from "@/lib/discovery";
import {
  discovery,
  readSelections,
  type Selection,
} from "@/lib/discovery-client";
import { authClient } from "@/lib/auth/client";
import { readStoredQuiz } from "@/lib/quiz";
import { feedbackSignal } from "@/lib/feedback";
import { useFeedback } from "./use-feedback";
import {
  loadAccountPassport,
  loadHidden,
  hidePlace,
  unhidePlace,
  type Hidden,
} from "@/lib/account";
import { useSavedLists } from "./save-button";
import { PlaceCard } from "./place-card";
import { useToast } from "./toast";
import { useCity } from "./use-city";
import type { CheckStatus } from "@/lib/venue-check";
type Payload = {
  results: Result[];
  checkedAt: string;
  candidateCount: number;
  discarded: number;
  // How many candidates have a kept feature (null when nothing is kept).
  keepMatched: number | null;
  // The cuisine all results share; anchorDropped when too few had it.
  anchor: string | null;
  anchorDropped: boolean;
  notice: string;
};
// The OpenStreetMap check in plain words (#14): a short label on the card,
// the longer sentence only inside "How we checked".
const CHECK_BADGE: Partial<Record<CheckStatus, { text: string; warn: boolean }>> = {
  confirmed: { text: "Address checked ✓", warn: false },
  conflict: { text: "Check the address before going", warn: true },
  ambiguous: { text: "Check the address before going", warn: true },
};
const CHECK_PLAIN: Record<CheckStatus, string> = {
  confirmed: "The name, the type of place and the address all agree with OpenStreetMap, a free public map.",
  conflict: "Something did not agree with OpenStreetMap, a free public map, so check the address before you go.",
  ambiguous: "Several places nearby share this name, so double-check you have the right one.",
  not_found: "OpenStreetMap, a free public map, does not list it nearby. The map is incomplete, so this does not mean it is closed.",
  unavailable: "We could not check the map right now.",
};
// `fixedCity` + `embedded`: inside a city page the page's city is used and the
// page title and city selector are hidden. Standalone /swap passes neither.
export function SwapWorkspace({ fixedCity, embedded = false }: { fixedCity?: string; embedded?: boolean } = {}) {
  const [category, setCategory] = useState<PlaceCategory>("restaurant"),
    [rememberedCity, setCity, rememberedKnown] = useCity(),
    city = fixedCity ?? rememberedCity,
    cityKnown = fixedCity ? true : rememberedKnown;
  // Each city and category keeps its own progress (docs/22 F15): switching
  // back shows the place, chips and results you left there. Tracking starts
  // once the remembered city is known, so no stray Paris workspace is made.
  const key = `${city}|${category}`;
  const [visited, setVisited] = useState<string[]>([]);
  // Home's search box links here with ?q= (and ?category=museum): that
  // place name pre-fills, and searches, the first workspace (docs/24).
  // ?ref= (from a card's "Find similar", #8) is that place's id: the search
  // result with the same id is chosen as the starting point automatically.
  const [prefill, setPrefill] = useState<{ key: string; query: string; ref: string } | null>(null),
    [linked, setLinked] = useState<{ query: string; category: PlaceCategory; ref: string } | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q")?.trim().slice(0, 120);
    if (!query) return;
    const cat: PlaceCategory = params.get("category") === "museum" ? "museum" : "restaurant";
    setCategory(cat);
    setLinked({ query, category: cat, ref: params.get("ref")?.trim().slice(0, 200) ?? "" });
  }, []);
  useEffect(() => {
    if (cityKnown && linked && !prefill) setPrefill({ key: `${city}|${linked.category}`, query: linked.query, ref: linked.ref });
  }, [cityKnown, linked, prefill, city]);
  useEffect(() => {
    if (cityKnown) setVisited((list) => (list.includes(key) ? list : [...list, key]));
  }, [key, cityKnown]);
  return (
    <>
      {!embedded && (
        <>
          <div className="page-head">
            <span className="meta">Swap a place</span>
            <h1>
              Keep the feeling, <em>change the place.</em>
            </h1>
          </div>
          <label htmlFor="swap-city">City</label>
          <select id="swap-city" value={city} onChange={(e) => setCity(e.target.value)}>
            {Object.keys(CITIES).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </>
      )}
      <div className="toggle-group" role="group" aria-label="Category">
        {(["restaurant", "museum"] as const).map((value) => (
          <button
            className="toggle"
            key={value}
            aria-pressed={category === value}
            onClick={() => setCategory(value)}
          >
            {value === "restaurant" ? "Restaurants" : "Museums"}
          </button>
        ))}
      </div>
      {visited.map((k) => {
        const [c, cat] = k.split("|") as [string, PlaceCategory];
        return (
          <div key={k} hidden={k !== key}>
            <CategoryWorkspace
              city={c}
              category={cat}
              onTransfer={setCategory}
              prefill={prefill?.key === k ? prefill.query : ""}
              prefillRef={prefill?.key === k ? prefill.ref : ""}
            />
          </div>
        );
      })}
    </>
  );
}
function CategoryWorkspace({ city, category, onTransfer, prefill, prefillRef }: {
  city: string;
  category: PlaceCategory;
  onTransfer: (category: PlaceCategory) => void;
  prefill: string;
  // Id of the linked place: when a search result has it, it is chosen (#8).
  prefillRef: string;
}) {
  const uid = useId();
  const museum = category === "museum";
  const museums = CITIES[city].museums;
  const searchController = useRef<AbortController | null>(null);
  useEffect(() => () => searchController.current?.abort(), []);
  const [passport, setPassport] = useState<Selection[]>([]),
    [ready, setReady] = useState(false),
    [query, setQuery] = useState(prefill),
    [matches, setMatches] = useState<Selection[]>([]),
    [reference, setReference] = useState<Selection | null>(null),
    [choices, setChoices] = useState<Choice[]>([]),
    [budget, setBudget] = useState(""),
    [searching, setSearching] = useState(false),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [data, setData] = useState<Payload | null>(null),
    [started, setStarted] = useState(false),
    [attempt, setAttempt] = useState(0),
    [hidden, setHidden] = useState<Hidden[]>([]),
    // Chips or budget changed since the results on screen (docs/22 F14).
    [stale, setStale] = useState(false);
  // Fewer than 3 picks is no Passport: Swap then runs on the starting place alone.
  const personal = passport.length >= 3;
  const toast = useToast();
  const showError = (m: string) => toast(m, { error: true });
  // Read at request time so hiding a card does not re-run the current Swap.
  const hiddenIds = useRef<string[]>([]);
  useEffect(() => {
    hiddenIds.current = hidden.map((h) => h.id);
  }, [hidden]);
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const { current: feedback, vote, unvote, voted } = useFeedback(!isPending, userId, showError);
  const { lists, reload, signedIn } = useSavedLists(!isPending, userId);
  // Signed in: use the account Passport (freshly signed, works on any device).
  useEffect(() => {
    if (isPending) return;
    try {
      setPassport(readSelections(localStorage.getItem(LIVE_PASSPORT_KEY)));
    } catch {
      setStatus(
        "Your browser Passport could not be read. Reopen the Passport and choose your favourites.",
      );
    }
    let active = true;
    loadHidden(!!userId)
      .then((list) => active && setHidden(list))
      .catch((e) => active && setStatus((e as Error).message));
    if (!userId) {
      setReady(true);
      return () => {
        active = false;
      };
    }
    loadAccountPassport()
      .then((account) => {
        if (!active || !account) return;
        setPassport(account);
        try {
          localStorage.setItem(LIVE_PASSPORT_KEY, JSON.stringify(account));
        } catch {}
      })
      .catch((e) => active && setStatus((e as Error).message))
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, [isPending, userId]);
  useEffect(() => {
    if (!started || !reference) return;
    const controller = new AbortController();
    let active = true;
    setBusy(true);
    setStale(false);
    setStatus("Finding alternatives…");
    discovery<Payload>(
      {
        action: "swap",
        category,
        reference: reference.token,
        passport: personal ? passport.map((s) => s.token) : [],
        choices,
        exclude: hiddenIds.current,
        quiz: readStoredQuiz(),
        city,
        feedback: feedbackSignal(feedback.current),
        ...(budget ? { maxPrice: Number(budget) } : {}),
      },
      controller.signal,
    )
      .then((result) => {
        if (active) {
          setData(result);
          setStatus(
            result.results.length
              ? `${result.results.length} alternatives in ${city}` +
                  (result.anchor
                    ? `, all with ${result.anchor.toLowerCase()} like ${reference.entity.name}.`
                    : result.anchorDropped
                      ? `. Too few places shared its cuisine, so these are the closest overall.`
                      : ".") +
                  (result.keepMatched !== null && result.keepMatched < 3
                    ? ` Only ${result.keepMatched} had what you chose to keep; the others are the next best matches.`
                    : "")
              : `Nothing in ${city} matched everything you asked for. Try keeping fewer things, or start from another place.`,
          );
        }
      })
      .catch((error) => {
        if (active && error.name !== "AbortError") setStatus(error.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
    // Only "Swap it" (attempt) or a new starting place runs a search
    // (docs/22 F14); chips and budget are read from the render that pressed it.
  }, [started, reference, attempt]);
  // A linked place name (from Home) searches once, as soon as the Passport is read.
  const prefilled = useRef(false);
  useEffect(() => {
    if (!prefill || prefilled.current || !ready) return;
    prefilled.current = true;
    setQuery(prefill);
    runSearch(prefill, prefillRef);
  }, [prefill, prefillRef, ready, passport]);
  async function search(e: React.FormEvent) {
    e.preventDefault();
    await runSearch(query);
  }
  async function runSearch(query: string, refId = "") {
    searchController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;
    setSearching(true);
    setMatches([]);
    setStatus(`Looking for your ${category} in ${city}…`);
    try {
      const found = await discovery<{ choices: Selection[] }>({
        action: "search",
        query,
        type: "place",
        reference: true,
        category,
        city,
      }, controller.signal);
      if (controller.signal.aborted) return;
      // The linked place is in the results: start from it, no second click.
      const sameName = found.choices.filter((s) => s.entity.name.toLowerCase() === query.toLowerCase());
      const linkedMatch = refId
        ? (found.choices.find((s) => s.entity.id === refId) ?? (sameName.length === 1 ? sameName[0] : undefined))
        : undefined;
      if (linkedMatch) {
        select(linkedMatch);
        return;
      }
      setMatches(found.choices);
      setStatus(
        found.choices.length
          ? `Pick the ${category} you meant.`
          : `No ${category} in ${city} with an address and map spot turned up. Try a more precise name.`,
      );
    } catch (error) {
      if (!controller.signal.aborted) setStatus((error as Error).message);
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }
  function select(s: Selection) {
    setReference(s);
    setData(null);
    setStarted(false);
    setBusy(false);
    setChoices(
      s.entity.tags
        .filter((t) => t.id !== `urn:tag:genre:place:${category}`)
        .slice(0, 6)
        .map((t) => ({ tagId: t.id, mode: "ignore" })),
    );
    setStatus(
      "Choose what to keep and what to change. City and category stay fixed.",
    );
    setMatches([]);
  }
  async function notForMe(result: Result) {
    const place = { id: result.place.id, name: result.place.name };
    setHidden((list) => [...list.filter((h) => h.id !== place.id), place]);
    try {
      await hidePlace(place, result.token!, !!userId);
      await vote(result.place, -1);
      toast(`${place.name} is hidden and won’t come up in your next Swaps.`, {
        action: { label: "Undo", run: () => undoHide(result) },
      });
    } catch (error) {
      showError((error as Error).message);
    }
  }
  async function undoHide(result: Result) {
    setHidden((list) => list.filter((h) => h.id !== result.place.id));
    try {
      await unhidePlace(result.place.id, !!userId);
      await unvote(result.place.id);
      toast(`${result.place.name} is back.`);
    } catch (error) {
      showError((error as Error).message);
    }
  }
  // Saving a place is also "more like this", as on the city page (docs/24:
  // ♡ replaces 👍).
  function saved(place: Result["place"]) {
    if (voted(place.id) === 1) return;
    vote(place, 1).catch((e) => showError((e as Error).message));
  }
  function changeTag(tagId: string, mode: Choice["mode"]) {
    if (data) setStale(true);
    setChoices((values) =>
      values.map((c) => (c.tagId === tagId ? { ...c, mode } : c)),
    );
  }
  return (
    <>
      <p className="lead">
        Full, closed or not quite right? Tell us the {category} you wanted and we find another
        one in {city} that keeps what you liked about it.
        {museum && " Your music, film and book favourites travel with you."}
      </p>
      {museum && museums !== "ok" && (
        <p className="muted" role="note">
          {museums === "none"
            ? `Our data has no museums in ${city}. Try restaurants, or another city.`
            : `Our data has only a few museums in ${city}: results will be the same for most Passports.`}
        </p>
      )}
      {ready && !personal && (
        <div className="city-banner">
          <p>
            These alternatives come from your starting place alone. <strong>Make them yours</strong>: pick 3
            favourites and we re-rank them for your taste.
          </p>
          <Link className="btn btn-primary" href="/passport">
            Make it mine
          </Link>
        </div>
      )}
      <>
          <div className="grid">
            <section className="paper">
              <span className="meta">Step 1 · The place you wanted</span>
              <form onSubmit={search}>
                <label htmlFor={uid + "-reference"}>The {category} you wanted</label>
                <input
                  id={uid + "-reference"}
                  placeholder={museum ? "Museum name" : "Restaurant name"}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  minLength={2}
                  maxLength={120}
                  required
                  disabled={!ready || searching}
                />
                <p className="meta">Stay in {city}</p>
                <div className="actions">
                  <button className="btn btn-secondary" disabled={!ready || searching}>
                    Find the {category}
                  </button>
                </div>
              </form>
              <ul className="entity-list">
                {matches.map((s) => (
                  <li key={s.entity.id}>
                    <div>
                      <strong>{s.entity.name}</strong>
                      <p className="muted">{s.entity.address}</p>
                    </div>
                    <button className="btn btn-quiet" onClick={() => select(s)}>
                      Choose
                    </button>
                  </li>
                ))}
              </ul>
              {reference && (
                <div className="divider">
                  <h3>{reference.entity.name}</h3>
                  <p>{reference.entity.address}</p>
                  <span className="meta">
                    Your starting point
                  </span>
                </div>
              )}
            </section>
            <section>
              <span className="meta">Step 2 · What to keep</span>
              {reference ? (
                <>
                  <p>
                    What this place is known for. Keep what you liked; Change what you want
                    to avoid next time.
                  </p>
                  {choices.length ? (
                    choices.map((choice) => {
                      const tag = reference.entity.tags.find(
                        (t) => t.id === choice.tagId,
                      )!;
                      return (
                        <div className="segment" key={choice.tagId}>
                          <span>{tag.name}</span>
                          <div className="toggle-group segmented" role="group" aria-label={tag.name}>
                            {(["keep", "change", "ignore"] as const).map(
                              (mode) => (
                                <button
                                  type="button"
                                  className="toggle"
                                  key={mode}
                                  aria-pressed={choice.mode === mode}
                                  onClick={() => changeTag(choice.tagId, mode)}
                                >
                                  {mode}
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>
                      We have no details for this place. It and your Passport still guide the
                      search.
                    </p>
                  )}
                  {!museum && (
                    <>
                      <label htmlFor={uid + "-budget"}>Price, at most</label>
                      <select
                        id={uid + "-budget"}
                        value={budget}
                        onChange={(e) => {
                          if (data) setStale(true);
                          setBudget(e.target.value);
                        }}
                      >
                        <option value="">Any price</option>
                        <option value="1">Cheap</option>
                        <option value="2">Moderate</option>
                        <option value="3">Pricier</option>
                        <option value="4">Top end</option>
                      </select>
                      <p className="muted">
                        A rough price level, not today’s menu. Places with no known price
                        are left out when you set a limit.
                      </p>
                    </>
                  )}
                  <div className="actions">
                    <button
                      className="btn btn-primary"
                      disabled={busy}
                      onClick={() => {
                        setStarted(true);
                        setAttempt((n) => n + 1);
                      }}
                    >
                      {busy ? "Finding alternatives…" : stale ? "Update results" : "Swap it"}
                    </button>
                  </div>
                  {stale && !busy && (
                    <p className="muted" role="note">
                      You changed what to keep or the price. Press Update results to see new alternatives.
                    </p>
                  )}
                </>
              ) : (
                <p>Find your {category} first. Then choose what you liked about it (to keep) and what you would change.</p>
              )}
              {personal && (
                <div className="divider">
                  <span className="meta">Your Passport</span>
                  <p className="muted">
                    {passport.map((s) => s.entity.name).join(" · ")}
                  </p>
                  <Link href="/passport">Edit favourites</Link>
                </div>
              )}
            </section>
          </div>
      </>
      <p role="status" aria-live="polite">
        {status}
      </p>
      <section aria-label="Alternatives" aria-busy={busy}>
        {data && (
          <>
            <div className="divider">
              <h2>{personal ? "Same Passport. A different experience." : "Same feeling. A different experience."}</h2>
              <p>Carry {personal ? "your favourites" : "this idea"} into {museum ? "restaurants" : "museums"} in {city}. Pick a starting place there to guide the next Swap.</p>
              <button className="btn btn-secondary" onClick={() => onTransfer(museum ? "restaurant" : "museum")}>
                Try {museum ? "restaurants" : "museums"} {personal ? "with this Passport" : "too"} ↗
              </button>
            </div>
            <div className="place-grid">
              {data.results
                .filter((result) => !hidden.some((h) => h.id === result.place.id))
                .map((result) => (
                <PlaceCard
                  key={result.place.id}
                  place={result.place}
                  token={result.token ?? ""}
                  city={city}
                  category={category}
                  eyebrow={result.role}
                  whyLabel="Why it fits you"
                  why={result.why}
                  details={
                    <>
                      <span className="place-label">What’s different</span>
                      <p className="place-why">{result.different}</p>
                      {result.check && CHECK_BADGE[result.check.status] && (
                        <p className="place-check" data-warn={CHECK_BADGE[result.check.status]!.warn || undefined}>
                          {CHECK_BADGE[result.check.status]!.text}
                        </p>
                      )}
                      <details className="place-checked">
                        <summary>How we checked</summary>
                        <p>
                          This is a {category} in {city} with an address and a spot on the map
                          {budget ? ", within your price limit" : ""}. We left out your starting
                          place, duplicates, places marked closed and anything you chose to change.
                        </p>
                        {result.check && (
                          <>
                            <p>
                              {CHECK_PLAIN[result.check.status]}
                              {result.check.match && (
                                <>
                                  {" "}It matches{" "}
                                  <a href={result.check.match.url} target="_blank" rel="noreferrer">
                                    {result.check.match.name} ↗
                                  </a>
                                  , {result.check.match.distanceM} m from where we have it.
                                </>
                              )}
                            </p>
                            {result.check.notes.map((note) => (
                              <p key={note}>{note}</p>
                            ))}
                          </>
                        )}
                        <p>
                          Opening hours, {museum ? "admission prices, exhibitions and tickets" : "menu prices and table availability"} are
                          not checked: confirm with the place.
                        </p>
                        <p className="meta">Checked {new Date(data.checkedAt).toLocaleString()}</p>
                      </details>
                    </>
                  }
                  lists={lists}
                  signedIn={signedIn}
                  onListsChange={reload}
                  onSaved={() => saved(result.place)}
                  onHide={() => notForMe(result)}
                  active={false}
                  onHover={() => {}}
                  pin={null}
                  findSimilar={false}
                  directions
                />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
