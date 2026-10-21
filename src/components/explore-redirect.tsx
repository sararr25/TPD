"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { citySlug } from "@/lib/discovery";
import { useCity } from "./use-city";

// /explore without a city: open the last city used on this browser (or Paris).
export function ExploreRedirect() {
  const router = useRouter();
  const [city, , known] = useCity();
  useEffect(() => {
    if (known) router.replace(`/${citySlug(city)}`);
  }, [known, city, router]);
  return <p className="page-status">Opening {known ? city : "your city"}…</p>;
}
