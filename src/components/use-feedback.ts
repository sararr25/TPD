"use client";
import { useEffect, useRef, useState } from "react";
import { addVote, removeVote, voteFor, type Feedback } from "@/lib/feedback";
import { loadFeedback, saveFeedback } from "@/lib/account";
import type { Entity } from "@/lib/discovery";

// Gradual feedback (D3) for a results page. `current` is read at request time,
// so voting does not re-run the search that is on screen.
export function useFeedback(ready: boolean, userId: string | undefined, onError: (m: string) => void) {
  const [feedback, setFeedback] = useState<Feedback>({ votes: [], dismissed: [] });
  const current = useRef(feedback);
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
    const next = addVote(current.current, voteFor(place, value));
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
