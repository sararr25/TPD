"use client";
import { useRef, useState } from "react";
import type { SavedList } from "@/lib/saved";
import { tripPostcard } from "@/lib/trip-postcard";
import { encodeSharedTrip, makeSharedTrip, type SharedTrip } from "@/lib/shared-trip";

// A deliberate snapshot. The preview is the exact public projection; notes
// and account details never enter the URL, native share payload or PNG body.
export function ShareTrip({ list }: { list: SavedList }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [trip, setTrip] = useState<SharedTrip | null>(null);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [nativeShare, setNativeShare] = useState(false);
  function open() {
    setStatus("");
    setTrip(null);
    setUrl("");
    try {
      const snapshot = makeSharedTrip(list);
      const encoded = encodeSharedTrip(snapshot);
      setTrip(snapshot);
      setUrl(`${window.location.origin}/trip#${encoded}`);
      setNativeShare(typeof navigator.share === "function");
    } catch (error) {
      setStatus((error as Error).message);
    }
    dialog.current?.showModal();
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Link copied. Anyone with it can read this snapshot.");
    } catch {
      setStatus("The link could not be copied. Select and copy it from the field below.");
    }
  }
  async function shareLink() {
    try {
      await navigator.share({ title: trip?.name, url });
      setStatus("Shared trip link.");
    } catch (error) {
      setStatus((error as Error).name === "AbortError" ? "" : "The link could not be shared. Try Copy link instead.");
    }
  }
  async function postcard(share: boolean) {
    if (!trip || busy) return;
    setBusy(true);
    setStatus("Drawing your postcard…");
    try {
      const file = new File([await tripPostcard(trip)], "beesyde-trip.png", { type: "image/png" });
      if (share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: trip.name });
        setStatus("Shared postcard.");
      } else {
        const fileURL = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = fileURL;
        link.download = file.name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
        setStatus(share ? "Image sharing is not available here. Downloaded beesyde-trip.png instead." : "Downloaded beesyde-trip.png.");
      }
    } catch (error) {
      setStatus((error as Error).name === "AbortError" ? "" : (error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button className="btn btn-secondary" disabled={!list.items.length} onClick={open}>Share trip ↗</button>
      <dialog className="share-trip-dialog" ref={dialog} aria-labelledby={`share-trip-${list.id}`}>
        <h2 id={`share-trip-${list.id}`}>Share this trip?</h2>
        <p>Anyone with the link can read the trip name and places below. Your notes stay private.</p>
        <p className="muted">This is a snapshot, not a live list. Later edits or deleting your list will not change a link you already shared.</p>
        {trip && (
          <>
            <div className="share-trip-preview">
              <h3>{trip.name}</h3>
              <ol>{trip.places.map((place) => <li key={place.id}>{place.name}{place.city && ` · ${place.city}`}</li>)}</ol>
            </div>
            {trip.places.length > 12 && <p className="muted">The postcard shows the first 12 of {trip.places.length} places. The link includes all of them.</p>}
            <div className="actions">
              <button className="btn btn-primary" disabled={busy} onClick={copyLink}>Copy link</button>
              {nativeShare && <button className="btn btn-secondary" disabled={busy} onClick={shareLink}>Share link</button>}
              <button className="btn btn-secondary" disabled={busy} onClick={() => postcard(false)}>Download postcard</button>
              {nativeShare && <button className="btn btn-secondary" disabled={busy} onClick={() => postcard(true)}>Share postcard</button>}
            </div>
            <label className="share-trip-link">Trip link
              <textarea readOnly value={url} rows={2} onFocus={(event) => event.currentTarget.select()} />
            </label>
          </>
        )}
        <p role="status" aria-live="polite">{status}</p>
        <button className="btn btn-quiet" disabled={busy} onClick={() => dialog.current?.close()}>Back to my trips</button>
      </dialog>
    </>
  );
}
