"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cityFromSlug } from "@/lib/discovery";
import { NAV_LINKS } from "./nav-links";

// The main menu marks the page you are on (docs/22 F23).
export function MainNav() {
  const path = usePathname();
  // City pages (/lisbon…) are where Cities live now (docs/24).
  const current = cityFromSlug(path.slice(1)) ? "/explore" : path;
  return (
    <nav aria-label="Main">
      {NAV_LINKS.map(([href, label, short]) => (
        <Link key={href} href={href} aria-label={short ? label : undefined} aria-current={current === href ? "page" : undefined}>
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
