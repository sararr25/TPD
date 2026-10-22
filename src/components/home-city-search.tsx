"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES, citySlug, LOCAL_NAME } from "@/lib/discovery";

// Home's city entrance: type a city, match it against the ones we cover.
export function HomeCitySearch() {
  const router = useRouter();
  const [value, setValue] = useState(""),
    [error, setError] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim().toLowerCase();
    const city = Object.keys(CITIES).find((c) => c.toLowerCase() === q || LOCAL_NAME[c]?.toLowerCase() === q);
    if (!city) return setError("We don’t cover that city yet. Try Lisbon, Paris or Tokyo.");
    router.push(`/${citySlug(city)}`);
  }
  return (
    <form className="h-search" onSubmit={submit} role="search" aria-label="Open a city">
      <label htmlFor="home-city">Where are you going?</label>
      <div className="h-row">
        <input
          id="home-city"
          list="home-city-list"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          placeholder="Lisbon, Tokyo, New York…"
          autoComplete="off"
          required
          aria-describedby={error ? "home-city-error" : undefined}
        />
        <datalist id="home-city-list">
          {Object.keys(CITIES).map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <button className="h-btn" type="submit">
          Open the city
        </button>
      </div>
      {error && (
        <p className="h-error" id="home-city-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
