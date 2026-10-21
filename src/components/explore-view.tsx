"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LIVE_PASSPORT_KEY,
  CITIES,
  EXPLORE_TAGS,
  chipTags,
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
import { SaveButton, useSavedLists } from "./save-button";
import { useFeedback } from "./use-feedback";
import { useToast } from "./toast";
import { useCity } from "./use-city";
import { feedbackSignal } from "@/lib/feedback";

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
  museum: "Museums",
  hotel: "Hotels",
  neighbourhood: "Neighbourhoods",
};

// Explore a city (docs/17 D2): the Passport alone picks places, no reference.
export function ExploreView() {
  const toast = useToast();
  const [passport, setPassport] = useState<Selection[]>([]),
    [ready, setReady] = useState(false),
    [city, setCity, cityKnown] = useCity(),
    [category, setCategory] = useState<ExploreCategory>("restaurant"),
    [data, setData] = useState<Payload | null>(null),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [hidden, setHidden] = useState<Hidden[]>([]);
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const showError = (m: string) => toast(m, { error: true });
  const { current: feedback, vote, unvote, voted } = useFeedback(!isPending, userId, showError);
  const { lists, reload, signedIn } = useSavedLists(!isPending, userId);
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
    // Wait for the remembered city, so no Paris search is wasted first.
    if (!ready || !cityKnown || passport.length < 3) return;
    const controller = new AbortController();
    let active = true;
    setBusy(true);
    setData(null);
    setStatus(`Finding ${CATEGORY_LABEL[category].toLowerCase()} in ${city} for your Passport…`);
    discovery<Payload>(
      {
        action: "explore",
        city,
        category,
        passport: passport.map((s) => s.token),
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
            ? `${result.results.length} ${category === "neighbourhood" ? "neighbourhoods" : "places"} in ${city}.`
            : `No ${CATEGORY_LABEL[category].toLowerCase()} in ${city} in our data for this Passport. Try another category.`,
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
  }, [ready, cityKnown, passport, city, category]);
  // Like is a toggle (docs/22 F8); the toast confirms where you are looking.
  async function like(place: Entity) {
    try {
      if (voted(place.id) === 1) {
        await unvote(place.id);
        toast(`Removed your like for ${place.name}.`);
      } else {
        await vote(place, 1);
        toast(`Liked ${place.name}. Places like it will come up more.`, {
          action: { label: "Undo", run: () => unvote(place.id).catch((e) => showError(e.message)) },
        });
      }
    } catch (error) {
      showError((error as Error).message);
    }
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
  const museums = CITIES[city].museums;
  return (
    <>
      <span className="meta">Explore · {city}</span>
      <h1>
        A city,
        <br />
        <em>read through your taste.</em>
      </h1>
      {ready && passport.length < 3 ? (
        <section className="paper">
          <h2>First, a little about you.</h2>
          <p>Take the quiz or choose 3–5 favourites so your Passport can pick places.</p>
          <Link className="ticket" href="/passport">
            Make my Passport
          </Link>
        </section>
      ) : (
        <>
          <label htmlFor="explore-city">City</label>
          <select id="explore-city" value={city} disabled={busy} onChange={(e) => setCity(e.target.value)}>
            {Object.keys(CITIES).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <div className="chips" role="group" aria-label="Category">
            {([...Object.keys(EXPLORE_TAGS), "neighbourhood"] as ExploreCategory[]).map((value) => (
              <button
                className="choice"
                key={value}
                aria-pressed={category === value}
                disabled={busy}
                onClick={() => setCategory(value)}
              >
                {CATEGORY_LABEL[value]}
              </button>
            ))}
          </div>
          {category === "museum" && museums !== "ok" && (
            <p className="muted" role="note">
              {museums === "none"
                ? `Our data has no museums in ${city}.`
                : `Our data has only a few museums in ${city}: most Passports will see the same ones.`}
            </p>
          )}
          <p className="page-status" aria-live="polite">{status}</p>
          {data && data.results.length > 0 && (
            <>
              <p className="muted">
                {data.notice}
                {data.traitsUsed && " Your quiz profile shaped how well-known and how pricey these are."}
              </p>
              <div className="cards">
                {data.results
                  .filter((r) => !hidden.some((h) => h.id === r.place.id))
                  .map(({ place, token, near }) => (
                    <article className="result" key={place.id}>
                      <div className="body">
                        <h2>{place.name}</h2>
                        {category === "neighbourhood" ? (
                          <>
                            {place.context && <p>{place.context}</p>}
                            {near && <p className="muted">Close to your picks: {near.join(" · ")}</p>}
                          </>
                        ) : (
                          <>
                            <p>{place.address}</p>
                            {/* Cuisine and atmosphere first, like Swap's chips (docs/22 F10). */}
                            <p className="muted">
                              {chipTags(place, category === "museum" ? "museum" : "restaurant")
                                .slice(0, 4)
                                .map((t) => t.name)
                                .join(" · ")}
                            </p>
                          </>
                        )}
                        {(category === "restaurant" || category === "bar") && (
                          <p className="muted">Price level: {place.price ? `${place.price} of 4` : "unknown"}</p>
                        )}
                      </div>
                      <div className="card-actions">
                        <SaveButton
                          place={place}
                          token={token}
                          city={city}
                          lists={lists}
                          signedIn={signedIn}
                          onChange={reload}
                        />
                        {category !== "neighbourhood" && (
                          <button
                            className="icon-button"
                            aria-pressed={voted(place.id) === 1}
                            onClick={() => like(place)}
                          >
                            <span aria-hidden>👍</span> {voted(place.id) === 1 ? "Liked" : "More like this"}
                          </button>
                        )}
                        <button className="icon-button" onClick={() => notForMe(place, token)}>
                          <span aria-hidden>✕</span> Not for me
                        </button>
                        <a
                          className="icon-button"
                          href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span aria-hidden>↗</span> Map
                        </a>
                      </div>
                      <div className="stub">
                        Picked by Qloo for your taste
                        <br />
                        {category === "hotel"
                          ? "Prices and availability not verified"
                          : category === "neighbourhood"
                            ? "Ranked by your places nearby"
                            : "Opening hours not verified"}
                      </div>
                    </article>
                  ))}
              </div>
              <p className="meta">Response checked: {new Date(data.checkedAt).toLocaleString()}</p>
            </>
          )}
          <div className="divider">
            <h2>Already have a place in mind?</h2>
            <p>If the place you wanted is full or not quite right, Swap finds one that keeps what you love.</p>
            <Link className="stamp" href="/swap">
              Swap a place ↗
            </Link>
          </div>
        </>
      )}
    </>
  );
}
