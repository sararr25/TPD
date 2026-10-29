"use client";
import { ViewTransition } from "react";
import { displayTags } from "@/lib/display-tags";
import {PlaceVisitControl} from "./trip-organisation";
import { ActionIcon } from "./action-icon";
import { useSearchParams } from "next/navigation";
import { PassportPrompt, usePassportState } from "./passport-state";
import Link from "next/link";
import { chipTags, citySlug, placeCategory, type Entity, type ExplorePlaceCategory } from "@/lib/discovery";
import { priceSymbols, priceLabel } from "@/lib/price";
import { PlacePhoto } from "./place-photo";
import { authClient } from "@/lib/auth/client";
import { CityMap } from "./city-map";
import { SaveButton, useSavedLists } from "./save-button";
import { GuideFolio, JourneyRoute } from "./travel-art";
import { COVERS } from "@/lib/city-covers";

const FALLBACK: Record<ExplorePlaceCategory, string> = { restaurant: "Eat", bar: "Drink", cafe: "Coffee", museum: "See", hotel: "Stay" };

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
  const listedTags = chipTags(place, placeCategory(category) ?? "restaurant");
  const chips = displayTags(listedTags).map((t) => t.name);
  const price = priceSymbols(place.price);
  const swappable = !!placeCategory(category);
  const twinHref = `/${citySlug(city)}?${new URLSearchParams({ tab: "swap", q: place.name, category, ref: place.id })}`;
  const hasPin = place.lat !== null && place.lon !== null;
  return (
    <article className="place-page">
      <Link className="place-back" href={backHref}>
        <ActionIcon name="left" /> {city}
      </Link>
      <div className="place-hero" data-travel-reveal>
        <ViewTransition name={`place-photo-${place.id.toLowerCase()}`} share="place-morph" default="none">
          <div className="place-photo-frame"><PlacePhoto placeId={place.id} image={place.image} city={city} size="1200x" label={FALLBACK[category]} /></div>
        </ViewTransition>
      </div>
      <div className="place-main">
        <GuideFolio city={city} code={COVERS[city]?.code ?? "PLACE"} />
        <JourneyRoute className="place-journey-route" />
        <span className="meta">
          {city}
          {place.context && place.context !== place.address ? ` · ${place.context}` : ""}
        </span>
        <h1>{place.name}</h1>
        {place.address && <p className="place-address">{place.address}</p>}
        {(chips.length > 0 || price) && (
          <ul className="place-chips" aria-label="About this place">
            {chips.slice(0,3).map((c) => (
              <li key={c}>{c}</li>
            ))}
            {price && <li aria-label={priceLabel(place.price)}>{price}</li>}
          </ul>
        )}
        {listedTags.length > Math.min(3, chips.length) && <details className="place-listed-traits"><summary>All listed traits ({listedTags.length})</summary><ul>{listedTags.map(tag=><li key={tag.id}>{tag.name}</li>)}</ul></details>}
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
              Directions <ActionIcon name="external" />
            </a>
          )}
        </div>
        {passportState.state !== "ready" && <div className="place-passport-prompt"><PassportPrompt actionClassName="btn btn-quiet" /></div>}
      </div>
      <PlaceVisitControl id={place.id}/>
      {hasPin && (
        <div className="place-map">
          <CityMap places={[place]} active={place.id} onPick={() => {}} />
        </div>
      )}
    </article>
  );
}
