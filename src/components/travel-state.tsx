"use client";
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {authClient} from '@/lib/auth/client';
import {emptyTravel,parseTravel,validateTravel,type TravelState} from '@/lib/travel-state';
type ContextValue={owner:string;state:TravelState;ready:boolean;busy:boolean;error:string;change:(next:TravelState)=>Promise<boolean>;retry:()=>void;reload:()=>void};
const Context=createContext<ContextValue|null>(null);
export const TRAVEL_KEY='beesyde-travel-v1:guest';
export function TravelStateProvider({children}:{children:ReactNode}){
 const {data:session,isPending}=authClient.useSession(),owner=session?.user?.id||'guest';
 const generation=useRef({owner});if(generation.current.owner!==owner)generation.current={owner};
 const [snapshot,setSnapshot]=useState({owner:'',state:emptyTravel(),revision:0,ready:false,error:''});
 const [busy,setBusy]=useState(false),[attempt,setAttempt]=useState(0);
 const lock=useRef<object|null>(null);
 const pending=useRef<{scope:object;state:TravelState}|null>(null);
 async function request(method:string,body?:object){
  const response=await fetch('/api/travel-state',{method,headers:{'Content-Type':'application/json','X-Beesyde-User':owner},body:body?JSON.stringify(body):undefined});
  const result=await response.json();
  if(!response.ok)throw new Error(response.status===409?'Your trip changed on another device. Reload before editing again.':'Your trip changes could not sync. Try again.');
  return result;
 }
 useEffect(()=>{
  if(isPending)return;const scope=generation.current;let active=true;
  setBusy(false);pending.current=null;
  (async()=>{
   const value=owner==='guest'?{state:parseTravel(localStorage.getItem(TRAVEL_KEY)),revision:0}:await request('GET');
   if(active&&generation.current===scope)setSnapshot({owner,state:validateTravel(value.state),revision:value.revision,ready:true,error:''});
  })().catch(e=>{if(active&&generation.current===scope)setSnapshot({owner,state:emptyTravel(),revision:0,ready:owner==='guest',error:owner==='guest'?'Browser storage is unavailable. Changes last while this page stays open.':e.message});});
  return()=>{active=false;};
 },[owner,isPending,attempt]);
 async function change(next:TravelState){
  if(lock.current===generation.current||isPending||snapshot.owner!==owner||!snapshot.ready)return false;
  const scope=generation.current;let state:TravelState;
  try{state=validateTravel(next);}catch{setSnapshot(s=>({...s,error:'This trip has reached its organisation limit. Remove an old group or clear trip organisation in Settings.'}));return false;}
  pending.current={scope,state};lock.current=scope;setBusy(true);
  try{
   let revision=snapshot.revision;
   if(owner==='guest')localStorage.setItem(TRAVEL_KEY,JSON.stringify(state));else revision=(await request('PUT',{state,revision})).revision;
   if(generation.current!==scope)return false;
   pending.current=null;setSnapshot({owner,state,revision,ready:true,error:''});return true;
  }catch(e){if(generation.current===scope)setSnapshot(s=>({...s,state,error:(e as Error).message}));return false;}
  finally{if(lock.current===scope)lock.current=null;if(generation.current===scope)setBusy(false);}
 }
 const visible=!isPending&&snapshot.owner===owner;
 return <Context.Provider value={{owner:!isPending?owner:"pending",state:visible?snapshot.state:emptyTravel(),ready:visible&&snapshot.ready,busy,error:visible?snapshot.error:'',change,retry:()=>{if(pending.current?.scope===generation.current)void change(pending.current.state);else setAttempt(n=>n+1);},reload:()=>setAttempt(n=>n+1)}}>{children}</Context.Provider>;
}
export function useTravelState(){const value=useContext(Context);if(!value)throw new Error('Travel provider missing');return value;}
