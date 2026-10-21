"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/explore", "Explore"],
  ["/passport", "Taste Passport"],
  ["/swap", "Swap a place"],
  ["/collections", "Collections"],
] as const;

// The main menu marks the page you are on (docs/22 F23).
export function MainNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main">
      {LINKS.map(([href, label]) => (
        <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
