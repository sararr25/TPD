"use client";
import { useEffect, useRef, useState } from "react";
import type { Map as MapLibre, Marker, Popup } from "maplibre-gl";
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
    markers = useRef(new Map<string, Marker>()),
    popup = useRef<Popup | null>(null);
  const [failed, setFailed] = useState("");
  const pick = useRef(onPick);
  pick.current = onPick;
  const activeId = useRef(active); activeId.current = active;
  const pinned = places.filter((p) => p.lat !== null && p.lon !== null);
  const key = JSON.stringify(pinned.map(p => [p.id, p.name, p.lat, p.lon]));
  useEffect(() => {
    let alive = true;
    let detach = () => {};
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
      const canvas = map.current;
      popup.current?.remove();
      if (!pinned.length) { markers.current.forEach(m => m.remove()); markers.current.clear(); return; }
      const bounds = new lib.LngLatBounds();
      pinned.forEach(p => bounds.extend([p.lon!, p.lat!]));
      function draw() {
        if (!alive) return;
        const focused = document.activeElement;
        const focusedId = [...markers.current].find(([, m]) => m.getElement() === focused)?.[0];
        popup.current?.remove();
        markers.current.forEach(m => m.remove()); markers.current.clear();
        // Merge intersecting 44px hit areas, including clusters whose new
        // centres intersect after a merge. Each resulting control is distinct.
        const groups = pinned.map((p, i) => ({ items: [{ p, i }], point: canvas.project([p.lon!, p.lat!]) }));
        for (let changed = true; changed;) {
          changed = false;
          outer: for (let a = 0; a < groups.length; a++) for (let b = a + 1; b < groups.length; b++) {
            if (Math.abs(groups[a].point.x - groups[b].point.x) >= 44 || Math.abs(groups[a].point.y - groups[b].point.y) >= 44) continue;
            const items = [...groups[a].items, ...groups[b].items].sort((x,y) => x.i-y.i);
            const points = items.map(({p}) => canvas.project([p.lon!,p.lat!]));
            groups[a] = { items, point: canvas.project(canvas.unproject([points.reduce((n,p)=>n+p.x,0)/points.length, points.reduce((n,p)=>n+p.y,0)/points.length])) };
            groups.splice(b,1); changed = true; break outer;
          }
        }
        for (const group of groups) {
          const pin = document.createElement("button"), mark = document.createElement("span");
          pin.className = "map-pin"; pin.type = "button";
          mark.className = "map-pin-mark"; pin.append(mark);
          if (group.items.length === 1) {
            const {p,i} = group.items[0]; mark.textContent = String(i+1);
            pin.setAttribute("aria-label", `${i+1}. ${p.name}`);
            pin.addEventListener("click", () => pick.current(p.id));
          } else {
            mark.textContent = String(group.items.length); pin.dataset.cluster = "true";
            pin.setAttribute("aria-label", `${group.items.length} places here. Choose a place.`);
            pin.setAttribute("aria-haspopup", "dialog"); pin.setAttribute("aria-expanded", "false");
            pin.addEventListener("click", event => {
              event.stopPropagation();
              popup.current?.remove();
              const list = document.createElement("div"), title = document.createElement("strong");
              list.className = "map-place-choices"; list.setAttribute("role", "dialog"); list.setAttribute("aria-label", "Choose a place here");
              title.textContent = "Places here"; list.append(title);
              for (const {p,i} of group.items) {
                const choice = document.createElement("button"); choice.type = "button"; choice.textContent = `${i+1}. ${p.name}`;
                choice.addEventListener("click", () => { popup.current?.remove(); pick.current(p.id); }); list.append(choice);
              }
              const chooser = new lib.Popup({ maxWidth: "280px", closeOnMove: true }).setLngLat(canvas.unproject(group.point)).setDOMContent(list).addTo(canvas);
              popup.current = chooser; pin.setAttribute("aria-expanded", "true");
              chooser.getElement().querySelector(".maplibregl-popup-close-button")?.addEventListener("click", () => { if(pin.isConnected) pin.focus({preventScroll:true}); });
              chooser.on("close", () => { pin.setAttribute("aria-expanded", "false"); if (list.contains(document.activeElement) && pin.isConnected) pin.focus({preventScroll:true}); });
              list.addEventListener("keydown", e => { if(e.key === "Escape") { e.preventDefault(); e.stopPropagation(); chooser.remove(); pin.focus({preventScroll:true}); } });
              list.querySelector("button")?.focus({preventScroll:true});
            });
          }
          const marker = new lib.Marker({ element: pin }).setLngLat(canvas.unproject(group.point)).addTo(canvas);
          for (const {p} of group.items) markers.current.set(p.id, marker);
          pin.toggleAttribute("data-active", group.items.some(({p}) => p.id === activeId.current));
        }
        if (focusedId) markers.current.get(focusedId)?.getElement().focus({preventScroll:true});
      }
      canvas.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 0 });
      canvas.on("moveend", draw); canvas.on("resize", draw); draw();
      detach = () => { canvas.off("moveend", draw); canvas.off("resize", draw); };
    })().catch((e) => alive && setFailed((e as Error).message || "unknown error"));
    return () => {
      alive = false;
      detach(); popup.current?.remove();
    };
    // Re-pin only when the set of places changes.
  }, [key]);
  useEffect(() => {
    const elements = new Set(markers.current.values());
    elements.forEach(m => m.getElement().toggleAttribute("data-active", !!active && markers.current.get(active) === m));
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
