import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = {
  title: "TPD · Taste Passport",
  description: "Keep what you love. Change what does not work.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="notice">
          PARIS PILOT · Live Qloo taste recommendations · Operational details
          unverified
        </div>
        <header>
          <Link className="brand" href="/">
            <span className="ring">TPD</span>TPD
          </Link>
          <nav aria-label="Main">
            <Link href="/passport">Taste Passport</Link>
            <Link href="/swap">Swap a place</Link>
          </nav>
          <span className="meta">Guest edition</span>
        </header>
        <main>{children}</main>
        <footer>TPD · Working name · Your taste, a different way in.</footer>
      </body>
    </html>
  );
}
