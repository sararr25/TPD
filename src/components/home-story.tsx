"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cityCover } from "@/lib/city-covers";
import { PassportPrompt } from "./passport-state";
import { HomeCities } from "./home-cities";
import { HomeSwapDemo } from "./home-swap-demo";
import "@/styles/home-story.css";
gsap.registerPlugin(useGSAP, ScrollTrigger);
export function HomeStory() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        root.current
          ?.querySelectorAll<HTMLElement>(".story-art")
          .forEach((art) => {
            gsap.from(art, {
              y: 24,
              rotation: -2,
              duration: 0.65,
              ease: "power2.out",
              scrollTrigger: { trigger: art, start: "top 92%", once: true },
            });
          });
      });
      return () => media.revert();
    },
    { scope: root },
  );
  return (
    <div className="home-story" ref={root}>
      <div className="story-top">
        <span className="meta">A little more you. A little less obvious.</span>
        <a href="#story-cities" className="btn btn-quiet">
          Skip the story ↓
        </a>
      </div>
      <section className="story-opening">
        <div>
          <span className="meta">01 / Your taste</span>
          <h1>
            The city has
            <br />a side <em>for you.</em>
          </h1>
          <p className="lead">
            The music you stay up for. The places you return to. Let what you
            love lead you somewhere new.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" href="/explore">
              Find my city
            </Link>
            <Link className="btn btn-secondary" href="/swap">
              Find a place’s twin
            </Link>
          </div>
          <p className="muted">
            Start exploring now. Your Passport makes it personal.
          </p>
          <PassportPrompt />
        </div>
        <div className="story-art story-passport">
          <span className="meta">Example Passport · not your profile</span>
          <p className="story-book-title">
            Good music.
            <br />
            Long lunches.
            <br />
            <em>One more street.</em>
          </p>
          <div className="story-tastes">
            <span>Khruangbin</span>
            <span>Nina Simone</span>
            <span>Before Sunrise</span>
          </div>
          <span className="story-seal" aria-label="Example Lisbon stamp">
            LIS
            <br />
            NEXT STOP
          </span>
          <span className="meta">BEESYDE / TASTE PASSPORT</span>
        </div>
      </section>
      <section className="story-scene">
        <figure className="story-art story-city">
          <img
            src={cityCover("Lisbon", "1200x")!}
            alt="Lisbon city view"
            onError={(e) => {
              e.currentTarget.hidden = true;
            }}
          />
          <figcaption>Lisbon · city photo</figcaption>
        </figure>
        <div>
          <span className="meta">02 / Your city</span>
          <h2>
            A familiar feeling.
            <br />
            <em>A new address.</em>
          </h2>
          <p>
            From your next table to a museum afternoon. Browse Lisbon, then let
            your favourites shape the picks.
          </p>
          <Link className="btn btn-secondary" href="/lisbon">
            Explore Lisbon →
          </Link>
          <p className="muted">
            Personal matches appear in the guide when there’s taste evidence.
          </p>
        </div>
      </section>
      <section className="story-scene story-next">
        <div>
          <span className="meta">03 / Your next place</span>
          <h2>
            Keep the feeling.
            <br />
            <em>Change the plan.</em>
          </h2>
          <p>
            The place you wanted is full? Start there. Tell us what to keep and
            what to exclude, and find its twin.
          </p>
          <Link className="btn btn-primary" href="/lisbon?tab=swap">
            Find its twin →
          </Link>
        </div>
        <div
          className="story-art story-pair"
          aria-label="Illustration of Keep and Delete, not search results"
        >
          <span className="meta">How it works · illustration</span>
          <div>
            <strong>The place you wanted</strong>
            <span className="story-keep">Keep · Seafood</span>
          </div>
          <span aria-hidden>↓</span>
          <div>
            <strong>A different way to spend the evening</strong>
            <span className="story-change">Delete · Casual</span>
          </div>
          <p className="muted">
            You choose the traits. We search for alternatives.
          </p>
        </div>
      </section>
      <div id="story-cities" tabIndex={-1}>
        <HomeCities />
      </div>
      <HomeSwapDemo />
    </div>
  );
}
