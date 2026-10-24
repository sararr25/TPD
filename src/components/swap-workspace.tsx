"use client";
import { usePassportState, PassportPrompt } from "./passport-state";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  CITIES,
  hasTrait,
  type Choice,
  type Result,
  type PlaceCategory,
} from "@/lib/discovery";
import {
  discovery,
  type Selection,
} from "@/lib/discovery-client";
import { authClient } from "@/lib/auth/client";
import { feedbackSignal } from "@/lib/feedback";
import { useFeedback } from "./use-feedback";
import { OpenQuizButton } from "./quiz-panel";
import {
  loadHidden,
  hidePlace,
  unhidePlace,
  type Hidden,
} from "@/lib/account";
import { useSavedLists } from "./save-button";
import { PlaceCard } from "./place-card";
import { CityMap } from "./city-map";
import { useToast } from "./toast";
import { useCity } from "./use-city";
import { EmptyState, LoadingCards } from "./empty-state";
import type { CheckStatus } from "@/lib/venue-check";
// Qloo tag names in plain sentence case ("fine_dining" -> "Fine dining").
function traitLabel(name: string): string {
  const text = name.replace(/[_-]+/g, " ").trim().toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
function joinList(items: string[]): string {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
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
  confirmed: { text: "Map match found ✓", warn: false },
  conflict: { text: "Check the address before going", warn: true },
  ambiguous: { text: "Check the address before going", warn: true },
};
const CHECK_PLAIN: Record<CheckStatus, string> = {
  confirmed: "A nearby place with the same name and kind matches OpenStreetMap, a free public map. Any limits to the address comparison are listed below.",
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
          <div className="page-head swap-intro">
            <span className="swap-intro-stamp" aria-hidden>SWAP</span>
            <div>
              <h1>Find its twin</h1>
              <p className="lead">Choose the city and the place you wanted. Keep what you loved, change what didn’t work.</p>
            </div>
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
    [noMatches, setNoMatches] = useState(false),
    [searchError, setSearchError] = useState(""),
    [swapError, setSwapError] = useState(""),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [data, setData] = useState<Payload | null>(null),
    // The choices the results on screen were found with (labels must not follow later edits).
    [usedChoices, setUsedChoices] = useState<Choice[]>([]),
    [started, setStarted] = useState(false),
    [attempt, setAttempt] = useState(0),
    [hidden, setHidden] = useState<Hidden[]>([]),
    [activeResult, setActiveResult] = useState<string | null>(null),
    // Chips or budget changed since the results on screen (docs/22 F14).
    [stale, setStale] = useState(false);
  // Fewer than 3 picks is no Passport: Swap then runs on the starting place alone.

  const toast = useToast();
  const showError = (m: string) => toast(m, { error: true });
  // Read at request time so hiding a card does not re-run the current Swap.
  const hiddenIds = useRef<string[]>([]);
  const resultsRegion = useRef<HTMLElement>(null);
  useEffect(() => {
    hiddenIds.current = hidden.map((h) => h.id);
  }, [hidden]);
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const { current: feedback, vote, unvote, voted } = useFeedback(!isPending, userId, showError);
  const { lists, reload, signedIn } = useSavedLists(!isPending, userId);
  const passportState = usePassportState();
  const personal = passportState.state === "ready";
  useEffect(() => { setData(null); setStarted(false); setHidden([]); }, [userId]);
  useEffect(() => {
    setPassport(passportState.selections);
    setReady(passportState.loaded && !passportState.error && !["saving", "partial", "expired"].includes(passportState.state));
  }, [passportState.selections, passportState.loaded, passportState.error, passportState.state]);
  useEffect(() => {
    if (isPending) return;
    let active = true;
    loadHidden(!!userId).then(list => active && setHidden(list)).catch(e => active && setStatus(e.message));
    return () => { active = false; };
  }, [isPending, userId]);
  useEffect(() => {
    if (!started || !reference || !ready || passportState.owner !== (userId || "guest")) return;
    const controller = new AbortController();
    let active = true;
    setBusy(true);
    setSwapError("");
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
        quiz: passportState.quiz,
        city,
        feedback: feedbackSignal(feedback.current),
        ...(budget ? { maxPrice: Number(budget) } : {}),
      },
      controller.signal,
    )
      .then((result) => {
        if (active) {
          setData(result);
          setUsedChoices(choices);
          setStatus(
            result.results.length
              ? `${result.results.length} alternatives in ${city}` +
                  (result.anchor
                    ? `, all with ${result.anchor.toLowerCase()} like ${reference.entity.name}.`
                    : result.anchorDropped
                      ? `. Too few places shared its cuisine, so we included other kinds of food.`
                      : ".") +
                  (result.keepMatched !== null && result.keepMatched < 3
                    ? ` Only ${result.keepMatched} shared at least one thing you chose to keep; the others offer a different option.`
                    : "")
              : `We couldn’t find alternatives in ${city} for these choices. Try a wider price range or another starting place.`,
          );
        }
      })
      .catch((error) => {
        if (active && error.name !== "AbortError") {
          setSwapError(error.message);
          setStatus(error.message);
        }
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
  }, [started, reference, attempt, ready, passportState.owner, userId]);
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
    setNoMatches(false);
    setSearchError("");
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
      setNoMatches(found.choices.length === 0);
      setStatus(
        found.choices.length
          ? `Pick the ${category} you meant.`
          : `We couldn’t find that ${category} in ${city} with an address and map location. Try its full name.`,
      );
    } catch (error) {
      if (!controller.signal.aborted) {
        setSearchError((error as Error).message);
        setStatus((error as Error).message);
      }
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }
  function select(s: Selection) {
    setNoMatches(false);
    setSearchError("");
    setSwapError("");
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
  const traitNames = (mode: Choice["mode"], from = choices) =>
    from
      .filter((c) => c.mode === mode)
      .map((c) => traitLabel(reference?.entity.tags.find((t) => t.id === c.tagId)?.name ?? c.tagId));
  const keepNames = traitNames("keep"),
    changeNames = traitNames("change");
  // What a result keeps and changes, from its own tags against the choices
  // made for the Swap that produced it (matched by name: the same feature can
  // carry a different tag type on each place).
  function keptChanged(result: Result) {
    const kept: string[] = [],
      changed: string[] = [];
    for (const c of usedChoices) {
      const tag = reference?.entity.tags.find((t) => t.id === c.tagId);
      if (!tag || c.mode === "ignore") continue;
      const has = hasTrait(result.place, tag);
      if (c.mode === "keep" && has) kept.push(traitLabel(tag.name));
      if (c.mode === "change" && !has) changed.push(traitLabel(tag.name));
    }
    return { kept, changed };
  }
  const visibleResults = data?.results.filter((result) => !hidden.some((h) => h.id === result.place.id)) ?? [];
  // CityMap numbers only places with coordinates, in this same order.
  const mappedPlaces = visibleResults
    .map((result) => result.place)
    .filter((place) => place.lat !== null && place.lon !== null);
  const resultPins = new Map(mappedPlaces.map((place, i) => [place.id, i + 1]));
  const usedKeepNames = traitNames("keep", usedChoices),
    usedChangeNames = traitNames("change", usedChoices);
  function pickResult(id: string) {
    setActiveResult(id);
    // Scope to Swap: the city's hidden For you tab can contain this place too.
    const card = resultsRegion.current?.querySelector<HTMLElement>(`#place-${CSS.escape(id)}`);
    card?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center",
    });
  }
  return (
    <>
      {passportState.state !== "ready" && passportState.state !== "new" && <PassportPrompt />}
      <p className="lead">
        Full, closed or not quite right? Name the {category} you wanted and we look for another
        one in {city} with what you liked about it.
        {museum && personal && " Your music, film and book favourites help shape the picks too."}
      </p>
      {museum && museums === "none" && (
        <EmptyState title={`No museum picks in ${city} yet`} action={
          <button className="btn btn-secondary" onClick={() => onTransfer("restaurant")}>Try restaurants</button>
        }>
          <p>We don’t have museums to suggest here yet. You can still look for a restaurant in this city.</p>
        </EmptyState>
      )}
      {museum && museums !== "none" && museums !== "ok" && (
        <p className="muted" role="note">
          We have only a few museums to suggest in {city}, so different Passports may see the same places.
        </p>
      )}
      {ready && !personal && (
        <div className="city-banner">
          <p>
            These twins are based on your starting place. <strong>Add your taste</strong>: a 3-minute quiz
            builds your Taste Passport, so your favourites can guide the picks too.
          </p>
          <OpenQuizButton />
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
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setNoMatches(false);
                    setSearchError("");
                  }}
                  minLength={2}
                  maxLength={120}
                  required
                  disabled={!ready || searching}
                />
                <p className="meta">Stay in {city}</p>
                <div className="actions">
                  <button className="btn btn-secondary" disabled={!ready || searching}>
                    Search for this place
                  </button>
                </div>
              </form>
              {searching && <LoadingCards label={`Looking for your ${category}…`} count={1} />}
              {noMatches && !searching && (
                <EmptyState title="We couldn’t find that place" action={
                  <button className="btn btn-secondary" onClick={() => document.getElementById(uid + "-reference")?.focus()}>Try another name</button>
                }>
                  <p>Try its full name or another {category} in {city}. Your Keep and Change choices stay as they were.</p>
                </EmptyState>
              )}
              {searchError && !searching && (
                <EmptyState title="The place search couldn’t load" action={
                  <button className="btn btn-secondary" onClick={() => void runSearch(query)}>Try again</button>
                }>
                  <p>{searchError}</p>
                </EmptyState>
              )}
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
                  <h3>{started ? <s>{reference.entity.name}</s> : reference.entity.name}</h3>
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
                    <strong>Keep</strong> what you love about it and we look for the same.{" "}
                    <strong>Change</strong> what you are tired of and we look for something different.
                    Leave a trait alone if you do not mind.
                  </p>
                  {choices.length ? (
                    choices.map((choice) => {
                      const tag = reference.entity.tags.find(
                        (t) => t.id === choice.tagId,
                      )!;
                      const label = traitLabel(tag.name);
                      return (
                        <div className="segment" key={choice.tagId}>
                          <span>{label}</span>
                          <div className="toggle-group" role="group" aria-label={label}>
                            {(["keep", "change"] as const).map((mode) => (
                              <button
                                type="button"
                                className="toggle"
                                key={mode}
                                aria-label={`${mode === "keep" ? "Keep" : "Change"}: ${label}`}
                                aria-pressed={choice.mode === mode}
                                onClick={() => changeTag(choice.tagId, choice.mode === mode ? "ignore" : mode)}
                              >
                                {mode === "keep" ? "Keep" : "Change"}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>
                      We don’t have traits to compare for this place. Its name{personal ? " and your Passport" : ""} still guides the search.
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
                  {choices.length > 0 && (
                    <p className="swap-summary">
                      <strong>Keeping:</strong> {keepNames.length ? joinList(keepNames) : "nothing in particular"}.{" "}
                      <strong>Changing:</strong> {changeNames.length ? joinList(changeNames) : "nothing in particular"}.
                    </p>
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
                      {busy ? "Finding alternatives…" : stale ? "Update results" : "Find its twin"}
                    </button>
                  </div>
                  {stale && !busy && (
                    <p className="muted" role="note">
                      You changed what to keep or the price. Press Update results to see new alternatives.
                    </p>
                  )}
                </>
              ) : (
                <EmptyState title="Start with a place you know" action={
                  <button className="btn btn-secondary" onClick={() => document.getElementById(uid + "-reference")?.focus()}>Search for a place</button>
                }>
                  <p>Find the {category} you wanted first. Then choose what its twins should keep or change.</p>
                </EmptyState>
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
      <section ref={resultsRegion} aria-label="Alternatives" aria-busy={busy}>
        {busy && <LoadingCards label="Finding twins for your starting place…" />}
        {swapError && !busy && (
          <EmptyState title="Your twins couldn’t load" action={
            <button className="btn btn-secondary" onClick={() => setAttempt((n) => n + 1)}>Try again</button>
          }>
            <p>{swapError}</p>
            <p>Your starting place and choices are still here.</p>
          </EmptyState>
        )}
        {data && !busy && !swapError && visibleResults.length === 0 && (
          <EmptyState title={data.results.length ? "You’ve hidden these twins" : "No twins for these choices"} action={
            data.results.length ? (
              <Link className="btn btn-secondary" href="/passport/settings">Review hidden places</Link>
            ) : (
              <button className="btn btn-secondary" onClick={() => document.getElementById(uid + "-reference")?.focus()}>Try another starting place</button>
            )
          }>
            <p>{data.results.length
              ? "Your hidden places stay hidden. Bring one back in Settings & privacy or choose a new starting place."
              : `${museum ? "Try a different starting museum" : "Try a wider price range or a different starting place"}. Your Passport and hidden places haven’t changed.`}</p>
          </EmptyState>
        )}
        {data && !busy && !swapError && visibleResults.length > 0 && (
          <>
            <div className="divider">
              <h2>Try {museum ? "restaurants" : "museums"} in {city}</h2>
              <p>Choose a starting {museum ? "restaurant" : "museum"}{personal ? "; your Passport will help pick its twins too" : " to find its twins"}.</p>
              <button className="btn btn-secondary" onClick={() => onTransfer(museum ? "restaurant" : "museum")}>
                Try {museum ? "restaurants" : "museums"} {personal ? "with this Passport" : "too"} ↗
              </button>
            </div>
            <div className="swap-results-layout">
            <div className="place-grid swap-results-list">
              {visibleResults.map((result) => (
                <PlaceCard
                  key={result.place.id}
                  place={result.place}
                  token={result.token ?? ""}
                  city={city}
                  category={category}
                  eyebrow={result.role}
                  whyLabel={personal ? "Why it fits you" : "Why this twin"}
                  why={result.why}
                  details={
                    <>
                      {(() => {
                        const { kept, changed } = keptChanged(result);
                        return (
                          (kept.length > 0 || changed.length > 0) && (
                            <>
                              <span className="place-label">Compared with {reference?.entity.name}</span>
                              {kept.length > 0 && (
                                <p className="place-why">
                                  <strong>Keeps:</strong> {joinList(kept)}.
                                </p>
                              )}
                              {changed.length > 0 && (
                                <p className="place-why">
                                  <strong>Changes:</strong> {joinList(changed)}.
                                </p>
                              )}
                            </>
                          )
                        );
                      })()}
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
                          Our place data lists this as a {category} in {city}, with an address and map location
                          {budget ? ", in your chosen price range" : ""}. We left out your starting
                          place, duplicates, places marked closed and places tagged with what you chose to change.
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
                        <p className="meta">Place data read {new Date(data.checkedAt).toLocaleString()}</p>
                      </details>
                    </>
                  }
                  lists={lists}
                  signedIn={signedIn}
                  onListsChange={reload}
                  onSaved={() => saved(result.place)}
                  onHide={() => notForMe(result)}
                  active={activeResult === result.place.id}
                  onHover={setActiveResult}
                  pin={resultPins.get(result.place.id) ?? null}
                  findSimilar={false}
                  directions
                />
              ))}
            </div>
            <aside className="swap-results-map" aria-label="Map and choices used for these twins">
              <div className="swap-search-recap">
                <h3>For this search</h3>
                <p><strong>Keeping:</strong> {usedKeepNames.length ? joinList(usedKeepNames) : "nothing in particular"}.</p>
                <p><strong>Changing:</strong> {usedChangeNames.length ? joinList(usedChangeNames) : "nothing in particular"}.</p>
                {stale && <p className="muted">Your edits above apply when you update the results.</p>}
              </div>
              {mappedPlaces.length > 0 && <CityMap places={mappedPlaces} active={activeResult} onPick={pickResult} />}
            </aside>
            </div>
            {data.results.length > 0 && (
              <p className="muted">
                Opening hours, {museum ? "admission prices, exhibitions and tickets" : "menu prices and table availability"} aren’t
                checked. Confirm with the place before you go.
              </p>
            )}
          </>
        )}
      </section>
    </>
  );
}
