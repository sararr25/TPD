"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LOCAL_NAME, type Entity } from "@/lib/discovery";
import { cityCover } from "@/lib/city-covers";
import { OpenQuizButton } from "./quiz-panel";
import { discovery, type Selection } from "@/lib/discovery-client";

const CITY = "Lisbon";
const CITY_LOCAL = LOCAL_NAME[CITY].toUpperCase();
type Pick = { place: Entity; category: string };

// Home's live example (docs/24): the sample profile, read through Lisbon.
// Real Qloo answers, not a mock-up; on failure the error is shown.
export function HomeExample() {
  const [who, setWho] = useState<string[]>([]),
    [picks, setPicks] = useState<Pick[] | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      const { choices } = await discovery<{ choices: Selection[] }>(
        { action: "guest", profile: 0 },
        controller.signal,
      );
      setWho(choices.map((c) => c.entity.name));
      const passport = choices.map((c) => c.token);
      // One bar, one museum, one restaurant: three sides of one city. The
      // same place can rank in two categories, so each pick must be new.
      const answers = await Promise.all(
        (["bar", "museum", "restaurant"] as const).map((category) =>
          discovery<{ results: { place: Entity }[] }>(
            { action: "explore", city: CITY, category, passport, quiz: {}, exclude: [], feedback: {} },
            controller.signal,
          ).then((r) => ({ category, places: r.results.map((x) => x.place) })),
        ),
      );
      const found: Pick[] = [];
      for (const { category, places } of answers) {
        const place = places.find((p) => !found.some((f) => f.place.id === p.id));
        if (place) found.push({ place, category });
      }
      setPicks(found);
    })().catch((e) => {
      if ((e as Error).name !== "AbortError") setError((e as Error).message);
    });
    return () => controller.abort();
  }, []);
  const first = picks?.[0]?.place.image ?? null;
  return (
    <aside className="h-visa" aria-labelledby="home-example">
      <VisaPhoto src={first} fallback={cityCover(CITY, "420x")} loading={!picks && !error} />
      <span className="h-mono" id="home-example">
        For example
      </span>
      <p className="h-visa-sentence">
        Someone who loves{" "}
        {who.length ? (
          who.map((n, i) => (
            <span key={n}>
              <strong>{n}</strong>
              {i < who.length - 2 ? ", " : i === who.length - 2 ? " and " : ""}
            </span>
          ))
        ) : (
          <strong>Khruangbin, Nina Simone and Before Sunrise</strong>
        )}{" "}
        might start with these picks in {CITY}:
      </p>
      {error ? (
        <p className="h-error" role="alert">
          The example could not load: {error}
        </p>
      ) : (
        <ul className="h-picks" aria-busy={!picks}>
          {(picks ?? [null, null, null]).map((p, i) => (
            <li key={p?.place.id ?? i}>
              {p ? (
                <>
                  <span className="h-mono">{p.category}</span>
                  <strong>{p.place.name}</strong>
                </>
              ) : (
                <span className="h-skeleton" aria-hidden />
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="h-visa-actions">
        <OpenQuizButton />
        <Link className="btn btn-quiet" href="/passport?guest=1">
          Try this Passport
        </Link>
      </div>
    </aside>
  );
}

// Some Qloo photos fail to load (docs/22): show a plain panel instead.
function VisaPhoto({ src, fallback, loading }: { src: string | null; fallback: string | null; loading: boolean }) {
  const [broken, setBroken] = useState(false);
  const shown = broken || !src ? fallback : src;
  return (
    <div className={loading ? "h-visa-photo skeleton" : "h-visa-photo"}>
      {shown && <img key={shown} src={shown} alt="" loading="lazy" onError={() => setBroken(true)} />}
      <span className="h-stamp" aria-hidden>
        {CITY_LOCAL}
      </span>
    </div>
  );
}
