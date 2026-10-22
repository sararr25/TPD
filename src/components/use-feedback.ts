"use client";
import { useEffect, useRef, useState } from "react";
import { addVote, dismissTag, newlyStrong, removeVote, voteFor, type Feedback } from "@/lib/feedback";
import { useToast } from "./toast";
import { loadFeedback, saveFeedback } from "@/lib/account";
import type { Entity } from "@/lib/discovery";

// Gradual feedback (D3) for a results page. `current` is read at request time,
// so voting does not re-run the search that is on screen.
export function useFeedback(ready: boolean, userId: string | undefined, onError: (m: string) => void) {
  const [feedback, setFeedback] = useState<Feedback>({ votes: [], dismissed: [] });
  const current = useRef(feedback);
  const toast = useToast();
  useEffect(() => {
    if (!ready) return;
    let active = true;
    loadFeedback(!!userId)
      .then((fb) => {
        if (!active) return;
        current.current = fb;
        setFeedback(fb);
      })
      .catch((e) => active && onError((e as Error).message));
    return () => {
      active = false;
    };
    // onError is a setter-like callback; loading depends on sign-in only.
  }, [ready, userId]);
  async function vote(place: Entity, value: 1 | -1) {
    const before = current.current;
    const next = addVote(before, voteFor(place, value));
    current.current = next;
    setFeedback(next);
    await saveFeedback(next, !!userId);
    // A vote that tips a taste over to strong is announced, with an undo.
    const learned = newlyStrong(before, next);
    const [taste, verb] = learned.keep.length ? [learned.keep[0], "you like"] : [learned.avoid[0], "you skip"];
    if (taste)
      toast(`Your Passport learned: ${verb} ${taste.name.toLowerCase()}.`, {
        action: { label: "Undo", run: () => dismiss(taste.id).catch((e) => onError((e as Error).message)) },
      });
  }
  async function dismiss(tagId: string) {
    const next = dismissTag(current.current, tagId);
    current.current = next;
    setFeedback(next);
    await saveFeedback(next, !!userId);
  }
  async function unvote(id: string) {
    const next = removeVote(current.current, id);
    current.current = next;
    setFeedback(next);
    await saveFeedback(next, !!userId);
  }
  const voted = (id: string) => feedback.votes.find((v) => v.id === id)?.vote;
  return { current, vote, unvote, voted };
}
