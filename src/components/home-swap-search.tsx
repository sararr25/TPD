"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES, TWIN_CATEGORIES, CATEGORY_CAPABILITIES, type PlaceCategory } from "@/lib/discovery";
import { useCity } from "./use-city";

// Home's Swap entrance (docs/24): name the place that's full, pick the city,
// and Swap opens on it with the search already run.
export function HomeSwapSearch() {
  const router = useRouter();
  const [city, setCity] = useCity();
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState<PlaceCategory>("restaurant");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ city, q: query.trim() });
    params.set("category", category);
    router.push(`/swap?${params}`);
  }
  return (
    <form className="h-search" onSubmit={submit} role="search" aria-label="Twin">
      <label className="sr-only" htmlFor="home-swap-q">
        The place you wanted
      </label>
      <input
        id="home-swap-q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`The ${CATEGORY_CAPABILITIES[category].singular} you wanted`}
        minLength={2}
        maxLength={120}
        required
      />
      <div className="h-row">
        <label className="sr-only" htmlFor="home-twin-category">Kind of place</label>
        <select id="home-twin-category" value={category} onChange={(e) => setCategory(e.target.value as PlaceCategory)}>
          {TWIN_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_CAPABILITIES[c].label}</option>)}
        </select>
        <label className="sr-only" htmlFor="home-swap-city">
          City
        </label>
        <select id="home-swap-city" value={city} onChange={(e) => setCity(e.target.value)}>
          {Object.keys(CITIES).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button className="btn btn-primary" disabled={query.trim().length < 2}>
          Find its twin
        </button>
      </div>
    </form>
  );
}
