import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthButton } from "@/components/auth-button";
export const metadata: Metadata = {
  title: "Beesyde · Taste Passport",
  description: "Travel by taste: a short quiz, a Taste Passport, and places in 11 cities picked for you.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="notice">
          11 cities · Taste picks by Qloo · Check hours and prices before you go
        </div>
        <header>
          <Link className="brand" href="/">
            <span className="ring">B</span>Beesyde
          </Link>
          <nav aria-label="Main">
            <Link href="/explore">Explore</Link>
            <Link href="/passport">Taste Passport</Link>
            <Link href="/swap">Swap a place</Link>
            <Link href="/collections">Collections</Link>
          </nav>
          <AuthButton />
        </header>
        <main>{children}</main>
        <footer>Beesyde · Travel by taste.</footer>
      </body>
    </html>
  );
}
