"use client";
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import Link from 'next/link';
import {authClient} from '@/lib/auth/client';
import {chipTags,citySlug,placeCategory,type Entity,type ExploreCategory} from '@/lib/discovery';
import {priceSymbols} from '@/lib/price';
import {SaveButton,useSavedLists} from './save-button';
import {ActionIcon} from './action-icon';
type Compared={place:Entity;token:string;city:string;category:ExploreCategory;why:string|null};
const Context=createContext<{items:Compared[];toggle:(item:Compared)=>void}|null>(null);
export function PlaceComparisonProvider({children}:{children:ReactNode}){
 const {data:session,isPending}=authClient.useSession(),owner=session?.user?.id||'guest';
 const [stored,setStored]=useState<{owner:string;items:Compared[]}>({owner:'',items:[]});
 const items=!isPending&&stored.owner===owner?stored.items:[];
 const [message,setMessage]=useState('');const dialog=useRef<HTMLDialogElement>(null);
 const {lists,reload,signedIn}=useSavedLists(!isPending&&items.length>0,session?.user?.id,false);
 useEffect(()=>{dialog.current?.close();setStored({owner,items:[]});setMessage('');},[owner]);
 function toggle(item:Compared){
  if(isPending)return;
  const present=items.some(i=>i.place.id===item.place.id);
  if(!present&&items.length>=3){setMessage('Compare up to three places. Remove one to add another.');return;}
  setStored({owner,items:present?items.filter(i=>i.place.id!==item.place.id):[...items,item]});setMessage('');
 }
 const common=items.length>1?chipTags(items[0].place,placeCategory(items[0].category)||'restaurant').filter(t=>items.every(i=>i.place.tags.some(tag=>tag.id===t.id))):[];
 return <Context.Provider value={{items,toggle}}>{children}
  {items.length>0&&<aside className="comparison-tray" aria-label="Places selected for comparison"><strong>{items.length} of 3 places</strong><button className="btn btn-secondary" disabled={items.length<2} onClick={event=>{event.currentTarget.focus();dialog.current?.showModal();}}>Compare places</button><button className="btn btn-quiet" onClick={()=>{dialog.current?.close();setStored({owner,items:[]});setMessage('');}}>Clear comparison</button><span role="status">{message}</span></aside>}
  <dialog ref={dialog} className="comparison-dialog" aria-label="Compare places"><form method="dialog"><button className="btn btn-quiet">Close comparison</button></form><h2>Compare your places</h2><p>Available details from these results. Hours, prices and availability aren’t live-checked.</p><p><strong>Listed in all:</strong> {common.map(t=>t.name).join(' · ')||'No shared traits listed'}</p>
   <p className="comparison-scroll-hint">Scroll across to see every place.</p><div className="comparison-grid" role="region" aria-label="Place comparisons" tabIndex={0} style={{'--compare-count':Math.max(1,items.length)} as React.CSSProperties}>{items.map(item=><article key={item.place.id}>
    <span className="meta">{item.city}</span><h3><Link href={`/${citySlug(item.city)}/${item.place.id.toLowerCase()}`} onClick={()=>dialog.current?.close()}>{item.place.name}</Link></h3>
    <p>{priceSymbols(item.place.price)} · indicative tier</p><p>{item.place.address||'Address unavailable'}</p><p>{chipTags(item.place,placeCategory(item.category)||'restaurant').map(t=>t.name).join(' · ')||'No traits listed'}</p><p>{item.why||'No individual recommendation reason available.'}</p>
    <div className="travel-controls"><SaveButton place={item.place} token={item.token} city={item.city} lists={lists} signedIn={signedIn} onChange={reload}/>
    {item.place.lat!==null&&item.place.lon!==null&&<a className="btn btn-quiet" href={`https://www.google.com/maps/dir/?api=1&destination=${item.place.lat},${item.place.lon}`} target="_blank" rel="noreferrer">Directions <ActionIcon name="external"/></a>}
    <button className="btn btn-quiet" aria-label={`Remove ${item.place.name} from comparison`} onClick={()=>{toggle(item);if(items.length<=2)dialog.current?.close();}}>Remove</button></div></article>)}</div>
  </dialog></Context.Provider>;
}
export function ComparePlace({place,token,city,category,why}:Compared){const context=useContext(Context);if(!context||category==='neighbourhood')return null;const selected=context.items.some(i=>i.place.id===place.id);return <button className="btn btn-quiet" aria-pressed={selected} aria-label={`${selected?'Remove':'Compare'} ${place.name}${selected?' from comparison':''}`} onClick={()=>context.toggle({place,token,city,category,why})}>{selected?'In comparison':'Compare'}</button>;}
