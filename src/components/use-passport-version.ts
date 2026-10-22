"use client";
import { useEffect, useState } from "react";
import { PASSPORT_CHANGED } from "@/lib/quiz-finish";

// Bumps when the quiz panel saves a new Passport. Add it to the dependencies
// of the effect that reads the Passport so the page picks it up without a reload.
export function usePassportVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((n) => n + 1);
    window.addEventListener(PASSPORT_CHANGED, bump);
    return () => window.removeEventListener(PASSPORT_CHANGED, bump);
  }, []);
  return version;
}
