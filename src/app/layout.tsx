import { Suspense } from "react";
import "@/styles/travel-tools.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { DM_Mono, Hanken_Grotesk, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { PassportStateProvider } from "@/components/passport-state";
import { AuthButton } from "@/components/auth-button";
import { MainNav } from "@/components/main-nav";
import { NAV_LINKS } from "@/components/nav-links";
import { TabBar } from "@/components/tab-bar";
import { ToastProvider } from "@/components/toast";
import { QuizPanelProvider } from "@/components/quiz-panel";
import { TravelMotion } from "@/components/travel-motion";
import { PlaceComparisonProvider } from "@/components/place-comparison";
import { TravelStateProvider } from "@/components/travel-state";
import { PlacePhotoProvider } from "@/components/place-photo-context";
// Type (ADR 0004): self-hosted by next/font, exposed as CSS variables that
// src/styles/tokens.css turns into --font-display / --font-body / --font-mono.
const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-instrument-serif",
});
const body = Hanken_Grotesk({
  weight: ["400", "500", "600"],
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-hanken-grotesk",
});
const mono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-mono",
});

// viewport-fit=cover lets the mobile tab bar pad for the iPhone home indicator.
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };
export const metadata: Metadata = {
  title: "Beesyde · Taste Passport",
  description: "Travel by taste: a short quiz, a Taste Passport, and places in 11 cities picked for you.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <ToastProvider>
          <header className="site-header">
            <Link className="brand" href="/">
              beesyde<span className="dot" aria-hidden="true">.</span>
            </Link>
            <div className="site-nav-slot"><Suspense fallback={<nav aria-label="Main">{NAV_LINKS.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav>}><MainNav /></Suspense></div>
            <AuthButton compact />
          </header>
          <main>
            <noscript><section className="paper"><h1>Your Taste Passport</h1><p>A city guide shaped by what you love. Enable JavaScript for personal picks and Twin searches.</p><a href="/explore">Browse cities</a></section></noscript>
            <PassportStateProvider><PlacePhotoProvider><TravelStateProvider><PlaceComparisonProvider><QuizPanelProvider><Suspense fallback={<div className="page-loading" role="status">Opening your city guide…</div>}><TravelMotion>{children}</TravelMotion></Suspense></QuizPanelProvider></PlaceComparisonProvider></TravelStateProvider></PlacePhotoProvider></PassportStateProvider>
          </main>
          <Suspense><TabBar /></Suspense>
          <footer>
            <div className="foot-top">
              <Link className="brand" href="/">
                beesyde<span className="dot" aria-hidden="true">.</span>
              </Link>
              <nav aria-label="Footer">
                {NAV_LINKS.map(([href, label]) => (
                  <Link key={href} href={href}>
                    {label}
                  </Link>
                ))}
                <Link href="/compare">Qloo vs AI</Link>
                <Link href="/photo-credits">Photo credits</Link>
              </nav>
            </div>
            <p>
              Picks by Qloo’s taste data · Hours, prices and bookings aren’t checked, so confirm before
              you go.
            </p>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
