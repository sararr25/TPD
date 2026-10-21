"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { citySlug, type Entity } from "@/lib/discovery";
import { discovery, type Selection } from "@/lib/discovery-client";

const CITY = "Lisbon";
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
  return (
    <section className="home-example paper" aria-labelledby="home-example">
      <h2 className="meta" id="home-example">
        For example
      </h2>
      <p>
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
        )}
        , in {CITY}:
      </p>
      {error ? (
        <p className="page-status" role="alert">
          The example could not load: {error}
        </p>
      ) : (
        <ul className="home-example-cards" aria-busy={!picks}>
          {(picks ?? [null, null, null]).map((p, i) => (
            <li key={p?.place.id ?? i}>
              {p ? (
                <Link href={`/${citySlug(CITY)}`} className="home-mini">
                  <MiniPhoto src={p.place.image ?? null} label={p.category} />
                  <span className="meta">{p.category}</span>
                  <strong>{p.place.name}</strong>
                </Link>
              ) : (
                <span className="home-mini skeleton" aria-hidden />
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="city-banner">
        <p>
          <strong>Make it yours</strong>: pick 3 favourites, about a minute.
        </p>
        <Link className="ticket" href="/passport">
          Start
        </Link>
      </div>
      <Link className="text" href="/passport?guest=1">
        Or try this sample profile
      </Link>
    </section>
  );
}

// Some Qloo photos fail to load (docs/22): show the category instead.
function MiniPhoto({ src, label }: { src: string | null; label: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className="home-mini-photo">
      {src && !broken ? <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} /> : <span>{label}</span>}
    </span>
  );
}
