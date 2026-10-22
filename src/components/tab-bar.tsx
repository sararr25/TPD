"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cityFromSlug } from "@/lib/discovery";
import { NAV_LINKS } from "./nav-links";

// Mobile bottom tab bar (ADR 0001): the same four links as the header menu.
// Hidden on wide screens by src/styles/shell.css.
const ICONS: Record<string, React.ReactNode> = {
  "/explore": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5z" />
    </>
  ),
  "/swap": (
    <>
      <path d="M4 8h14l-3-3" />
      <path d="M20 16H6l3 3" />
    </>
  ),
  "/collections": <path d="M7 4h10v16l-5-3.5L7 20z" />,
  "/passport": (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="10" r="3" />
      <path d="M9 16h6" />
    </>
  ),
};

export function TabBar() {
  const path = usePathname();
  const current = cityFromSlug(path.slice(1)) ? "/explore" : path.startsWith("/passport") ? "/passport" : path;
  return (
    <nav className="tab-bar" aria-label="Main (mobile)">
      {NAV_LINKS.map(([href, label, short]) => (
        <Link key={href} href={href} aria-current={current === href ? "page" : undefined}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {ICONS[href]}
          </svg>
          <span>{short ?? label}</span>
        </Link>
      ))}
    </nav>
  );
}
