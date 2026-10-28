"use client";
import {createContext,useContext,useEffect,useId,useRef,useState,type ReactNode} from 'react';
import Link from 'next/link';
import {authClient} from '@/lib/auth/client';
import {chipTags,citySlug,placeCategory,type Entity,type ExploreCategory} from '@/lib/discovery';
import {priceSymbols} from '@/lib/price';
import {displayTags} from '@/lib/display-tags';
import {SaveButton,useSavedLists} from './save-button';
import {ActionIcon} from './action-icon';
type Compared={place:Entity;token:string;city:string;category:ExploreCategory;why:string|null};
const Context=createContext<{items:Compared[];toggle:(item:Compared)=>void}|null>(null);
export function PlaceComparisonProvider({children}:{children:ReactNode}){
 const {data:session,isPending}=authClient.useSession(),owner=session?.user?.id||'guest';
 const [stored,setStored]=useState<{owner:string;items:Compared[]}>({owner:'',items:[]});
 const items=!isPending&&stored.owner===owner?stored.items:[];
 const [message,setMessage]=useState(''),[minimized,setMinimized]=useState(false),[activeId,setActiveId]=useState<string|null>(null);
 const headings=useRef(new Map<string,HTMLHeadingElement>());
 const uid=useId(),dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null),trayTitle=useRef<HTMLElement>(null),status=useRef<HTMLParagraphElement>(null);
 const {lists,reload,signedIn}=useSavedLists(!isPending&&items.length>0,session?.user?.id,false);
 useEffect(()=>{dialog.current?.close();setStored({owner,items:[]});setMessage('');setMinimized(false);setActiveId(null);},[owner]);
 function toggle(item:Compared){
  if(isPending)return;
  const present=items.some(i=>i.place.id===item.place.id);
  if(!present&&items.length>=3){setMessage('Compare up to three places. Remove one to add another.');return;}
  setStored({owner,items:present?items.filter(i=>i.place.id!==item.place.id):[...items,item]});setMessage('');
  if(!present)setMinimized(false);
 }
 function clear(){dialog.current?.close();setStored({owner,items:[]});setMessage('Comparison cleared.');status.current?.focus({preventScroll:true});}
 const common=items.length>1?chipTags(items[0].place,placeCategory(items[0].category)||'restaurant').filter(t=>items.every(i=>i.place.tags.some(tag=>tag.id===t.id))):[];
 const selectedId=items.find(item=>item.place.id===activeId)?.place.id||items[0]?.place.id;
 function selectPlace(id:string){setActiveId(id);requestAnimationFrame(()=>{const heading=headings.current.get(id);heading?.scrollIntoView({block:'nearest'});heading?.focus({preventScroll:true});});}
 return <Context.Provider value={{items,toggle}}>{children}
  <p ref={status} className="sr-only" role="status" tabIndex={-1}>{message}</p>
  {items.length>0&&<aside className="comparison-tray" aria-label="Places selected for comparison" data-minimized={minimized||undefined}>
   <strong ref={trayTitle} tabIndex={-1}>{items.length} of 3 places</strong>
   <span className="comparison-selected-names" title={items.map(i=>i.place.name).join(' · ')}>{items.map(i=>i.place.name).join(' · ')}</span>
   <button className="btn btn-quiet" aria-expanded={!minimized} aria-controls={uid+'-controls'} onClick={()=>setMinimized(!minimized)}>{minimized?'Expand comparison':'Minimize comparison'}</button>
   <div className="comparison-tray-controls" id={uid+'-controls'} hidden={minimized}>
    {items.length===1&&<span>Select one more place to compare.</span>}
    <button ref={trigger} className="btn btn-secondary" disabled={items.length<2} onClick={event=>{event.currentTarget.focus();dialog.current?.showModal();}}>Compare places</button>
    <button className="btn btn-quiet" onClick={clear}>Clear comparison</button>
   </div>
  </aside>}
  <dialog ref={dialog} className="comparison-dialog" style={{'--compare-count':Math.max(1,items.length)} as React.CSSProperties} aria-label="Compare places" onClose={()=>{
   if(trigger.current?.isConnected&&!trigger.current.disabled)trigger.current.focus({preventScroll:true});else if(trayTitle.current?.isConnected)trayTitle.current.focus({preventScroll:true});else status.current?.focus({preventScroll:true});
  }}>
   <form method="dialog" className="comparison-close"><button className="btn btn-quiet">Close comparison</button></form>
   <h2 id={uid+'-title'}>Compare your places</h2><p>Available details from these results. Hours, prices and availability aren’t live-checked.</p>
   <p><strong>Listed in all:</strong> {common.map(t=>t.name).join(' · ')||'No shared traits listed'}</p>
   <div className="comparison-mobile-nav">
    <ul className="comparison-price-summary" aria-label="Price overview">{items.map((item,i)=><li key={item.place.id}><span>Place {i+1}</span><strong>{priceSymbols(item.place.price)}</strong></li>)}</ul>
    <div className="comparison-selector" role="group" aria-label="Choose a place to read">{items.map((item,i)=><button className="btn btn-secondary" key={item.place.id} aria-label={`Show place ${i+1}: ${item.place.name}`} aria-pressed={selectedId===item.place.id} aria-controls={uid+'-card-'+i} onClick={()=>selectPlace(item.place.id)}>Place {i+1}</button>)}</div>
   </div>
   <div className="comparison-grid" role="region" aria-label="Place comparisons" style={{'--compare-count':Math.max(1,items.length)} as React.CSSProperties}>
    {items.map((item,i)=><article id={uid+'-card-'+i} data-selected={selectedId===item.place.id} key={item.place.id}>
     <span className="meta">Place {i+1} · {item.city}</span><h3 tabIndex={-1} ref={node=>{if(node)headings.current.set(item.place.id,node);else headings.current.delete(item.place.id);}}><Link href={`/${citySlug(item.city)}/${item.place.id.toLowerCase()}`} onClick={()=>dialog.current?.close()}>{item.place.name}</Link></h3>
     <dl><dt>Indicative price</dt><dd>{priceSymbols(item.place.price)}</dd><dt>Why this place</dt><dd>{item.why||'No individual recommendation reason available.'}</dd><dt>Listed traits</dt><dd>{displayTags(chipTags(item.place,placeCategory(item.category)||'restaurant')).map(t=>t.name).join(' · ')||'No traits listed'}</dd><dt>Address</dt><dd>{item.place.address||'Address unavailable'}</dd></dl>
     <div className="travel-controls"><SaveButton place={item.place} token={item.token} city={item.city} lists={lists} signedIn={signedIn} onChange={reload}/>
      {item.place.lat!==null&&item.place.lon!==null&&<a className="btn btn-quiet" href={`https://www.google.com/maps/dir/?api=1&destination=${item.place.lat},${item.place.lon}`} target="_blank" rel="noreferrer">Directions <ActionIcon name="external"/></a>}
      <button className="btn btn-quiet" aria-label={`Remove ${item.place.name} from comparison`} onClick={()=>{toggle(item);if(items.length<=2)dialog.current?.close();else selectPlace(items.find(other=>other.place.id!==item.place.id)!.place.id);}}>Remove</button>
     </div>
    </article>)}
   </div>
  </dialog></Context.Provider>;
}
export function ComparePlace({place,token,city,category,why}:Compared){const context=useContext(Context);if(!context||category==='neighbourhood')return null;const selected=context.items.some(i=>i.place.id===place.id);return <button className="btn btn-quiet" aria-pressed={selected} aria-label={`${selected?'Remove':'Compare'} ${place.name}${selected?' from comparison':''}`} onClick={()=>context.toggle({place,token,city,category,why})}>{selected?'In comparison':'Compare'}</button>;}
