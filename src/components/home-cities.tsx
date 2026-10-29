"use client";
import { ActionIcon } from "./action-icon";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CITIES, citySlug, LOCAL_NAME } from "@/lib/discovery";
import { COVERS, cityCover } from "@/lib/city-covers";
import { PassportSecurityLines } from "./passport-art";
import { discovery } from "@/lib/discovery-client";
import { selectHomeCities, type CityAffinity } from "@/lib/home-cities";
import { usePassportState } from "./passport-state";
import { useVisitedCities } from "./use-visited-cities";

const REGIONS = ["All", "Europe", "Asia", "Americas"] as const;
type Region = (typeof REGIONS)[number];
const EUROPE = ["Lisbon", "Porto", "Paris", "Barcelona", "Madrid"];
const regionOf = (c: string): Exclude<Region, "All"> =>
  EUROPE.includes(c) ? "Europe" : c === "New York" ? "Americas" : "Asia";

// Home has a personal four-card shelf; /explore retains the full regional index.
export function HomeCities({ page = false }: { page?: boolean }) {
  return page ? <CitiesIndex /> : <PersonalCityShelf />;
}
function PersonalCityShelf() {
  const passport = usePassportState();
  const history = useVisitedCities();
  const tokens = passport.state === "ready" ? passport.selections.map(s => s.token) : [];
  const signature = JSON.stringify(tokens);
  const requestKey = `${passport.owner}:${signature}`;
  const [rank, setRank] = useState<{ key: string; cities: CityAffinity[]; error: boolean }>({ key: "", cities: [], error: false });
  useEffect(() => {
    if (!tokens.length) return;
    const controller = new AbortController();
    discovery<{ cities: CityAffinity[] }>({ action: "cities", passport: JSON.parse(signature) }, controller.signal)
      .then(data => { if (!controller.signal.aborted) setRank({ key: requestKey, cities: Array.isArray(data.cities) ? data.cities : [], error: false }); })
      .catch(() => { if (!controller.signal.aborted) setRank({ key: requestKey, cities: [], error: true }); });
    return () => controller.abort();
  }, [requestKey, signature]);
  const affinities = rank.key === requestKey && tokens.length ? rank.cities : [];
  const cities = selectHomeCities(affinities, history.cities);
  const personal = cities.some(c => c.reason === "passport");
  const returning = !personal && cities.some(c => c.visited);
  return <section className="h-cities h-personal-cities" id="cities" aria-labelledby="h-cities">
    <div className="h-cities-head"><div><h2 id="h-cities">{personal ? "Cities for your Passport." : returning ? "Your next city starts here." : "Four cities to start with."}</h2>
      <p>{personal ? "Shaped by your Passport favourites; cities you’ve visited come next." : returning ? "Your visited cities, then a few starting points." : "Choose a starting point, or open all eleven cities."}</p></div>
      <Link className="btn btn-secondary" href="/explore">All cities · 11 <ActionIcon name="right" /></Link></div>
    {tokens.length > 0 && rank.key !== requestKey && <p className="meta" role="status">Finding cities through your Passport favourites…</p>}
    {tokens.length > 0 && rank.key === requestKey && (rank.error || !affinities.length) && <p className="meta" role="status">Personal city picks aren’t available right now. These are visited cities and starting points.</p>}
    <ul className="h-grid">{cities.map(({ city, visited, reason }) => <li key={city}>
      <CityCard city={city} big={false} />
      <p className="h-city-reason">{reason === "passport" ? "From your Passport favourites" : reason === "visited" ? "Visited by you" : "A starting point"}{visited && reason === "passport" ? " · Visited by you" : ""}</p>
    </li>)}</ul>
    <p className="meta"><Link href="/passport#visited-cities-title">Update your visited cities <ActionIcon name="right" /></Link></p>
  </section>;
}
function CitiesIndex() {
  const cities = Object.keys(CITIES);
  const [region, setRegion] = useState<Region>("All");
  return <section className="h-cities page" id="cities" aria-labelledby="h-cities">
    <div className="h-cities-head">
      <PassportSecurityLines />
      <div className="cities-index-title">
        <h1 id="h-cities">Choose your next city</h1>
        <p>Open a city to explore its places, or find a twin for one you already know.</p>
      </div>
      <CitySkyline />
      <div className="toggle-group on-dark" role="group" aria-label="Filter cities by region">
        {REGIONS.map(r => <button type="button" className="toggle" key={r} aria-pressed={region === r} onClick={() => setRegion(r)}>{r}</button>)}
      </div>
    </div>
    <ul className="h-grid">{cities.map((city, index) => <li key={city} data-big={index === 0 && region === "All"} hidden={region !== "All" && regionOf(city) !== region}>
      <CityCard city={city} big={index === 0 && region === "All"} />
    </li>)}</ul>
  </section>;
}

// A faint skyline outline: says "cities" without competing with the title (docs/84 §2).
function CitySkyline() {
  return <svg className="cities-skyline" viewBox="0 0 400 90" preserveAspectRatio="xMaxYMax meet" aria-hidden>
    <path d="M0 90V70h20V55h12v15h14V40l8-10 8 10v30h18V60h10V45h6V30h4v15h6v25h20V50q10-14 20 0v20h16V58h22v12h12V35h8V20h4v15h8v35h18v-8h24v8h20V48h10v22h40v20" />
  </svg>;
}

function CityCard({ city, big }: { city: string; big: boolean }) {
  const [broken, setBroken] = useState(false);
  const cover = COVERS[city];
  const code = cover?.code ?? city.slice(0, 3).toUpperCase();
  const photo = broken ? null : cityCover(city, big ? "1200x" : "420x");
  return (
    <Link href={`/${citySlug(city)}`} className="h-city" data-city={citySlug(city)}>
      <div className={photo ? "h-city-photo" : "h-city-photo none"} data-travel-reveal>
        {photo ? (
          <img
            src={photo}
            alt=""
            loading="lazy"
            onError={() => setBroken(true)}
          />
        ) : (
          <><PassportSecurityLines /><span aria-hidden>{code}</span><small>City photo unavailable</small></>
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
