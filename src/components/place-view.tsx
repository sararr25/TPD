"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LIVE_PASSPORT_KEY, chipTags, citySlug, type Entity, type ExplorePlaceCategory } from "@/lib/discovery";
import { readSelections } from "@/lib/discovery-client";
import { cityCover } from "@/lib/city-covers";
import { authClient } from "@/lib/auth/client";
import { CityMap } from "./city-map";
import { SaveButton, useSavedLists } from "./save-button";
import { OpenQuizButton } from "./quiz-panel";
import { usePassportVersion } from "./use-passport-version";

const FALLBACK: Record<ExplorePlaceCategory, string> = { restaurant: "Eat", bar: "Drink", museum: "See", hotel: "Stay" };

// The Place page (#20): photo, name, where it is, chips, map, Save, Directions
// and "Find its twin", which opens the city's Swap tab on this place.
export function PlaceView({
  city,
  place,
  token,
  category,
}: {
  city: string;
  place: Entity;
  token: string;
  category: ExplorePlaceCategory;
}) {
  const { data: session, isPending } = authClient.useSession();
  const { lists, reload, signedIn } = useSavedLists(!isPending, session?.user?.id);
  // "Why it fits you" needs Qloo's explanation, which only comes with a
  // Passport-driven search, not with a lookup by id. So this page never
  // invents one: without a Passport it points to building one.
  const passportVersion = usePassportVersion();
  const [hasPassport, setHasPassport] = useState(true);
  useEffect(() => {
    try {
      setHasPassport(readSelections(localStorage.getItem(LIVE_PASSPORT_KEY)).length >= 3);
    } catch {
      setHasPassport(true);
    }
  }, [passportVersion]);
  const [broken, setBroken] = useState(false),
    [coverBroken, setCoverBroken] = useState(false);
  const cover = coverBroken ? null : cityCover(city, "1200x");
  const chips = chipTags(place, category === "museum" ? "museum" : "restaurant").map((t) => t.name);
  const price = place.price ? "€".repeat(place.price) : null;
  const swappable = category === "restaurant" || category === "museum";
  const twinHref = `/${citySlug(city)}?${new URLSearchParams({ tab: "swap", q: place.name, category, ref: place.id })}`;
  const hasPin = place.lat !== null && place.lon !== null;
  return (
    <article className="place-page">
      <Link className="place-back" href={`/${citySlug(city)}`}>
        ← {city}
      </Link>
      <div className="place-hero">
        {place.image && !broken ? (
          <img src={place.image} alt="" onError={() => setBroken(true)} />
        ) : cover ? (
          <img src={cover} alt="" onError={() => setCoverBroken(true)} />
        ) : (
          <span aria-hidden>{FALLBACK[category]}</span>
        )}
      </div>
      <div className="place-main">
        <span className="meta">
          {city}
          {place.context && place.context !== place.address ? ` · ${place.context}` : ""}
        </span>
        <h1>{place.name}</h1>
        {place.address && <p className="place-address">{place.address}</p>}
        {(chips.length > 0 || price) && (
          <ul className="place-chips" aria-label="About this place">
            {chips.map((c) => (
              <li key={c}>{c}</li>
            ))}
            {price && <li aria-label={`Price ${place.price} of 4`}>{price}</li>}
          </ul>
        )}
        {!hasPassport && (
          <p className="place-why">
            Your Taste Passport helps us pick places from what you love. <OpenQuizButton className="btn btn-quiet" />
          </p>
        )}
        <div className="place-page-actions">
          {swappable && (
            <Link className="btn btn-primary" href={twinHref}>
              Find its twin
            </Link>
          )}
          <SaveButton
            place={place}
            token={token}
            city={city}
            lists={lists}
            signedIn={signedIn}
            onChange={reload}
          />
          {hasPin && (
            <a
              className="btn btn-secondary"
              href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
              target="_blank"
              rel="noreferrer"
            >
              Directions ↗
            </a>
          )}
        </div>
      </div>
      {hasPin && (
        <div className="place-map">
          <CityMap places={[place]} active={place.id} onPick={() => {}} />
        </div>
      )}
    </article>
  );
}
