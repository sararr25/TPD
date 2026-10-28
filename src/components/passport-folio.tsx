"use client";
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ActionIcon } from './action-icon';
import { buildProfile, quizCompletion, type Answers } from '@/lib/quiz';
import { passportInsights } from '@/lib/passport-insights';
import { PassportPreview } from './passport-preview';
import { useVisitedCities } from './use-visited-cities';
import { VisitedCities } from './visited-cities';
import { PassportSecurityLines } from './passport-art';
import { PassportStamps } from './passport-stamps';
import { SharePassport } from './share-passport';
import { PassportPrompt, usePassportState } from './passport-state';
export function PassportFolio({ answers, favourites, editor, onStartQuiz }: { answers: Answers; favourites: string[]; editor: ReactNode; onStartQuiz: () => void }) {
  const state = usePassportState();
  const [expanded, setExpanded] = useState(''), [more, setMore] = useState(false), [stampMessage, setStampMessage] = useState('');
  const history = useVisitedCities(), dialog = useRef<HTMLDialogElement>(null);
  const editorDialog = useRef<HTMLDialogElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  function openEditor() {
    if (!editorDialog.current?.open) editorDialog.current?.showModal();
    editorDialog.current?.querySelector<HTMLElement>('.passport-editor h1')?.focus({ preventScroll: true });
  }
  useEffect(() => {
    function openLinkedEditor(hash = window.location.hash) {
      if (hash === '#visited-cities-title' && history.loaded && !dialog.current?.open) {
        dialog.current?.showModal();
      }
      if (hash === '#passport-editor') openEditor();
    }
    const onHashChange = () => openLinkedEditor();
    // Next's same-page Link uses history state without a native hashchange.
    const onLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!anchor) return;
      const target = new URL(anchor.getAttribute('href')!, window.location.href);
      if (target.origin === window.location.origin && target.pathname === window.location.pathname) openLinkedEditor(target.hash);
    };
    openLinkedEditor();
    window.addEventListener('hashchange', onHashChange);
    document.addEventListener('click', onLink, true);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      document.removeEventListener('click', onLink, true);
    };
  }, [history.loaded]);
  const profile = buildProfile(answers);
  const isNew = state.state === 'new';
  const completion = quizCompletion(answers);
  const rows = passportInsights(answers);
  const words = (completion.partial ? 'Your taste, taking shape' : profile?.title || '').split(' '), last = words.slice(2).join(' ');
  const dominant = profile ? Object.entries(profile.interests).sort((a,b)=>b[1]-a[1])[0][0] : 'nature';
  function jump(id: string) { const el=document.getElementById(id); el?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}); el?.focus({preventScroll:true}); }
  function savedStamps(message: string) { dialog.current?.close(); setStampMessage(message); }
  return <div className="personal-passport"><header className="pf-intro"><div><span className="meta">Your personal travel document</span><p>What you love, so we can pick places for you.</p></div><Link href="/passport/settings">Settings &amp; privacy <ActionIcon name="settings" /></Link></header>
    {isNew && <section className="pf-start" aria-label="Start your Passport"><p>A 3-minute quiz makes your city picks personal. No account needed.</p><button className="btn btn-primary" onClick={event=>{event.currentTarget.focus();onStartQuiz();}}>Make your Passport</button></section>}
    <nav className="pf-bookmarks" aria-label="Passport sections"><button onClick={()=>jump('pf-taste')}>Your taste <ActionIcon name="down" /></button><button onClick={()=>jump('pf-travels')}>Your travels <ActionIcon name="down" /></button></nav><div className="pf-book"><section className="pf-left" aria-label="Your Passport and visited cities"><div className="pf-cover"><PassportSecurityLines/><h1 tabIndex={-1}>Your Passport</h1></div>
      <div className="pf-travels" id="pf-travels" tabIndex={-1}><div className="pf-heading"><h2>Places you’ve been</h2>{history.loaded && history.cities.length > 0 && <button className="btn btn-quiet" onClick={event=>{event.currentTarget.focus();dialog.current?.showModal();}}>Edit visited cities</button>}</div><p>Your real travels, stamped on your pages.</p>
      {!history.loaded ? <p role="status">Loading your visited cities…</p> : <div className="pf-stamps">{history.cities.length ? history.cities.map((city,i)=><span className="pf-city-stamp" key={city} data-city={city.toLowerCase().replaceAll(' ','-')} style={{'--stamp-delay':`${Math.min(i,5)*60}ms`} as React.CSSProperties}><strong>{city}</strong><svg viewBox="0 0 50 40" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d={city==='Paris'?'M12 36h26M17 36l8-32 8 32M19 26h12M21 17h8M17 36l8-10 8 10':'M6 35h38M12 35V16h26v19M9 16L25 5l16 11M22 35V25h6v10M17 20v4m16-4v4'}/></svg><small>VISITED</small></span>):<div className="pf-empty-stamp"><span>＋</span>Your first travel stamp</div>}</div>}
      <button className="btn btn-secondary" disabled={!history.loaded} onClick={event=>{event.currentTarget.focus();dialog.current?.showModal();}}>Add a visited city</button><p className="pf-stamp-status" role="status">{stampMessage}</p></div><div className="pf-left-foot"><Link className="btn pf-explore" href="/explore">Explore cities <ActionIcon name="external" /></Link>{!['new','ready'].includes(state.state) && <PassportPrompt/>}</div></section>
      <section id="pf-taste" tabIndex={-1} className="pf-analysis" aria-label="Your quiz analysis">{profile ? <><div className="pf-portrait"><span className="meta">Your travel preferences</span><h2>{words.slice(0,2).join(' ')}<br/><em>{last}.</em></h2><p>{completion.partial ? "A first sketch, based on the answers you gave." : profile.motto}</p><p className="meta">Based on {completion.answered} of {completion.total} questions.{completion.partial && <> Revisit the quiz from <Link href="/passport/settings">Settings &amp; privacy</Link>.</>}</p><svg className="pf-illustration" viewBox="0 0 210 160" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><circle cx="160" cy="28" r="15" fill="var(--sun)" stroke="none"/><g className="pf-drawing"><path d={dominant === 'night' ? 'M20 140h170M32 132V72h32v60M42 82h5m7 0h5M42 98h5m7 0h5M78 132V92h25v40M128 120V47l35-8v64M128 59l35-8M117 120a11 7 0 1 0 22 0a11 7 0 1 0-22 0M152 104a11 7 0 1 0 22 0a11 7 0 1 0-22 0' : dominant === 'culture' ? 'M16 142h178M31 128V40h58v88zM38 119V50h44v69zM45 103l13-22 19 22M106 131V70h12v61M121 131V60h13v71M138 131l-3-48 13-2 7 50M159 131V73h13v58' : dominant === 'food' ? 'M20 140h173M48 85h111c-3 28-21 40-55 40S51 113 48 85zM70 125v13M136 125v13M77 65c-18-15 14-18 0-35M102 65c-18-15 14-18 0-35M128 65c-18-15 14-18 0-35M175 80v51M169 79V60m6 19V60m6 19V60M169 79q6 12 12 0' : 'M10 120L56 43l54 77M40 70l16 12 12-13M90 120l28-45 30 45M132 116V64l22-13 23 13v52M127 65l27-20 28 20M149 116V91h11v25M140 72h8v10h-8zM162 72h8v10h-8zM18 143h180'}/><path d="M28 132c60-60 144 37 150-9s-72-25-59 15" strokeDasharray="4 5"/></g></svg></div>
      <div className="pf-traits" aria-label="Details from your answers">{rows.map(row=><span key={row.id}>{row.stamp}</span>)}</div>
      <ol className="pf-insights">{rows.slice(0,more ? rows.length : 3).map((row,i)=><li key={row.id}><span className="pf-number" aria-hidden="true">0{i+1}</span><div><h3>{row.title}</h3><p>{row.text.split(/(?<=[.!?])\s/)[0]}</p><button className="pf-match-trigger" aria-expanded={expanded===row.id} aria-controls={`pf-preview-${row.id}`} onClick={()=>setExpanded(expanded===row.id?'':row.id)}>{row.action} <ActionIcon name={expanded===row.id?"minus":"plus"} /></button>{expanded===row.id && <div id={`pf-preview-${row.id}`}><PassportPreview key={`${state.owner}:${row.id}`} category={row.category} title={row.action}/></div>}</div></li>)}</ol>{rows.length>3 && <button className="btn btn-quiet" aria-expanded={more} onClick={()=>{setMore(!more);if(more && rows.slice(3).some(r=>r.id===expanded))setExpanded('');}}>{more?'Show less':'More about your taste'}</button>}
      <section className="pf-favourites"><span className="meta">Your favourites</span><p>{favourites.length?favourites.join(' · '):'Add your favourites below to get personal picks.'}</p><small>Your quiz describes your preferences. Your favourites help us find places for you. Atmosphere, live music and hours aren’t confirmed.</small></section><SharePassport answers={answers}/></> : <div className="pf-first-page"><span className="meta">Your taste, your next discovery</span>{favourites.length >= 3 ? <><h2>Your favourites<br/><em>are ready.</em></h2><p>Your favourites can guide city picks. Travel preferences are not filled in yet.</p><Link className="btn btn-secondary" href="/passport/settings">Add travel preferences</Link></> : <><h2>Make it<br/><em>yours.</em></h2><p>A 3-minute quiz turns what you love into your personal Taste Passport. Then find places through your taste.</p>{!isNew && <button className="btn btn-primary" onClick={event=>{event.currentTarget.focus();onStartQuiz();}}>Make your Passport</button>}</>}{favourites.length > 0 && <p>Your favourites are already here: {favourites.join(" · ")}. You can keep editing them below.</p>}<p className="meta">No account needed. Your travel stamps stay separate from quiz answers.</p></div>}</section></div>
    <section className="pf-tools" aria-labelledby="pf-tools-title"><div><span className="meta">Your taste, refined</span><h2 id="pf-tools-title">What you love.</h2><p>Add artists, films, books or places to guide your next finds.</p></div><button ref={editButton} className="btn btn-secondary" onClick={openEditor}>Add what you love</button></section>
    <div className="pf-activity-panel"><PassportStamps/></div>
    <dialog className="pf-editor pf-editor-dialog" id="passport-editor" ref={editorDialog} aria-label="Add what you love" onClose={()=>editButton.current?.focus({preventScroll:true})}><form method="dialog"><button className="btn btn-quiet">Close editor</button></form>{editor}</dialog>
    <dialog className="pf-stamp-dialog" ref={dialog} aria-label="Add visited city stamps"><form method="dialog"><button className="btn btn-quiet">Close</button></form><VisitedCities onSaved={savedStamps}/></dialog>
  </div>;
}
