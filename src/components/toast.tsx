"use client";
import {authClient} from "@/lib/auth/client";
import { ActionIcon } from "./action-icon";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { motionTokens as m } from "@/lib/motion-tokens";

// Toasts (docs/22 1.2): feedback appears where the user is looking, at the
// bottom of the screen, with an optional action such as Undo (and a second one
// such as Change, #16). Queue messages; errors and actions require dismissal.
type Action = { label: string; run: () => void };
type Toast = { id: number; message: string; action?: Action; secondary?: Action; error?: boolean; origin?: HTMLElement; owner:string };
type Show = (message: string, options?: { action?: Action; secondary?: Action; error?: boolean }) => void;
const ToastContext = createContext<Show | null>(null);

export function useToast(): Show {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside <ToastProvider>");
  return show;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const {data:session}=authClient.useSession();
  const owner=session?.user?.id||"guest";
  const generation=useRef({owner});if(generation.current.owner!==owner)generation.current={owner};
  const [queue, setQueue] = useState<Toast[]>([]);
  const toast = queue.find(item=>item.owner===owner) || null;
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const reasons = useRef(new Set<string>());
  const remaining = useRef(0);
  const serial = useRef(0);
  const timedId = useRef<number | null>(null);
  const origin = useRef<HTMLElement | null>(null);
  const suspend = (reason: string, on: boolean) => {
    if (on) reasons.current.add(reason); else reasons.current.delete(reason);
    setPaused(reasons.current.size > 0);
  };
  const scope=generation.current;
  useEffect(()=>{setQueue([]);setLeaving(false);reasons.current.clear();setPaused(false);},[owner]);
  const show = useCallback<Show>((message, options = {}) => {
    if(generation.current!==scope)return;
    if (document.activeElement instanceof HTMLElement && !document.activeElement.closest(".toast")) origin.current = document.activeElement;
    reasons.current.delete("hover");
    reasons.current.delete("focus");
    setPaused(reasons.current.size > 0);
    const item = { id: ++serial.current, message, ...options, owner, origin: origin.current || undefined };
    setQueue(current => [...current, item]);
  }, [owner,scope]);
  useEffect(() => {
    const visibility = () => suspend("hidden", document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);
  useEffect(() => {
    if (!toast) return;
    if (timedId.current !== toast.id) {
      timedId.current = toast.id;
      remaining.current = toast.error ? 8000 : 5000;
    }
    if (paused || leaving || toast.action || toast.secondary || toast.error) return;
    const started = performance.now();
    const timer = setTimeout(() => setLeaving(true), remaining.current);
    return () => { clearTimeout(timer); remaining.current = Math.max(0, remaining.current - (performance.now() - started)); };
  }, [toast, paused, leaving]);
  useEffect(() => {
    if (!leaving || !toast) return;
    const id = toast.id;
    const timer = setTimeout(() => {
      if (document.activeElement?.closest(".toast") && toast.origin?.isConnected) toast.origin.focus({ preventScroll: true });
      setQueue(current => current.filter(item => item.id !== id));
      setLeaving(false);
    }, m.duration.exit * 1000);
    return () => clearTimeout(timer);
  }, [leaving, toast]);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div className="toast on-dark" data-error={toast.error || undefined} data-leaving={leaving || undefined} key={toast.id}
            onMouseEnter={() => suspend("hover", true)} onMouseLeave={() => suspend("hover", false)}
            onFocusCapture={() => suspend("focus", true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) suspend("focus", false); }}>
            <span>{toast.message}{queue.length > 1 && <small> · {queue.length} messages</small>}</span>
            {[toast.action, toast.secondary].map(
              (a) =>
                a && (
                  <button
                    className="btn btn-secondary"
                    key={a.label}
                    onClick={() => {
                      setLeaving(true);
                      a.run();
                    }}
                  >
                    {a.label}
                  </button>
                ),
            )}
            <button className="btn btn-icon toast-close" aria-label="Dismiss" onClick={() => setLeaving(true)}>
              <ActionIcon name="close" />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
