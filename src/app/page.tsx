import { InkJourney } from "@/components/ink-journey";
import { ResumeSearch } from "@/components/resume-search";
import { PassportPrompt } from "@/components/passport-state";
import { HomeSearch } from "@/components/home-search";
import { HomeExample } from "@/components/home-example";
import { HomeCities } from "@/components/home-cities";
import { HomeSwapDemo } from "@/components/home-swap-demo";
import { HomePassportMotion } from "@/components/home-passport-motion";
import { PassportEmblem, PassportSecurityLines } from "@/components/passport-art";

const STEPS = [
  ["Make your Passport", "A short quiz about how you travel and what you love. About 3 minutes, no account."],
  ["Open a city", "See popular places, or use your Passport for picks shaped by what you love."],
  ["Find its twin", "Name the place you wanted. Keep the traits you love. Leave the rest behind."],
];

// Owner-selected direction A: the existing cover and live example, bound
// into one Passport. The two product entrances retain their real behavior.
export default function Home() {
  return (
    <HomePassportMotion>
      <div className="h-opening-line">
        <span>A city guide shaped by what you love.</span>
        <a href="#cities">Skip to cities ↓</a>
      </div>
      <div className="h-hero">
        <section className="h-cover" aria-labelledby="h-title">
          <PassportSecurityLines />
          <div className="h-cover-top" aria-hidden="true"><span>Beesyde</span><span>Personal city guide</span></div>
          <div className="h-cover-heading">
            <span className="h-cover-kicker">Taste Passport</span>
            <h1 id="h-title">Your taste.<br /><em>Your next place.</em></h1>
            <p className="h-lead">Find places you’ll love, or a twin for the one that’s full. A 3-minute quiz makes the picks personal.</p>
          </div>
          <HomeSearch />
          <div className="h-emblem-depth"><PassportEmblem /></div>
          <div className="h-cover-bottom" aria-hidden="true"><span>Made of what you love</span><span>Open to somewhere new ↗</span></div>
        </section>
        <HomeExample />
      </div>
      <div className="h-reading-note"><span>Your taste → Your city → Your next place</span></div>

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

      <ResumeSearch /><HomeCities />

      <section className="h-band ink-home-ending" aria-labelledby="h-band">
        <PassportEmblem className="h-band-emblem" />
        <div>
          <h2 id="h-band">Fill it with <em>what you love.</em></h2>
          <p>Your Taste Passport keeps your favourites together and helps choose places in each city. About 3 minutes to make it personal.</p>
          <PassportPrompt />
        </div>
        <InkJourney />
      </section>
    </HomePassportMotion>
  );
}
