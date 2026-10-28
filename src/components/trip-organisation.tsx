"use client";
import {useState} from 'react';
import type {SavedList,SavedItem} from '@/lib/saved';
import {useTravelState,TravelSyncNotice} from './travel-state';
import {useToast} from './toast';
export function TripGroups({list}:{list:SavedList}){
 const travel=useTravelState(),[name,setName]=useState('');
 const trip=travel.state.trips[list.id]||{groups:[],places:[]};
 async function add(value:string){if(!value.trim()||trip.groups.includes(value.trim())||trip.groups.length>=10)return;if(await travel.change({...travel.state,trips:{...travel.state.trips,[list.id]:{...trip,groups:[...trip.groups,value.trim()]}}}))setName('');}
 return <details className="travel-panel"><summary>Organise this trip</summary><p>Groups are your ideas, not bookings or a timed itinerary. Private notes stay with their places.</p><div className="travel-controls">{['To try','Saturday','Alternatives'].filter(g=>!trip.groups.includes(g)).map(g=><button key={g} className="btn btn-secondary" disabled={!travel.ready||travel.busy||trip.groups.length>=10} onClick={()=>void add(g)}>Add {g}</button>)}</div>
 <form onSubmit={e=>{e.preventDefault();void add(name);}}><label>New group<input maxLength={60} value={name} onChange={e=>setName(e.target.value)}/></label><button className="btn btn-secondary" disabled={!travel.ready||travel.busy||!name.trim()||trip.groups.length>=10}>Add group</button></form>
 <ul>{trip.groups.map(group=><li key={group}>{group} <button className="btn btn-quiet" disabled={travel.busy} aria-label={`Remove group ${group}`} onClick={()=>void travel.change({...travel.state,trips:{...travel.state.trips,[list.id]:{groups:trip.groups.filter(g=>g!==group),places:trip.places.map(p=>p.group===group?{...p,group:''}:p)}}})}>Remove group</button></li>)}</ul></details>;
}
export function TripPlaceTools({list,item}:{list:SavedList;item:SavedItem}){
 const travel=useTravelState();const trip=travel.state.trips[list.id]||{groups:[],places:[]};
 const group=trip.places.find(p=>p.id===item.placeId)?.group||'';
 const placements=list.items.map(i=>({id:i.placeId,group:trip.places.find(p=>p.id===i.placeId)?.group||''}));
 const index=placements.findIndex(p=>p.id===item.placeId);
 async function update(places:typeof placements){await travel.change({...travel.state,trips:{...travel.state.trips,[list.id]:{...trip,places}}});}
 function move(delta:number){const next=[...placements];[next[index],next[index+delta]]=[next[index+delta],next[index]];void update(next);}
 return <div className="trip-organise"><label>Group for {item.name}<select value={group} disabled={!travel.ready||travel.busy} onChange={e=>void update([...placements.filter(p=>p.id!==item.placeId),{id:item.placeId,group:e.target.value}])}><option value="">Ungrouped</option>{trip.groups.map(g=><option key={g}>{g}</option>)}</select></label><div className="travel-controls"><button className="btn btn-quiet" disabled={travel.busy||!travel.ready||index<=0||placements[index-1]?.group!==group} aria-label={`Move up ${item.name}`} onClick={()=>move(-1)}>Move up</button><button className="btn btn-quiet" disabled={travel.busy||!travel.ready||index===placements.length-1||placements[index+1]?.group!==group} aria-label={`Move down ${item.name}`} onClick={()=>move(1)}>Move down</button></div></div>;
}
function OwnedVisitControl({id,showErrors}:{id:string;showErrors:boolean}){
 const travel=useTravelState(),toast=useToast();const visit=travel.state.visits.find(v=>v.id===id.toLowerCase());
 const [verdict,setVerdict]=useState<'again'|'not-for-me'|''>(''),[reason,setReason]=useState('');
 async function save(){const before=travel.state.visits;const next={id:id.toLowerCase(),at:visit?.at||new Date().toISOString(),verdict:verdict||null,reason:reason.trim()};
 if(await travel.change({...travel.state,visits:[...before.filter(v=>v.id!==next.id),next]}))toast('Visit feedback saved. Your Passport and saved place stay unchanged.');}
 return <details className="trip-organise" onToggle={event=>{if(event.currentTarget.open){setVerdict(visit?.verdict||'');setReason(visit?.reason||'');}}}><summary>{visit?'Your visit feedback':'I visited this place'}</summary><p>Only mark places you actually visited. This private feedback does not change your Passport, hide this place or mark its city visited.</p>{visit&&<><p>Marked visited · {new Date(visit.at).toLocaleDateString('en-GB')}{visit.verdict&&` · ${visit.verdict==='again'?'Would go again':'Not for me'}`}</p>{visit.reason&&<p>{visit.reason}</p>}<button className="btn btn-quiet" disabled={travel.busy} onClick={()=>void travel.change({...travel.state,visits:travel.state.visits.filter(v=>v.id!==visit.id)})}>Undo visit and feedback</button></>}
 {showErrors&&<TravelSyncNotice/>}<form onSubmit={e=>{e.preventDefault();void save();}}><label>Your experience<select value={verdict} onChange={e=>setVerdict(e.target.value as typeof verdict)}><option value="">No rating</option><option value="again">Would go again</option><option value="not-for-me">Not for me</option></select></label><label>Why? Optional and private<textarea value={reason} maxLength={280} onChange={e=>setReason(e.target.value)}/></label><button className="btn btn-secondary" disabled={!travel.ready||travel.busy||(!visit&&travel.state.visits.length>=100)}>{visit?'Update visit feedback':'Mark as visited'}</button></form></details>;
}

export function PlaceVisitControl({id,showErrors=true}:{id:string;showErrors?:boolean}){const travel=useTravelState();return <OwnedVisitControl key={travel.owner} id={id} showErrors={showErrors}/>;}
