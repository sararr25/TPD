import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthButton } from "@/components/auth-button";
import { MainNav } from "@/components/main-nav";
import { NAV_LINKS } from "@/components/nav-links";
import { ToastProvider } from "@/components/toast";
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
        <ToastProvider>
          <header>
            <Link className="brand" href="/">
              beesyde<span className="dot" aria-hidden="true">.</span>
            </Link>
            <MainNav />
            <AuthButton />
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
              </nav>
            </div>
            <p>
              11 cities · Picks by Qloo’s taste data · Hours, prices and bookings aren’t checked, so confirm before
              you go.
            </p>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
