"use client";
import { useRef, useState } from 'react';
import { CITIES } from '@/lib/discovery';
import { cleanVisitedCities } from '@/lib/home-cities';
import { saveVisited } from '@/lib/visited-cities-client';
import { useVisitedCities } from './use-visited-cities';
export function VisitedCities({ onSaved }: { onSaved?: (message: string) => void } = {}) {
  const history = useVisitedCities();
  const ownerRef = useRef(history.owner); ownerRef.current = history.owner;
  const [draft, setDraft] = useState<{ owner: string; cities: string[] } | null>(null);
  const [busyOwner, setBusyOwner] = useState('');
  const [status, setStatus] = useState({ owner: '', text: '' });
  const cities = !history.loaded ? [] : draft?.owner === history.owner ? draft.cities : history.cities;
  const dirty = JSON.stringify(cleanVisitedCities(cities)) !== JSON.stringify(history.cities);
  const busy = busyOwner === history.owner;
  async function save() {
    if (!history.loaded || busy) return;
    const owner = history.owner, submitted = cities;
    setBusyOwner(owner); setStatus({ owner, text: '' });
    try {
      const result = await saveVisited(owner, submitted, history.syncAvailable);
      setDraft(previous => previous?.owner === owner ? null : previous);
      setStatus({ owner, text: result.message });
      if (!result.pending && ownerRef.current === owner) onSaved?.(result.message);
    } catch (error) {
      setStatus({ owner, text: error instanceof Error ? error.message : 'These changes could not be saved. Please try again.' });
    } finally { setBusyOwner(previous => previous === owner ? '' : previous); }
  }
  return <section className="visited-cities paper" aria-labelledby="visited-cities-title">
    <h2 id="visited-cities-title">Cities you’ve visited</h2>
    <p>Tell us where you’ve been. Opening a guide never marks a real visit. We use these choices after your Passport favourites when choosing cities for Home.</p>
    <fieldset disabled={!history.loaded || busy}><legend>Which of these cities have you visited?</legend>
      {[{title:'Already stamped',list:Object.keys(CITIES).filter(c=>history.cities.includes(c))},{title:'Add to your travels',list:Object.keys(CITIES).filter(c=>!history.cities.includes(c))}].filter(group=>group.list.length).map(group=><div className="pf-city-group" key={group.title}><h3>{group.title}</h3><div className="visited-city-options">{group.list.map(city=><label key={city} data-changed={cities.includes(city)!==history.cities.includes(city) || undefined}>
        <input type="checkbox" checked={cities.includes(city)} onChange={event=>{const next=event.target.checked?[...cities,city]:cities.filter(c=>c!==city);setDraft({owner:history.owner,cities:cleanVisitedCities(next)});setStatus({owner:history.owner,text:''});}}/>{city}{cities.includes(city)!==history.cities.includes(city) && <small>{cities.includes(city)?'Adding':'Removing'}</small>}
      </label>)}</div></div>)}
    </fieldset>
    {!history.loaded && <p role="status">Loading your visited cities…</p>}
    {history.loaded && history.message && <p className="meta">{history.message}</p>}
    <button className="btn btn-secondary" disabled={!history.loaded || busy || (!dirty && !history.pending)} onClick={save}>{busy ? 'Saving…' : history.pending ? 'Save visited cities again' : 'Save visited cities'}</button>
    <p role="status" aria-live="polite">{history.loaded && status.owner === history.owner ? status.text : ''}</p>
  </section>;
}
