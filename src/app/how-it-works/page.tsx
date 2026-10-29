import Link from "next/link";
import { ActionIcon } from "@/components/action-icon";

// #103: one short page for judges and curious visitors — where taste and
// places come from, and what we do not claim. Linked from the footer only,
// so naming the data providers here keeps the rest of the copy clean.
export const metadata = { title: "How it works · Beesyde" };

const STEPS = [
  ["01", "Your taste", "The quiz and 3–10 favourite artists, films or books become your Taste Passport. Nothing about places is asked."],
  ["02", "Taste → places", "Qloo's Taste AI links those favourites to places across domains: someone who loves Khruangbin and Before Sunrise tends to love certain bars, cafés and museums."],
  ["03", "A reason for each pick", "In the example Passport each pick is credited to the favourite that ranks it highest. If no single favourite returns a place, we show no reason rather than invent one."],
  ["04", "Find its twin", "Start from a place you wanted. Keep, delete or ignore its traits, and Qloo returns places that keep what you loved."],
] as const;

export default function HowItWorks() {
  return (
    <section className="how-it-works" aria-labelledby="how-title">
      <div className="page-head">
        <span className="meta">How it works</span>
        <h1 id="how-title">From what you love <em>to where you go.</em></h1>
        <p>Beesyde turns taste in music, film and books into places in eleven cities.</p>
      </div>
      <ol className="how-steps">
        {STEPS.map(([n, title, text]) => (
          <li key={n}>
            <span className="how-number" aria-hidden="true">{n}</span>
            <div><h2>{title}</h2><p>{text}</p></div>
          </li>
        ))}
      </ol>
      <div className="how-columns">
        <section aria-labelledby="how-sources">
          <h2 id="how-sources">Where the data comes from</h2>
          <ul>
            <li><strong>Qloo</strong> — taste profiles, place recommendations, traits and price tiers.</li>
            <li><strong>OpenStreetMap</strong> — a name, type and address check on Twin results, when the public map answers.</li>
            <li><strong>Your browser or account</strong> — your Passport, saves and trips. Sign-in is optional.</li>
          </ul>
        </section>
        <section aria-labelledby="how-limits">
          <h2 id="how-limits">What we don’t claim</h2>
          <ul>
            <li>No live opening hours, menus, availability or bookings.</li>
            <li>Price tiers (€–€€€€) are indicative, not menu prices.</li>
            <li>Address checks are a light match, not a guarantee the place is open.</li>
            <li>Events are a Paris-only pilot.</li>
          </ul>
        </section>
      </div>
      <div className="how-actions">
        <Link className="btn btn-primary" href="/lisbon?example=1">See it with an example Passport <ActionIcon name="right" /></Link>
        <Link className="btn btn-quiet" href="/compare">Qloo vs a general AI</Link>
      </div>
    </section>
  );
}
