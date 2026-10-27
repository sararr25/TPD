"use client";
import { useEffect, useRef, useState } from "react";
import { addVote, dismissTag, newlyStrong, removeVote, voteFor, type Feedback } from "@/lib/feedback";
import { useToast } from "./toast";
import { loadFeedback, saveFeedback } from "@/lib/account";
import type { Entity } from "@/lib/discovery";

// Owner-bound reads and queued writes: old completions cannot mutate a new
// account, and rapid saves cannot replace one another's preference votes.
export function useFeedback(ready: boolean, userId: string | undefined, onError: (m: string) => void) {
  const generation=useRef({userId});
  if(generation.current.userId!==userId)generation.current={userId};
  const scope=generation.current;
  const [snapshot,setSnapshot]=useState<{scope:object;value:Feedback}>({scope,value:{votes:[],dismissed:[]}});
  const current=useRef<Feedback>({votes:[],dismissed:[]});
  const work=useRef<Promise<void>>(Promise.resolve());
  const loading=useRef<{scope:object;promise:Promise<Feedback>}|null>(null);
  const currentScope=useRef(scope);
  if(currentScope.current!==scope){currentScope.current=scope;current.current={votes:[],dismissed:[]};work.current=Promise.resolve();loading.current=null;}
  const toast=useToast();
  function load(){
    if(loading.current?.scope===scope)return loading.current.promise;
    const promise=loadFeedback(!!userId,userId).then(fb=>{if(generation.current===scope){current.current=fb;setSnapshot({scope,value:fb});}return fb;});
    loading.current={scope,promise};void promise.catch(()=>{if(loading.current?.promise===promise)loading.current=null;});return promise;
  }
  useEffect(()=>{if(!ready)return;load().catch(e=>{if(generation.current===scope)onError(e.message);});},[ready,userId]);
  function change(transform:(fb:Feedback)=>Feedback,announce=false){
    if(generation.current!==scope||!ready)return Promise.resolve();
    const task=work.current.catch(()=>{}).then(async()=>{
      if(generation.current!==scope)return;
      await load();if(generation.current!==scope)return;
      const before=current.current,next=transform(before);current.current=next;setSnapshot({scope,value:next});
      await saveFeedback(next,!!userId,userId);
      if(generation.current!==scope||!announce)return;
      const learned=newlyStrong(before,next);
      const [taste,verb]=learned.keep.length?[learned.keep[0],'you like']:[learned.avoid[0],'you skip'];
      if(taste)toast(`Your Passport learned: ${verb} ${taste.name.toLowerCase()}.`,{action:{label:'Undo',run:()=>{void dismiss(taste.id).catch(e=>onError(e.message));}}});
    });work.current=task;return task;
  }
  const vote=(place:Entity,value:1|-1)=>change(fb=>addVote(fb,voteFor(place,value)),true);
  const dismiss=(tagId:string)=>change(fb=>dismissTag(fb,tagId));
  const unvote=(id:string)=>change(fb=>removeVote(fb,id));
  const feedback=snapshot.scope===scope?snapshot.value:{votes:[],dismissed:[]};
  const voted=(id:string)=>feedback.votes.find(v=>v.id===id)?.vote;
  return {current,vote,unvote,voted};
}
