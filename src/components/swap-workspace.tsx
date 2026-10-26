"use client";
import { JourneyRoute } from "./travel-art";
import { usePassportState, PassportPrompt } from "./passport-state";
import { useEffect, useLayoutEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  CITIES,
  TWIN_CATEGORIES, CATEGORY_CAPABILITIES, placeCategory, categoryHasPrice, categoryFacets, distance, type Entity,
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
import { EmptyState } from "./empty-state";
import { priceSymbols, PRICE_LEVELS } from "@/lib/price";
import { EventsExplorer } from "./events-explorer";
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
    [events, setEvents] = useState(false),
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
    const cat = placeCategory(params.get("category")) ?? "restaurant";
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
          <div className="page-head swap-intro" data-travel-page>
            <span className="swap-intro-stamp" data-travel-stamp aria-hidden>TWIN</span>
            <div>
              <h1>Find its twin</h1>
              <p className="lead">Choose the city and the place you wanted. Keep the DNA you love. Leave the rest behind.</p>
              <JourneyRoute branching />
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
        {TWIN_CATEGORIES.map((value) => (
          <button
            className="toggle"
            key={value}
            aria-pressed={!events && category === value}
            onClick={() => { setEvents(false); setCategory(value); }}
          >
            {CATEGORY_CAPABILITIES[value].label}
          </button>
        ))}
        <button className="toggle" aria-pressed={events} onClick={() => setEvents(true)}>Events · Paris pilot</button>
      </div>
      {events && <EventsExplorer city={city} />}
      {visited.map((k) => {
        const [c, cat] = k.split("|") as [string, PlaceCategory];
        return (
          <div key={k} hidden={events || k !== key}>
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
  const [presenting, setPresenting] = useState(false);
  const [facet, setFacet] = useState("");
  const [areaId, setAreaId] = useState("");
  const [neighbourhoods, setNeighbourhoods] = useState<Entity[]>([]);
  const [areasError, setAreasError] = useState("");
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const outcomeRef = useRef<HTMLDivElement>(null);
  const submissionTop = useRef(96);
  const otherHeading = useRef<HTMLHeadingElement>(null);
  const outcomeHeading = useRef<HTMLHeadingElement>(null);
  const focusOutcome = useRef(false);
  const cap = CATEGORY_CAPABILITIES[category];
  function startTwin() {
    if (!ready || busy) return;
    submissionTop.current = Math.max(88, (document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 76) + 12);
    focusOutcome.current = true;
    submittedProfile.current = profileKey;
    setBusy(true);
    setPresenting(true);
    setStarted(true);
    setAttempt((n) => n + 1);
  }
  function editSearch() {
    setPresenting(false);
    requestAnimationFrame(() => document.getElementById(uid + "-reference")?.focus());
  }
  function seeOthers() {
    const target = otherHeading.current;
    if (!target) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }
  useEffect(() => {
    const controller = new AbortController();
    discovery<{ places: Entity[] }>({ action: "neighbourhoods", city }, controller.signal)
      .then((r) => setNeighbourhoods(r.places ?? []))
      .catch((e) => { if (e.name !== "AbortError") setAreasError("Neighbourhood filters are unavailable right now."); });
    return () => controller.abort();
  }, [city]);
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
    [usedBudget, setUsedBudget] = useState(""),
    [started, setStarted] = useState(false),
    [attempt, setAttempt] = useState(0),
    [hidden, setHidden] = useState<Hidden[]>([]),
    [activeResult, setActiveResult] = useState<string | null>(null),
    // Chips or budget changed since the results on screen (docs/22 F14).
    [stale, setStale] = useState(false);
  // Preserve the submitted task's viewport while replacing its editor with the outcome.
  useLayoutEffect(() => {
    if (!presenting || !outcomeRef.current) return;
    // Replacing the editor is a layout correction, not a second scroll animation.
    const align = () => {
      const top = outcomeRef.current?.getBoundingClientRect().top;
      if (top !== undefined) window.scrollBy({ top: top - submissionTop.current, behavior: "instant" });
    };
    align();
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        align();
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [presenting, busy]);
  // Fewer than 3 picks is no Passport: Swap then runs on the starting place alone.

  const toast = useToast();
  const showError = (m: string) => toast(m, { error: true });
  useEffect(() => {
    if (presenting && !busy && focusOutcome.current) {
      focusOutcome.current = false;
      outcomeHeading.current?.focus({ preventScroll: true });
    }
  }, [presenting, busy, data, swapError]);
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
  const profileKey = JSON.stringify({ owner: passportState.owner, tokens: passportState.selections.map(s => s.token), quiz: passportState.quiz });
  const submittedProfile = useRef("");
  useEffect(() => {
    if (!started || submittedProfile.current === profileKey) return;
    // A changed Passport invalidates this search, without silently sending another.
    setStarted(false);
    setData(null);
    setBusy(false);
    setPresenting(false);
    setStale(true);
    setStatus("Your Passport changed. Update results to use it.");
  }, [profileKey, started]);
  useEffect(() => { setData(null); setStarted(false); setPresenting(false); setBusy(false); setHidden([]); }, [userId]);
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
    if (!started || !reference || !ready || submittedProfile.current !== profileKey || passportState.owner !== (userId || "guest")) return;
    const controller = new AbortController();
    let active = true;
    setBusy(true);
    setSwapError("");
    setStale(false);
    setStatus("Matching your place’s DNA…");
    discovery<Payload>(
      {
        action: "swap",
        category,
        reference: reference.token,
        passport: personal ? passportState.selections.map((s) => s.token) : [],
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
          setUsedBudget(budget);
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
  }, [started, reference, attempt, ready, passportState.owner, userId, profileKey]);
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
    setPresenting(false);
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
      "Keep what you love, Delete what to avoid, or Ignore a trait. These choices apply only to this search.",
    );
    setMatches([]);
  }
  async function notForMe(result: Result) {
    const place = { id: result.place.id, name: result.place.name };
    setHidden((list) => [...list.filter((h) => h.id !== place.id), place]);
    try {
      await hidePlace(place, result.token!, !!userId);
      await vote(result.place, -1);
      toast(`${place.name} is hidden and won’t come up in your next Twin searches.`, {
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
    if (started) setStale(true);
    setChoices((values) =>
      values.map((c) => (c.tagId === tagId ? { ...c, mode } : c)),
    );
  }
  const traitNames = (mode: Choice["mode"], from = choices) =>
    from
      .filter((c) => c.mode === mode)
      .map((c) => traitLabel(reference?.entity.tags.find((t) => t.id === c.tagId)?.name ?? c.tagId));
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
  const area = neighbourhoods.find((h) => h.id === areaId);
  const visibleResults = data?.results.filter(({ place }) =>
    !hidden.some((h) => h.id === place.id) &&
    (!facet || place.tags.some((t) => t.id === facet)) &&
    (!area || (distance(place, area) !== null && distance(place, area)! <= 2))
  ) ?? [];
  const facetOptions = Array.from(new Map((data?.results ?? []).flatMap((r) => categoryFacets(r.place, category))
    .map((t) => [t.id, t])).values()).slice(0, 40);
  const closest = visibleResults[0];
  const others = visibleResults.slice(1);
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
    const card = workspaceRef.current?.querySelector<HTMLElement>(`#place-${CSS.escape(id)}`);
    card?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center",
    });
  }
  function resultCard(result: Result, spotlight = false) {
    const { kept, changed } = keptChanged(result);
    return <PlaceCard key={result.place.id} place={result.place} token={result.token ?? ""}
      city={city} category={category} eyebrow={spotlight ? "Your closest twin" : result.role}
      whyLabel={personal ? "Why it fits you" : "Shared DNA"} why={result.why}
      details={<details className="twin-details"><summary>What’s different & search details</summary>
        {kept.length > 0 && <p><strong>Keeps:</strong> {joinList(kept)}.</p>}
        {changed.length > 0 && <p><strong>Leaves behind:</strong> {joinList(changed)}.</p>}
        {usedKeepNames.filter((name) => !kept.includes(name)).length > 0 && <p><strong>Kept traits not listed here:</strong> {joinList(usedKeepNames.filter((name) => !kept.includes(name)))}. Keep is a preference, not a guarantee.</p>}
        <p>{result.different}</p>
        {result.check && CHECK_BADGE[result.check.status] && <p>{CHECK_BADGE[result.check.status]!.text}</p>}
        <p>Compared with {reference?.entity.name} in {city}. Your starting place, duplicates, hidden places
          and traits marked Delete are excluded.{usedBudget && ` Price up to ${priceSymbols(Number(usedBudget))}.`}</p>
        {result.check && <><p>{CHECK_PLAIN[result.check.status]}</p>{result.check.notes.map((note) => <p key={note}>{note}</p>)}</>}
        <p className="meta">Data read {data ? new Date(data.checkedAt).toLocaleString() : ""}.
          Opening hours, prices and availability aren’t live-checked.</p>
      </details>}
      lists={lists} signedIn={signedIn} onListsChange={reload} onSaved={() => saved(result.place)}
      onHide={() => notForMe(result)} active={activeResult === result.place.id} onHover={setActiveResult}
      pin={resultPins.get(result.place.id) ?? null} findSimilar={false} directions featured={spotlight} />;
  }
  return (
    <div className="twin-workspace" ref={workspaceRef}>
      {passportState.state !== "ready" && passportState.state !== "new" && <PassportPrompt />}
      <p className="twin-intro">Find a {cap.singular} in {city} with the DNA you love.</p>
      {museum && museums !== "ok" && <p className="muted">{museums === "none" ? "No museum picks are listed here yet." : "Museum coverage is limited here."}</p>}
      {presenting && <div className="twin-outcome" ref={outcomeRef} aria-busy={busy}>
        <div className="twin-outcome-head"><div><span className="meta">Your search · {reference?.entity.name}</span>
          <h2 ref={outcomeHeading} tabIndex={-1} aria-live="polite">{busy ? "Matching your place’s DNA…" : swapError ? "Search needs attention" : `${visibleResults.length} ${visibleResults.length === 1 ? "match" : "matches"} found`}</h2></div>
          <button className="btn btn-quiet" onClick={editSearch}>Edit search</button></div>
        <div className="twin-thread" data-state={busy ? "searching" : swapError ? "error" : closest ? "success" : "empty"}>
          <div className="twin-thread-origin"><span className="meta">Starting place · {city}</span><strong>{reference?.entity.name}</strong></div>
          <div className="twin-thread-route" aria-hidden="true"><span /><i>→</i><span /></div>
          <div className="twin-thread-traits">
            {busy ? <><span className="meta">Looking for</span><p>{traitNames("keep").join(" · ") || "A place with shared traits"}</p></> : closest ? <>
              <strong>{closest.place.name}</strong>
              <span className="meta">Listed in both places</span>
              <p>{keptChanged(closest).kept.join(" · ") || "No selected Keep traits listed in both"}</p>
            </> : <><span className="meta">Your choices are kept</span><p>{swapError ? "Try again when you’re ready." : "Adjust the search to explore another direction."}</p></>}
          </div>
          {traitNames("change", busy ? choices : usedChoices).length > 0 && <p className="twin-thread-exclusions"><strong>Excluded from this search:</strong> {traitNames("change", busy ? choices : usedChoices).join(" · ")}</p>}
        </div>
        {busy && <div className="twin-match-loading" role="status"><span className="twin-loading-photo" aria-hidden="true" /><p>Comparing places with your choices…<br /><span className="meta">You can edit your search at any time.</span></p></div>}
        {!busy && swapError && <EmptyState title="Your twins couldn’t load" action={<button className="btn btn-primary" onClick={startTwin}>Try again</button>}><p>{swapError}</p><p>Your starting place and choices are still here.</p></EmptyState>}
        {!busy && !swapError && data && !closest && <EmptyState title={data.results.length ? "No visible matches for this view" : "No twins for these choices"}
          action={<button className="btn btn-primary" onClick={() => { setFacet(""); setAreaId(""); editSearch(); }}>Adjust search</button>}>
          <p>Try another place, fewer exclusions or a wider price range. Your Passport hasn’t changed.</p></EmptyState>}
        {!busy && !swapError && closest && <div className="twin-spotlight" data-travel-enter>
          {resultCard(closest, true)}
          <p className="twin-difference"><span>What’s different</span> {closest.different}</p>
          {others.length > 0 && <button className="twin-other-link" onClick={seeOthers}>See other matches <span>({others.length})</span><span aria-hidden>↓</span></button>}
        </div>}
      </div>}
      <div className="twin-editor" hidden={presenting} data-travel-enter>
        <section className="twin-reference paper">
          <form onSubmit={search}>
            <label htmlFor={uid + "-reference"}>The {cap.singular} you wanted</label>
            <div className="twin-reference-search"><input id={uid + "-reference"} placeholder={`Search a ${cap.singular} name`}
              value={query} onChange={(e) => { setQuery(e.target.value); setNoMatches(false); setSearchError(""); }}
              minLength={2} maxLength={120} required disabled={!ready || searching} />
              <button className="btn btn-secondary" disabled={!ready || searching}>{searching ? "Searching…" : "Search"}</button></div>
          </form>
          {searching && <p role="status">Looking for your starting place…</p>}
          {noMatches && <p role="status">We couldn’t find that {cap.singular} in {city}. Try its full name.</p>}
          {searchError && <p role="alert">{searchError} <button className="btn btn-quiet" onClick={() => void runSearch(query)}>Try again</button></p>}
          {matches.length > 0 && <ul className="entity-list">{matches.map((s) => <li key={s.entity.id}><div><strong>{s.entity.name}</strong><p className="muted">{s.entity.address}</p></div><button className="btn btn-quiet" onClick={() => select(s)}>Choose</button></li>)}</ul>}
          {reference && <div className="twin-reference-recap"><strong>{reference.entity.name}</strong><span>{reference.entity.address}</span></div>}
        </section>
        {reference && <section className="twin-traits" aria-labelledby={uid + "-dna"}>
          <h2 id={uid + "-dna"}>Choose its DNA</h2>
          <p className="twin-help">Keep favours a trait. Delete excludes it from this search. Ignore leaves it open.</p>
          <div className="twin-trait-list">{choices.map((choice) => {
            const tag = reference.entity.tags.find((t) => t.id === choice.tagId)!;
            const label = traitLabel(tag.name);
            return <div className="twin-trait-row" key={choice.tagId} data-choice={choice.mode}><span className="twin-trait-label">{label}</span>
              <div className="twin-trait-actions" role="group" aria-label={label}>{(["keep", "change", "ignore"] as const).map((mode) => {
                const action = mode === "change" ? "Delete" : mode === "keep" ? "Keep" : "Ignore";
                return <button type="button" className="twin-trait-action" key={mode} data-mode={mode} aria-label={`${action}: ${label}`} aria-pressed={choice.mode === mode}
                  onClick={() => changeTag(choice.tagId, mode)}>{action}</button>;
              })}</div></div>;
          })}</div>
          {!choices.length && <p className="muted">No traits are listed for this place. Its name{personal ? " and your Passport" : ""} still guides the search.</p>}
          {categoryHasPrice(category) && <div className="twin-budget"><span id={uid + "-budget"}>Price up to</span>
            <div className="twin-price-options" role="group" aria-labelledby={uid + "-budget"}>
              {["", ...PRICE_LEVELS.map(String)].map(value => <button type="button" key={value} aria-label={value ? `Price up to ${priceSymbols(Number(value))}` : "Any price"} aria-pressed={budget === value}
                onClick={() => { if (started) setStale(true); setBudget(value); }}>{value ? priceSymbols(Number(value)) : "Any"}</button>)}
            </div></div>}
          <details className="twin-context"><summary>About these choices{personal ? " & your Passport" : ""}</summary>
            <p>Keep is a preference, not a guarantee. Delete never removes anything from your Passport.</p>
            {categoryHasPrice(category) && <p>Indicative price tiers, not menu prices or currency conversion. Places without a known tier are excluded when a limit is set.</p>}
            {personal ? <><p>{passport.map((s) => s.entity.name).join(" · ")}</p><Link href="/passport#passport-editor">Edit favourites</Link></> : <p>You can search without a Passport. A 3-minute quiz makes the picks personal. <OpenQuizButton /></p>}
          </details>
          {stale && <p role="note">Choices changed. Update results to apply them.</p>}
          <div className="twin-submit"><button className="btn btn-primary" disabled={busy || !ready} onClick={startTwin}>{stale ? "Update results" : "Find its twin"}</button></div>
        </section>}
      </div>
      <p className="sr-only" role="status" aria-live="polite">{!presenting ? status : ""}</p>
      {data && !busy && !swapError && <section ref={resultsRegion} className="twin-results" aria-label="All twin matches">
        <div className="twin-result-filters"><label htmlFor={uid + "-facet"}>{cap.facet}<select id={uid + "-facet"} value={facet} onChange={(e) => setFacet(e.target.value)}>
          <option value="">Any listed trait</option>{facetOptions.map((t) => <option key={t.id} value={t.id}>{traitLabel(t.name)}</option>)}</select></label>
          <label htmlFor={uid + "-area"}>Near a neighbourhood<select id={uid + "-area"} value={areaId} disabled={!neighbourhoods.length} onChange={(e) => setAreaId(e.target.value)}>
            <option value="">Anywhere in the city</option>{neighbourhoods.map((h) => <option key={h.id} value={h.id}>{h.name} · within 2 km</option>)}</select></label>
          <p className="muted">Filters apply to these returned matches. Near means within 2 km of the centre, not the boundary.{areasError && ` ${areasError}`}</p>
        </div>
        {!presenting && closest && resultCard(closest, true)}
        {others.length > 0 && <><h2 className="twin-other-heading" ref={otherHeading} tabIndex={-1}>Other matches <span className="meta">{others.length}</span></h2>
          <div className="place-grid swap-results-list">{others.map((r) => resultCard(r))}</div></>}
        {mappedPlaces.length > 0 && <details className="twin-map" onToggle={(e) => setMapOpen(e.currentTarget.open)}><summary>See matches on the map</summary>{mapOpen && <CityMap places={mappedPlaces} active={activeResult} onPick={pickResult} />}</details>}
        <p className="meta">Keeping: {usedKeepNames.length ? joinList(usedKeepNames) : "nothing in particular"}. Excluding: {usedChangeNames.length ? joinList(usedChangeNames) : "nothing in particular"}.</p>
      </section>}
    </div>
  );
}
