"use client";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useVisitedCities } from './use-visited-cities';
import { CityView } from './city-view';
import { CITIES, CATEGORY_LABELS, exploreCategory } from '@/lib/discovery';
import { LoadingCards } from './empty-state';
export function PassportMatches() {
  const history=useVisitedCities(), search=useSearchParams(), router=useRouter();
  const category=exploreCategory(search.get('category')) || 'restaurant';
  const requested=search.get('city') || '';
  const city=Object.hasOwn(CITIES,requested)?requested:history.cities[0] || '';
  if (!history.loaded) return <LoadingCards label="Loading your cities…" count={1}/>;
  function choose(value:string) {const params=new URLSearchParams(search.toString());params.set('city',value);params.set('category',category);router.replace(`/passport/matches?${params}`,{scroll:false});}
  return <div className="pf-matches"><Link href="/passport">← Your Taste Passport</Link><header className="pf-match-heading"><div><span className="meta">Your taste → real places</span><h1>{CATEGORY_LABELS[category]} for your Passport</h1><p>Your favourites and quiz preferences guide the places you see in the city you choose.</p><p className="meta">Visited cities are starting points, not extra proof of taste. Hours and live music are not confirmed.</p></div><label>Choose a city<select value={city} onChange={e=>choose(e.target.value)}><option value="" disabled>Choose a city</option>{history.cities.length>0 && <optgroup label="Cities you’ve visited">{history.cities.map(c=><option key={c}>{c}</option>)}</optgroup>}<optgroup label="Other cities">{Object.keys(CITIES).filter(c=>!history.cities.includes(c)).map(c=><option key={c}>{c}</option>)}</optgroup></select></label></header>{!city?<div className="paper"><h2>Where would you like to explore?</h2><p>You haven’t added travel stamps yet. Choose a city above to see picks, or <Link href="/passport">add your stamps</Link>.</p></div>:<CityView key={`${history.owner}:${city}`} city={city}/>}</div>;
}
