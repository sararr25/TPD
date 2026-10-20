"use client";
import { useId, useState } from "react";
import { saveToCollection } from "@/lib/account";

// Save one Swap result into a named collection (e.g. one per trip). Signed-in only.
export function SaveToCollection({
  token,
  names,
  onSaved,
}: {
  token: string;
  names: string[];
  onSaved: (collection: string) => void;
}) {
  const id = useId();
  const [name, setName] = useState(names[0] ?? "Paris"),
    [note, setNote] = useState(""),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus("Saving…");
    try {
      await saveToCollection(name.trim(), token, note);
      setStatus(`Saved to “${name.trim()}”.`);
      onSaved(name.trim());
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <details>
      <summary>Save to a collection</summary>
      <form onSubmit={save}>
        <label htmlFor={id + "-name"}>Collection</label>
        <input
          id={id + "-name"}
          list={id + "-names"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          required
          disabled={busy}
        />
        <datalist id={id + "-names"}>
          {names.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <label htmlFor={id + "-note"}>Note (optional)</label>
        <input
          id={id + "-note"}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={280}
          placeholder="e.g. book for Saturday"
          disabled={busy}
        />
        <div className="actions">
          <button className="stamp" disabled={busy}>
            Save
          </button>
        </div>
        <p role="status" aria-live="polite" className="muted">
          {status}
        </p>
      </form>
    </details>
  );
}
