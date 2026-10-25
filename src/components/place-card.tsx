"use client";
import { useSearchParams, usePathname } from "next/navigation";
import { rememberCityPosition } from "./use-city-context";
import Link from "next/link";
import { chipTags, citySlug, placeCategory, type Entity, type ExploreCategory } from "@/lib/discovery";
import type { SavedList } from "@/lib/saved";
import { priceSymbols, priceLabel } from "@/lib/price";
import { PlacePhoto } from "./place-photo";
import { SaveButton } from "./save-button";

const FALLBACK: Record<ExploreCategory, string> = {
  restaurant: "Eat",
  bar: "Drink",
  cafe: "Coffee",
  museum: "See",
  hotel: "Stay",
  neighbourhood: "Area",
};

// The shared place card (docs/24 §5, wireframe W2): photo, name, why it fits
// you, 3 chips, then ♡ / ✕ and "Find similar" in one bottom row.
export function PlaceCard({
  place,
  token,
  city,
  category,
  why,
  near,
  lists,
  signedIn,
  onListsChange,
  onSaved,
  onHide,
  active,
  onHover,
  pin,
  eyebrow,
  whyLabel,
  details,
  findSimilar = true,
  directions = false,
  featured = false,
}: {
  place: Entity;
  token: string;
  city: string;
  category: ExploreCategory;
  why: string | null;
  near?: string[];
  lists: SavedList[];
  signedIn: boolean;
  onListsChange: () => Promise<void>;
  onSaved: () => void;
  onHide: () => void;
  active: boolean;
  onHover: (id: string | null) => void;
  // Its number on the map, when it has coordinates.
  pin: number | null;
  // Swap results (#14): a role label, extra body (what's different, the
  // address check), no "Find similar" (already in Swap) and Directions.
  eyebrow?: string;
  whyLabel?: string;
  details?: React.ReactNode;
  findSimilar?: boolean;
  directions?: boolean;
  featured?: boolean;
}) {
  // Some Qloo photos are missing or fail to load (docs/22): show the city's
  // cover, and the category text only if the city has none either.
  const hood = category === "neighbourhood";
  const price = category === "neighbourhood" ? null : priceSymbols(place.price);
  const chips = hood
    ? []
    : chipTags(place, placeCategory(category) ?? "restaurant")
        .slice(0, 3)
        .map((t) => t.name);
  // Every place (not neighbourhoods) opens its page: /lisbon/<id>.
  const query = useSearchParams();
  const path = usePathname();
  const returnQuery = path === `/${citySlug(city)}` ? `?${new URLSearchParams({ returnTo: path + (query.size ? `?${query}` : "") })}` : "";
  const pageHref = hood ? null : `/${citySlug(city)}/${place.id.toLowerCase()}${returnQuery}`;
  const swappable = findSimilar && !!placeCategory(category);
  // "Find similar" starts Swap from this place (#8): name + category + id so
  // Swap can pick the matching search result without retyping.
  const similarHref = `/swap?${new URLSearchParams({ city, q: place.name, category, ref: place.id })}`;
  return (
    <article
      className="place-card"
      id={`place-${place.id}`}
      data-active={active || undefined}
      onMouseEnter={() => onHover(place.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(place.id)}
    >
      <div className="place-photo" data-travel-reveal>
        {pageHref && <Link className="place-photo-link" href={pageHref} onClick={rememberCityPosition} tabIndex={-1} aria-hidden />}
        {pin !== null && (
          <span className="place-pin" aria-label={`Pin ${pin} on the map`}>
            {pin}
          </span>
        )}
        <PlacePhoto image={place.image} city={city} label={FALLBACK[category]} lazy />
      </div>
      <div className="place-body">
        {eyebrow && <span className="place-role">{eyebrow}</span>}
        <h3>{pageHref ? <Link href={pageHref} onClick={rememberCityPosition}>{place.name}</Link> : place.name}</h3>
        {why && whyLabel && <span className="place-label">{whyLabel}</span>}
        {why && <p className="place-why">{why}</p>}
        {hood && place.context && <p className="place-why">{place.context}</p>}
        {near && near.length > 0 && <p className="place-why">Close to your picks: {near.join(" · ")}</p>}
        {(chips.length > 0 || price) && (
          <ul className="place-chips" aria-label="About this place">
            {chips.map((c) => (
              <li key={c}>{c}</li>
            ))}
            {price && <li aria-label={priceLabel(place.price)}>{price}</li>}
          </ul>
        )}
        {details}
      </div>
      <div className="place-actions">
        {token && (
          <>
            <SaveButton
              place={place}
              token={token}
              city={city}
              lists={lists}
              signedIn={signedIn}
              onChange={onListsChange}
              onSaved={onSaved}
              iconOnly={!featured}
            />
            <button className="btn btn-icon" aria-label={`Not for me: hide ${place.name}`} title="Not for me" onClick={onHide}>
              <span aria-hidden>✕</span>
            </button>
          </>
        )}
        {directions && place.lat !== null && place.lon !== null && (
          <a
            className="btn btn-icon"
            aria-label={`Directions to ${place.name}`}
            title="Directions"
            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
            target="_blank"
            rel="noreferrer"
          >
            <span aria-hidden>↗</span>
          </a>
        )}
        <span className="grow" />
        {swappable && (
          <Link
            className="btn btn-secondary btn-chip"
            href={similarHref}
            title="Find places that keep what you like about this one"
          >
            Find its twin
          </Link>
        )}
      </div>
    </article>
  );
}
