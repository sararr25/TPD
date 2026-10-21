"use client";
import { useState } from "react";
import Link from "next/link";
import { chipTags, type Entity, type ExploreCategory } from "@/lib/discovery";
import type { SavedList } from "@/lib/saved";
import { SaveButton } from "./save-button";

const FALLBACK: Record<ExploreCategory, string> = {
  restaurant: "Eat",
  bar: "Drink",
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
}) {
  // Some Qloo photos fail to load (docs/22): show the category instead.
  const [broken, setBroken] = useState(false);
  const hood = category === "neighbourhood";
  const price = place.price ? "€".repeat(place.price) : null;
  const chips = hood
    ? []
    : chipTags(place, category === "museum" ? "museum" : "restaurant")
        .slice(0, 3)
        .map((t) => t.name);
  const swappable = category === "restaurant" || category === "museum";
  return (
    <article
      className="place-card"
      id={`place-${place.id}`}
      data-active={active || undefined}
      onMouseEnter={() => onHover(place.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(place.id)}
    >
      <div className="place-photo">
        {pin !== null && (
          <span className="place-pin" aria-label={`Pin ${pin} on the map`}>
            {pin}
          </span>
        )}
        {place.image && !broken ? (
          // Remote Qloo photos, already sized (420 px): a plain lazy img.
          <img src={place.image} alt="" loading="lazy" onError={() => setBroken(true)} />
        ) : (
          <span aria-hidden>{FALLBACK[category]}</span>
        )}
      </div>
      <div className="place-body">
        <h3>{place.name}</h3>
        {why && <p className="place-why">{why}</p>}
        {hood && place.context && <p className="place-why">{place.context}</p>}
        {near && near.length > 0 && <p className="place-why">Close to your picks: {near.join(" · ")}</p>}
        {(chips.length > 0 || price) && (
          <ul className="place-chips" aria-label="About this place">
            {chips.map((c) => (
              <li key={c}>{c}</li>
            ))}
            {price && <li aria-label={`Price ${place.price} of 4`}>{price}</li>}
          </ul>
        )}
      </div>
      <div className="place-actions">
        <SaveButton
          place={place}
          token={token}
          city={city}
          lists={lists}
          signedIn={signedIn}
          onChange={onListsChange}
          onSaved={onSaved}
          iconOnly
        />
        <button className="icon-button" aria-label={`Not for me: hide ${place.name}`} title="Not for me" onClick={onHide}>
          <span aria-hidden>✕</span>
        </button>
        <span className="grow" />
        {swappable && (
          <Link
            className="pill-link"
            href={`/swap?city=${encodeURIComponent(city)}`}
            title="Find places that keep what you like about this one"
          >
            Find similar
          </Link>
        )}
      </div>
    </article>
  );
}
