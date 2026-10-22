"use client";
import { useState } from "react";
import { HomeCitySearch } from "./home-city-search";
import { HomeSwapSearch } from "./home-swap-search";

// The hero's two entrances: open a city, or swap a place that's full.
export function HomeSearch() {
  const [mode, setMode] = useState<"city" | "swap">("city");
  return (
    <div className="h-entrance">
      <div className="toggle-group on-dark" role="group" aria-label="How do you want to start?">
        <button type="button" className="toggle" aria-pressed={mode === "city"} onClick={() => setMode("city")}>
          Pick a city
        </button>
        <button type="button" className="toggle" aria-pressed={mode === "swap"} onClick={() => setMode("swap")}>
          Find its twin
        </button>
      </div>
      {mode === "city" ? (
        <HomeCitySearch />
      ) : (
        <>
          <HomeSwapSearch />
          <p className="h-help">Keep what you loved about it. Find another place in the same city.</p>
        </>
      )}
    </div>
  );
}
