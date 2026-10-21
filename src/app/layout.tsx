import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthButton } from "@/components/auth-button";
import { MainNav } from "@/components/main-nav";
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
          <div className="notice">
            11 cities · Taste picks by Qloo · Check hours and prices before you go
          </div>
          <header>
            <Link className="brand" href="/">
              <span className="ring">B</span>Beesyde
            </Link>
            <MainNav />
            <AuthButton />
          </header>
          <main>{children}</main>
          <footer>Beesyde · Travel by taste.</footer>
        </ToastProvider>
      </body>
    </html>
  );
}
