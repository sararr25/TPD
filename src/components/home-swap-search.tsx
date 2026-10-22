"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES, type PlaceCategory } from "@/lib/discovery";
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
    if (category === "museum") params.set("category", "museum");
    router.push(`/swap?${params}`);
  }
  return (
    <form className="h-search" onSubmit={submit} role="search" aria-label="Swap a place">
      <label className="sr-only" htmlFor="home-swap-q">
        The restaurant or museum you wanted
      </label>
      <input
        id="home-swap-q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={category === "museum" ? "The museum that’s full" : "The restaurant that’s full"}
        minLength={2}
        maxLength={120}
        required
      />
      <div className="h-row">
        <div className="h-kind" role="group" aria-label="Kind of place">
          {(["restaurant", "museum"] as const).map((c) => (
            <button type="button" key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c === "restaurant" ? "Restaurant" : "Museum"}
            </button>
          ))}
        </div>
        <label className="sr-only" htmlFor="home-swap-city">
          City
        </label>
        <select id="home-swap-city" value={city} onChange={(e) => setCity(e.target.value)}>
          {Object.keys(CITIES).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button className="h-btn" disabled={query.trim().length < 2}>
          Find its twin
        </button>
      </div>
    </form>
  );
}
