"use client";
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useSavedLists} from './save-button';
import {authClient} from '@/lib/auth/client';
import {parseSearch,searchKey,type SearchDraft} from '@/lib/search-draft';
export function ResumeSearch(){
 const {data:session,isPending}=authClient.useSession(),owner=session?.user?.id||'guest';
 const {lists}=useSavedLists(!isPending,session?.user?.id,false);
 const recent=[...lists].sort((a,b)=>Math.max(0,...b.items.map(i=>Date.parse(i.savedAt)||0))-Math.max(0,...a.items.map(i=>Date.parse(i.savedAt)||0)))[0];
 const [snapshot,setSnapshot]=useState<{owner:string;draft:SearchDraft|null}>({owner:'',draft:null});
 useEffect(()=>{if(isPending)return;try{setSnapshot({owner,draft:parseSearch(localStorage.getItem(searchKey(owner)))});}catch{setSnapshot({owner,draft:null});}},[owner,isPending]);
 const draft=!isPending&&snapshot.owner===owner?snapshot.draft:null;
 if(!draft&&!recent)return null;
 return <section className="travel-panel" aria-label="Recent search"><h2>Pick up where you left off</h2>{draft&&<><p>{draft.reference.name} · {draft.city}</p><p>For this search: {draft.choices.filter(c=>c.mode==='keep').length} preferences, {draft.choices.filter(c=>c.mode==='change').length} exclusions. Your starting place needs a fresh check.</p><Link className="btn btn-secondary" href={`/swap?${new URLSearchParams({city:draft.city,category:draft.category,resume:'1'})}`}>Resume search</Link><Link className="btn btn-quiet" href="/collections">Open saved trips</Link><button className="btn btn-quiet" onClick={()=>{try{localStorage.removeItem(searchKey(owner));}catch{}setSnapshot({owner,draft:null});}}>Forget recent search</button></>}{recent&&<p><Link className="btn btn-secondary" href={`/collections#trip-${encodeURIComponent(recent.id)}`}>Continue {recent.name}</Link></p>}</section>;
}
