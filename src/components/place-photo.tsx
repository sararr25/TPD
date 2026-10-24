"use client";
import { useEffect, useRef, useState } from "react";
import { cityCover } from "@/lib/city-covers";
// The same photo/fallback decision for cards, details and saved places.
export function PlacePhoto({
  image,
  city,
  size = "420x",
  label = "Place",
  lazy = false,
}: {
  image: string | null | undefined;
  city: string;
  size?: "420x" | "1200x";
  label?: string;
  lazy?: boolean;
}) {
  const [failed, setFailed] = useState<string[]>([]);
  const ref = useRef<HTMLImageElement>(null);
  const actual = image && !failed.includes(image) ? image : null;
  const cover = cityCover(city, size);
  const src = actual || (cover && !failed.includes(cover) ? cover : null);
  function fail() {
    if (src) setFailed((old) => (old.includes(src) ? old : [...old, src]));
  }
  // A cached failure can complete before React attaches onError at hydration.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth === 0) fail();
  }, [src]);
  return src ? (
    <>
      <img
        ref={ref}
        key={src}
        src={src}
        alt={actual ? "" : `${city} city photo`}
        loading={lazy ? "lazy" : undefined}
        onError={fail}
      />
      {!actual && <span className="photo-caption">{city} city photo</span>}
    </>
  ) : (
    <span>No place photo · {label}</span>
  );
}
