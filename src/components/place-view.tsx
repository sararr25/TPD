"use client";
import { useSearchParams } from "next/navigation";
import { PassportPrompt, usePassportState } from "./passport-state";
import Link from "next/link";
import { chipTags, citySlug, type Entity, type ExplorePlaceCategory } from "@/lib/discovery";
import { PlacePhoto } from "./place-photo";
import { authClient } from "@/lib/auth/client";
import { CityMap } from "./city-map";
import { SaveButton, useSavedLists } from "./save-button";

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
  const passportState = usePassportState();
  const query = useSearchParams();
  const returnTo = query.get("returnTo");
  const base = `/${citySlug(city)}`;
  const backHref = returnTo && (returnTo === base || returnTo.startsWith(base + "?")) ? returnTo : base;
  const chips = chipTags(place, category === "museum" ? "museum" : "restaurant").map((t) => t.name);
  const price = place.price ? "€".repeat(place.price) : null;
  const swappable = category === "restaurant" || category === "museum";
  const twinHref = `/${citySlug(city)}?${new URLSearchParams({ tab: "swap", q: place.name, category, ref: place.id })}`;
  const hasPin = place.lat !== null && place.lon !== null;
  return (
    <article className="place-page">
      <Link className="place-back" href={backHref}>
        ← {city}
      </Link>
      <div className="place-hero">
        <PlacePhoto image={place.image} city={city} size="1200x" label={FALLBACK[category]} />
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
        {passportState.state !== "ready" && <PassportPrompt />}
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
