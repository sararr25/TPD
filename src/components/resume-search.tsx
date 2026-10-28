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
 const target=draft?`/swap?${new URLSearchParams({city:draft.city,category:draft.category,resume:'1'})}`:`/collections#trip-${encodeURIComponent(recent!.id)}`;
 return <section className="h-resume-entry" aria-label="Recent search"><div><span className="meta">Pick up where you left off</span><strong>{draft?`${draft.reference.name} · ${draft.city}`:recent!.name}</strong></div><Link className="btn btn-secondary" href={target}>{draft?'Resume search':'Open saved trip'}</Link>{draft&&<button className="btn btn-quiet" aria-label="Forget recent search" onClick={()=>{try{localStorage.removeItem(searchKey(owner));}catch{}setSnapshot({owner,draft:null});}}>Forget</button>}</section>;
}
