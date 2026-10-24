"use client";
import Link from "next/link";
import { useNavContext } from "./use-nav-context";
import { NAV_LINKS } from "./nav-links";

// The main menu marks the page you are on (docs/22 F23).
export function MainNav() {
  const { current, swapHref } = useNavContext();
  return (
    <nav aria-label="Main">
      {NAV_LINKS.map(([href, label, short]) => (
        <Link key={href} href={href === "/swap" ? swapHref : href} aria-label={short ? label : undefined} aria-current={current === href ? "page" : undefined}>
          {short ? (
            <>
              <span className="nav-full">{label}</span>
              <span className="nav-short" aria-hidden>
                {short}
              </span>
            </>
          ) : (
            label
          )}
        </Link>
      ))}
    </nav>
  );
}
