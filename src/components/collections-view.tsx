"use client";
import {organise} from "@/lib/travel-state";
import {useTravelState} from "./travel-state";
import {TripGroups,TripPlaceTools,PlaceVisitControl} from "./trip-organisation";
import {TravelNotebook} from "./travel-notebook";
import { ActionIcon } from "./action-icon";
import { Fragment, useRef, useState } from "react";
import Link from "next/link";
import { PassportSecurityLines, PassportEmblem } from "./passport-art";
import { AuthButton } from "./auth-button";
import { authClient } from "@/lib/auth/client";
import { removeFromList, deleteList, savedItemCity, savedItemPhoto, type SavedList, type SavedItem } from "@/lib/saved";
import { citySlug } from "@/lib/discovery";
import { PlacePhoto } from "./place-photo";
import { CityMap } from "./city-map";
import { useSavedLists } from "./save-button";
import { useToast } from "./toast";
import { EmptyState, LoadingCards } from "./empty-state";
import { ShareTrip } from "./share-trip";

// Saved places grouped by list (docs/22 F1-F3). Guests see this device's
// lists; signed in, they move to the account and follow you everywhere.
export function CollectionsView() {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const toast = useToast();
  const travel = useTravelState();
  const { lists, loaded, reload } = useSavedLists(!isPending, userId);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<string | null>(null);
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
    <div className="trip-leaves">
      <header className="trip-page-head passport-leaf-heading">
        <PassportSecurityLines />
        <PassportEmblem className="trip-passport-emblem" />
        <div>
          <h1>Your trips</h1>
          <p>The places you saved, ready for when you go.</p>
        </div>
      </header>
      {!loaded ? (
        <LoadingCards label="Opening your trips…" />
      ) : lists.length === 0 ? (
        <EmptyState title="Your next trip starts with one place." action={<Link className="btn btn-primary" href="/explore">Browse cities</Link>}>
          <p>Tap Save on a place you like. We’ll keep it here in a trip list.</p>
        </EmptyState>
      ) : (
        lists.map((original) => { const c={...original,items:organise(original.items,travel.state.trips[original.id])};return (
          <section className="trip" data-travel-page key={c.id} aria-labelledby={`trip-${c.id}`}>
            <header className="trip-head">
              <svg className="trip-route-mark" viewBox="0 0 180 60" fill="none" aria-hidden="true"><path data-travel-route d="M8 42C34 42 30 12 62 12S99 49 129 37 151 18 172 18" /><circle cx="8" cy="42" r="4" /><circle cx="172" cy="18" r="4" /></svg>
              <div>
                <h2 id={`trip-${c.id}`}>{c.name}</h2>
                <p className="muted">
                  {c.items.length} saved place{c.items.length === 1 ? "" : "s"}
                  {c.local && " · On this device only"}
                </p>
              </div>
              <div className="actions trip-head-actions">
              <ShareTrip list={c} /><TravelNotebook list={c} />
              <button
                className="btn btn-quiet"
                disabled={busy}
                onClick={event => {
                  event.currentTarget.focus();
                  setPending(c);
                  dialog.current?.showModal();
                }}
              >
                Delete list
              </button>
              </div>
            </header>
            <TripGroups list={c} />
            {c.items.length === 0 ? (
              <EmptyState title="Room for your next find." action={<Link className="btn btn-secondary" href="/explore">Find a place</Link>}>
                <p>This trip has no saved places yet.</p>
              </EmptyState>
            ) : (
              <div className="trip-layout">
                <div className="trip-cards">
                  {c.items.map((item,index) => (
                    <Fragment key={item.placeId}>{(index===0||(travel.state.trips[c.id]?.places.find(p=>p.id===item.placeId)?.group||'')!==(travel.state.trips[c.id]?.places.find(p=>p.id===c.items[index-1].placeId)?.group||''))&&<h3 className="trip-group-heading">{travel.state.trips[c.id]?.places.find(p=>p.id===item.placeId)?.group||'Ungrouped'}</h3>}
                    <SavedPlaceCard
                      key={item.placeId}
                      item={item}
                      list={c}
                      number={c.items.filter(hasCoordinates).findIndex((mapped) => mapped.placeId === item.placeId) + 1}
                      busy={busy}
                      active={active === `${c.id}:${item.placeId}`}
                      onActive={() => setActive(`${c.id}:${item.placeId}`)}
                      onRemove={() => run(() => removeFromList(c, item.placeId,userId), `Removed ${item.name} from “${c.name}”.`)}
                    /></Fragment>
                  ))}
                </div>
                {c.items.some(hasCoordinates) ? (
                  <aside className="trip-map" aria-label={`Map of ${c.name}`}>
                    <CityMap
                      places={c.items.filter(hasCoordinates).map((item) => ({
                        id: item.placeId, name: item.name, lat: item.lat, lon: item.lon,
                      }))}
                      active={active?.startsWith(`${c.id}:`) ? active.slice(c.id.length + 1) : null}
                      onPick={(id) => {
                        setActive(`${c.id}:${id}`);
                        document.getElementById(`saved-${c.id}-${id}`)?.scrollIntoView({
                          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
                          block: "center",
                        });
                      }}
                    />
                    {c.items.some((item) => !hasCoordinates(item)) && (
                      <p className="muted">Some saved places have no map location yet. They are listed here too.</p>
                    )}
                  </aside>
                ) : (
                  <p className="trip-map-empty muted">These saved places have no map locations yet. Open a place for its address.</p>
                )}
              </div>
            )}
          </section>
        );})
      )}
      {travel.error && <div className="travel-panel" role="alert"><p>{travel.error}</p><button className="btn btn-secondary" onClick={travel.retry}>Retry trip changes</button><button className="btn btn-quiet" onClick={travel.reload}>Reload account trip data</button></div>}
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
              if (list) run(async () => {await deleteList(list,userId);if(travel.state.trips[list.id]){const trips={...travel.state.trips};delete trips[list.id];await travel.change({...travel.state,trips});}}, `Deleted “${list.name}”.`);
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
        <section className={lists.length ? "paper" : "trip-sync-invitation"}>
          {lists.length > 0 && <h2>Keep your lists on every device.</h2>}
          <p>
            {anyLocal
              ? "These lists are saved on this device. Sign in and they move to your account, so they follow you to your phone and back."
              : "Sign in and your lists follow you to your phone and back."}
          </p>
          <AuthButton />
        </section>
      )}
    </div>
  );
}


function hasCoordinates(item: SavedItem): boolean {
  return typeof item.lat === "number" && Number.isFinite(item.lat) && Math.abs(item.lat) <= 90 &&
    typeof item.lon === "number" && Number.isFinite(item.lon) && Math.abs(item.lon) <= 180;
}

function SavedPlaceCard({ item, list, number, busy, active, onActive, onRemove }: {
  item: SavedItem;
  list: SavedList;
  number: number;
  busy: boolean;
  active: boolean;
  onActive: () => void;
  onRemove: () => void;
}) {
  const city = savedItemCity(item, list.name);
  const photo = savedItemPhoto(item);
  const href = city
    ? `/${citySlug(city)}/${item.placeId.toLowerCase()}`
    : `/place/${item.placeId.toLowerCase()}`;
  return (
    <article data-travel-page className="saved-place" id={`saved-${list.id}-${item.placeId}`} data-active={active || undefined}
      onMouseEnter={onActive} onFocus={onActive}>
      <Link className="saved-place-photo" href={href} prefetch={false} tabIndex={-1} aria-hidden="true">
        <PlacePhoto placeId={item.placeId} image={photo} city={city || ""} label={city || "Saved place"} lazy />
        {hasCoordinates(item) && <span className="saved-place-pin">{number}</span>}
      </Link>
      <div className="saved-place-body">
        <h3><Link href={href} prefetch={false}>{item.name}</Link></h3>
        {city && <p className="meta">{city}</p>}
        {item.address && <p className="muted">{item.address}</p>}
        {item.note && <p className="saved-place-note">{item.note}</p>}
        <TripPlaceTools list={list} item={item}/><PlaceVisitControl id={item.placeId} showErrors={false}/>
        <div className="saved-place-actions">
          {hasCoordinates(item) && (
            <a className="btn btn-quiet" href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lon}`}
              target="_blank" rel="noreferrer">Directions <ActionIcon name="external" /></a>
          )}
          <button className="btn btn-quiet" disabled={busy} onClick={onRemove} aria-label={`Remove ${item.name} from ${list.name}`}>Remove</button>
        </div>
      </div>
    </article>
  );
}
