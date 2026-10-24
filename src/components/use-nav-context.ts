"use client";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CITIES, cityFromSlug, citySlug } from "@/lib/discovery";
export function useNavContext() {
  const path = usePathname();
  const search = useSearchParams();
  const city = cityFromSlug(path.split("/")[1] || "");
  const [stored, setStored] = useState<string | null>(null);
  useEffect(() => {
    try {
      const value = localStorage.getItem("beesyde-city-v1");
      setStored(value && Object.hasOwn(CITIES, value) ? value : null);
    } catch {}
  }, [path]);
  const known = city || stored;
  return {
    current: city
      ? search.get("tab") === "swap"
        ? "/swap"
        : "/explore"
      : path.startsWith("/passport")
        ? "/passport"
        : path,
    swapHref: known ? `/${citySlug(known)}?tab=swap` : "/swap",
  };
}
