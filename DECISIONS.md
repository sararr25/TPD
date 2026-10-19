# Beesyde — Registro delle decisioni

**Progetto:** Beesyde (ex nome provvisorio TPD), Qloo Agentic Hackathon 2026
**Aggiornato:** 19 ottobre 2026
**Scadenza submission:** 30 ottobre 2026, 23:45 EDT (verificare il countdown ufficiale su Devpost)

Questo file raccoglie tutte le decisioni prese fino ad ora. Il dettaglio e le fonti sono in `docs/`:
`00-product-brief.md` · `01-research-and-brainstorm.md` · `02-b2c-product-structure.md` · `03-data-sources-and-verification.md`.

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
| 4.10 | Stack proposto: **Next.js + TypeScript su Vercel** (non ancora confermato). |

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
| 7.1 | Chiave API Qloo | In attesa (richiesta inviata) |
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
