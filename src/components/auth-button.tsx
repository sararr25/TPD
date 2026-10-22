"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";

// Optional Google sign-in. The Passport and Swap keep working as a guest.
export function AuthButton() {
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

  if (isPending) return <span className="meta">Checking sign-in…</span>;
  return (
    <span className="auth">
      {user ? (
        <>
          <span className="meta">Signed in as {user.name || user.email}</span>
          <button className="text" onClick={signOut} disabled={busy}>
            Sign out
          </button>
        </>
      ) : (
        <button className="stamp quiet" onClick={signIn} disabled={busy}>
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
