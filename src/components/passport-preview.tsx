"use client";
import { recommendationCopy } from "@/lib/recommendation-copy";
import { ActionIcon } from "./action-icon";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CITIES, citySlug, type Entity, type ExploreCategory } from '@/lib/discovery';
import { discovery } from '@/lib/discovery-client';
import { loadFeedback, loadHidden } from '@/lib/account';
import { feedbackSignal } from '@/lib/feedback';
import { usePassportState, PassportPrompt } from './passport-state';
import { useVisitedCities } from './use-visited-cities';
import { PlacePhoto } from './place-photo';
import { LoadingCards } from './empty-state';
type Payload = { results: { place: Entity; token: string }[] };
export function PassportPreview({ category, title }: { category: ExploreCategory; title: string }) {
  const passport = usePassportState(), history = useVisitedCities();
  const [chosen, setChosen] = useState(''), [attempt, setAttempt] = useState(0);
  const city = chosen || history.cities[0] || '';
  const key = JSON.stringify({ owner: passport.owner, city, category, tokens: passport.selections.map(s=>s.token), quiz: passport.quiz });
  const [snapshot, setSnapshot] = useState<{ key: string; data?: Payload; error?: string }>({ key: '' });
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(()=>{ heading.current?.focus({preventScroll:true}); },[]);
  useEffect(()=>{
    if (!city || !history.loaded || passport.state !== 'ready' || passport.selections.length < 3) return;
    const controller = new AbortController(); let active = true;
    setSnapshot({key});
    const input = JSON.parse(key) as { owner: string; city: string; category: ExploreCategory; tokens: string[]; quiz: object };
    (async()=>{
      const [hidden, feedback] = await Promise.all([loadHidden(input.owner !== 'guest',input.owner==='guest'?undefined:input.owner),loadFeedback(input.owner !== 'guest',input.owner==='guest'?undefined:input.owner)]);
      if (!active) return;
      const data = await discovery<Payload>({action:'explore', city:input.city, category:input.category, passport:input.tokens, quiz:input.quiz, exclude:hidden.map(p=>p.id), feedback:feedbackSignal(feedback)},controller.signal);
      if (active) setSnapshot({key,data});
    })().catch(error=>{if(active && error.name!=='AbortError') setSnapshot({key,error:error.message});});
    return ()=>{active=false;controller.abort();};
  },[key,attempt,history.loaded,passport.state,passport.selections.length,city]);
  const current = snapshot.key === key ? snapshot : null;
  const canSearch = passport.state === 'ready' && passport.selections.length >= 3;
  const reasons = recommendationCopy(current?.data?.results.slice(0,3).map(r => r.place) || [], passport.selections);
  return <section className="pf-preview" aria-label={title}>
    <h4 ref={heading} tabIndex={-1}>A few places for you</h4>
    <label>Explore in<select value={city} onChange={e=>setChosen(e.target.value)} disabled={!history.loaded}><option value="" disabled>Choose a city</option>{history.cities.length>0 && <optgroup label="Cities you’ve visited">{history.cities.map(c=><option key={c}>{c}</option>)}</optgroup>}<optgroup label="Other cities">{Object.keys(CITIES).filter(c=>!history.cities.includes(c)).map(c=><option key={c}>{c}</option>)}</optgroup></select></label>
    {!city ? <p>Choose a city to see your matches. You can add travel stamps whenever you like.</p> : !canSearch ? <><p>Personal matches will appear here once your Passport is ready.</p><PassportPrompt/></> : current?.error ? <div role="status"><p>{current.error}</p><button className="btn btn-secondary" onClick={()=>setAttempt(a=>a+1)}>Try again</button></div> : !current?.data ? <LoadingCards label={`Finding places in ${city}…`} count={3}/> : !current.data.results.length ? <p role="status">No matches in this category today. Try another city.</p> : <>{reasons.summary && <p>{reasons.summary}</p>}<div className="pf-preview-grid">{current.data.results.slice(0,3).map(({place})=>{
      return <article className="pf-mini-place" key={place.id}><div className="pf-mini-photo"><PlacePhoto placeId={place.id} image={place.image} city={city} lazy/></div><div><span className="meta">{city}</span><h5><Link href={`/${citySlug(city)}/${place.id.toLowerCase()}`}>{place.name}</Link></h5><p>{reasons.why(place) || 'Picked for your Passport'}</p></div></article>;
    })}</div></>}
    {city && <Link className="pf-all-matches" href={`/passport/matches?${new URLSearchParams({category,city})}`}>See all matches in {city} <ActionIcon name="external" /></Link>}
  </section>;
}
