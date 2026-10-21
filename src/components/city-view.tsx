"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LIVE_PASSPORT_KEY,
  CITIES,
  EXPLORE_TAGS,
  citySlug,
  type Entity,
  type ExploreCategory,
} from "@/lib/discovery";
import { discovery, readSelections, type Selection } from "@/lib/discovery-client";
import { authClient } from "@/lib/auth/client";
import { readStoredQuiz } from "@/lib/quiz";
import {
  loadAccountPassport,
  loadHidden,
  hidePlace,
  unhidePlace,
  type Hidden,
} from "@/lib/account";
import { useSavedLists } from "./save-button";
import { useFeedback } from "./use-feedback";
import { useToast } from "./toast";
import { useCity } from "./use-city";
import { PlaceCard } from "./place-card";
import { CityMap } from "./city-map";
import { feedbackSignal } from "@/lib/feedback";

type Payload = {
  // `near`: for neighbourhoods, the Passport's places close to its centre.
  results: { place: Entity; token: string; near?: string[] }[];
  checkedAt: string;
  traitsUsed: boolean;
  notice: string;
};
const CATEGORY_LABEL: Record<ExploreCategory, string> = {
  restaurant: "Eat",
  bar: "Drink",
  museum: "See",
  hotel: "Stay",
  neighbourhood: "Areas",
};
const CATEGORY_NOUN: Record<ExploreCategory, string> = {
  restaurant: "restaurants",
  bar: "bars",
  museum: "museums",
  hotel: "hotels",
  neighbourhood: "neighbourhoods",
};
// The city's own name, shown under the English one on the cover.
const LOCAL_NAME: Record<string, string> = {
  Lisbon: "Lisboa",
  Tokyo: "東京",
  Osaka: "大阪",
  "Ho Chi Minh City": "Thành phố Hồ Chí Minh",
  Hanoi: "Hà Nội",
  "Phu Quoc": "Phú Quốc",
};

// The City page (docs/24, wireframe W2): picks for this city, with or without
// a Passport, as a card grid beside a map. A Passport only re-ranks them.
export function CityView({ city }: { city: string }) {
  const toast = useToast();
  const [passport, setPassport] = useState<Selection[]>([]),
    [ready, setReady] = useState(false),
    [, rememberCity] = useCity(),
    [category, setCategory] = useState<ExploreCategory>("restaurant"),
    [data, setData] = useState<Payload | null>(null),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [hidden, setHidden] = useState<Hidden[]>([]),
    [active, setActive] = useState<string | null>(null);
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const showError = (m: string) => toast(m, { error: true });
  const { current: feedback, vote, unvote, voted } = useFeedback(!isPending, userId, showError);
  const { lists, reload, signedIn } = useSavedLists(!isPending, userId);
  const personal = passport.length >= 3;
  // Swap opens on the city you last looked at (docs/22 F11).
  useEffect(() => rememberCity(city), [city]);
  // Same Passport source as Swap: the account copy when signed in.
  useEffect(() => {
    if (isPending) return;
    try {
      setPassport(readSelections(localStorage.getItem(LIVE_PASSPORT_KEY)));
    } catch {
      setStatus("Your browser Passport could not be read. Reopen the Passport and choose your favourites.");
    }
    let active = true;
    const loads: Promise<unknown>[] = [
      loadHidden(!!userId).then((list) => active && setHidden(list)),
    ];
    if (userId)
      loads.push(
        loadAccountPassport().then((account) => {
          if (!active || !account) return;
          setPassport(account);
          try {
            localStorage.setItem(LIVE_PASSPORT_KEY, JSON.stringify(account));
          } catch {}
        }),
      );
    Promise.all(loads)
      .catch((e) => active && setStatus((e as Error).message))
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, [isPending, userId]);
  useEffect(() => {
    if (!ready) return;
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
        quiz: readStoredQuiz(),
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
  }, [ready, passport, city, category]);
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
  // "Because you like X": the Passport picks Qloo says drove this place.
  function why(place: Entity) {
    const names = passport.filter((s) => place.evidence.includes(s.entity.id)).map((s) => s.entity.name);
    return names.length ? `Because you like ${names.slice(0, 2).join(" and ")}` : null;
  }
  function pickFromMap(id: string) {
    setActive(id);
    document.getElementById(`place-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  const museums = CITIES[city].museums;
  const shown = (data?.results ?? []).filter((r) => !hidden.some((h) => h.id === r.place.id));
  // Same numbering as the map's pins (only places with coordinates get one).
  const pins = new Map(
    shown.filter((r) => r.place.lat !== null && r.place.lon !== null).map((r, i) => [r.place.id, i + 1]),
  );
  return (
    <div className="city">
      <section className="city-cover">
        <div>
          <span className="meta">Explore</span>
          <h1>{city}</h1>
          {LOCAL_NAME[city] && <p className="city-local">{LOCAL_NAME[city]}</p>}
        </div>
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
        <span className="city-stamp" aria-hidden>
          {city.slice(0, 3).toUpperCase()}
        </span>
      </section>
      <div className="city-toolbar">
        <div className="seg" role="group" aria-label="View">
          <span aria-current="page">For you</span>
          <Link href={`/swap?city=${encodeURIComponent(city)}`}>Swap a place</Link>
        </div>
        <div className="city-cats" role="group" aria-label="Category">
          {([...Object.keys(EXPLORE_TAGS), "neighbourhood"] as ExploreCategory[]).map((value) => (
            <button key={value} className="pill" aria-pressed={category === value} onClick={() => setCategory(value)}>
              {CATEGORY_LABEL[value]}
            </button>
          ))}
        </div>
      </div>
      {ready && !personal && (
        <div className="city-banner">
          <p>
            These are popular picks in {city}. <strong>Make them yours</strong>: pick 3 favourites and we re-rank
            them for your taste.
          </p>
          <Link className="ticket" href="/passport">
            Make it mine
          </Link>
        </div>
      )}
      {category === "museum" && museums !== "ok" && (
        <p className="muted" role="note">
          {museums === "none"
            ? `Our data has no museums in ${city}.`
            : `Our data has only a few museums in ${city}: most Passports will see the same ones.`}
        </p>
      )}
      <p className="page-status city-status" aria-live="polite">
        {status}
      </p>
      <div className="city-split">
        <div className="place-grid" aria-busy={busy}>
          {busy && !data
            ? Array.from({ length: 6 }, (_, i) => <div className="place-card skeleton" key={i} aria-hidden />)
            : shown.map(({ place, token, near }) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  token={token}
                  city={city}
                  category={category}
                  why={why(place)}
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
        <aside className="city-map-wrap">
          <CityMap places={shown.map((r) => r.place)} active={active} onPick={pickFromMap} />
        </aside>
      </div>
      {data && shown.length > 0 && (
        <p className="muted city-notice">
          {data.notice}
          {data.traitsUsed && " Your quiz profile shaped how well-known and how pricey these are."}
        </p>
      )}
    </div>
  );
}
