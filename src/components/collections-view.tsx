"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthButton } from "./auth-button";
import { authClient } from "@/lib/auth/client";
import {
  loadCollections,
  removeFromCollection,
  deleteCollection,
  type Collection,
} from "@/lib/account";

// Saved Swap results grouped by collection (E06). Signed-in only.
export function CollectionsView() {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const [collections, setCollections] = useState<Collection[] | null>(null),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState("");
  useEffect(() => {
    if (!userId) return;
    let active = true;
    loadCollections()
      .then((list) => active && setCollections(list))
      .catch((e) => active && setStatus((e as Error).message));
    return () => {
      active = false;
    };
  }, [userId]);
  async function run(action: () => Promise<void>, done: string) {
    setBusy(true);
    try {
      await action();
      setCollections(await loadCollections());
      setStatus(done);
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <span className="meta">Collections</span>
      <h1>
        Places worth keeping.
        <br />
        <em>Grouped by trip.</em>
      </h1>
      {isPending ? (
        <p className="meta">Checking sign-in…</p>
      ) : !userId ? (
        <section className="paper">
          <h2>Sign in to keep collections.</h2>
          <p>
            Collections are saved to your account, so they follow you to your phone and back.
            Sign in, then save places from Explore or Swap.
          </p>
          <AuthButton />
        </section>
      ) : collections === null ? (
        <p className="meta">{status || "Loading your collections…"}</p>
      ) : collections.length === 0 ? (
        <section className="paper">
          <h2>No collections yet.</h2>
          <p>Open a city in Explore and choose “Save to a collection” on a place you like.</p>
          <Link className="ticket" href="/explore">
            Explore a city
          </Link>
        </section>
      ) : (
        collections.map((c) => (
          <section className="divider" key={c.id}>
            <div className="row">
              <h2>{c.name}</h2>
              <button
                className="text"
                disabled={busy}
                onClick={() => {
                  if (confirm(`Delete the collection “${c.name}” and its places?`))
                    run(() => deleteCollection(c.id), `Deleted “${c.name}”.`);
                }}
              >
                Delete collection
              </button>
            </div>
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
                      className="text"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => removeFromCollection(c.id, item.placeId),
                          `Removed ${item.name} from “${c.name}”.`,
                        )
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
      <p role="status" aria-live="polite">
        {collections !== null && status}
      </p>
    </>
  );
}
