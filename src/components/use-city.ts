"use client";
import { useEffect, useState } from "react";
import { CITIES } from "@/lib/discovery";

const CITY_KEY = "beesyde-city-v1";

// One city across Explore and Swap (docs/22 F11): a ?city= link wins, then
// the last city used on this browser, then Paris. Remembering is only a
// convenience: if storage is blocked the chosen city still works this visit.
// `resolved` turns true once the remembered or linked city is known.
export function useCity(): [string, (city: string) => void, boolean] {
  const [city, setCity] = useState("Paris"),
    [resolved, setResolved] = useState(false);
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(CITY_KEY);
    } catch {}
    const linked = new URLSearchParams(window.location.search).get("city");
    const first = [linked, stored].find((c) => c && Object.hasOwn(CITIES, c));
    if (first) choose(first);
    setResolved(true);
    // Runs once on mount; `choose` only sets state and storage.
  }, []);
  function choose(next: string) {
    setCity(next);
    try {
      localStorage.setItem(CITY_KEY, next);
    } catch {}
  }
  return [city, choose, resolved];
}
