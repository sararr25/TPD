"use client";
import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";
import { authClient } from "@/lib/auth/client";

type Photos = {
  read: (id: string, city: string) => string | null;
  loaded: (id: string, city: string, url: string) => void;
  failed: (id: string, city: string, url: string) => void;
};
const Context = createContext<Photos | null>(null);
const key = (id: string, city: string) => `${city}:${id.toLowerCase()}`;

// Successful Qloo image URLs only, for navigation within this mounted app.
// No image bytes, browser storage, signed tokens or server cache are added.
export function PlacePhotoProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const owner = session?.user?.id || "guest";
  const cache = useRef({ owner, photos: new Map<string, string>() });
  if (cache.current.owner !== owner) cache.current = { owner, photos: new Map() };
  const value = useMemo<Photos>(() => {
    const scope = cache.current;
    return {
      read: (id, city) => !isPending && cache.current === scope ? scope.photos.get(key(id, city)) || null : null,
      loaded: (id, city, url) => {
        // Identity, rather than just owner, also rejects late A → B → A loads.
        if (isPending || cache.current !== scope) return;
        try {
          const parsed = new URL(url);
          if (parsed.protocol !== "https:" || parsed.hostname !== "images.qloo.com") return;
        } catch { return; }
        scope.photos.delete(key(id, city));
        scope.photos.set(key(id, city), url);
        if (scope.photos.size > 60) scope.photos.delete(scope.photos.keys().next().value!);
      },
      failed: (id, city, url) => {
        if (cache.current === scope && scope.photos.get(key(id, city)) === url) scope.photos.delete(key(id, city));
      },
    };
  }, [owner, isPending]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePlacePhotos() { return useContext(Context); }
