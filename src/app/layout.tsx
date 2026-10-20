import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthButton } from "@/components/auth-button";
export const metadata: Metadata = {
  title: "Beesyde · Taste Passport",
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
            <span className="ring">B</span>Beesyde
          </Link>
          <nav aria-label="Main">
            <Link href="/passport">Taste Passport</Link>
            <Link href="/swap">Swap a place</Link>
            <Link href="/collections">Collections</Link>
          </nav>
          <AuthButton />
        </header>
        <main>{children}</main>
        <footer>Beesyde · Your taste, a different way in.</footer>
      </body>
    </html>
  );
}
