import { HomeSearch } from "@/components/home-search";
import { HomeExample } from "@/components/home-example";
import { HomeCities } from "@/components/home-cities";
import { OpenQuizButton } from "@/components/quiz-panel";
import { HomeSwapDemo } from "@/components/home-swap-demo";

const STEPS = [
  ["Make your Passport", "A short quiz about how you travel and what you love. About 3 minutes, no account."],
  ["Open a city", "See popular places, or use your Passport for picks shaped by what you love."],
  ["Find its twin", "Name the place you wanted. Choose what to keep and what to change."],
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
            Find places you’ll love, <em>or a twin for the one that’s full.</em>
          </h1>
          <p className="h-lead">Pick a city to explore, or start from a place you wanted. A 3-minute quiz makes the picks personal.</p>
          <HomeSearch />
        </section>
        <HomeExample />
      </div>

      <HomeSwapDemo />

      <section className="h-how" aria-labelledby="h-how">
        <h2 id="h-how">A city guide shaped by what you love.</h2>
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
          <p>Your Taste Passport keeps your favourites together and helps choose places in each city. Save a few for your next trip.</p>
        </div>
        <OpenQuizButton />
      </section>
    </>
  );
}
