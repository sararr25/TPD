"use client";
import { useState } from "react";
import Link from "next/link";
import { CITIES, citySlug, LOCAL_NAME } from "@/lib/discovery";
import { COVERS, cityCover } from "@/lib/city-covers";

const REGIONS = ["All", "Europe", "Asia", "Americas"] as const;
type Region = (typeof REGIONS)[number];
const EUROPE = ["Lisbon", "Porto", "Paris", "Barcelona", "Madrid"];
const regionOf = (c: string): Exclude<Region, "All"> =>
  EUROPE.includes(c) ? "Europe" : c === "New York" ? "Americas" : "Asia";

// `page` is the /explore index: same grid, with a plain one-line h1 (#11).
export function HomeCities({ page = false }: { page?: boolean }) {
  const cities = Object.keys(CITIES);
  const [region, setRegion] = useState<Region>("All");
  return (
    <section className={page ? "h-cities page" : "h-cities"} id="cities" aria-labelledby="h-cities">
      <div className="h-cities-head">
        {page ? <h1 id="h-cities">Cities</h1> : <h2 id="h-cities">Eleven cities so far.</h2>}
        <div className="toggle-group" role="group" aria-label="Filter cities by region">
          {REGIONS.map((r) => (
            <button type="button" className="toggle" key={r} aria-pressed={region === r} onClick={() => setRegion(r)}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <ul className="h-grid">
        {cities.map((c, i) => (
          <li key={c} data-big={i === 0 && region === "All"} hidden={region !== "All" && regionOf(c) !== region}>
            <CityCard city={c} big={i === 0 && region === "All"} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CityCard({ city, big }: { city: string; big: boolean }) {
  const [broken, setBroken] = useState(false);
  const cover = COVERS[city];
  const code = cover?.code ?? city.slice(0, 3).toUpperCase();
  const photo = broken ? null : cityCover(city, big ? "1200x" : "420x");
  return (
    <Link href={`/${citySlug(city)}`} className="h-city">
      <div className={photo ? "h-city-photo" : "h-city-photo none"}>
        {photo ? (
          <img
            src={photo}
            alt=""
            loading="lazy"
            onError={() => setBroken(true)}
          />
        ) : (
          <span aria-hidden>{code}</span>
        )}
      </div>
      <div className="h-city-body">
        <div>
          <strong>{city}</strong>
          <small>{LOCAL_NAME[city] ?? cover?.country}</small>
        </div>
        <span className="h-code" aria-hidden>
          {code}
        </span>
      </div>
    </Link>
  );
}
