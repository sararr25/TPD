"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { motionTokens as m } from "@/lib/motion-tokens";

// Toasts (docs/22 1.2): feedback appears where the user is looking, at the
// bottom of the screen, with an optional action such as Undo (and a second one
// such as Change, #16). One at a time; a new toast replaces the current one.
type Action = { label: string; run: () => void };
type Toast = { id: number; message: string; action?: Action; secondary?: Action; error?: boolean };
type Show = (message: string, options?: { action?: Action; secondary?: Action; error?: boolean }) => void;
const ToastContext = createContext<Show | null>(null);

export function useToast(): Show {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside <ToastProvider>");
  return show;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
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
  const show = useCallback<Show>((message, options = {}) => {
    if (document.activeElement instanceof HTMLElement && !document.activeElement.closest(".toast")) origin.current = document.activeElement;
    reasons.current.delete("hover");
    reasons.current.delete("focus");
    setPaused(reasons.current.size > 0);
    setLeaving(false);
    setToast({ id: ++serial.current, message, ...options });
  }, []);
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
    if (paused || leaving) return;
    const started = performance.now();
    const timer = setTimeout(() => setLeaving(true), remaining.current);
    return () => { clearTimeout(timer); remaining.current = Math.max(0, remaining.current - (performance.now() - started)); };
  }, [toast, paused, leaving]);
  useEffect(() => {
    if (!leaving || !toast) return;
    const id = toast.id;
    const timer = setTimeout(() => {
      if (document.activeElement?.closest(".toast") && origin.current?.isConnected) origin.current.focus({ preventScroll: true });
      setToast(current => current?.id === id ? null : current);
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
            <span>{toast.message}</span>
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
              ×
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
