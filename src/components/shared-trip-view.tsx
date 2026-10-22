"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { citySlug } from "@/lib/discovery";
import { decodeSharedTrip, type SharedTrip } from "@/lib/shared-trip";

// The fragment is read locally. It is not sent in page requests or referrers;
// no analytics or server-side persistence is introduced for shared snapshots.
export function SharedTripView() {
  const [trip, setTrip] = useState<SharedTrip | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    function read() {
      setTrip(null);
      setError("");
      try {
        setTrip(decodeSharedTrip(window.location.hash.slice(1)));
      } catch (error) {
        setError((error as Error).message);
      }
      setReady(true);
    }
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  if (!ready) return <section className="paper" aria-busy="true"><p role="status">Opening this trip…</p></section>;
  if (!trip) return (
    <section className="paper">
      <h1>This trip link could not be opened.</h1>
      <p role="alert">{error}</p>
      <Link className="btn btn-primary" href="/explore">Browse cities</Link>
    </section>
  );
  return (
    <section className="shared-trip">
      <header className="trip-page-head">
        <span className="trip-mark" aria-hidden>↗</span>
        <div><h1>{trip.name}</h1><p>{trip.places.length} places · Shared snapshot</p></div>
      </header>
      <p className="shared-trip-note">A read-only trip someone shared with you. Open a place for its current details; the list may have changed since this snapshot was made.</p>
      <ol className="shared-trip-places">
        {trip.places.map((place, index) => (
          <li className="paper" key={place.id}>
            <span className="shared-trip-number" aria-hidden>{index + 1}</span>
            <div>
              <h2><Link prefetch={false} href={place.city ? `/${citySlug(place.city)}/${place.id}` : `/place/${place.id}`}>{place.name}</Link></h2>
              {place.city && <p className="muted">{place.city}</p>}
            </div>
          </li>
        ))}
      </ol>
      <Link className="btn btn-secondary" href="/explore">Plan a trip of your own</Link>
    </section>
  );
}
