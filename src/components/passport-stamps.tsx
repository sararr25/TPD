"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { citySlug } from "@/lib/discovery";
import { COVERS } from "@/lib/city-covers";
import { STAMP_LIMIT, stampKey, type Stamp } from "@/lib/stamps";
import { loadStamps, readLocalStamps, STAMPS_CHANGED } from "@/lib/stamps-client";
import { authClient } from "@/lib/auth/client";

// Browser/account activity stamps are separate from the quiz's interest
// stamps. "Opened" never claims the person travelled to or visited a city.
export function PassportStamps() {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const [storedStamps, setStamps] = useState<Stamp[]>([]), [error, setError] = useState("");
  const [owner, setOwner] = useState<string | undefined>(userId);
  const stamps = !isPending && owner === userId ? storedStamps : [];
  useEffect(() => {
    if (isPending) return;
    let active = true;
    setStamps([]);
    setError("");
    setOwner(userId);
    const load = () => {
      loadStamps(userId).then(list => {
        if (active) { setStamps(list); setError(""); }
      }).catch(e => {
        if (active) { setStamps(readLocalStamps(userId)); setError((e as Error).message); }
      });
    };
    load();
    window.addEventListener(STAMPS_CHANGED, load);
    return () => { active = false; window.removeEventListener(STAMPS_CHANGED, load); };
  }, [isPending, userId]);
  return (
    <section className="passport-activity" aria-labelledby="passport-stamps-title">
      <div className="row">
        <h2 id="passport-stamps-title">Your stamps</h2>
        <span className="meta">{stamps.length} collected</span>
      </div>
      <p className="muted">City guides you’ve opened and places you’ve saved. {stamps.length === STAMP_LIMIT && `Your latest ${STAMP_LIMIT} stamps.`}</p>
      {error && !isPending && owner === userId && <p role="status">{error}</p>}
      {isPending ? <p className="meta" role="status">Opening your stamp pages…</p> : !stamps.length ? (
        <div className="passport-stamps-empty">
          <span className="activity-stamp-mark" aria-hidden>+1</span>
          <p>Your first city guide starts the collection.</p>
          <Link className="btn btn-secondary" href="/explore">Browse cities</Link>
        </div>
      ) : (
        <ul className="activity-stamps" aria-label="Collected city and place stamps">
          {stamps.map(stamp => (
            <li key={stampKey(stamp)} className="activity-stamp" data-kind={stamp.kind} data-city={citySlug(stamp.city)}>
              <span className="activity-stamp-mark" aria-hidden>{stamp.kind === "city" ? COVERS[stamp.city]?.code ?? stamp.city.slice(0,3).toUpperCase() : "♡"}</span>
              <div>
                <span className="meta">{stamp.kind === "city" ? "Opened city guide" : "Saved place"}</span>
                <h3><Link href={`/${citySlug(stamp.city)}${stamp.kind === "place" ? `/${stamp.placeId}` : ""}`}>{stamp.kind === "city" ? stamp.city : stamp.name}</Link></h3>
                <p className="muted">{stamp.kind === "place" && `${stamp.city} · `}<time dateTime={stamp.createdAt}>{new Date(stamp.createdAt).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}</time></p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
