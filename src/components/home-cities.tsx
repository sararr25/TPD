"use client";
import { useState } from "react";
import Link from "next/link";
import { CITIES, citySlug, LOCAL_NAME } from "@/lib/discovery";

// Qloo photos picked by hand: id for the image URL, 3-letter ring code, country line.
const COVERS: Record<string, { code: string; country: string; photo?: string }> = {
  Lisbon: { code: "LIS", country: "Portugal", photo: "85E621E5-F91F-4AB7-B8D3-4E385619C2B1-2Q7xn5" },
  Porto: { code: "OPO", country: "Portugal", photo: "A19EA433-1596-47A4-B408-972D63563EE2-1yqYl4" },
  Paris: { code: "PAR", country: "France", photo: "B1BF01AF-08EA-446A-9491-4A1862ECD8BC-1A0koI" },
  Barcelona: { code: "BCN", country: "Spain", photo: "E006CA6B-9A73-40B9-909F-58C4A8CEABDA-1fwLCl" },
  Madrid: { code: "MAD", country: "Spain", photo: "B215D185-5A63-4390-8256-D684657B870F-2v6SN2" },
  Tokyo: { code: "TYO", country: "Japan", photo: "2C22E484-392B-4AE2-A00E-E811AAED1075-0Fv0Om" },
  "New York": { code: "NYC", country: "USA", photo: "5FAFC6A6-45DB-4AC6-80B3-D7BD558420A8-0rXlRA" },
  Osaka: { code: "OSA", country: "Japan", photo: "6014C8FD-94EC-447D-BC3A-9F12A75CEDE9-1lTKpz" },
  "Ho Chi Minh City": { code: "SGN", country: "Vietnam", photo: "AAAD1F0C-25CF-4913-8C5B-B6C154FC3952-0tkPJr" },
  Hanoi: { code: "HAN", country: "Vietnam", photo: "B41AE803-6C0C-4DC0-AE4D-EA3B36F4ED78-0rFUQG" },
  "Phu Quoc": { code: "PQC", country: "Vietnam" },
};
const REGIONS = ["All", "Europe", "Asia", "Americas"] as const;
type Region = (typeof REGIONS)[number];
const EUROPE = ["Lisbon", "Porto", "Paris", "Barcelona", "Madrid"];
const regionOf = (c: string): Exclude<Region, "All"> =>
  EUROPE.includes(c) ? "Europe" : c === "New York" ? "Americas" : "Asia";

export function HomeCities() {
  const cities = Object.keys(CITIES);
  const [region, setRegion] = useState<Region>("All");
  return (
    <section className="h-cities" id="cities" aria-labelledby="h-cities">
      <div className="h-cities-head">
        <h2 id="h-cities">Eleven cities so far.</h2>
        <div className="h-filters" role="group" aria-label="Filter cities by region">
          {REGIONS.map((r) => (
            <button type="button" key={r} aria-pressed={region === r} onClick={() => setRegion(r)}>
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
  const photo = cover?.photo && !broken ? cover.photo : null;
  return (
    <Link href={`/${citySlug(city)}`} className="h-city">
      <div className={photo ? "h-city-photo" : "h-city-photo none"}>
        {photo ? (
          <img
            src={`https://images.qloo.com/i/${photo}-${big ? "1200x" : "420x"}-outside.jpg`}
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
