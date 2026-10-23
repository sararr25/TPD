# Rapporto sintetico — continuazione ticket, 23 ottobre 2026

## Esito

E09 completato nel perimetro **demo Qloo** concordato con l’utente: Google Places escluso, nessuna nuova chiave o integrazione a pagamento aggiunta. Ogni alternativa ha un controllo su richiesta tra la raccomandazione e la ricerca Qloo. Tutti i risultati restano **L0**.

Il controllo non certifica esistenza, attività corrente, orari, prezzi o disponibilità: confronta due endpoint della stessa fonte. La verifica operativa indipendente originariamente prevista da E09 resta fuori dallo scope demo e aperta per un prodotto più ampio.

## Comportamento

- Nome esatto normalizzato; mai selezione automatica del primo omonimo. Fra più candidati, serve un solo indirizzo esatto per disambiguare.
- Civico/codice postale discordanti, altra città/paese o coordinate distanti oltre 150 metri producono conflitto. Differenze di formattazione non risolte restano unknown; la soglia spaziale è una scelta conservativa, non un confine certificato della sede.
- Categoria e flag di chiusura vengono confrontati solo dopo accordo di indirizzo e posizione. L’assenza del flag non conferma apertura attuale.
- Un conflitto mostra un avviso e nasconde le indicazioni nella card. Il risultato e il ranking originari non vengono modificati. Prima del controllo le indicazioni rimangono disponibili con i limiti L0 espliciti.
- Nessun risultato di ricerca non trovato viene dichiarato inesistente. Nessuna blacklist nominale.
- Endpoint interno con selezione firmata e categoria validata; Qloo resta solo server, cache privata preesistente, risposta HTTP private/no-store. Non vengono introdotti altri provider. Il link esterno alle indicazioni Google Maps preesistente resta un semplice link, senza Places API.

## Verifiche

`npm test`, `npm run build`, `npm run typecheck` e `git diff --check`: superati. Le nuove fixture sintetiche coprono omonimi, civici, indirizzi non equivalenti, categoria, coordinate, flag chiuso, unknown, token alterati/categoria incompatibile e riuso della cache senza nuove chiamate.

Prova reale nella build di produzione locale: Passport ospite → Le Baratin → tre alternative → controllo di due risultati. Du Pain et des Idées: record coerenti, etichetta L0 mantenuta e indicazioni presenti. La Crèmerie: conflitto di indirizzo/posizione, categoria e chiusura non attribuite alla sede incerta, indicazioni nascoste. Nessun overflow orizzontale nella viewport desktop corrente. Evidenza solo privata: `.private/qa/e09-qloo-consistency.json` (riepilogo della verifica DOM nel browser).

Questa prova non sostituisce un audit completo di tastiera, zoom o schermi stretti. Nessun deploy, nessuna nuova raccolta benchmark e nessun dato Qloo grezzo aggiunto al repository.

## Ticket residui e A/B testing

I ticket **non sono tutti conclusi**. Prossima priorità tecnica: E02, cache e protezione quota condivise prima del deploy. Restano inoltre decisioni su login/nome/licenza, integrazioni esterne e QA documentata nella board; E04 resta parziale con valutazione umana rimandata.

La richiesta di A/B testing era subordinata alla conclusione dei ticket: nessun nuovo esperimento viene avviato o dichiarato completato. Il precedente benchmark ha tre condizioni raccolte su 16 scenari correlati, non traffico randomizzato; l’audit Qloo della stessa fonte non può provare un incremento di qualità. Nessun vincitore, p-value o uplift viene dedotto da questi controlli tecnici.

Per un eventuale test futuro si useranno ipotesi, singola variabile, metrica primaria, campione e durata fissati prima della raccolta, secondo la skill ab-testing. Non vengono richiesti voti all’utente né inventati partecipanti.
