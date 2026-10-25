import assert from 'node:assert/strict';
import { discoverEvents, EventsError } from '../src/lib/server/events.ts';
const now = new Date('2026-10-25T12:00:00Z');
const original = globalThis.fetch;
const row = { id: '1', title: '<b>Paris concert</b>', date_start: '2026-10-26T19:00:00+01:00', date_end: '2026-10-26T22:00:00+01:00',
 address_name: 'Public venue', address_street: 'Example street', address_city: 'Paris', address_zipcode: '75001',
 url: 'https://www.paris.fr/evenements/example', qfap_tags: 'Concert;Musique', price_type: 'gratuit', lat_lon: { lat: 48.8, lon: 2.3 }, date_description: '<p>One session</p>' };
let calls = 0;
try {
 globalThis.fetch = async (url, options) => {
  calls++;
  assert.equal(new URL(url).hostname, 'opendata.paris.fr');
  assert.equal(new URL(url).searchParams.get('limit'), '50');
  assert.equal(options.redirect, 'error');
  return Response.json({ results: [row, row,
   { ...row, id: '2', address_city: 'Versailles' },
   { ...row, id: '3', url: 'https://evil.invalid/' },
   { ...row, id: '4', date_end: '2025-01-01T00:00:00Z' },
   { ...row, id: '5', date_start: null },
   { ...row, id: '6', price_type: 'Prix libre', title: '<script>bad()</script>Second event', lat_lon: { lat: 200, lon: 300 } },
  ] });
 };
 const unsupported = await discoverEvents('Lisbon', now); assert.equal(unsupported.supported, false); assert.equal(calls, 0);
 const result = await discoverEvents('Paris', now);
 assert.equal(result.events.length, 2); assert.equal(result.events[0].title, 'Paris concert');
 assert.deepEqual(result.events[0].types, ['Concert', 'Musique']);
 assert.equal(result.events[0].price, 'free'); assert.equal(result.events[0].timezone, 'Europe/Paris');
 assert.equal(result.events[1].price, 'unknown'); assert.equal(result.events[1].lat, null); assert.equal(result.events[1].title, 'Second event');
 assert.equal(result.source.license, 'ODbL');
 globalThis.fetch = async () => new Response('<html>error</html>', { status: 200, headers: { 'Content-Type': 'text/html' } });
 await assert.rejects(() => discoverEvents('Paris', now), EventsError);
 globalThis.fetch = async () => Response.json({ bad: [] });
 await assert.rejects(() => discoverEvents('Paris', now), EventsError);
 globalThis.fetch = async () => Response.json({ results: [], waste: 'x'.repeat(2_000_000) });
 await assert.rejects(() => discoverEvents('Paris', now), EventsError);
 console.log('PASS: dated municipal events validate city, range, provenance, URLs, prices and plain text; dedupe, unsupported cities and bounded failures.');
} finally { globalThis.fetch = original; }
