"use client";
import { useEffect, useRef, useState } from "react";
import { cityCover } from "@/lib/city-covers";
import { usePlacePhotos } from "./place-photo-context";
// The same photo/fallback decision for cards, details and saved places.
export function PlacePhoto({
  image,
  city,
  size = "420x",
  label = "Place",
  lazy = false,
  placeId,
}: {
  image: string | null | undefined;
  city: string;
  size?: "420x" | "1200x";
  label?: string;
  lazy?: boolean;
  placeId?: string;
}) {
  const photos = usePlacePhotos();
  const [failed, setFailed] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<string | null>(null);
  const ref = useRef<HTMLImageElement>(null);
  const previous = placeId ? photos?.read(placeId,city) : null;
  const actual = image && !failed.includes(image) ? image : previous && !failed.includes(previous) ? previous : null;
  const cover = cityCover(city, size);
  const src = actual || (cover && !failed.includes(cover) ? cover : null);
  function fail() {
    if (actual && placeId) photos?.failed(placeId,city,actual);
    if (src) setFailed((old) => (old.includes(src) ? old : [...old, src]));
  }
  // A cached failure can complete before React attaches onError at hydration.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth === 0) fail();
    else if (ref.current?.complete && actual) {
      setLoaded(actual);
      if (placeId) photos?.loaded(placeId,city,actual);
    }
  }, [src, photos, placeId, city, actual]);
  return src ? (
    <>
      {actual && loaded === actual && <span className="place-image-backdrop" aria-hidden="true" style={{backgroundImage: `url(${JSON.stringify(actual)})`}} />}
      <img
        ref={ref}
        data-place-image={actual ? "" : undefined}
        key={src}
        src={src}
        alt={actual ? "" : `${city} city photo`}
        loading={lazy ? "lazy" : undefined}
        onError={fail}
        onLoad={() => { setLoaded(src); if (actual && placeId) photos?.loaded(placeId,city,actual); }}
      />
      {!actual && <span className="photo-caption">{city} city photo · place photo unavailable</span>}
    </>
  ) : (
    <span>No place photo · {label}</span>
  );
}
