"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { AuthButton } from "./auth-button";
import { authClient } from "@/lib/auth/client";
import { removeFromList, deleteList, type SavedList } from "@/lib/saved";
import { useSavedLists } from "./save-button";
import { useToast } from "./toast";

// Saved places grouped by list (docs/22 F1-F3). Guests see this device's
// lists; signed in, they move to the account and follow you everywhere.
export function CollectionsView() {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const toast = useToast();
  const { lists, loaded, reload } = useSavedLists(!isPending, userId);
  const [busy, setBusy] = useState(false);
  // Deleting a list asks in the site dialog, like the Passport (#17).
  const [pending, setPending] = useState<SavedList | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  async function run(action: () => Promise<void>, done: string) {
    setBusy(true);
    try {
      await action();
      await reload();
      toast(done);
    } catch (e) {
      toast((e as Error).message, { error: true });
    } finally {
      setBusy(false);
    }
  }
  const anyLocal = lists.some((l) => l.local);
  return (
    <>
      <div className="page-head">
        <span className="meta">Saved</span>
        <h1>
          Places worth keeping, <em>grouped by trip.</em>
        </h1>
      </div>
      {!loaded ? (
        <p className="meta">Loading your lists…</p>
      ) : lists.length === 0 ? (
        <section className="paper">
          <p>Nothing saved yet. Tap Save on any place to start a trip list.</p>
          <Link className="btn btn-primary" href="/explore">
            Browse cities
          </Link>
        </section>
      ) : (
        lists.map((c) => (
          <section className="paper coll-list" key={c.id}>
            <div className="row">
              <h2>{c.name}</h2>
              <button
                className="btn btn-quiet"
                disabled={busy}
                onClick={() => {
                  setPending(c);
                  dialog.current?.showModal();
                }}
              >
                Delete list
              </button>
            </div>
            {c.local && <p className="meta">On this device only</p>}
            {c.items.length === 0 ? (
              <p className="muted">Empty.</p>
            ) : (
              <ul className="entity-list">
                {c.items.map((item) => (
                  <li key={item.placeId}>
                    <div>
                      <strong>{item.name}</strong>
                      <p className="muted">{item.address}</p>
                      {item.note && <p>{item.note}</p>}
                      <p className="meta">
                        Saved {new Date(item.savedAt).toLocaleDateString()}
                        {item.lat !== null && item.lon !== null && (
                          <>
                            {" · "}
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lon}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Directions ↗
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                    <button
                      className="btn btn-quiet"
                      disabled={busy}
                      onClick={() =>
                        run(() => removeFromList(c, item.placeId), `Removed ${item.name} from “${c.name}”.`)
                      }
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))
      )}
      <dialog ref={dialog} onClose={() => setPending(null)}>
        <h2>Delete “{pending?.name}”?</h2>
        <p>
          This removes the list and its {pending?.items.length ?? 0} saved place
          {pending?.items.length === 1 ? "" : "s"}. This cannot be undone.
        </p>
        <div className="actions">
          <button
            className="btn btn-secondary"
            onClick={() => {
              const list = pending;
              dialog.current?.close();
              if (list) run(() => deleteList(list), `Deleted “${list.name}”.`);
            }}
          >
            Delete list
          </button>
          <button className="btn btn-quiet" onClick={() => dialog.current?.close()}>
            Keep it
          </button>
        </div>
      </dialog>
      {loaded && !userId && (
        <section className="paper">
          <h2>Keep your lists on every device.</h2>
          <p>
            {anyLocal
              ? "These lists are saved on this device. Sign in and they move to your account, so they follow you to your phone and back."
              : "Sign in and your lists follow you to your phone and back."}
          </p>
          <AuthButton />
        </section>
      )}
    </>
  );
}
