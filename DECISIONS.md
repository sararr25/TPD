# Beesyde — Registro delle decisioni

**Progetto:** Beesyde (ex nome provvisorio TPD), Qloo Agentic Hackathon 2026
**Aggiornato:** 19 ottobre 2026
**Scadenza submission:** 30 ottobre 2026, 23:45 EDT (verificare il countdown ufficiale su Devpost)

Questo file raccoglie tutte le decisioni prese fino ad ora. Il dettaglio e le fonti sono in `docs/`:
`00-product-brief.md` · `01-research-and-brainstorm.md` · `02-b2c-product-structure.md` · `03-data-sources-and-verification.md` · `04-design-direction-research.md` · `05-design-handover.md`.

---

## 1. Direzione

| # | Decisione |
|---|---|
| 1.1 | Il prodotto è un **motore di scoperta di esperienze alternative basato sui gusti**: "Keep what you love. Change what doesn't work." |
| 1.2 | Per l'hackathon si costruisce il **B2C**. Il B2B (hotel, concierge, DMO) resta roadmap, non scope. |
| 1.3 | Gesto centrale: **Swap**, cioè "il posto che volevo non va, trova quello giusto per me". Il Taste Passport è il motore. |
| 1.4 | Non si costruisce: chat libera generica, itinerari multi-giorno, prenotazione end-to-end. |
| 1.5 | Posizionamento: non "hidden gems" né "città simili", ma sostituzione motivata e controllabile, con onestà su ciò che è verificato. |

## 2. Destinazioni della demo

| # | Decisione |
|---|---|
| 2.1 | Tre paesi europei: **Portogallo, Francia (Parigi), Spagna (Barcellona/Madrid)**. |
| 2.2 | **Vietnam, Giappone, New York.** |
| 2.3 | Sei destinazioni da testare, non da promettere: si parte con una per area (Parigi, Tokyo, New York) e si aggiunge il resto solo se la copertura Qloo lo permette. Nell'app non si scrive "supportato" per ciò che non è stato provato. |
| 2.4 | **Fallback Asia:** se Qloo ha pochi dati, Asia ridotta a **2 città** (Tokyo + Hanoi o Ho Chi Minh), dichiarate. Il grosso della demo va su New York ed Europa. |
| 2.5 | Le città definitive si scelgono dopo le query di verifica con la chiave Qloo. |

## 3. Prodotto B2C

### Ingresso e account
| # | Decisione |
|---|---|
| 3.1 | **Passport prima di tutto:** il primo passo è comporre il Taste Passport. |
| 3.2 | **Demo ospite** con Passport precompilato (2–3 profili di esempio): i giudici provano subito, senza registrarsi. |
| 3.3 | **Account con login** per salvare Passport e collezioni. |
| 3.4 | Il Passport si può creare senza account (locale); il login compare al primo "Salva" o "Condividi". |
| 3.5 | Metodo di login **da decidere** (magic link o Google). |

### Passport
| # | Decisione |
|---|---|
| 3.6 | Segnali al primo accesso: **artisti e musica · film, serie, libri · luoghi già amati**. |
| 3.7 | Budget, dieta e accessibilità non sono gusti Qloo: sono vincoli duri, fuori dal Passport iniziale. |
| 3.8 | 3–5 scelte, in circa 20 secondi. |

### Categorie
| # | Decisione |
|---|---|
| 3.9 | **Ristoranti e bar · musei, gallerie e cultura · hotel e alloggi · quartieri e zone · attività, spettacoli ed escursioni.** |
| 3.10 | Ordine di costruzione: ristoranti → musei/cultura → quartieri → hotel → attività/spettacoli. Una categoria che non regge i dati esce dall'MVP, non si finge. |

### Interazione e risultati
| # | Decisione |
|---|---|
| 3.11 | **Keep/Change con chip dai tag Qloo**, ciascuno Keep / Change / Ignora (4–6 chip), con ricalcolo a ogni tocco. |
| 3.12 | **Tre ruoli di risultato:** Closest cultural match · Best practical match · Unexpected but relevant. |
| 3.13 | Ogni card: **Why it matches you · What's different · What we verified**. Nessun "96% vibe match" né punteggi non spiegabili. |
| 3.14 | Azioni sul risultato: **salva in collezioni · apri mappa e indicazioni · feedback che aggiorna il Passport**. |
| 3.15 | Non è stato scelto un link "Controlla disponibilità": l'app non mostra mai "Prenota" né "Disponibile" dove non è verificato. |

### Il "wow" e il tono
| # | Decisione |
|---|---|
| 3.16 | Momento guida della demo: **Transfer cross-domain** (stesso Passport su ristorante → museo → quartiere). |
| 3.17 | Secondo momento: **Qloo vs LLM affiancati** sulla stessa richiesta. |
| 3.18 | Identità: **giocosa e social**, con la scheda Passport come "carta d'identità del gusto". Le etichette di verifica restano sobrie e precise. |
| 3.19 | **Piattaforma: web app desktop, non mobile.** Le schermate si disegnano a 1440 px; il layout deve solo non rompersi su schermi stretti. |
| 3.20 | **Direzione visiva:** base A (Passport e timbri), più calma; timbri a inchiostro su carta, pochi tocchi della C. **Mai azzurro chiaro né verde scuro** nella palette. Prototipi in `design-mockups/A2-*.html`. |
| 3.21 | **Design system scelto** (dallo style explorer `design-mockups/A3-style-explorer.html`): palette **Carbone e fucsia** (`--bg #F4F4F3`, `--paper #FFFFFF`, `--ink #1E1D22`, `--ink-2 #55535C`, `--line #E0DFE2`, `--pass #26242C`, `--on-pass #FFFFFF`, `--stamp #D61F69`, `--third #D9860B`); font **Familjen Grotesk** (titoli e testo, enfasi in corsivo dello stesso font) + **Martian Mono** (etichette e dati); simboli **ad anello-timbro**; bottoni **timbro di gomma**, tranne **un solo bottone principale per schermata in stile biglietto** (es. "Swap it"). Sostituisce Oltremare/Prugna e Instrument Serif. |

## 4. Qloo e architettura

| # | Decisione |
|---|---|
| 4.1 | Accesso: **HTTP diretto** a `https://hackathon.api.qloo.com`, header `X-Api-Key`. L'harness `@qloo/qloo-harness` è opzionale. Conferma finale all'arrivo della chiave. |
| 4.2 | La chiave resta **solo lato server**: mai nel browser, nel repo, nelle demo registrate. |
| 4.3 | Endpoint da usare: `/v2/insights`, `/search`, `/v2/tags`. Mai `/recommendations` né `/recs`. |
| 4.4 | Keep/Change si traduce in `signal.interests.tags` con peso (Keep) e `filter.exclude.tags` (Change). Confine geografico con `filter.location.query` (locality) e `radius=0`, non il raggio in metri. |
| 4.5 | `urn:heatmap` **non è nell'elenco dei tipi supportati**: da considerare non disponibile finché non è provato. |
| 4.6 | I parametri non validi vengono ignorati in silenzio: ogni risposta va controllata rispetto ai parametri inviati. |
| 4.7 | **Le risposte Qloo non si salvano in un repository pubblico.** Cache e casi precalcolati (confronto Qloo vs LLM) stanno in un database privato lato server; il repo contiene solo gli script per rigenerarli. |
| 4.8 | Nessuno scraping e nessuna ricostruzione di un database dalle API Qloo; retry limitati. |
| 4.9 | L'adapter Qloo è sostituibile (un solo punto di accesso), così un cambio di accesso non tocca il resto. |
| 4.10 | Stack confermato il 20 ottobre: **Next.js + TypeScript su Vercel**. Scaffold locale completato; deploy non eseguito. |

## 5. Dati operativi e verifica

| # | Decisione |
|---|---|
| 5.1 | Fonti: **Qloo + Google Places + Ticketmaster**, più Viator per le attività. |
| 5.2 | **Scala di verifica:** L0 consigliato da Qloo · L1 esiste, posizione e orari (Places) · L2 pagina dove controllare/prenotare · L3 disponibilità e prezzo veri dal provider. Ogni risultato dichiara il suo livello. |
| 5.3 | I ristoranti non arrivano mai a L3. Google `reservable` dice solo se il luogo accetta prenotazioni, non se ci sono posti. |
| 5.4 | **Registro "paese × categoria → provider"** come file di configurazione: se un'integrazione cade, si cambia una riga. Alimenta anche l'etichetta di verifica nell'interfaccia. |
| 5.5 | **Eventi in Giappone e Vietnam:** "spettacoli" = esperienze culturali dal vivo prenotabili via **Viator** (L3). I concerti restano **link di uscita** (Peatix, e+, Ticketbox), dichiarati non verificati. |
| 5.6 | Ticketmaster per New York ed Europa; la copertura per Portogallo, Francia e Spagna va verificata paese per paese. |
| 5.7 | **Monetizzazione:** link affiliati dichiarati (Viator Basic, eventualmente Klook) con nota visibile; primo ricavo B2C da citare nel pitch. Il ranking non deve dipendere dalla commissione, e va scritto nel README solo se è vero nel codice. |
| 5.8 | **Esclusi:** ricerca web dell'LLM per riempire i buchi, scraper di terzi (Apify per Peatix, Klook, Viator, GetYourGuide), promesse di disponibilità dei ristoranti. |

## 6. Validazione e consegna

| # | Decisione |
|---|---|
| 6.1 | Benchmark Qloo vs LLM: 15–20 richieste, 3 condizioni (ricerca normale, LLM puro, TPD), valutazione possibilmente cieca. Nessun numero inventato; includere anche i casi in cui Qloo non aggiunge valore. |
| 6.2 | Richiesto dal regolamento: app ospitata pubblicamente, URL demo, repository pubblico con licenza open source, descrizione in inglese. Il video non è obbligatorio. |
| 6.3 | Priorità: **due flussi reali e solidi valgono più di dieci schermate con dati fittizi.** |

## 7. Aperto / in attesa

| # | Cosa | Stato |
|---|---|---|
| 7.1 | Chiave API Qloo | Configurata localmente; accesso HTTP verificato il 20 ottobre, docs/08 |
| 7.2 | Dati effettivi Qloo per categoria e paese; limiti e parametri abilitati | Da chiedere su `#api-help` (bozza in `docs/03`) e da provare con le 8 query di `docs/01`, sezione 2.5 |
| 7.3 | Viator Affiliate Basic: attivazione e copertura nelle 6 destinazioni | Da fare |
| 7.4 | Copertura Ticketmaster in Portogallo, Francia, Spagna | Da fare |
| 7.5 | Metodo di login | Deciso: Neon Auth + Google |
| 7.6 | Stack | Deciso: Next.js + Vercel + Neon (vedi spec 2026-10-19) |
| 7.7 | Nome del prodotto | Deciso: **Beesyde** (sezione 9). Identità visiva da fare |
| 7.8 | Quota e rate limit effettivi della chiave | Dopo la chiave |
| 7.9 | Test utenti del problema ("il posto che volevo era pieno") e interviste | Da pianificare |

## 8. Prossimi passi, in ordine

1. Incollare la richiesta su `#api-help` (Discord Qloo).
2. Attivare Viator Affiliate Basic e provare ricerca/disponibilità sulle destinazioni.
3. Alla chiave: le 8 query di verifica su `hackathon.api.qloo.com` e scelta delle città.
4. Scaffold del progetto, adapter Qloo, cache privata.
5. Passport + Swap per ristoranti con chip Keep/Change e tre ruoli.
6. Confronto Qloo vs LLM, Transfer e musei/cultura.
7. Login, collezioni, feedback, scheda condivisibile.
8. Altre categorie solo se i dati reggono; rifinitura, stati di errore, README, deploy, descrizione in inglese.

## Aggiornamento tecnico — 20 ottobre 2026

La guida hackathon richiede GET per Insights: risolvere il riferimento con `/search` e usare ID, senza affidarsi alla risoluzione via body POST descritta nelle API generali. Parametro Resy corretto: `filter.external.exists=resy`. Prime prove Qloo e limiti in `docs/08-qloo-verification.md`; nessuna città ancora dichiarata supportata.

## Pilot locale — 20 ottobre 2026

Parigi è il primo pilot dopo audit categoria/città (docs/09); nessuna copertura generale promessa. Passport e Restaurant Swap sono ora collegati a Qloo. In GET i Keep usano un peso comune del gruppo di tag, non pesi per-tag in un body. Cache privata in memoria per processo; persistenza e limiti distribuiti restano aperti prima del deploy. I tre ruoli usano ordine Qloo, distanza dal riferimento e popolarità tra candidati distinti, dichiarando le rispettive limitazioni.

## Musei e Transfer — 20 ottobre 2026

Seconda categoria live del pilot Parigi: Museum Swap con lo stesso Passport e nuova reference. Keep/Change usa tag culturali Qloo; il budget ristorante non viene applicato ai musei. Tre ruoli distinti e provenienza L0 verificati nel campione live e nel browser. Nessuna copertura gallerie/quartieri implicita. Dettaglio in docs/10; benchmark Qloo vs LLM ancora aperto.

## Benchmark tecnico — 20 ottobre 2026

E04 avviato con 16 scenari nel pilot Parigi: colonna TPD raccolta e controllata, harness privato con input identici per i baseline e schede cieche predisposte. LLM, ricerca normale e valutazioni umane ancora mancanti; nessuna superiorità dimostrata. Il campione usa riferimenti risolvibili e non misura copertura generale. Protocollo ed evidenze in docs/11.

Per il baseline LLM l’utente ha scelto la raccolta manuale da ChatGPT. Prompt dei 16 casi esportati privatamente; modello effettivo e provenienza verranno annotati alla raccolta. Nessuna API LLM necessaria e nessuna risposta ancora importata.

Dopo gli errori del sito ChatGPT, l’utente ha richiesto un’alternativa da terminale/codice. Baseline raccolto con Codex CLI e login ChatGPT esistente: gpt-6-sol/high, 16 casi e 48 alternative, nessuna chiamata a strumenti osservata. Il trasporto CLI e le istruzioni interne diverse vengono dichiarati: non è una risposta della UI ChatGPT né si presume equivalenza del modello. Non serve una nuova API key. Dettagli in docs/12; ricerca normale, controllo comune dei fatti e voti umani restano aperti.

Terza condizione raccolta come ricerca web con estrazione assistita dichiarata, non studio di utenti Google Maps. Tre condizioni 16/16, audit comune dei metadati su 144 occorrenze, risultati ignoti e conflitti conservati. Il campo collectionComplete separa la raccolta dalla qualità ancora non misurata. Scheda A/B/C locale pronta, nessun voto inventato né contatto esterno effettuato. Conflitti omonimi/sedi in TPD richiedono E09 prima del deploy. Metodo e limiti in docs/13.

## Valutazione umana rimandata — 20 ottobre 2026

Su richiesta dell’utente, saltiamo per ora la scheda anonima A/B/C: l’utente non conosce i luoghi e usa il prodotto proprio per scoprirli. Nessuna compilazione, reclutamento o raccolta voti richiesta nel lavoro corrente. Strumenti e dati tecnici restano disponibili, ma E04 non blocca lo sviluppo e non viene dichiarato concluso o vincente. La priorità passa all’affidabilità dei suggerimenti: identità, attività e indirizzi (E09), con limiti operativi espliciti. Un eventuale studio con valutatori adatti richiederà una decisione futura.

## E09: verifica luoghi con OpenStreetMap — 20 ottobre 2026

L’utente ha scelto OpenStreetMap (Nominatim) invece di Google Places per E09: gratuito, senza chiave né carta di credito. Google Places resta la fonte prevista per L1 (orari, stato chiuso), da aggiungere più avanti. Ogni risultato dello Swap viene cercato per nome esatto entro 250 m dalle coordinate Qloo, poi confrontato per categoria (ristorante: amenity restaurant/cafe/bar/…; museo: tourism museum/gallery, amenity arts_centre) e per numero civico/CAP. Stati: confirmed, conflict, ambiguous, not_found (non prova che il luogo non esista), unavailable (errore OSM, mostrato, mai nascosto). Nessun risultato viene rimosso o riordinato: i conflitti sono mostrati sulla card. Il livello resta L0. Primo test live: Du Pain et des Idées risulta shop=bakery e La Crèmerie di rue de Lancry shop=cheese, entrambi segnalati come conflitto; Musée d’Orsay e Orangerie confermati. Limiti: il nome esatto non trova varianti (es. «Galerie Magda Danysz»), la copertura OSM è incompleta, ~1 s in più per risultato al primo calcolo (poi cache 24 h in memoria). Codice: src/lib/venue-check.ts, src/lib/server/osm.ts; test: scripts/check-venue.mjs.

## Cache e limiti condivisi su Neon — 20 ottobre 2026

Con l’autorizzazione dell’utente è stato creato il progetto Neon `beesyde` (nome dell’app deciso, regione Francoforte, piano gratuito). Tre tabelle private (db/schema.sql, `npm run db:migrate`): `provider_cache` (risposte Qloo 15 min e OpenStreetMap 24 h; mai nel repository pubblico, come da 4.7), `provider_pace` (cadenza condivisa tra tutte le istanze: Qloo 300 ms, Nominatim 1,1 s; una richiesta che dovrebbe attendere troppo riceve «busy» senza occupare uno slot) e `request_budget` (limite per visitatore: 60 richieste e 15 Swap ogni 10 minuti, poi 429 con Retry-After). L’IP viene salvato solo come hash con un segreto del server. Senza DATABASE_URL, in locale e nei test lo stato resta nel processo con un avviso esplicito; su Vercel la mancanza è un errore. Verifiche: contratto dello store su memoria e su Postgres reale, Swap live ripetuto in un secondo processo da 4,1 s a 0,46 s grazie alla cache condivisa, 62 richieste HTTP dallo stesso IP → 60 accettate e 2 bloccate, riga contatore su Neon con hash.

## Deploy e login Google — 20 ottobre 2026

Su richiesta dell’utente: app pubblicata su Vercel (progetto `beesyde`, https://beesyde.vercel.app), deploy automatico dal ramo predefinito `claude/blissful-gauss-dymbeo` (non esiste un ramo `main`). Login Google opzionale con Neon Auth (Better Auth gestito) sul progetto Neon `beesyde`; per ora usa le credenziali Google condivise di Neon, adatte allo sviluppo: prima di utenti reali servono credenziali OAuth proprie. Il login non salva ancora nulla per utente (E06). Handover: docs/14-handover.md.

## 9. Decisioni del 19 ottobre 2026 (brainstorming struttura e nome)

Dettaglio in `docs/superpowers/specs/2026-10-19-product-structure-design.md`. Prossimi passi in `docs/04-handover.md`.

| # | Decisione |
|---|---|
| 9.1 | **Scope completo per la demo:** Passport, Swap, Explore, Transfer, **Discovery di destinazioni alternative**, login e collezioni. Rischio di scope accettato e gestito con **una sola pipeline** condivisa. |
| 9.2 | Discovery parte da una città amata (con chip Keep/Change) **oppure** dal solo Passport: il riferimento è opzionale. |
| 9.3 | Navigazione: **campo unico "Cosa cerchi?"** che riconosce l'intento, più **tre pulsanti piccoli** (Sostituisci · Sono qui · Dove andare). Transfer proposto dopo ogni risultato. |
| 9.4 | Database **Neon Postgres**; login **Neon Auth + Google**. Stack: Next.js + TypeScript su Vercel. |
| 9.5 | Nome: **Beesyde**. Gioco di parole su "B-side" (il lato B del disco), "piano B" e l'ape come possibile mascotte. Si pronuncia come "bee side". |
| 9.6 | Verifica nome (19/10): `beesyde.com` libero secondo whois; nessun uso esistente trovato in ricerca web. Marchi non verificati su registri ufficiali. Dominio **non ancora acquistato**. |
| 9.7 | Scartati: Plan Bee/PlanBee (planbee.com preso), Bee Side (beeside.com preso), Swappa (marketplace esistente), Take Two (Take-Two Interactive), Vivra (confondibile con ViViRA), Vibeway (settore affollato). |
| 9.8 | Chiave Qloo in `.env` (`QLOO_API_KEY`), ignorato da git; `.env.example` committato senza segreti. |

## E06 — Passport saved to the account (20 October 2026)

- One Passport per signed-in user in Neon, table `user_passport` (`db/schema.sql`), linked to `neon_auth."user"` with `ON DELETE CASCADE`: deleting the user deletes their Passport.
- Only the Qloo entities are stored, never the signed selection tokens (they expire after 24 h). Reading the Passport re-signs the entities, so a Passport saved days ago still works for Swap, on any device.
- The server accepts only selections it signed itself (max 5, no duplicates), so an account cannot hold arbitrary data.
- When a user signs in: if the account already has a Passport, it wins and replaces the browser copy; if the account is empty, the browser's Passport is uploaded. Guests keep browser-only storage, unchanged.
- "Delete my Passport" when signed in removes it from both the account and the browser.
- Not done yet in E06: collections, feedback, account deletion from inside the app.
