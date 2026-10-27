"use client";
import { ActionIcon } from "./action-icon";
import { useState } from "react";
import type { Answers } from "@/lib/quiz";

// Share card (E07): the server draws the PNG from the quiz answers alone.
export function SharePassport({ answers }: { answers: Answers }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const url = () => {
    const bytes = new TextEncoder().encode(JSON.stringify(answers));
    const b64 = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `/api/passport-card?a=${b64}`;
  };
  async function share() {
    setBusy(true);
    setStatus("Drawing your Passport…");
    try {
      const res = await fetch(url());
      if (!res.ok) throw new Error("Your Passport image could not be made. Try again.");
      const file = new File([await res.blob()], "taste-passport.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Taste Passport", text: "My Beesyde Taste Passport" });
        setStatus("");
      } else {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file);
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(link.href);
        setStatus("Saved as taste-passport.png.");
      }
    } catch (error) {
      // Closing the phone's share sheet is not an error.
      setStatus((error as Error).name === "AbortError" ? "" : (error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="actions">
      <button className="btn btn-secondary" disabled={busy} onClick={share}>
        Share my Passport <ActionIcon name="share" />
      </button>
      <span className="muted" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}
