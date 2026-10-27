"use client";
import { ActionIcon } from "./action-icon";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Entity } from "@/lib/discovery";
import { addToList, deleteList, loadLists, moveLocalLists, removeFromList, setNote, type SavedList } from "@/lib/saved";
import { useToast } from "./toast";
import { authClient } from "@/lib/auth/client";
import { recordStamp } from "@/lib/stamps-client";

// Lists for a results page (docs/22 F1-F3). Signed in, this browser's lists
// move to the account first; anything that cannot move is reported.
export function useSavedLists(ready: boolean, userId: string | undefined, migrate = true) {
  const toast = useToast();
  const [lists, setLists] = useState<SavedList[]>([]),
    [loaded, setLoaded] = useState(false);
  const owner = useRef(userId); owner.current = userId;
  const [listOwner, setListOwner] = useState(userId);
  const reload = useCallback(async () => {
    const found = await loadLists(!!userId);
    if (owner.current === userId) { setLists(found); setListOwner(userId); }
  }, [userId]);
  useEffect(() => {
    if (!ready) return;
    let active = true;
    (async () => {
      if (userId && migrate) {
        const { moved, failed } = await moveLocalLists(userId);
        if (moved) toast(`Moved ${moved} saved place${moved === 1 ? "" : "s"} from this device to your account.`);
        if (failed.length)
          toast(`${failed.length} saved place${failed.length === 1 ? "" : "s"} could not move to your account yet: ${failed.join(", ")}. They stay on this device.`, { error: true });
      }
      const found = await loadLists(!!userId);
      if (active) { setLists(found); setListOwner(userId); }
    })()
      .catch((e) => active && toast((e as Error).message, { error: true }))
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, [ready, userId, toast, migrate]);
  return { lists: listOwner === userId ? lists : [], loaded: loaded && listOwner === userId, reload, signedIn: !!userId };
}

// One tap on ♡ saves into "{City} trip" and offers Undo / Change (#16). Change,
// or tapping ♥ on a saved place, opens the sheet: tick lists, a new list, a note.
function OwnedSaveButton({
  place,
  token,
  city,
  lists,
  signedIn,
  onChange,
  onSaved,
  iconOnly = false,
}: {
  place: Entity;
  token: string;
  city: string;
  lists: SavedList[];
  signedIn: boolean;
  onChange: () => Promise<void>;
  // Saving also counts as "more like this" on place cards (docs/24).
  onSaved?: () => void;
  iconOnly?: boolean;
}) {
  const id = useId();
  const toast = useToast();
  const { data: session, isPending } = authClient.useSession();
  const saveOwner = signedIn ? session?.user?.id : undefined;
  const [imprint, setImprint] = useState<{ placeId: string; serial: number } | null>(null);
  function stampSaved() {
    setImprint(previous => ({ placeId: place.id, serial: (previous?.serial ?? 0) + 1 }));
    recordStamp({ kind: "place", city, placeId: place.id, name: place.name, createdAt: new Date().toISOString() }, signedIn ? session?.user?.id : undefined)
      .catch(e => toast(`The place is saved. ${(e as Error).message}`, { error: true }));
  }
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [note, setNote_] = useState(""),
    [newName, setNewName] = useState("");
  const sheet = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDialogElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState("");
  const saved = lists.filter((l) => l.items.some((i) => i.placeId === place.id));
  useEffect(() => {
    const dialog = panel.current;
    if (!dialog) return;
    if (!open) { dialog.close(); return; }
    dialog.showModal();
    function position() {
      if (!dialog || !trigger.current) return;
      const rect = trigger.current.getBoundingClientRect();
      if (innerWidth <= 720) { dialog.style.removeProperty("left"); dialog.style.removeProperty("top"); return; }
      dialog.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - dialog.offsetWidth - 12))}px`;
      dialog.style.top = `${Math.max(12, Math.min(rect.bottom + 8, innerHeight - dialog.offsetHeight - 12))}px`;
    }
    position(); window.addEventListener("resize", position);
    return () => window.removeEventListener("resize", position);
  }, [open]);
  // The note field shows what is already saved with the place.
  useEffect(() => {
    if (open) setNote_(saved.find((l) => l.items.some((i) => i.placeId === place.id && i.note))?.items.find((i) => i.placeId === place.id)?.note ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  async function quickSave() {
    const name = `${city} trip`;
    const existed = lists.some((l) => l.name === name);
    setError("");
    setBusy(true);
    try {
      await addToList(name, place, token, "", signedIn, saveOwner);
      stampSaved();
      await onChange();
      onSaved?.();
      toast(`Saved to ${name}`, {
        action: {
          label: "Undo",
          run: () => {
            (async () => {
              const fresh = await loadLists(signedIn);
              const list = fresh.find((l) => l.name === name && l.items.some((i) => i.placeId === place.id));
              if (list) {
                await removeFromList(list, place.id, saveOwner);
                // A list this tap created goes with it.
                if (!existed && list.items.length === 1) await deleteList(list, saveOwner);
              }
              await onChange();
            })().catch((e) => toast((e as Error).message, { error: true }));
          },
        },
        secondary: { label: "Change", run: () => setOpen(true) },
      });
    } catch (e) {
      setError((e as Error).message);
      toast((e as Error).message, { error: true });
    } finally {
      setBusy(false);
    }
  }
  function onTap() {
    if (saved.length) setOpen((v) => !v);
    else if (!busy) void quickSave();
  }
  async function run(action: () => Promise<void>, message: string, undo?: () => Promise<void>, added = false) {
    setError("");
    setBusy(true);
    try {
      await action();
      if (added) stampSaved();
      await onChange();
      if (added) onSaved?.();
      toast(message, undo && {
        action: {
          label: "Undo",
          run: () => {
            undo().then(onChange).catch((e) => toast((e as Error).message, { error: true }));
          },
        },
      });
      return true;
    } catch (e) {
      setError((e as Error).message);
      toast((e as Error).message, { error: true });
      return false;
    } finally {
      setBusy(false);
    }
  }
  function toggle(list: SavedList, on: boolean) {
    if (on)
      return run(
        () => addToList(list.name, place, token, note, signedIn, saveOwner),
        `Saved ${place.name} to “${list.name}”.`,
        () => removeFromList(list, place.id, saveOwner),
        true,
      );
    return run(
      () => removeFromList(list, place.id, saveOwner),
      `Removed ${place.name} from “${list.name}”.`,
      () => addToList(list.name, place, token, note, signedIn, saveOwner),
    );
  }
  // Writes the note on every list that holds this place.
  async function saveNote() {
    await run(async () => {
      for (const l of saved) await setNote(l, place, token, note, saveOwner);
    }, note.trim() ? "Note saved." : "Note removed.");
  }
  async function create(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    const created = await run(() => addToList(name, place, token, note, signedIn, saveOwner), `Saved ${place.name} to a new list, “${name}”.`, undefined, true);
    if (created) setNewName("");
  }
  return (
    <div className="save" ref={sheet}>
      <button
        ref={trigger}
        disabled={busy || isPending || (signedIn && !saveOwner)}
        aria-haspopup="dialog"
        className={iconOnly ? "btn btn-icon" : "btn btn-secondary"}
        aria-expanded={open}
        aria-controls={id}
        data-on={saved.length > 0 || undefined}
        onClick={onTap}
        aria-label={iconOnly ? `${saved.length ? "Saved" : "Save"} ${place.name}` : undefined}
        title={iconOnly ? (saved.length ? "Saved" : "Save") : undefined}
      >
        <ActionIcon name="bookmark" filled={saved.length > 0} />
        {!iconOnly && (saved.length ? " Saved" : " Save")}
      </button>
      {imprint?.placeId === place.id && saved.length > 0 && <span key={imprint.serial} className="save-imprint" data-travel-stamp aria-hidden="true">SAVED<br />BEESYDE</span>}
      {error && !open && <p className="save-error" role="alert">{error}</p>}
      <dialog ref={panel} className="save-sheet" id={id} aria-label={`Save ${place.name}`}
        onCancel={() => setOpen(false)} onClose={() => { setOpen(false); trigger.current?.focus({preventScroll:true}); }}
        onClick={e => { if(e.target === e.currentTarget) { const r=e.currentTarget.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)setOpen(false); } }}>
          <div className="row"><strong>Change lists</strong><button type="button" className="btn btn-icon" aria-label="Close saved place panel" onClick={() => setOpen(false)}><ActionIcon name="close" /></button></div>
          {error && <p role="alert">{error}</p>}
          {lists.length > 0 && (
            <ul>
              {lists.map((list) => {
                const on = list.items.some((i) => i.placeId === place.id);
                return (
                  <li key={list.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={on}
                        disabled={busy}
                        onChange={() => toggle(list, !on)}
                      />
                      <span>{list.name}</span>
                      <span className="meta">{list.items.length}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
          <form onSubmit={create}>
            <label htmlFor={id + "-new"}>{lists.length ? <><ActionIcon name="plus" /> New list</> : "Name your first list"}</label>
            <div className="save-new">
              <input
                id={id + "-new"}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={60}
                placeholder="e.g. Tokyo trip"
                required
                disabled={busy}
              />
              <button className="btn btn-secondary" disabled={busy || !newName.trim()}>
                Create
              </button>
            </div>
          </form>
          <details>
            <summary>{saved.some((l) => l.items.some((i) => i.placeId === place.id && i.note)) ? "Edit note" : "Add a note"}</summary>
            <input
              aria-label="Note for this place"
              value={note}
              onChange={(e) => setNote_(e.target.value)}
              maxLength={280}
              placeholder="e.g. book for Saturday"
              disabled={busy}
            />
            <div className="save-new">
              <p className="muted">Kept with the place; add or change it any time.</p>
              <button className="btn btn-secondary" type="button" onClick={saveNote} disabled={busy || !saved.length}>
                Save note
              </button>
            </div>
          </details>
          {!signedIn && (
            <p className="muted">Saved on this device. Sign in to keep your lists on every device.</p>
          )}
      </dialog>
    </div>
  );
}

export function SaveButton(props: React.ComponentProps<typeof OwnedSaveButton>) {
  const {data:session,isPending}=authClient.useSession();
  return <OwnedSaveButton key={isPending?'pending':session?.user?.id||'guest'} {...props}/>;
}
