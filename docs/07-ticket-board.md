# Beesyde — Current ticket status

Updated 23 October 2026. **Canonical tracker: GitHub Issues in `sararr25/TPD`, including issue comments.** Current handover: [28](28-handover.md), following [27](27-handover.md). Do not use the historical D/E/I register below as the active backlog.

Verified against GitHub before this continuation:

| Issue | Status | Remaining acceptance |
|---|---|---|
| [#26](https://github.com/sararr25/TPD/issues/26) | Closed; owner approved visuals; verified corrections released | Complete, receipt in handover 28 |
| [#32](https://github.com/sararr25/TPD/issues/32) | Implemented; genuine signed-in persistence after reload verified | Same account in independent browser/device, then return sync |
| [#3](https://github.com/sararr25/TPD/issues/3) | Parent spec | Final acceptance of #26 and #32 |

All child tickets #4–#34 except #32 are now closed. Old PR #1 is still open and is a separate historical proposal, not a current implementation ticket. Its status is recorded in handover 28; it is not merged or closed by this audit.

Name **Beesyde**, **Neon Auth + Google**, shared **Neon** storage, **Qloo + OpenStreetMap** and the Vercel release are already in place. No new provider activation, naming or auth selection is needed. Details and acceptance boundaries live in the handover, not the old register.

---

## Archived register — 20 October 2026

The following was the original pilot board, retained for provenance. Its “open”, “not deployed” and “to decide” statements are historical snapshots and are superseded by the current GitHub tracker and handovers 14–28.


Aggiornato: 20 ottobre 2026. Fonte: DECISIONS.md sezioni 7–8, docs/02 sezione 7 e docs/05. La ricerca GitHub di oggi non ha restituito issue: questo registro rende espliciti i passi già documentati, senza creare issue remote.

`Prototipo` non significa implementazione live. `Da verificare` richiede evidenza browser o provider.

| ID | Ticket | Stato | Criterio di completamento / dipendenza |
|---|---|---|---|
| D01 | Direzione e token Carbone/fucsia | Prototipo | A4 + tokens.css + docs/06 presenti; accettazione visiva aperta |
| D02 | Schermate Passport, ospite, Swap, dettaglio, collezioni e stati | Prototipo | 17 route renderizzate nello smoke Node; manca prova browser |
| D03 | Passport locale: integrità, persistenza e cancellazione | Prototipo verificato in Node | Dati corrotti gestiti, valori ammessi, massimo 5 segnali, deduplicazione salvataggi, cancellazione con conferma, storage indisponibile dichiarato; manca prova browser |
| D04 | QA desktop e schermi stretti | Da verificare | 1440 px, larghezze strette, tastiera, focus, zoom, font e contrasto; apertura file:// bloccata dal browser integrato |
| P01 | Nome e logo | Aperto | Decisione utente; mantenere TPD provvisorio |
| I01 | Richiesta dettagli Qloo / #api-help | Da fare esternamente | Bozza in docs/03; nessun invio effettuato |
| I02 | Attivazione Viator Basic | Da fare esternamente | Account, termini e accesso provider; nessuna attivazione effettuata |
| I03 | Otto verifiche API Qloo | Pilot Parigi verificato; audit altre città aperto, docs/09 | Accesso HTTP, risoluzione, copertura, tag, explainability, differenze filtri, limiti; aggiornare i vecchi scenari Bangkok/Phu Quoc con le destinazioni di DECISIONS 2 prima di eseguire |
| I04 | Copertura Ticketmaster e Viator | In attesa accessi | Evidenza per paese/categoria, nessuna copertura promessa prima delle prove |
| E01 | Scaffold Next.js + TypeScript | Completato localmente | Stack confermato; build, typecheck, test e smoke HTTP passano. Deploy/QA browser aperti |
| E02 | Adapter Qloo e cache privata | Cache e limiti condivisi su Neon Postgres (progetto `beesyde`), verificati live tra processi e via HTTP | Solo server, retry limitati, nessuna risposta Qloo nel repo pubblico |
| E03 | Passport e Restaurant Swap reali | Flusso Parigi verificato nel browser, docs/09 | Ricerca entità, tag Keep/Change, vincoli, tre ruoli, provenienza, stati errore |
| E04 | Benchmark Qloo vs LLM | Parziale; valutazione umana rimandata per decisione utente. Tre condizioni 16/16 e audit metadati conservati, docs/13 | Casi privati, stessi vincoli, numeri reali, 15–20 richieste |
| E05 | Musei e Transfer | Flusso Parigi implementato e verificato localmente, docs/10 | Stesso Passport, nuova categoria con copertura provata |
| E06 | Login, collezioni e feedback | Built 20 Oct: Passport in the account, collections, "Not for me" feedback, account deletion. Verified with unit tests, live database checks and guest browser runs; not yet with a real Google sign-in | Account reale, persistenza privata, cancellazione, feedback verificato |
| E07 | Scheda Passport condivisibile | Dipende da E06 | Esportazione e condivisione deliberate, nessun dato privato involontario |
| E08 | Categorie aggiuntive | Condizionato ai dati | Quartieri → hotel → attività solo dopo evidenza di copertura |
| E09 | Identità, attività e indirizzi: conflitti con fonte operativa | Implementato localmente con OpenStreetMap/Nominatim (gratuito, senza chiave); test unitari, live e browser. Google Places rimandato a L1 (orari/stato) | Fonte esterna, disambiguazione omonimi/sedi, conflitti espliciti; nessuna blacklist ad hoc |
| R01 | README, licenza, deploy e submission inglese | Dipende dai flussi reali | Demo pubblica provata, fonti/limiti, regole ufficiali ricontrollate |

## Incremento D03

Modifica: A4 filtra e deduplica dati da localStorage, tollera formati corrotti, mostra un avviso quando la scrittura fallisce e permette di cancellare Passport e collezione con un dialog esplicito. La cancellazione riguarda solo la chiave `tpd-design-v1`.

Verifica ripetibile dalla root: `node scripts/check-prototype.cjs`. Lo script usa un DOM minimale e verifica logica/persistenza; non certifica rendering, tastiera o comportamento nativo dei dialog.

## Prossimo passo

E05 completato localmente sul pilot musei Parigi: stessi segnali Passport, nuova reference, Keep/Change, tre ruoli L0, test live e browser (docs/10). E04: 16 casi TPD e 16 casi LLM CLI raccolti; import e valutazione cieca predisposti. Dopo il blocco ChatGPT web, alternativa da terminale richiesta dall’utente e verificata: Codex CLI/gpt-6-sol, senza strumenti né Qloo (docs/12). Ora anche ricerca web assistita 16/16 raccolta; audit comune su 144 occorrenze completato con metadati Qloo (non indipendente). Valutazione umana A/B/C rimandata su richiesta utente: conoscere i luoghi non è un requisito da imporre a chi usa il prodotto per scoprirli. Nessuna compilazione o reclutamento richiesti ora; E04 non blocca il prossimo incremento. I dati tecnici restano conservati senza dichiarare superiorità. E09 implementato con OpenStreetMap (vedi DECISIONS.md, 20 ottobre). Cache e rate limiting condivisi fatti su Neon (vedi DECISIONS.md). Online su https://beesyde.vercel.app con login Google opzionale (Neon Auth). Stato e prossimi passi: docs/14-handover.md. I03 resta aperto sulle altre destinazioni. E02/E03 locali descritti in docs/09. Metodo login e naming ancora aperti.
