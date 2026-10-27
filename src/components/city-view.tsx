"use client";
import { recommendationCopy } from "@/lib/recommendation-copy";
import { CityInkMap } from "./city-ink-map";
import { useCityContext, useCityPosition } from "./use-city-context";
import { usePassportState, PassportPrompt } from "./passport-state";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CITIES,
  CATEGORY_LABELS, CATEGORY_CAPABILITIES, FACET_PLACEHOLDERS, categoryHasPrice, categoryFacets,
  EXPLORE_TAGS,
  citySlug,
  LOCAL_NAME,
  distance,
  type Entity,
  type ExploreCategory,
} from "@/lib/discovery";
import { discovery, MESSAGES, type Selection } from "@/lib/discovery-client";
import { authClient } from "@/lib/auth/client";
import {
  loadHidden,
  hidePlace,
  unhidePlace,
  type Hidden,
} from "@/lib/account";
import { useSavedLists } from "./save-button";
import { useFeedback } from "./use-feedback";
import { OpenQuizButton } from "./quiz-panel";
import { useToast } from "./toast";
import { useCity } from "./use-city";
import { PlaceCard } from "./place-card";
import { EventsExplorer } from "./events-explorer";
import { SwapWorkspace } from "./swap-workspace";
import { CityMap } from "./city-map";
import { feedbackSignal } from "@/lib/feedback";
import { EmptyState } from "./empty-state";
import { COVERS, cityCover } from "@/lib/city-covers";
import { PassportSecurityLines } from "./passport-art";
import { GuideFolio, JourneyRoute } from "./travel-art";

type Payload = {
  // `near`: for neighbourhoods, the Passport's places close to its centre.
  results: { place: Entity; token: string; near?: string[] }[];
  checkedAt: string;
  traitsUsed: boolean;
  notice: string;
};
const CATEGORY_LABEL: Record<ExploreCategory, string> = {
  restaurant: "Restaurants",
  bar: "Bars",
  cafe: "Cafés",
  museum: "Museums",
  hotel: "Hotels",
  neighbourhood: "Neighbourhoods",
};
const CATEGORY_NOUN: Record<ExploreCategory, string> = {
  restaurant: "restaurants",
  bar: "bars",
  cafe: "cafés",
  museum: "museums",
  hotel: "hotels",
  neighbourhood: "neighbourhoods",
};
// The City page (docs/24, wireframe W2): picks for this city, with or without
// a Passport, as a card grid beside a map. A Passport only re-ranks them.
export function CityView({ city }: { city: string }) {
  const toast = useToast();
  const context = useCityContext();
  const passportState = usePassportState();
  const events = new URLSearchParams(context.query).get("events") === "1";
  const setEvents = (value: boolean) => context.update({ events: value ? "1" : "" });
  const [hiddenOwner, setHiddenOwner] = useState<string | null>(null);
  const { category, prices, areas, tab, view: mobileView } = context;
  const mapSelection = useRef<string | null>(null);
  const setCategory = (value: ExploreCategory) => context.update({ category: value, events: "" });
  const setMobileView = (view: "list" | "map") => context.update({ view });
  const setPrices = (fn: (p: Partial<Record<ExploreCategory, string>>) => Partial<Record<ExploreCategory, string>>) => context.update(Object.fromEntries(Object.entries(fn(prices)).map(([k,v]) => [`price-${k}`, v || ""])));
  const setAreas = (fn: (p: Partial<Record<ExploreCategory, string>>) => Partial<Record<ExploreCategory, string>>) => context.update(Object.fromEntries(Object.entries(fn(areas)).map(([k,v]) => [`area-${k}`, v || ""])));

  const [passport, setPassport] = useState<Selection[]>([]),
    [ready, setReady] = useState(false),
    [, rememberCity] = useCity(),
    [data, setData] = useState<Payload | null>(null),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [hidden, setHidden] = useState<Hidden[]>([]),
    [active, setActive] = useState<string | null>(null),
    [mobile, setMobile] = useState(false),
    [brokenCover, setBrokenCover] = useState<string | null>(null),
    [neighbourhoods, setNeighbourhoods] = useState<Entity[]>([]),
    [areasBusy, setAreasBusy] = useState(false),
    [areasError, setAreasError] = useState(""),
    [areasAttempt, setAreasAttempt] = useState(0),
    [filtersOpen, setFiltersOpen] = useState(false),
    // "For you" or "Swap" tab, mirrored in the URL as ?tab=swap. Swap mounts
    // on first open and then stays mounted (hidden) so its progress survives.
    [swapOpened, setSwapOpened] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const showError = (m: string) => toast(m, { error: true });
  const { current: feedback, vote, unvote, voted } = useFeedback(!isPending, userId, showError);
  const { lists, reload, signedIn } = useSavedLists(!isPending, userId);
  const personal = passportState.state === "ready";
  useEffect(() => {
    const controller = new AbortController();
    setNeighbourhoods([]);
    setAreasBusy(true);
    setAreasError("");
    discovery<{ places: Entity[] }>({ action: "neighbourhoods", city }, controller.signal)
      .then(({ places }) => { if (!controller.signal.aborted) setNeighbourhoods(places); })
      .catch((e) => { if (!controller.signal.aborted) setAreasError((e as Error).message); })
      .finally(() => { if (!controller.signal.aborted) setAreasBusy(false); });
    return () => controller.abort();
  }, [city, areasAttempt]);
  // Mount the mobile map only when opened, so it starts with a measurable
  // container rather than a zero-width hidden canvas. Desktop shows both.
  useEffect(() => {
    const query = window.matchMedia("(max-width: 850px)");
    const sync = () => setMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  useEffect(() => { if (tab === "swap") setSwapOpened(true); }, [tab]);
  function chooseTab(next: "foryou" | "swap") { context.update({ tab: next === "swap" ? "swap" : "" }); }
  useCityPosition(!!data && !busy, context.query);
  // Swap opens on the city you last looked at (docs/22 F11).
  useEffect(() => rememberCity(city), [city]);
  useEffect(() => { setData(null); setStatus(""); }, [userId]);
  useEffect(() => {
    setPassport(passportState.selections);
    setReady(passportState.loaded && !passportState.error && !["saving", "partial", "expired"].includes(passportState.state));
  }, [passportState.selections, passportState.loaded, passportState.error, passportState.state]);
  useEffect(() => {
    if (isPending) return;
    let active = true;
    setHiddenOwner(null); setHidden([]);
    loadHidden(!!userId).then(list => { if (active) { setHidden(list); setHiddenOwner(userId || "guest"); } }).catch(e => active && setStatus(e.message));
    return () => { active = false; };
  }, [userId, isPending]);
  useEffect(() => {
    if (!ready || hiddenOwner !== (userId || "guest")) return;
    const controller = new AbortController();
    let active = true;
    setBusy(true);
    setData(null);
    setStatus(`Finding ${CATEGORY_NOUN[category]} in ${city}…`);
    discovery<Payload>(
      {
        action: "explore",
        city,
        category,
        // Without a Passport (fewer than 3 picks) Qloo's popular picks show.
        passport: personal ? passport.map((s) => s.token) : [],
        quiz: passportState.quiz,
        exclude: hidden.map((h) => h.id),
        feedback: feedbackSignal(feedback.current),
      },
      controller.signal,
    )
      .then((result) => {
        if (!active) return;
        setData(result);
        setStatus(
          result.results.length
            ? ""
            : `No ${CATEGORY_NOUN[category]} in ${city} in our data. Try another category.`,
        );
      })
      .catch((error) => {
        if (active && error.name !== "AbortError") setStatus(error.message);
      })
      .finally(() => active && setBusy(false));
    return () => {
      active = false;
      controller.abort();
    };
    // Hidden places are sent with the next search, not re-run on every hide.
  }, [ready, passport, city, category, hiddenOwner, userId]);
  // Saving a place is also "more like this" (docs/24: ♡ replaces 👍).
  function saved(place: Entity) {
    if (category === "neighbourhood" || voted(place.id) === 1) return;
    vote(place, 1).catch((e) => showError((e as Error).message));
  }
  // Not for me hides the card at once, with Undo in the toast (docs/22 F7).
  async function notForMe(place: Entity, token: string) {
    const item = { id: place.id, name: place.name };
    setHidden((list) => [...list.filter((h) => h.id !== item.id), item]);
    try {
      await hidePlace(item, token, !!userId);
      if (category !== "neighbourhood") await vote(place, -1);
      toast(`${place.name} is hidden and won’t come up again.`, {
        action: { label: "Undo", run: () => undoHide(place) },
      });
    } catch (error) {
      showError((error as Error).message);
    }
  }
  async function undoHide(place: Entity) {
    setHidden((list) => list.filter((h) => h.id !== place.id));
    try {
      await unhidePlace(place.id, !!userId);
      if (category !== "neighbourhood") await unvote(place.id);
      toast(`${place.name} is back.`);
    } catch (error) {
      showError((error as Error).message);
    }
  }
  function focusMapSelection() {
    const id = mapSelection.current;
    if (!id) return;
    const card = document.getElementById(`place-${id}`);
    if (card && card.getClientRects().length) {
      card.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "center",
      });
      card.querySelector<HTMLAnchorElement>("h3 a")?.focus({ preventScroll: true });
      mapSelection.current = null;
    }
  }
  useEffect(() => {
    if (mobileView !== "list") return;
    const frame = requestAnimationFrame(focusMapSelection);
    return () => cancelAnimationFrame(frame);
  }, [mobileView, active]);
  function pickFromMap(id: string) {
    mapSelection.current = id;
    setActive(id);
    setMobileView("list");
    if (mobileView === "list") requestAnimationFrame(focusMapSelection);
  }
  const museums = CITIES[city].museums;
  const price = prices[category] ?? "";
  const areaId = areas[category] ?? "";
  const area = neighbourhoods.find((h) => h.id === areaId);
  const priceApplies = categoryHasPrice(category);
  const available = (data?.results ?? []).filter((r) => !hidden.some((h) => h.id === r.place.id));
  const facet = context.facets[category] || "";
  const facetOptions = Array.from(new Map(available.flatMap((r) => categoryFacets(r.place, category))
    .map((t) => [t.id, t])).values()).slice(0, 40);
  const shown = available.filter(({ place }) => {
    if (facet && !place.tags.some((t) => t.id === facet)) return false;
    if (priceApplies && price && (place.price === null || place.price > Number(price))) return false;
    if (category !== "neighbourhood" && area) {
      const km = distance(place, area);
      if (km === null || km > 2) return false;
    }
    return true;
  });
  const reasons = recommendationCopy(shown.map(r => r.place), passport);
  // Same numbering as the map's pins (only places with coordinates get one).
  const pins = new Map(
    shown.filter((r) => r.place.lat !== null && r.place.lon !== null).map((r, i) => [r.place.id, i + 1]),
  );
  const cover = brokenCover === city ? null : cityCover(city, "1200x");
  const mapped = shown.filter((r) => r.place.lat !== null && r.place.lon !== null).length;
  const filterSummary = category === "neighbourhood" ? [] : [
    priceApplies && price ? `Up to ${"€".repeat(Number(price))}` : "",
    facet ? facetOptions.find(t => t.id === facet)?.name.replace(/[_-]+/g, " ") || "Selected characteristic" : "",
    areaId ? `Near ${area?.name || "selected neighbourhood"}` : "",
  ].filter(Boolean);
  function clearFilters() { context.update({ [`price-${category}`]: "", [`area-${category}`]: "", [`trait-${category}`]: "" }); }
  const viewControls = <div className="city-mobile-view toggle-group segmented" role="group" aria-label="Show places as">
    <button className="toggle" aria-pressed={mobileView === "list"} aria-controls="city-place-list" onClick={() => setMobileView("list")}>List</button>
    <button className="toggle" aria-pressed={mobileView === "map"} aria-controls="city-place-map" onClick={() => setMobileView("map")}>Map</button>
  </div>;
  return (
    <div className="city" data-city={citySlug(city)}>
      <section className="city-cover" aria-labelledby="city-title" data-ink-cover={tab === "swap" || undefined}>
        {tab === "swap" && <CityInkMap key={city} />}
        <PassportSecurityLines />
        <div className="city-cover-copy">
          <GuideFolio country={COVERS[city]?.country} code={COVERS[city]?.code ?? "GUIDE"} />
          <h1 id="city-title">{city}</h1>
          {LOCAL_NAME[city] && <p className="city-local">{LOCAL_NAME[city]}</p>}
          <p className="city-intro">
            {tab === "swap" ? "Find an alternative to a place you know." : "Places to eat, drink, stay and explore."}
          </p>
          {tab === "foryou" && data && !busy && (
            <p className="city-count" aria-live="polite">
              {shown.length} {CATEGORY_NOUN[category]} shown · {mapped} on the map
            </p>
          )}
          <details className="city-switch">
            <summary>Change city</summary>
            <ul>
              {Object.keys(CITIES).map((name) => (
                <li key={name}>
                  <Link href={`/${citySlug(name)}`} aria-current={name === city ? "page" : undefined}>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
          <JourneyRoute className="city-journey-route" branching={tab === "swap"} />
        </div>
        <div className="city-cover-photo" aria-hidden>
          {cover && <img src={cover} alt="" onError={() => setBrokenCover(city)} />}
          <span className="city-stamp" data-travel-stamp>{COVERS[city]?.code ?? city.slice(0, 3).toUpperCase()}</span>
        </div>
      </section>
      <div className="city-toolbar">
        <div className="toggle-group segmented" role="tablist" aria-label="View">
          {([["foryou", "For you"], ["swap", "Twin"]] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              id={`city-tab-${value}`}
              aria-selected={tab === value}
              aria-controls={`city-panel-${value}`}
              className="toggle"
              aria-pressed={tab === value}
              onClick={() => chooseTab(value)}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "foryou" && (
          <div className="toggle-group" role="group" aria-label="Category">
            {([...Object.keys(EXPLORE_TAGS), "neighbourhood"] as ExploreCategory[]).map((value) => (
              <button key={value} className="toggle" aria-pressed={!events && category === value} onClick={() => setCategory(value)}>
                {CATEGORY_LABELS[value]}
              </button>
            ))}

          </div>
        )}
      </div>
      {tab === "foryou" && city === "Paris" && <button className="btn btn-quiet" aria-pressed={events} onClick={() => setEvents(!events)}>{events ? "Back to places" : "Paris events pilot"}</button>}
      {swapOpened && (
        <div role="tabpanel" id="city-panel-swap" aria-labelledby="city-tab-swap" hidden={tab !== "swap"}>
          <SwapWorkspace fixedCity={city} embedded />
        </div>
      )}
      <div role="tabpanel" id="city-panel-foryou" aria-labelledby="city-tab-foryou" hidden={tab !== "foryou"}>
      {events && <EventsExplorer city={city} />}
      <div hidden={events}>
      {category !== "neighbourhood" && (
        <div className="city-filter-panel">
        <div className="city-filter-bar">
          <button type="button" className="btn btn-secondary city-filter-toggle" aria-expanded={filtersOpen} aria-controls="city-filter-fields" onClick={() => setFiltersOpen(!filtersOpen)}>{filtersOpen ? "Hide filters" : "Filters"}{filterSummary.length > 0 && ` (${filterSummary.length})`}</button>
          {(busy || (!status && shown.length > 0)) && viewControls}
          <p className="city-filter-summary" role="status">{filterSummary.join(" · ")}</p>
          {filterSummary.length > 0 && <button type="button" className="btn btn-quiet" onClick={clearFilters}>Clear filters</button>}
        </div>
        <div className="city-filters" id="city-filter-fields" role="group" aria-label="Filter these results" data-open={filtersOpen || undefined}>
          {priceApplies && <label htmlFor="city-price">Price up to
            <select id="city-price" value={price} onChange={(e) => setPrices((p) => ({ ...p, [category]: e.target.value }))}>
              <option value="">Any price</option>
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{"€".repeat(n)}</option>)}
            </select>
          </label>}
          {CATEGORY_CAPABILITIES[category].facet && <label htmlFor="city-trait">{CATEGORY_CAPABILITIES[category].facet}
            <select id="city-trait" value={facet} onChange={(e) => context.update({ [`trait-${category}`]: e.target.value })}>
              <option value="">{FACET_PLACEHOLDERS[category]}</option>{facetOptions.map((t) => <option key={t.id} value={t.id}>{t.name.replace(/[_-]+/g, " ")}</option>)}
            </select></label>}
          <label htmlFor="city-area">Near a neighbourhood
            <select id="city-area" disabled={areasBusy || !neighbourhoods.length} value={areaId}
              onChange={(e) => setAreas((p) => ({ ...p, [category]: e.target.value }))}>
              <option value="">{areasBusy ? "Loading neighbourhoods…" : "Anywhere in the city"}</option>
              {neighbourhoods.map((h) => <option key={h.id} value={h.id}>{h.name} · within 2 km</option>)}
            </select>
          </label>
          <p className="muted">Filter these picks by distance from the neighbourhood centre, not its boundary.{priceApplies && " Price tiers are indicative, not menu prices."}{price && priceApplies && " Places without a price tier are left out."}</p>
          {areasError && <p role="status">Neighbourhoods couldn’t load. <button className="btn btn-quiet" onClick={() => setAreasAttempt((n) => n + 1)}>Try again</button></p>}
          {!areasError && !areasBusy && !neighbourhoods.length && <p className="muted">No neighbourhood centres are listed for this city yet.</p>}
        </div>
        </div>
      )}
      {!personal && (
        <div className="city-banner">
          <div>
            <h2>Let’s find your side of {city}.</h2>
            <p>Your favourites help us shape these picks around you.</p>
          </div>
          <PassportPrompt />
        </div>
      )}
      {category === "museum" && museums !== "ok" && (
        <p className="muted" role="note">
          {museums === "none"
            ? `Our data has no museums in ${city}.`
            : `Our data has only a few museums in ${city}: most Passports will see the same ones.`}
        </p>
      )}
      {(busy || !status) && <p className="page-status city-status" aria-live="polite">{status}</p>}
      {!busy && status && (
        <EmptyState title={data ? "Let’s try another way." : "These picks couldn’t load."} action={
          status === MESSAGES.expired_selection ? <OpenQuizButton /> :
          category !== "restaurant" ? <button className="btn btn-primary" onClick={() => setCategory("restaurant")}>See restaurants</button> :
          <Link className="btn btn-primary" href="/explore">Choose another city</Link>
        }><p role="status">{status}</p></EmptyState>
      )}
      {!busy && data && !status && shown.length === 0 && (
        <EmptyState title="No places match this view." action={
          price || area || facet ? <button className="btn btn-primary" onClick={clearFilters}>Clear filters</button> :
          <Link className="btn btn-primary" href="/explore">Choose another city</Link>
        }><p>Try a wider price range, another neighbourhood or another category. Your saved places are still here.</p></EmptyState>
      )}
      {!busy && !status && reasons.summary && <p className="city-recommendation-reason">{reasons.summary}</p>}
      {/* No places to show (error, expired Passport): skip the empty map. */}
      {(busy || shown.length > 0) && (
      <>
      {category === "neighbourhood" && viewControls}
      <div className="city-split" data-view={mobileView}>
        <div id="city-place-list" className="place-grid" aria-busy={busy}>
          {busy && !data
            ? Array.from({ length: 6 }, (_, i) => <div className="place-card skeleton" key={i} aria-hidden />)
            : shown.map(({ place, token, near }) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  token={token}
                  city={city}
                  category={category}
                  why={reasons.why(place)}
                  near={near}
                  lists={lists}
                  signedIn={signedIn}
                  onListsChange={reload}
                  onSaved={() => saved(place)}
                  onHide={() => notForMe(place, token)}
                  active={active === place.id}
                  onHover={setActive}
                  pin={pins.get(place.id) ?? null}
                />
              ))}
        </div>
        <aside id="city-place-map" className="city-map-wrap">
          {tab === "foryou" && !events && (!mobile || mobileView === "map") && (
            mapped > 0 ? <CityMap places={shown.map((r) => r.place)} active={active} onPick={pickFromMap} /> :
            <p className="muted">These places don’t have map coordinates. You can still browse their details.</p>
          )}
        </aside>
      </div>
      </>
      )}
      {city !== "Paris" && <p className="muted">Events are a separate Paris guide. <Link href="/paris?events=1">Explore the Paris events pilot</Link></p>}
      {data && shown.length > 0 && (
        <p className="muted city-notice">
          {data.notice}
          {data.traitsUsed && " Your quiz helped us choose places for your budget and appetite for discovery."}
        </p>
      )}
      </div>
      </div>
    </div>
  );
}
