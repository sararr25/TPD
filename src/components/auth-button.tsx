"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";

// Optional Google sign-in. The Passport and Swap keep working as a guest.
// `compact` is the header version: a small link / initial, not a button (#12).
export function AuthButton({ compact = false }: { compact?: boolean }) {
  const { data, isPending } = authClient.useSession();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const user = data?.user;

  async function signIn() {
    setError(null);
    setBusy(true);
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: window.location.href,
    });
    if (result?.error) {
      setError("Google sign-in failed. Please try again.");
      setBusy(false);
    }
  }
  async function signOut() {
    setError(null);
    setBusy(true);
    const result = await authClient.signOut();
    if (result?.error) setError("Sign-out failed. Please try again.");
    setBusy(false);
  }

  if (isPending) return <span className="meta">{compact ? "…" : "Checking sign-in…"}</span>;
  return (
    <span className={compact ? "auth compact" : "auth"}>
      {user && compact ? (
        <>
          <span className="auth-avatar" title={user.name || user.email} aria-label={`Signed in as ${user.name || user.email}`}>
            {(user.name || user.email || "?").trim().charAt(0).toUpperCase()}
          </span>
          <button className="btn btn-quiet" onClick={signOut} disabled={busy}>
            Sign out
          </button>
        </>
      ) : compact ? (
        <button className="btn btn-quiet" onClick={signIn} disabled={busy}>
          {busy ? "Opening…" : "Sign in"}
        </button>
      ) : user ? (
        <>
          <span className="meta">Signed in as {user.name || user.email}</span>
          <button className="btn btn-quiet" onClick={signOut} disabled={busy}>
            Sign out
          </button>
        </>
      ) : (
        <button className="btn btn-secondary" onClick={signIn} disabled={busy}>
          {busy ? "Opening Google…" : "Sign in with Google"}
        </button>
      )}
      {error && (
        <span role="alert" className="meta">
          {error}
        </span>
      )}
    </span>
  );
}
