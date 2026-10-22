"use client";
import { useState } from "react";
import { HomeCitySearch } from "./home-city-search";
import { HomeSwapSearch } from "./home-swap-search";

// The hero's two entrances: open a city, or swap a place that's full.
export function HomeSearch() {
  const [mode, setMode] = useState<"city" | "swap">("city");
  return (
    <div className="h-entrance">
      <div className="h-toggle" role="group" aria-label="How do you want to start?">
        <button type="button" aria-pressed={mode === "city"} onClick={() => setMode("city")}>
          Pick a city
        </button>
        <button type="button" aria-pressed={mode === "swap"} onClick={() => setMode("swap")}>
          Swap a full place
        </button>
      </div>
      {mode === "city" ? (
        <HomeCitySearch />
      ) : (
        <>
          <HomeSwapSearch />
          <p className="h-help">We’ll look for the closest match nearby.</p>
        </>
      )}
    </div>
  );
}
