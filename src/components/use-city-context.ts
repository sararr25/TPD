"use client";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { type ExploreCategory } from "@/lib/discovery";
const categories: ExploreCategory[] = [
  "restaurant",
  "bar",
  "museum",
  "hotel",
  "neighbourhood",
];
export function useCityContext() {
  const search = useSearchParams();
  const category =
    categories.find((c) => c === search.get("category")) || "restaurant";
  const prices = Object.fromEntries(
    categories.map((c) => [
      c,
      /^[1-4]$/.test(search.get(`price-${c}`) || "")
        ? search.get(`price-${c}`)!
        : "",
    ]),
  );
  const areas = Object.fromEntries(
    categories.map((c) => [c, search.get(`area-${c}`) || ""]),
  );
  function update(values: Record<string, string>) {
    const url = new URL(location.href);
    for (const [k, v] of Object.entries(values))
      v ? url.searchParams.set(k, v) : url.searchParams.delete(k);
    window.history.pushState(null, "", url);
  }
  return {
    category,
    prices,
    areas,
    view: search.get("view") === "map" ? ("map" as const) : ("list" as const),
    tab: search.get("tab") === "swap" ? ("swap" as const) : ("foryou" as const),
    update,
    query: search.toString(),
  };
}
// Only an actual Place opening records a return position. Restore after results
// arrive, never while the skeleton is shorter than the original list.
export function rememberCityPosition() {
  try {
    sessionStorage.setItem(
      `beesyde-scroll:${location.pathname}${location.search}`,
      String(scrollY),
    );
  } catch {}
}
export function useCityPosition(loaded: boolean, query: string) {
  const restored = useRef("");
  useEffect(() => {
    const key = `${location.pathname}${location.search}`;
    if (!loaded || restored.current === key) return;
    restored.current = key;
    try {
      const y = sessionStorage.getItem(`beesyde-scroll:${key}`);
      if (y !== null)
        requestAnimationFrame(() =>
          window.scrollTo({ top: Number(y), behavior: "instant" }),
        );
    } catch {}
  }, [loaded, query]);
}
