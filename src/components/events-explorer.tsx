"use client";
import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import type { EventsResult } from "@/lib/server/events";

const dateLabel = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Paris" }).format(new Date(value));
const dayKey = (value: string) => new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Paris" }).format(new Date(value));

/** Municipal event browse: these dated records are distinct from venue twins. */
export function EventsExplorer({ city }: { city: string }) {
  const fieldId = useId();
  const cityKey = city.trim().toLowerCase();
  const supported = cityKey === "paris";
  const [state, setState] = useState<{ city: string; data?: EventsResult; error?: boolean }>({ city: "" });
  const [attempt, setAttempt] = useState(0);
  const [filters, setFilters] = useState({ city: cityKey, from: "", to: "", type: "", price: "" });
  const active = filters.city === cityKey ? filters : { city: cityKey, from: "", to: "", type: "", price: "" };
  const setFilter = (key: "from" | "to" | "type" | "price", value: string) => setFilters({ ...active, [key]: value });
  const data = state.city === cityKey ? state.data : undefined;
  const failed = state.city === cityKey && state.error;
  useEffect(() => {
    if (!supported) return;
    const controller = new AbortController();
    setState({ city: cityKey });
    fetch(`/api/events?city=${encodeURIComponent(cityKey)}`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("events_unavailable");
        const result = await response.json() as EventsResult;
        if (!Array.isArray(result.events) || !result.supported) throw new Error("events_unavailable");
        if (!controller.signal.aborted) setState({ city: cityKey, data: result });
      })
      .catch(() => { if (!controller.signal.aborted) setState({ city: cityKey, error: true }); });
    return () => controller.abort();
  }, [cityKey, supported, attempt]);
  const types = useMemo(() => [...new Set(data?.events.flatMap(event => event.types) || [])].sort(), [data]);
  const invalidRange = Boolean(active.from && active.to && active.from > active.to);
  const events = (data?.events || []).filter(event => !invalidRange &&
    (!active.from || dayKey(event.end) >= active.from) &&
    (!active.to || dayKey(event.start) <= active.to) &&
    (!active.type || event.types.includes(active.type)) &&
    (!active.price || event.price === active.price));

  if (!supported) return <section className="events-explorer events-coverage" aria-label="Events coverage">
    <p className="eyebrow">Events · source coverage</p>
    <h2>Dated events are available in Paris</h2>
    <p>Our municipal-events pilot has dates, venues and links to the original listings. Events in {city} aren’t connected yet. A music venue alone isn’t an event.</p>
    {cityKey === "lisbon" && <a className="btn btn-secondary" href="https://www.agendalx.pt/" target="_blank" rel="noreferrer">Check Lisbon’s official agenda ↗</a>}
    <p><Link className="btn btn-secondary" href="/paris?events=1">Browse the Paris events pilot →</Link> <a href="https://www.paris.fr/que-faire-a-paris" target="_blank" rel="noreferrer">Official Paris agenda ↗</a></p>
    <p className="meta">Choose Paris to browse the pilot. Event browsing is separate from Find its twin for places.</p>
  </section>;

  return <section className="events-explorer" aria-labelledby={`${fieldId}-title`}>
    <header className="events-header">
      <div><p className="eyebrow">Dated discoveries · Paris pilot</p><h2 id={`${fieldId}-title`}>A date with the city</h2></div>
      <p>Real events from the city’s cultural agenda. Browse the next 30 days; check the original listing for sessions, prices and access.</p>
    </header>
    <div role="status" aria-live="polite" aria-atomic="true">
      {!data && !failed && <p className="events-status" aria-busy="true">Opening Paris’s cultural agenda…</p>}
      {failed && <div className="events-status"><p>The cultural agenda couldn’t load. Your other city picks are still available.</p><button type="button" className="btn btn-secondary" onClick={() => setAttempt(n => n + 1)}>Try events again</button></div>}
    </div>
    {data && <>
      <div className="events-filters">
        <label htmlFor={`${fieldId}-from`}>From<input id={`${fieldId}-from`} type="date" value={active.from} onChange={event => setFilter("from", event.target.value)} /></label>
        <label htmlFor={`${fieldId}-to`}>Until<input id={`${fieldId}-to`} type="date" value={active.to} onChange={event => setFilter("to", event.target.value)} /></label>
        <label htmlFor={`${fieldId}-type`}>Event type<select id={`${fieldId}-type`} value={active.type} onChange={event => setFilter("type", event.target.value)}><option value="">All types</option>{types.map(type => <option key={type}>{type}</option>)}</select></label>
        <label htmlFor={`${fieldId}-price`}>Admission<select id={`${fieldId}-price`} value={active.price} onChange={event => setFilter("price", event.target.value)}><option value="">Any admission</option><option value="free">Free</option><option value="paid">Paid</option><option value="unknown">Check price</option></select></label>
      </div>
      <p className="meta" role="status">{invalidRange ? "Choose an Until date on or after From." : `${events.length} of ${data.events.length} supplied events · ${dateLabel(data.period.from)}–${dateLabel(data.period.to)} · Europe/Paris`}</p>
      <p className="meta">Filters apply to this selection of up to 50 events, including ongoing exhibitions. A date range doesn’t guarantee a session every day. These are municipal listings, not personal Twin rankings.</p>
      {events.length ? <ol className="events-list">{events.map(event => <li key={event.id} className="event-card" data-travel-enter>
        <div className="event-date"><time dateTime={event.start}>{dateLabel(event.start)}</time>{dayKey(event.start) !== dayKey(event.end) && <><span>until</span><time dateTime={event.end}>{dateLabel(event.end)}</time></>}</div>
        <div className="event-copy"><p className="eyebrow">{event.types.slice(0, 2).join(" · ") || "Cultural event"}</p><h3><a href={event.url} target="_blank" rel="noreferrer">{event.title} ↗</a></h3><p>{event.venue}<br /><span className="meta">{event.address}</span></p>{event.schedule && <p className="event-schedule">{event.schedule}</p>}<p className="event-price">{event.price === "free" ? "Free admission" : event.price === "paid" ? "Paid admission" : "Check admission price"}{event.priceDetail && ` · ${event.priceDetail}`}</p><a className="event-verify" href={event.url} target="_blank" rel="noreferrer">Check sessions & access at Paris.fr ↗</a></div>
      </li>)}</ol> : <div className="events-status"><h3>{data.events.length ? "No events in this selection match" : "No dated events returned"}</h3><p>{data.events.length ? "Try a wider date range or another event type. These filters cover the supplied selection, not the whole agenda." : "The agenda returned no eligible Paris events for the next 30 days. Check the official agenda for more options."}</p>{data.events.length > 0 && <button type="button" className="btn btn-secondary" onClick={() => setFilters({ city: cityKey, from: "", to: "", type: "", price: "" })}>Clear event filters</button>}</div>}
      <p className="events-credit meta">Source: <a href={data.source.url} target="_blank" rel="noreferrer">{data.source.name}</a> · <a href={data.source.licenseUrl} target="_blank" rel="noreferrer">{data.source.license}</a> · Retrieved {dateLabel(data.checkedAt)}. Listing details can change; availability isn’t confirmed.</p>
    </>}
    {failed && <p><a href="https://www.paris.fr/que-faire-a-paris" target="_blank" rel="noreferrer">Open the official Paris agenda ↗</a></p>}
  </section>;
}
