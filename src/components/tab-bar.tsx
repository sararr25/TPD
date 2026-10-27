"use client";
import { ActionIcon } from "./action-icon";
import Link from "next/link";
import { useNavContext } from "./use-nav-context";
import { NAV_LINKS } from "./nav-links";

// Mobile bottom tab bar (ADR 0001): the same four links as the header menu.
// Hidden on wide screens by src/styles/shell.css.
const ICONS = { "/explore": "compass", "/swap": "twin", "/collections": "bookmark", "/passport": "passport" } as const;

export function TabBar() {
  const { current, swapHref } = useNavContext();
  return (
    <nav className="tab-bar" aria-label="Main (mobile)">
      {NAV_LINKS.map(([href, label, short]) => (
        <Link key={href} href={href === "/swap" ? swapHref : href} aria-current={current === href ? "page" : undefined}>
          <ActionIcon name={ICONS[href as keyof typeof ICONS]} navigation />
          <span>{short ?? label}</span>
        </Link>
      ))}
    </nav>
  );
}
