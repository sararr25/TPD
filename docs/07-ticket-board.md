# TPD — Ticket board

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
| E02 | Adapter Qloo e cache privata | Implementato localmente, cache in memoria; storage distribuito aperto | Solo server, retry limitati, nessuna risposta Qloo nel repo pubblico |
| E03 | Passport e Restaurant Swap reali | Flusso Parigi verificato nel browser, docs/09 | Ricerca entità, tag Keep/Change, vincoli, tre ruoli, provenienza, stati errore |
| E04 | Benchmark Qloo vs LLM | Dipende da E03 | Casi privati, stessi vincoli, numeri reali, 15–20 richieste |
| E05 | Musei e Transfer | Dipende da I03/E03 | Stesso Passport, nuova categoria con copertura provata |
| E06 | Login, collezioni e feedback | Dipende da E03 / scelta login | Account reale, persistenza privata, cancellazione, feedback verificato |
| E07 | Scheda Passport condivisibile | Dipende da E06 | Esportazione e condivisione deliberate, nessun dato privato involontario |
| E08 | Categorie aggiuntive | Condizionato ai dati | Quartieri → hotel → attività solo dopo evidenza di copertura |
| R01 | README, licenza, deploy e submission inglese | Dipende dai flussi reali | Demo pubblica provata, fonti/limiti, regole ufficiali ricontrollate |

## Incremento D03

Modifica: A4 filtra e deduplica dati da localStorage, tollera formati corrotti, mostra un avviso quando la scrittura fallisce e permette di cancellare Passport e collezione con un dialog esplicito. La cancellazione riguarda solo la chiave `tpd-design-v1`.

Verifica ripetibile dalla root: `node scripts/check-prototype.cjs`. Lo script usa un DOM minimale e verifica logica/persistenza; non certifica rendering, tastiera o comportamento nativo dei dialog.

## Prossimo passo

Prossimi: E04 benchmark e E05 musei/Transfer su Parigi; completare verifica operativa e cache/rate limiting condivisi prima del deploy. I03 resta aperto sulle altre destinazioni. E02/E03 locali descritti in docs/09. Metodo login e naming ancora aperti.
