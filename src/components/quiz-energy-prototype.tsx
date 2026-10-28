"use client";
// Three throwaway visual directions inside the real preview/checks host.
// All choices are memory-only; the study never creates a Passport or calls discovery.
import {useEffect,useRef,useState,useImperativeHandle,forwardRef,type ReactNode} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {motion,useMotionValue,useTransform,useReducedMotion,animate} from 'motion/react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useGSAP} from '@gsap/react';
import {QUIZ_ORDER} from '@/lib/quiz-draft';
import {QuizArtwork} from './quiz-artwork';
import {motionTokens as t,springs} from '@/lib/quiz-energy-prototype-motion';
import './quiz-energy-prototype.css';
gsap.registerPlugin(ScrollTrigger,useGSAP);
type Variant='A'|'B'|'C';
const names={A:'City playground',B:'Choice runway',C:'Passport theatre'};
const strengths=['Definitely','Mostly','It depends','Mostly','Definitely'];
function CityScene({value=0}:{value?:number}){
 return <svg className="eq-scene" viewBox="0 0 560 350" fill="none" aria-hidden="true">
 <defs><pattern id="eq-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" stroke="currentColor" strokeOpacity=".08"/></pattern></defs>
 <rect width="560" height="350" fill="url(#eq-grid)"/>
 <ellipse cx="280" cy="300" rx="245" ry="25" fill="currentColor" opacity=".09"/>
 <path className="eq-route" d="M40 274C92 231 169 323 224 263S304 205 355 249 439 289 520 224" stroke="var(--sun)" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 10"/>
 <g data-scene-piece="house"><path d="m70 145 100-36 59 27-101 39z" fill="#F3E6F6"/><path d="m70 145 58 30v109l-58-31z" fill="#B38DBB"/><path d="m128 175 101-39v109l-101 39z" fill="#F8F8F9"/><path d="m70 145 100-36 59 27-101 39z" stroke="#1E1630" strokeWidth="2"/><path d="m128 175 101-39v109l-101 39z" stroke="#1E1630" strokeWidth="2"/><path d="m70 145 58 30v109l-58-31z" stroke="#1E1630" strokeWidth="2"/>{[0,1,2].map(i=><path key={i} d={`m${144+i*26} 190 14-5v27l-14 5z`} fill={value<3?'#FFE14D':'#7E2B8F'}/>)}<path d="m161 241 33-12v30l-33 13z" fill="#7E2B8F"/><path d="m70 214 58 29 101-38" stroke="#1E1630" strokeWidth="2"/><path d="m137 229 83-32" stroke="#7E2B8F" strokeWidth="9"/><path d="m141 219 74-28" stroke="#FFE14D" strokeWidth="5"/></g>
 <g data-scene-piece="tower"><path d="m277 92 58-25 45 24-58 25z" fill="#FFE14D"/><path d="m277 92 45 24v160l-45-24z" fill="#B38DBB"/><path d="m322 116 58-25v160l-58 25z" fill="#E8D3EC"/><path d="m277 92 58-25 45 24-58 25zM277 92v160l45 24 58-25V91M322 116v160" stroke="#1E1630" strokeWidth="2"/>{[0,1,2].map(i=><g key={i}><path d={`m290 ${125+i*38} 15 8v18l-15-8z`} fill="#7E2B8F"/><path d={`m337 ${136+i*38} 26-11v18l-26 11z`} fill={value>3?'#FFE14D':'#7E2B8F'}/></g>)}</g>
 <g data-scene-piece="tree"><path d="M445 284v-77" stroke="#1E1630" strokeWidth="6"/><path d="m445 243-24-24m24 10 25-24" stroke="#1E1630" strokeWidth="4"/><path d="M398 190c0-27 19-50 45-50 32 0 53 25 53 52 0 29-20 52-50 52s-48-25-48-54Z" fill="#C4D8B9" stroke="#1E1630" strokeWidth="2"/><path d="M445 219v-55m0 37-22-17m22 3 20-15" stroke="#1E1630" strokeWidth="3"/></g>
 <g data-scene-piece="sun"><circle cx="427" cy="68" r="29" fill="#FFE14D"/><path d="m427 24 0-9m0 106v-9m44-44h9m-106 0h9m75-32 7-7m-75 75 7-7m61 7 7 7m-75-75 7 7" stroke="#FFE14D" strokeWidth="3" strokeLinecap="round"/></g>
 <circle className="eq-traveller" r="7" fill="var(--sun)" stroke="#1E1630" strokeWidth="2" opacity="0"/>
 <path d="m43 312 17-6m436 3 18-8" stroke="currentColor" opacity=".4" strokeWidth="2"/>
 </svg>;
}
function Answer({pressed,onClick,children,index=0,className=''}:{pressed?:boolean;onClick:()=>void;children:ReactNode;index?:number;className?:string}){
 const reduce=useReducedMotion();return <motion.button type="button" className={`eq-choice ${className}`} aria-pressed={!!pressed} onClick={onClick} whileHover={reduce?undefined:{y:-t.distance.small,scale:t.scale.pop}} whileTap={reduce?undefined:{scale:t.scale.press}} transition={springs.snappy} style={{'--choice-order':index} as React.CSSProperties}>{children}<span className="eq-check" aria-hidden="true">{pressed?'✓':'↗'}</span></motion.button>;
}
type SwipeHandle={choose:(yes:boolean)=>void};
const SwipeCard=forwardRef<SwipeHandle,{id:string;label:string;note?:string;onDecision:(yes:boolean)=>void}>(function SwipeCard({id,label,note,onDecision},ref){
 const reduce=useReducedMotion(),x=useMotionValue(0),rotation=useTransform(x,[-t.distance.exit,t.distance.exit],[-t.angle.drag,t.angle.drag]);
 const yes=useTransform(x,[0,t.distance.threshold],[0,1]),no=useTransform(x,[-t.distance.threshold,0],[1,0]);
 const locked=useRef(false),animation=useRef<ReturnType<typeof animate>|null>(null);
 function choose(value:boolean){if(locked.current)return;locked.current=true;if(reduce){onDecision(value);return;}animation.current=animate(x,(value?1:-1)*t.distance.exit,{duration:t.duration.fast,onComplete:()=>onDecision(value)});}
 useImperativeHandle(ref,()=>({choose}));useEffect(()=>()=>animation.current?.stop(),[]);
 return <motion.div className="eq-swipe-card" role="group" tabIndex={0} aria-label={`${label}. Right arrow yes, left arrow no.`} style={reduce?undefined:{x,rotate:rotation}} drag={reduce?false:'x'} dragConstraints={{left:0,right:0}} dragElastic={1} dragMomentum={false} onDragEnd={(_,info)=>{const offset=info.offset.x;const flick=Math.abs(offset)>=t.distance.flick&&Math.abs(info.velocity.x)>=t.distance.velocity;if(Math.abs(offset)>=t.distance.threshold||flick)choose(offset>0);else animation.current=animate(x,0,springs.release);}} onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();choose(event.key==='ArrowRight');}}}>
 <motion.span className="eq-swipe-verdict eq-yes" style={{opacity:yes}} aria-hidden="true">YES</motion.span><motion.span className="eq-swipe-verdict eq-no" style={{opacity:no}} aria-hidden="true">PASS</motion.span>
 <QuizArtwork id={id}/><h3>{label}</h3><p>{note}</p></motion.div>;
});
function VariantA({title,instruction,scene,answers}:{title:ReactNode;instruction:string;scene:ReactNode;answers:ReactNode}){
 return <div className="eq-layout-a"><section className="eq-world"><div className="eq-title-block"><h1 tabIndex={-1}>{title}</h1><p>{instruction}</p></div>{scene}<div className="eq-words" aria-hidden="true"><span>Music. Places. Little detours. Your kind of city.</span></div></section><section className="eq-answer-zone">{answers}</section></div>;
}
function VariantB({title,instruction,answers}:{title:ReactNode;instruction:string;answers:ReactNode}){
 return <div className="eq-layout-b"><section className="eq-runway-heading"><h1 tabIndex={-1}>{title}</h1><p>{instruction}</p></section><section className="eq-runway">{answers}</section><div className="eq-runway-line" aria-hidden="true"><span>Let your taste lead.</span><svg viewBox="0 0 500 40"><path className="eq-route" d="M3 20h470m-22-15 24 15-24 15" fill="none" stroke="currentColor" strokeWidth="2"/></svg></div></div>;
}
function VariantC({title,instruction,scene,answers}:{title:ReactNode;instruction:string;scene:ReactNode;answers:ReactNode}){
 return <div className="eq-layout-c"><section className="eq-theatre-heading"><h1 tabIndex={-1}>{title}</h1><p>{instruction}</p></section><section className="eq-theatre"><div className="eq-theatre-scene">{scene}</div><div className="eq-theatre-choices">{answers}</div></section></div>;
}
export function QuizEnergyPrototype({variant,initialStep=2,showSwitcher}:{variant:Variant;initialStep?:number;showSwitcher:boolean}){
 const router=useRouter(),params=useSearchParams(),dialog=useRef<HTMLDialogElement>(null),root=useRef<HTMLDivElement>(null),swipe=useRef<SwipeHandle>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const reduce=useReducedMotion(),[step,setStep]=useState(initialStep),[picked,setPicked]=useState<string[]>([]),[rating,setRating]=useState(0),[history,setHistory]=useState<boolean[]>([]),[log,setLog]=useState<Record<string,unknown>>({}),[complete,setComplete]=useState(false),[sound,setSound]=useState(false);
 const audio=useRef<AudioContext|null>(null);
 useEffect(()=>()=>{void audio.current?.close();},[]);
 function tone(){if(!sound||document.hidden)return;const context=audio.current;if(!context)return;const oscillator=context.createOscillator(),gain=context.createGain();oscillator.frequency.value=550;gain.gain.setValueAtTime(.02,context.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+t.duration.fast);oscillator.connect(gain);gain.connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+t.duration.fast);}
 const q=QUIZ_ORDER[step],card=q.kind==='swipe'?q.cards[history.length]:null;
 function cancel(){if(timer.current)clearTimeout(timer.current);timer.current=null;}
 function go(next:number){cancel();setComplete(next>2);setStep(Math.min(2,Math.max(0,next)));setPicked([]);setRating(0);setHistory([]);}
 function next(){cancel();timer.current=setTimeout(()=>go(step+1),t.duration.answerHold*1000);}
 useEffect(()=>{dialog.current?.showModal();dialog.current?.querySelector<HTMLElement>("h1")?.focus();return()=>{cancel();dialog.current?.close();};},[]);
 useEffect(()=>{const hide=()=>{if(document.hidden)cancel();};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[]);
 useGSAP(()=>{
  const node=root.current;if(!node)return;node.querySelector<HTMLElement>('.eq-content')?.scrollTo(0,0);node.querySelector<HTMLElement>('h1')?.focus({preventScroll:true});
  if(reduce)return;
  const context=gsap.context(()=>{
   if(node.querySelector('.eq-title-block,.eq-runway-heading,.eq-theatre-heading'))gsap.fromTo('.eq-title-block,.eq-runway-heading,.eq-theatre-heading',{y:t.distance.reveal,opacity:t.opacity.text},{y:0,opacity:1,duration:t.duration.normal,clearProps:'transform,opacity'});
   if(node.querySelector('[data-scene-piece]'))gsap.fromTo('[data-scene-piece]',{y:t.distance.reveal,opacity:t.opacity.scene},{y:0,opacity:1,stagger:t.duration.instant,duration:t.duration.slow,ease:t.easing.gsapBounce,clearProps:'transform,opacity'});
   node.querySelectorAll<SVGPathElement>('.eq-route').forEach(path=>{const length=path.getTotalLength();gsap.fromTo(path,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,duration:t.duration.crawl,clearProps:'strokeDasharray,strokeDashoffset'});});
   const scroller=node.querySelector('.eq-content');
   if(scroller&&node.querySelector('.eq-world .eq-scene'))gsap.fromTo('.eq-world .eq-scene',{scale:t.scale.sceneStart},{scale:1,duration:t.duration.slow,scrollTrigger:{trigger:'.eq-world',scroller,start:'top 90%',once:true},clearProps:'transform'});
   if(node.querySelector('.eq-words span'))gsap.fromTo('.eq-words span',{x:t.distance.ribbon,opacity:t.opacity.text},{x:0,opacity:1,duration:t.duration.crawl,clearProps:'transform,opacity'});
  },node);return()=>context.revert();
 },{scope:root,dependencies:[step,variant,reduce,complete],revertOnUpdate:true});
 useEffect(()=>{
  const node=root.current;if(!node||!rating||reduce)return;
  const path=node.querySelector<SVGPathElement>('.eq-scene .eq-route'),dot=node.querySelector<SVGCircleElement>('.eq-traveller');
  if(!path||!dot)return;
  const driver={progress:0},length=path.getTotalLength();
  const context=gsap.context(()=>{
   gsap.set(dot,{opacity:1});
   gsap.to(driver,{progress:1,duration:t.duration.crawl,ease:t.easing.gsapSmooth,onUpdate:()=>{const point=path.getPointAtLength(length*driver.progress);gsap.set(dot,{x:point.x,y:point.y});}});
   gsap.fromTo('[data-scene-piece="sun"]',{scale:t.scale.scenePulse,transformOrigin:'center'},{scale:1,duration:t.duration.normal,ease:t.easing.gsapBounce});
  },node);return()=>context.revert();
 },[rating,reduce]);
 function record(value:unknown){tone();setLog(previous=>({...previous,[q.id]:value}));}
 function pick(id:string){cancel();const items=picked.includes(id)?picked.filter(x=>x!==id):[...picked,id];if(q.kind==='pick'&&items.length>q.max)return;setPicked(items);record(items);if(q.kind==='pick'&&items.length===q.max)next();}
 function decide(value:boolean){const entries=[...history,value];setHistory(entries);record(entries);if(q.kind==='swipe'&&entries.length===q.cards.length)next();}
 function switchVariant(direction:number){const options:Variant[]=['A','B','C'];const value=options[(options.indexOf(variant)+direction+3)%3];const query=new URLSearchParams(params.toString());query.set('variant',value);router.replace('/preview/checks?'+query.toString(),{scroll:false});}
 useEffect(()=>{
  const keys=(event:KeyboardEvent)=>{
   if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
   if((event.target as Element)?.closest('input,textarea,button,[contenteditable="true"],.eq-swipe-card'))return;
   event.preventDefault();switchVariant(event.key==='ArrowRight'?1:-1);
  };
  if(showSwitcher)window.addEventListener('keydown',keys);
  return()=>window.removeEventListener('keydown',keys);
 },[variant,params,showSwitcher]);
 const instruction=q.kind==='pick'?`Pick up to ${q.max}. Your last pick moves you on.`:q.kind==='swipe'?'Swipe what moves you. Right for yes, left for no.':'Go with your instinct. Pick one to move on.';
 const words=q.title.split(" ");
 const title=<>{words.slice(0,-1).join(" ")} <span className="eq-inline-art" aria-hidden="true"><img src={q.kind==="swipe"?"/quiz-art/vinyl.svg":"/quiz-art/map.svg"} alt=""/></span> <em>{words.at(-1)}</em></>;
 const scaleArt=['calendar','calendar','map','wander','wander'];
 const answers=q.kind==='slider'?<div className="eq-scale" role="group" aria-label={q.title}>{strengths.map((strength,i)=>{
  const context=i<2?q.left.label:i>2?q.right.label:'A bit of both';return <Answer key={i} index={i} pressed={rating===i+1} className={i===2?'eq-neutral':''} onClick={()=>{setRating(i+1);record(i+1);next();}}><span className="eq-option-art"><img src={`/quiz-art/${scaleArt[i]}.svg`} alt=""/></span><span className="eq-option-text"><strong>{strength}</strong><small>{context}</small></span><span className="eq-energy-bars" aria-hidden="true">{[1,2,3].map(n=><i key={n} data-on={n<=Math.abs(i-2)+1}/>)}</span></Answer>;
 })}</div>:q.kind==='swipe'?<div className="eq-deck"><div className="eq-deck-under" aria-hidden="true"/>{card?<SwipeCard key={card.id} ref={swipe} id={card.id} label={card.label} note={card.note} onDecision={decide}/>:<div className="eq-swipe-card"><h3>That sounds like you.</h3><p>Next stop, your kind of day.</p></div>}<div className="eq-swipe-controls"><button onClick={()=>{cancel();setHistory(history.slice(0,-1));}} disabled={!history.length}>Undo</button><button onClick={()=>swipe.current?.choose(false)} disabled={!card}>Pass</button><button className="eq-yes-button" onClick={()=>swipe.current?.choose(true)} disabled={!card}>Yes, me</button></div></div>:q.kind==='pick'||q.kind==='this-or-that'?<div className="eq-picks">{q.options.map((option,i)=><Answer key={option.id} index={i} pressed={picked.includes(option.id)} onClick={()=>pick(option.id)}><QuizArtwork id={option.id}/><strong>{option.label}</strong></Answer>)}</div>:null;
 const scene=<CityScene value={rating}/>;
 return <><section className="eq-host"><h2>Beesyde · quiz visual study</h2><p>Three directions, using the existing brand and original illustrations. Demo choices stay in memory.</p><button className="btn btn-primary" onClick={()=>dialog.current?.showModal()}>Open visual study</button><details><summary>Study state</summary><pre>{JSON.stringify({variant,question:q.id,picked,rating,history,answers:log},null,2)}</pre></details></section>
 <dialog ref={dialog} className={`eq-dialog eq-variant-${variant}`} aria-label="Beesyde quiz visual study" onCancel={()=>cancel()}><div ref={root} className="eq-root" style={{'--eq-normal':`${t.duration.normal}s`} as React.CSSProperties}>
 <header className="eq-header"><span className="eq-brand">beesyde<span>.</span></span><div className="eq-progress" role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={18} aria-valuenow={complete?3:step+1}><motion.i initial={false} animate={{scaleX:(complete?3:step+1)/18}} transition={{duration:reduce?0:t.duration.normal}}/></div><span className="eq-count">{complete?3:step+1} / 18</span><button aria-pressed={sound} onClick={()=>{if(!sound){audio.current??=new AudioContext();void audio.current.resume();}setSound(!sound);}}>{sound?'Sound on':'Sound off'}</button><button onClick={()=>{cancel();dialog.current?.close();}}>Close</button></header>
 <div className="eq-content">{complete?<section className="eq-finale"><CityScene value={5}/><h1 tabIndex={-1}>A little more <em>you.</em></h1><p>Your taste brings the city to life.</p><button className="eq-main-button" onClick={()=>go(0)}>Play it again</button><small>Three-question visual study. No Passport created.</small></section>:variant==='A'?<VariantA title={title} instruction={instruction} scene={scene} answers={answers}/>:variant==='B'?<VariantB title={title} instruction={instruction} answers={answers}/>:<VariantC title={title} instruction={instruction} scene={scene} answers={answers}/>}</div>
 <footer className="eq-footer"><button onClick={()=>go(complete?2:step-1)} disabled={!complete&&step===0}>Back</button><p role="status">{rating?`${strengths[rating-1]} · moving on…`:picked.length?`${picked.length} selected`:q.kind==='swipe'?`${history.length} of 4 played`:'Follow your instinct.'}</p><div>{q.kind==='pick'&&picked.length>0&&picked.length<q.max&&<button onClick={()=>go(step+1)}>Use {picked.length} choices</button>}<button onClick={()=>go(step+1)}>Skip</button></div></footer>
 {showSwitcher&&<div className="eq-prototype-controls"><div className="eq-variant-switch"><button aria-label="Previous variant" onClick={()=>switchVariant(-1)}>←</button><strong>{variant} · {names[variant]}</strong><button aria-label="Next variant" onClick={()=>switchVariant(1)}>→</button></div><div className="eq-sample-switch" role="group" aria-label="Try a question">{['Places','Music','Your day'].map((name,i)=><button key={name} aria-pressed={!complete&&step===i} onClick={()=>go(i)}>{name}</button>)}<details><summary>Demo state</summary><pre>{JSON.stringify({variant,question:q.id,picked,rating,history,answers:log},null,2)}</pre></details></div></div>}
 </div></dialog></>;
}
