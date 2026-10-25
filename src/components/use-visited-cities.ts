"use client";
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/client';
import { loadVisited, VISITED_CHANGED, type VisitedSnapshot } from '@/lib/visited-cities-client';
const empty: VisitedSnapshot = { cities: [], pending: false, syncAvailable: false, message: '' };
export function useVisitedCities() {
  const { data: session, isPending } = authClient.useSession();
  const owner = session?.user?.id || 'guest';
  const [snapshot, setSnapshot] = useState<{ owner: string; data: VisitedSnapshot }>({ owner: '', data: empty });
  useEffect(() => {
    if (isPending) return;
    let active = true, version = 0;
    const load = () => {
      const request = ++version;
      loadVisited(owner).then(data => { if (active && request === version) setSnapshot({ owner, data }); });
    };
    load();
    window.addEventListener(VISITED_CHANGED, load);
    window.addEventListener('storage', load);
    return () => { active = false; window.removeEventListener(VISITED_CHANGED, load); window.removeEventListener('storage', load); };
  }, [owner, isPending]);
  const loaded = !isPending && snapshot.owner === owner;
  return { owner, loaded, ...(loaded ? snapshot.data : empty) };
}
