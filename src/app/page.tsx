import { HomeSearch } from "@/components/home-search";
import { HomeExample } from "@/components/home-example";
import { HomeCities } from "@/components/home-cities";
import { OpenQuizButton } from "@/components/quiz-panel";

const STEPS = [
  ["Make your Passport", "A short quiz about how you travel and what you love. About 3 minutes, no account."],
  ["Open a city", "Every city is reordered around your taste."],
  ["Swap when it’s full", "Name the place you wanted. We find the closest match nearby."],
];

// Home (docs/24): a passport-cover hero with two ways in, a live example,
// how it works, every city, then the Passport band.
export default function Home() {
  return (
    <>
      <div className="h-hero">
        <section className="h-cover" aria-labelledby="h-title">
          <div className="h-seal" aria-hidden />
          <span className="h-mono">Taste Passport</span>
          <h1 id="h-title">
            Places that fit your taste, <em>in the city you’re visiting.</em>
          </h1>
          <p className="h-lead">Tell us three things you love. We read the city through them.</p>
          <HomeSearch />
        </section>
        <HomeExample />
      </div>

      <section className="h-how" aria-labelledby="h-how">
        <h2 id="h-how">Three favourites, and the city starts to look like you.</h2>
        <ol className="h-steps">
          {STEPS.map(([title, text]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <HomeCities />

      <section className="h-band" aria-labelledby="h-band">
        <div>
          <h2 id="h-band">Your taste, carried to every city.</h2>
          <p>Make it once. Every city you open is read through it, and the places you save wait for the next trip.</p>
        </div>
        <OpenQuizButton />
      </section>
    </>
  );
}
