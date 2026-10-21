"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

// Toasts (docs/22 1.2): feedback appears where the user is looking, at the
// bottom of the screen, with an optional action such as Undo. One at a time;
// a new toast replaces the current one.
type Toast = { id: number; message: string; action?: { label: string; run: () => void }; error?: boolean };
type Show = (message: string, options?: { action?: Toast["action"]; error?: boolean }) => void;
const ToastContext = createContext<Show | null>(null);

export function useToast(): Show {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside <ToastProvider>");
  return show;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback<Show>((message, options = {}) => {
    setToast({ id: Date.now(), message, ...options });
  }, []);
  useEffect(() => {
    if (!toast) return;
    if (timer.current) clearTimeout(timer.current);
    // Long enough to read and reach the action; errors stay a little longer.
    timer.current = setTimeout(() => setToast(null), toast.error ? 8000 : 5000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [toast]);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div className="toast" data-error={toast.error || undefined} key={toast.id}>
            <span>{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action!.run();
                  setToast(null);
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button className="toast-close" aria-label="Dismiss" onClick={() => setToast(null)}>
              ×
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
