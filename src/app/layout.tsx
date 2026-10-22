import type { Metadata } from "next";
import Link from "next/link";
import { DM_Mono, Hanken_Grotesk, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AuthButton } from "@/components/auth-button";
import { MainNav } from "@/components/main-nav";
import { NAV_LINKS } from "@/components/nav-links";
import { ToastProvider } from "@/components/toast";
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
          <header>
            <Link className="brand" href="/">
              beesyde<span className="dot" aria-hidden="true">.</span>
            </Link>
            <MainNav />
            <AuthButton compact />
          </header>
          <main>{children}</main>
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
