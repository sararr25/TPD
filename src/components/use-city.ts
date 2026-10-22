"use client";
import { useEffect, useRef, useState } from "react";
import { CITIES, cityFromSlug } from "@/lib/discovery";
import { authClient } from "@/lib/auth/client";
import { loadStamps, recordStamp } from "@/lib/stamps-client";
import { useToast } from "./toast";

const CITY_KEY = "beesyde-city-v1";

// One city across Explore and Swap (docs/22 F11): a ?city= link wins, then
// the last city used on this browser, then Paris. Remembering is only a
// convenience: if storage is blocked the chosen city still works this visit.
// `resolved` turns true once the remembered or linked city is known.
export function useCity(): [string, (city: string) => void, boolean] {
  const toast = useToast();
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const recorded = useRef<string | null>(null);
  const [city, setCity] = useState("Paris"),
    [resolved, setResolved] = useState(false);
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(CITY_KEY);
    } catch {}
    const linked = new URLSearchParams(window.location.search).get("city");
    const first = [linked, stored].find((c) => c && Object.hasOwn(CITIES, c));
    if (first) choose(first);
    setResolved(true);
    // Runs once on mount; `choose` only sets state and storage.
  }, []);
  // Sign-in adopts any pending browser stamps. The queued API binds writes
  // to this user so an account switch cannot receive another user's history.
  useEffect(() => {
    if (isPending || !userId) return;
    loadStamps(userId).catch(e => toast((e as Error).message, { error: true }));
  }, [isPending, userId, toast]);
  // A stored/default city used by the Home search is not an opened guide.
  // Record only the city in the actual URL, including a direct Place link.
  useEffect(() => {
    if (isPending) return;
    const opened = cityFromSlug(window.location.pathname.split("/")[1] || "");
    if (!opened) return;
    const key = `${userId ?? "guest"}:${opened}`;
    if (recorded.current === key) return;
    recorded.current = key;
    recordStamp({ kind: "city", city: opened, createdAt: new Date().toISOString() }, userId)
      .catch(e => toast((e as Error).message, { error: true }));
  }, [city, isPending, userId, toast]);
  function choose(next: string) {
    setCity(next);
    try {
      localStorage.setItem(CITY_KEY, next);
    } catch {}
  }
  return [city, choose, resolved];
}
