"use client";
import {useId,useRef} from 'react';
import {useGSAP} from '@gsap/react';
import gsap from 'gsap';
import {useReducedMotion} from '@/lib/use-reduced-motion';
import {motionTokens as m} from '@/lib/motion-tokens';
gsap.registerPlugin(useGSAP);

// Original vector city from the owner-selected C study; decorative, never a real route.
export function QuizStageArt({activity=0,question}:{activity?:number;question:string}){
 const node=useRef<HTMLDivElement>(null),reduce=useReducedMotion();
 const gridId='quiz-grid-'+useId().replace(/:/g,'');
 const value=activity;
 useGSAP(()=>{
  if(reduce)return;
  const timeline=gsap.timeline();
  timeline.fromTo('[data-scene-piece]',{y:m.distance.reveal,opacity:m.quiz.sceneOpacity},{y:0,opacity:1,stagger:m.stagger,duration:m.duration.hero,ease:m.ease.settle,clearProps:'transform,opacity'});
  const path=node.current?.querySelector<SVGPathElement>('.taste-city-route');
  if(path){const length=path.getTotalLength();timeline.fromTo(path,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,duration:m.duration.route,ease:m.ease.ink,clearProps:'strokeDasharray,strokeDashoffset'},0);}
  const visibility=()=>{if(document.hidden)timeline.pause();else timeline.resume();};
  document.addEventListener('visibilitychange',visibility);visibility();
  return()=>document.removeEventListener('visibilitychange',visibility);
 },{scope:node,dependencies:[question,reduce],revertOnUpdate:true});
 useGSAP(()=>{
  if(!activity||reduce)return;
  const path=node.current?.querySelector<SVGPathElement>('.taste-city-route'),dot=node.current?.querySelector<SVGCircleElement>('.taste-city-traveller');
  if(!path||!dot)return;
  const driver={progress:0},length=path.getTotalLength();
  gsap.set(dot,{opacity:1});
  const tween=gsap.to(driver,{progress:1,duration:m.duration.route,ease:m.ease.ink,onUpdate:()=>{const point=path.getPointAtLength(length*driver.progress);gsap.set(dot,{x:point.x,y:point.y});}});
  const visibility=()=>{if(document.hidden)tween.pause();else tween.resume();};
  document.addEventListener('visibilitychange',visibility);visibility();
  return()=>document.removeEventListener('visibilitychange',visibility);
 },{scope:node,dependencies:[activity,question,reduce],revertOnUpdate:true});
 return <div ref={node} className="taste-stage-art" aria-hidden="true">{city()}</div>;
 function city(){
 return <svg className="taste-city-scene" viewBox="0 0 560 350" fill="none" aria-hidden="true">
 <defs><pattern id={gridId} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" stroke="currentColor" strokeOpacity=".08"/></pattern></defs>
 <rect width="560" height="350" fill={`url(#${gridId})`}/>
 <ellipse cx="280" cy="300" rx="245" ry="25" fill="currentColor" opacity=".09"/>
 <path className="taste-city-route" d="M40 274C92 231 169 323 224 263S304 205 355 249 439 289 520 224" stroke="var(--sun)" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 10"/>
 <g data-scene-piece="house"><path d="m70 145 100-36 59 27-101 39z" fill="#F3E6F6"/><path d="m70 145 58 30v109l-58-31z" fill="#B38DBB"/><path d="m128 175 101-39v109l-101 39z" fill="#F8F8F9"/><path d="m70 145 100-36 59 27-101 39z" stroke="#1E1630" strokeWidth="2"/><path d="m128 175 101-39v109l-101 39z" stroke="#1E1630" strokeWidth="2"/><path d="m70 145 58 30v109l-58-31z" stroke="#1E1630" strokeWidth="2"/>{[0,1,2].map(i=><path key={i} d={`m${144+i*26} 190 14-5v27l-14 5z`} fill={value<3?'#FFE14D':'#7E2B8F'}/>)}<path d="m161 241 33-12v30l-33 13z" fill="#7E2B8F"/><path d="m70 214 58 29 101-38" stroke="#1E1630" strokeWidth="2"/><path d="m137 229 83-32" stroke="#7E2B8F" strokeWidth="9"/><path d="m141 219 74-28" stroke="#FFE14D" strokeWidth="5"/></g>
 <g data-scene-piece="tower"><path d="m277 92 58-25 45 24-58 25z" fill="#FFE14D"/><path d="m277 92 45 24v160l-45-24z" fill="#B38DBB"/><path d="m322 116 58-25v160l-58 25z" fill="#E8D3EC"/><path d="m277 92 58-25 45 24-58 25zM277 92v160l45 24 58-25V91M322 116v160" stroke="#1E1630" strokeWidth="2"/>{[0,1,2].map(i=><g key={i}><path d={`m290 ${125+i*38} 15 8v18l-15-8z`} fill="#7E2B8F"/><path d={`m337 ${136+i*38} 26-11v18l-26 11z`} fill={value>3?'#FFE14D':'#7E2B8F'}/></g>)}</g>
 <g data-scene-piece="tree"><path d="M445 284v-77" stroke="#1E1630" strokeWidth="6"/><path d="m445 243-24-24m24 10 25-24" stroke="#1E1630" strokeWidth="4"/><path d="M398 190c0-27 19-50 45-50 32 0 53 25 53 52 0 29-20 52-50 52s-48-25-48-54Z" fill="#C4D8B9" stroke="#1E1630" strokeWidth="2"/><path d="M445 219v-55m0 37-22-17m22 3 20-15" stroke="#1E1630" strokeWidth="3"/></g>
 <g data-scene-piece="sun"><circle cx="427" cy="68" r="29" fill="#FFE14D"/><path d="m427 24 0-9m0 106v-9m44-44h9m-106 0h9m75-32 7-7m-75 75 7-7m61 7 7 7m-75-75 7 7" stroke="#FFE14D" strokeWidth="3" strokeLinecap="round"/></g>
 <circle className="taste-city-traveller" r="7" fill="var(--sun)" stroke="#1E1630" strokeWidth="2" opacity="0"/>
 <path d="m43 312 17-6m436 3 18-8" stroke="currentColor" opacity=".4" strokeWidth="2"/>
 </svg>;
 }
}
