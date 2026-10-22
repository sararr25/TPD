"use client";
import { useEffect, useRef, useState } from "react";
import type { Map as MapLibre, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Entity } from "@/lib/discovery";

// Keyless vector tiles from OpenFreeMap (OpenStreetMap data), docs/22 Q3.
const STYLE = "https://tiles.openfreemap.org/styles/positron";

// The City page's map (wireframe W2): one numbered pin per card. Hovering a
// card lights its pin; clicking a pin scrolls to and lights its card.
export function CityMap({
  places,
  active,
  onPick,
}: {
  places: Pick<Entity, "id" | "name" | "lat" | "lon">[];
  active: string | null;
  onPick: (id: string) => void;
}) {
  const box = useRef<HTMLDivElement>(null),
    map = useRef<MapLibre | null>(null),
    markers = useRef(new Map<string, Marker>());
  const [failed, setFailed] = useState("");
  const pick = useRef(onPick);
  pick.current = onPick;
  const pinned = places.filter((p) => p.lat !== null && p.lon !== null);
  const key = pinned.map((p) => p.id).join(",");
  useEffect(() => {
    let alive = true;
    (async () => {
      const lib = await import("maplibre-gl");
      if (!alive || !box.current) return;
      if (!map.current) {
        lib.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
        map.current = new lib.Map({
          container: box.current,
          style: STYLE,
          center: [0, 20],
          zoom: 1,
          attributionControl: { compact: true },
        });
        map.current.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");
      }
      markers.current.forEach((m) => m.remove());
      markers.current.clear();
      if (!pinned.length) return;
      const bounds = new lib.LngLatBounds();
      pinned.forEach((p, i) => {
        const pin = document.createElement("button");
        pin.className = "map-pin";
        pin.type = "button";
        pin.textContent = String(i + 1);
        pin.setAttribute("aria-label", `${i + 1}. ${p.name}`);
        pin.addEventListener("click", () => pick.current(p.id));
        const lngLat: [number, number] = [p.lon!, p.lat!];
        markers.current.set(p.id, new lib.Marker({ element: pin }).setLngLat(lngLat).addTo(map.current!));
        bounds.extend(lngLat);
      });
      map.current.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 0 });
    })().catch((e) => alive && setFailed((e as Error).message || "unknown error"));
    return () => {
      alive = false;
    };
    // Re-pin only when the set of places changes.
  }, [key]);
  useEffect(() => {
    markers.current.forEach((m, id) => m.getElement().toggleAttribute("data-active", id === active));
  }, [active, key]);
  useEffect(
    () => () => {
      map.current?.remove();
      map.current = null;
    },
    [],
  );
  return (
    <div className="city-map" ref={box} role="region" aria-label="Map of these places">
      {failed && <p className="map-error">The map couldn’t load. You can still browse the place cards and open their directions.</p>}
    </div>
  );
}
