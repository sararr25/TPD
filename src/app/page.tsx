import Link from "next/link";
import { CITIES, citySlug, LOCAL_NAME } from "@/lib/discovery";
import { HomeSwapSearch } from "@/components/home-swap-search";
import { HomeExample } from "@/components/home-example";

// Home (docs/24, wireframe W2): two ways in (a city, or a place that's full),
// a live example of what you get, then every city. No forms, no gate.
export default function Home() {
  const cities = Object.keys(CITIES);
  return (
    <>
      <div className="home-top">
        <section className="home-entrances">
          <h1>Places that fit your taste, in the city you’re visiting.</h1>
          <p className="lead">Tell us a few things you love. We read the city through them.</p>
          <h2 className="meta">Where are you going?</h2>
          <ul className="home-cities">
            {cities.map((c) => (
              <li key={c}>
                <Link className="pill" href={`/${citySlug(c)}`}>
                  {c}
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="meta">Or: had a place in mind that’s full?</h2>
          <HomeSwapSearch />
        </section>
        <HomeExample />
      </div>

      <section className="home-covers" aria-labelledby="home-covers">
        <h2 className="meta" id="home-covers">
          {cities.length} cities
        </h2>
        <ul>
          {cities.map((c) => (
            <li key={c}>
              <Link href={`/${citySlug(c)}`} className="home-cover">
                <span className="city-stamp" aria-hidden>
                  {c.slice(0, 3).toUpperCase()}
                </span>
                <strong>{c}</strong>
                {LOCAL_NAME[c] && <span className="home-cover-local">{LOCAL_NAME[c]}</span>}
                <span className="home-cover-go" aria-hidden>
                  Explore ↗
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="muted">
          Picks come from Qloo’s taste data. Opening hours, prices and bookings are not checked: confirm before you go.
        </p>
      </section>
    </>
  );
}
