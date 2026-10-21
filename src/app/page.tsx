import Link from "next/link";
import { PassportCard } from "@/components/passport-card";
import { QuizIcon } from "@/components/quiz-icon";
import { CITIES } from "@/lib/discovery";

// Emoji keys of the quiz illustrations (src/lib/quiz-icons.ts).
const STEPS = [
  { icon: "🧭", title: "Take the quiz", text: "18 quick questions about how you travel, plus a few films and artists you love." },
  { icon: "📓", title: "Get your Taste Passport", text: "Your traveller type, what you lean towards, and what you care about most." },
  { icon: "🗺️", title: "Explore a city", text: "Restaurants, bars, museums, hotels and neighbourhoods picked for your taste. Say yes or not for me, and it learns." },
];

export default function Home() {
  return (
    <>
      <div className="grid">
        <section>
          <span className="meta">Taste Passport · {Object.keys(CITIES).length} cities</span>
          <h1>
            Travel by taste,
            <br />
            <em>not by top-10 lists.</em>
          </h1>
          <p className="lead">
            Tell us what you love. Beesyde reads a city through it and shows you the places and
            neighbourhoods that fit you, not everyone.
          </p>
          <div className="actions">
            <Link className="ticket" href="/passport">
              Take the quiz
            </Link>
            <Link href="/passport?guest=1">Try a sample profile</Link>
          </div>
          <p className="muted">About 3 minutes. No account needed.</p>
        </section>
        <PassportCard />
      </div>

      <section className="divider" aria-labelledby="how">
        <span className="meta" id="how">How it works</span>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <QuizIcon emoji={s.icon} />
              <span className="meta">Step {i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="muted">
          Already picked a place that is full or not quite right?{" "}
          <Link href="/swap">Swap it</Link> for one that keeps what you liked.
        </p>
      </section>

      <section className="divider" aria-labelledby="cities">
        <span className="meta" id="cities">Where</span>
        <ul className="city-list">
          {Object.keys(CITIES).map((c) => (
            <li key={c}>
              <Link href={`/explore?city=${encodeURIComponent(c)}`}>{c}</Link>
            </li>
          ))}
        </ul>
        <p className="muted">
          Picks come from Qloo’s taste data. Opening hours, prices and bookings are not checked:
          confirm before you go.
        </p>
      </section>
    </>
  );
}
