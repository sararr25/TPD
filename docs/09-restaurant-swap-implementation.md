# Restaurant Swap — primo flusso live

20 ottobre 2026. Stato: implementato e verificato localmente, non distribuito su Vercel.

## Scope provato

Parigi è il pilot. Le query per ristoranti e musei hanno restituito dieci candidati ciascuna, con categoria, città dichiarata, indirizzo e coordinate coerenti. Per Tokyo, la locality comprende municipalità con nomi diversi da Tokyo; per New York alcuni musei hanno città diversa. Questi casi restano aperti: nessuna espansione silenziosa del pilot.

L'audit controlla i metadati Qloo; non costituisce una verifica esterna di esistenza o una verifica geometrica indipendente dei poligoni. Il runtime impone locality Parigi con radius=0 e ricontrolla città Paris, paese FR, categoria ristorante, indirizzo e coordinate.

## Percorso implementato

1. Passport: ricerca live di artisti, film, libri e luoghi tramite Qloo; selezione esplicita di 3–5 entità. I film omonimi mostrano disambiguazione/anno.
2. Due Passport ospiti risolti live: musica/cinema oppure musica. Per il film del primo è richiesto l'anno 1995; non si sceglie il primo omonimo.
3. Ricerca del ristorante a Parigi e conferma dell'indirizzo.
4. Fino a sei tag di atmosfera/offerta della reference: Keep, Change, Ignore. Budget separato, espresso come fascia indicativa Qloo, non prezzo in euro.
5. Una query Insights GET con Passport + riferimento, categoria, città, esclusioni e explainability.
6. Validazione locale e tre ruoli distinti. Se mancano candidati o metadati, alcuni ruoli non vengono mostrati. Nessun riempimento fittizio.
7. Dettagli di verifica espandibili e link indicazioni costruiti dalle coordinate. Tutti i risultati sono L0, senza verifiche Places, orari o disponibilità.

Keep usa gli ID dei tag e un peso comune del gruppo, compatibile con GET. Non invia pesi per-tag tramite body POST. Change esclude i tag, ricontrollati anche sulla risposta. Dopo il primo Swap, ogni modifica di chip/budget ricalcola: i risultati vecchi vengono rimossi e risposte obsolete ignorate.

## Adapter e cache

- Unico trasporto server in `src/lib/server/qloo.ts`, import protetto da `server-only`.
- Solo host hackathon, header X-Api-Key, GET, timeout 15 secondi, redirect rifiutati, zero retry.
- Cache privata **in memoria per processo**, TTL 15 minuti, massimo 100 voci, deduplicazione richieste simultanee. Non scrive risposte nei file pubblici o nella cache Next/CDN.
- Spaziatura minima di 300 ms tra partenze delle chiamate del processo; coda limitata, cooldown 60 secondi dopo 429. Non è un rate limiter distribuito.
- Selezioni firmate HMAC lato server con scadenza 24 ore: il client non può costruire reference o tag arbitrari. Chiave mai inviata al browser; i token non sostituiscono autenticazione o autorizzazione utente.
- Endpoint POST dell'app con controllo Origin/Host, limiti input, errori sanitizzati e `private, no-store`. Le chiamate upstream a Qloo restano GET.
- Passport locale in `tpd-passport-v2`. I vecchi dati campione non sono migrati in entità vere. Cancellazione locale esplicita. I token scaduti richiedono una nuova selezione.

Prima di un deploy pubblico: scegliere storage/cache e rate limiting condivisi, con isolamento e cancellazione; nessun servizio esterno attivato in questo incremento.

## Logica dei tre ruoli

- Closest cultural match: primo candidato rimasto nell'ordinamento Qloo.
- Best practical match: candidato distinto più vicino al riferimento in linea d'aria, dopo i vincoli selezionati. Non promette tempi di viaggio o orari.
- Unexpected but relevant: candidato distinto con minore popolarità Qloo fra quelli rimasti. Non misura affollamento.

Le spiegazioni citano solo gli input presenti nei metadati di contributo. Se non disponibili, lo dichiarano. Nessuna percentuale di match o spiegazione LLM inventata.

## Evidenza

- Otto query aggiuntive dell'audit categoria/area e Keep/Change, risposte in `.private/qloo/`.
- Esclusione Change rispettata nel campione Parigi; HTTP 200 non usato da solo come criterio.
- Build e TypeScript passano.
- `npm test`: città/paese/categoria, budget sconosciuto, chiusura, esclusioni, deduplicazione, ruoli distinti, dati corrotti, warning explainability, firme, cache e richieste simultanee. Fixture interamente sintetiche; nessuna chiamata live nei test.
- Browser: Passport ospite musica/cinema risolto e salvato → conferma reference → Keep → tre alternative → Change e nuovi risultati → prezzo massimo e nuovi risultati → dettaglio verifica espanso.
- Browser: layout a 1440 px e controllo a 390 px, larghezza documento pari a viewport (nessun overflow orizzontale nel campione). Screenshot solo in `.private/qa/`, non nel repository.
- Errori HTTP locali: origine diversa/assente 403; JSON errato, tipo non consentito e selezione manomessa 400. Nessun dato provider pubblicato per queste prove.

Non chiusi: audit completo tastiera/zoom/contrasto, test qualità con utenti, ranking benchmark, integrazioni operative, login/collezioni, musei e Transfer, cache distribuita, deploy.
