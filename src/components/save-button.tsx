"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Entity } from "@/lib/discovery";
import { addToList, deleteList, loadLists, moveLocalLists, removeFromList, setNote, type SavedList } from "@/lib/saved";
import { useToast } from "./toast";

// Lists for a results page (docs/22 F1-F3). Signed in, this browser's lists
// move to the account first; anything that cannot move is reported.
export function useSavedLists(ready: boolean, userId: string | undefined) {
  const toast = useToast();
  const [lists, setLists] = useState<SavedList[]>([]),
    [loaded, setLoaded] = useState(false);
  const reload = useCallback(async () => setLists(await loadLists(!!userId)), [userId]);
  useEffect(() => {
    if (!ready) return;
    let active = true;
    (async () => {
      if (userId) {
        const { moved, failed } = await moveLocalLists();
        if (moved) toast(`Moved ${moved} saved place${moved === 1 ? "" : "s"} from this device to your account.`);
        if (failed.length)
          toast(`${failed.length} saved place${failed.length === 1 ? "" : "s"} could not move to your account yet: ${failed.join(", ")}. They stay on this device.`, { error: true });
      }
      const found = await loadLists(!!userId);
      if (active) setLists(found);
    })()
      .catch((e) => active && toast((e as Error).message, { error: true }))
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, [ready, userId, toast]);
  return { lists, loaded, reload, signedIn: !!userId };
}

// One tap on ♡ saves into "{City} trip" and offers Undo / Change (#16). Change,
// or tapping ♥ on a saved place, opens the sheet: tick lists, a new list, a note.
export function SaveButton({
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
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [note, setNote_] = useState(""),
    [newName, setNewName] = useState("");
  const sheet = useRef<HTMLDivElement>(null);
  const saved = lists.filter((l) => l.items.some((i) => i.placeId === place.id));
  // Close on Escape or a click outside the sheet.
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const click = (e: MouseEvent) => {
      if (sheet.current && !sheet.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", key);
    document.addEventListener("mousedown", click);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("mousedown", click);
    };
  }, [open]);
  // The note field shows what is already saved with the place.
  useEffect(() => {
    if (open) setNote_(saved.find((l) => l.items.some((i) => i.placeId === place.id && i.note))?.items.find((i) => i.placeId === place.id)?.note ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  async function quickSave() {
    const name = `${city} trip`;
    const existed = lists.some((l) => l.name === name);
    setBusy(true);
    try {
      await addToList(name, place, token, "", signedIn);
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
                await removeFromList(list, place.id);
                // A list this tap created goes with it.
                if (!existed && list.items.length === 1) await deleteList(list);
              }
              await onChange();
            })().catch((e) => toast((e as Error).message, { error: true }));
          },
        },
        secondary: { label: "Change", run: () => setOpen(true) },
      });
    } catch (e) {
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
    setBusy(true);
    try {
      await action();
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
    } catch (e) {
      toast((e as Error).message, { error: true });
    } finally {
      setBusy(false);
    }
  }
  function toggle(list: SavedList, on: boolean) {
    if (on)
      return run(
        () => addToList(list.name, place, token, note, signedIn),
        `Saved ${place.name} to “${list.name}”.`,
        () => removeFromList(list, place.id),
        true,
      );
    return run(
      () => removeFromList(list, place.id),
      `Removed ${place.name} from “${list.name}”.`,
      () => addToList(list.name, place, token, note, signedIn),
    );
  }
  // Writes the note on every list that holds this place.
  async function saveNote() {
    await run(async () => {
      for (const l of saved) await setNote(l, place, token, note);
    }, note.trim() ? "Note saved." : "Note removed.");
  }
  async function create(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    await run(() => addToList(name, place, token, note, signedIn), `Saved ${place.name} to a new list, “${name}”.`, undefined, true);
    setNewName("");
  }
  return (
    <div className="save" ref={sheet}>
      <button
        className="icon-button"
        aria-expanded={open}
        aria-controls={id}
        data-on={saved.length > 0 || undefined}
        onClick={onTap}
        aria-label={iconOnly ? `${saved.length ? "Saved" : "Save"} ${place.name}` : undefined}
        title={iconOnly ? (saved.length ? "Saved" : "Save") : undefined}
      >
        <span aria-hidden>{saved.length ? "♥" : "♡"}</span>
        {!iconOnly && (saved.length ? " Saved" : " Save")}
      </button>
      {open && (
        <div className="save-sheet" id={id} role="group" aria-label={`Save ${place.name}`}>
          <strong>Change lists</strong>
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
            <label htmlFor={id + "-new"}>{lists.length ? "＋ New list" : "Name your first list"}</label>
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
              <button className="stamp" disabled={busy || !newName.trim()}>
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
              <button className="stamp" type="button" onClick={saveNote} disabled={busy || !saved.length}>
                Save note
              </button>
            </div>
          </details>
          {!signedIn && (
            <p className="muted">Saved on this device. Sign in to keep your lists on every device.</p>
          )}
        </div>
      )}
    </div>
  );
}
