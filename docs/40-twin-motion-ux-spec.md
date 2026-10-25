# Twin, motion e UX — specifica e piano di lavoro

25 ottobre 2026 · Stato: implementazione locale e verifica completate; receipt in `docs/45-twin-implementation-and-ab.md`.

**Aggiornamento owner, 25 ottobre:** autorizzata l'implementazione completa,
seguita da confronto A/B tecnico/visuale e correzioni. L'owner ha scelto di usare
**€–€€€€ con i quattro livelli reali per ora**: questa decisione supera il
requisito di cinque fasce nelle sezioni storiche sotto. Nessuna quinta fascia
è un gate aperto per questa consegna. Events parte come pilot municipale Paris;
le altre città richiedono ancora copertura verificata e non sono dichiarate supportate.

## Problem Statement

L'esperienza attuale non rende percepibile la scoperta: la hero è quasi statica,
il parallasse manca e i reveal sono poco estesi. Il flusso chiamato ancora Swap
contraddice il nome Twin richiesto. Offre solo Restaurants/Museums, un editor
troppo alto, Ignore implicito e prezzi a quattro livelli. Dopo Find its twin il
risultato è lontano dall'azione: il messaggio esiste ma non guida la persona.

## Solution

Evolvere il Passport A esistente con una hero coreografata, profondità durante
lo scroll e apparizioni delle sezioni. Unificare Twin su tutte le superfici;
offrire categorie e filtri coerenti con dati verificati; rendere compatte ed
esplicite le scelte Keep / Delete / Ignore. Al completamento mostrare subito il
match principale nello spazio della ricerca e una freccia See other matches
che porta agli altri risultati solo quando viene premuta. Usare il DNA come
metafora leggera della somiglianza, mantenendo spiegazioni concrete.

## User Stories

1. As a visitor, I want an animated hero, so that the Passport feels alive from my first visit.
2. As a visitor, I want layered parallax while scrolling, so that the page has visible depth.
3. As a visitor, I want sections to appear when I reach them, so that I experience their entrance.
4. As a returning visitor, I want stable navigation and controls during motion, so that I can act immediately.
5. As a motion-sensitive visitor, I want an equivalent static experience, so that discovery remains comfortable.
6. As a visitor, I want consistent Twin navigation, so that I recognise the same feature everywhere.
7. As a visitor with an old link, I want it to keep working, so that a rename does not strand me.
8. As a city explorer, I want restaurants, bars, cafés and museums, so that I can search for the kind of place I need.
9. As an event seeker, I want dated events with locations, so that I can find an actual experience.
10. As a visitor, I want category-specific filters, so that irrelevant controls do not clutter my search.
11. As a visitor, I want unsupported coverage to be explained, so that an empty category is understandable.
12. As a visitor, I want category and filter state restored, so that switching context does not erase my work.
13. As a visitor, I want five understandable euro-symbol price levels, so that I can compare budget consistently.
14. As a visitor, I want unknown prices identified, so that missing information is not presented as cheap.
15. As a visitor, I want the same price meaning on filters, cards and details, so that my budget remains coherent.
16. As a Twin seeker, I want Keep, so that I can favour a starting place's traits.
17. As a Twin seeker, I want Delete, so that I can exclude unwanted traits from this search.
18. As a Twin seeker, I want explicit Ignore, so that I can leave a trait unconstrained.
19. As a Twin seeker, I want a compact editor, so that the useful content fits closer to the action.
20. As a keyboard user, I want labelled three-state controls, so that I can change every trait confidently.
21. As a Twin seeker, I want immediate loading feedback, so that I know my action was received.
22. As a Twin seeker, I want my closest returned match visible on completion, so that I do not have to discover hidden results.
23. As a Twin seeker, I want a result count, so that I know there are other options.
24. As a Twin seeker, I want See other matches, so that I can deliberately move to the remaining results.
25. As a keyboard user, I want focus to follow that explicit navigation, so that I can continue reading there.
26. As a Twin seeker, I want honest shared-trait and difference explanations, so that I understand the recommendation.
27. As a Twin seeker, I want to edit my search after a match, so that I can refine it without starting over.
28. As a Twin seeker, I want stale results labelled, so that I know which choices produced them.
29. As a Twin seeker, I want errors and no-results feedback beside my action, so that I know how to recover.
30. As a visitor, I want light DNA-themed language, so that finding a twin feels distinctive and understandable.
31. As a visitor, I want consistent map pins and result cards, so that I can locate the matches without duplicates.
32. As a Passport owner, I want search choices isolated from my saved profile, so that Delete does not erase my data.
33. As a mobile visitor, I want short usable forms and readable matches, so that I can complete the task on a small screen.
34. As a visitor, I want animations to survive back navigation and resizing, so that content never stays hidden.

## Implementation Decisions

### Baseline e decisioni di prodotto

- Review basata sul sorgente locale pulito e835875, corrispondente al main
  remoto verificato. Il default GitHub resta claude/blissful-gauss-dymbeo,
  remoto 55d757b: sono riferimenti distinti. Nessuna modifica a default branch
  o configurazione Vercel. Nessuna nuova verifica del deployment in questo piano.
- GitHub: nessuna issue aperta alla verifica; lette le precedenti #3/#31 e i
  relativi commenti disponibili. Creare nuovo lavoro, senza riaprire ticket chiusi.
- La richiesta corrente supera le precedenti scelte menu/tab Swap, Keep/Change
  e il limite Home ai soli ingressi/timbri. Aggiornare glossario e ADR con una
  nuova annotazione cronologica durante l'implementazione.
- Conservare Passport A / La rilegatura, berry/lemon, tipografia, autenticazione,
  privacy e provider. Non riproporre l'apertura copertina dell'opzione C scartata.
- Lo stack reale è Next.js/React web. Della skill UI/UX usare indicazioni
  pertinenti a feedback, accessibilità e densità; non applicare il suo presupposto
  React Native né sostituire brand/font con le proposte generate dal database.

### A · Twin ovunque

- Nome visibile del menu, tab e sezione: Twin; azione principale: Find its twin.
- Coprire Home e demo, navigazione desktop/mobile, City, Place, Saved, risultati,
  stati vuoti/errori, messaggi, etichette accessibili e condivisione pertinente.
- Conservare compatibilità dei vecchi URL e parametri Swap; il cambio visibile
  non impone una migrazione di tutti i nomi interni né delle action API.

### B · Categorie e filtri reali

- Registro condiviso delle capacità per categoria, riusato da City, ricerca Twin,
  link da Place/card e Home. Evitare liste indipendenti che divergono.
- Target: Restaurants, Bars, Cafés, Museums, Events; mantenere Hotels e
  Neighbourhoods nel discovery esistente. Non trattare i quartieri come locali.
- City già supporta restaurant/bar/museum/hotel; Twin e la validazione dei
  riferimenti oggi solo restaurant/museum. Estendere l'intero percorso:
  ricerca, riferimento firmato, tratti, confronto, verifiche e azioni sulle card.
- Bars usa già un tag di categoria, non un ipotetico tag genre:bar. Verificare
  tag e copertura Cafés senza assumere che ogni ristorante sia un café.
- Prima attività tecnica: matrice categoria × città × sorgente × attributi ×
  supporto ricerca/Twin/prezzo/verifica. Un massimo iniziale di 12 richieste live,
  sequenziali e senza retry automatici; fermarsi a errori auth/quota. Fixture per
  il resto. Riportare prove e lacune senza pubblicare risposte grezze.
- Filtri base: categoria, città, prezzo dove supportato, vicino al quartiere
  riusando il criterio dichiarato di distanza dal centro. Filtri per categoria:
  cucina per Restaurants, tipo/ambiente per Bars/Cafés, tema per Museums;
  data/intervallo e tipo per Events, soltanto con metadati effettivi.
- Events è un ramo esplicito: titolo evento, date/ora e timezone quando disponibili,
  luogo, fonte e collegamento di verifica. Un music venue non è un evento.
  Se i provider correnti non coprono eventi datati, produrre una proposta concreta
  di integrazione entro i vincoli delle fonti ammesse; non dichiarare completata
  l'espansione Events con una categoria vuota o un'etichetta rinominata.
- Filtri persistenti per città/categoria; mappa e lista sullo stesso insieme.
  Distinguere non supportato, nessun risultato, dati mancanti ed errore.
- Non aggiungere open now, disponibilità o biglietti acquistabili senza dati.

### C · Prezzo condiviso, € → €€€€€

- Richiesta di prodotto: cinque fasce con uno, due, tre, quattro, cinque simboli
  euro; Any price separato. Dichiarare che sono fasce indicative, non importi
  o conversioni valutarie, anche per città fuori dall'eurozona.
- Applicare a filtri City/Twin, card, Place, Saved dove mostra prezzi, recap,
  spiegazioni e testo accessibile. Accessibilità: Price level 2 of 5, per esempio.
- Vincolo verificato: il provider documenta price_level 1–4; anche API e
  spiegazioni applicative oggi sono 1–4. Il livello 5 richiede un contratto
  esplicito con dati sufficienti: registrare scala nativa, normalizzazione,
  soglie e trattamento degli ignoti. Non creare una quinta fascia fittizia,
  duplicata o ottenuta spacciando il rating per prezzo.
- La fase tecnica deve consegnare la proposta per cinque fasce e la relativa
  fattibilità. Se quattro livelli non consentono di distinguerne cinque,
  il requisito resta aperto con owner e azione successiva; nessuna riduzione
  silenziosa a quattro e nessun mapping inventato.
- Filtraggio server e locale concordano. Un limite attivo esclude prezzi ignoti
  con spiegazione; nessun limite mantiene gli ignoti. Non confrontare il costo
  hotel o un biglietto evento con il livello ristorante senza un contratto.

### D · Editor compatto Keep / Delete / Ignore

- Riferimento in un riepilogo corto, righe dense dei tratti, tre scelte esplicite,
  un controllo prezzo, CTA primaria. Contesto Passport e spiegazioni lunghe in
  disclosure; evitare riepiloghi duplicati prima dei risultati.
- Keep = preferenza nel ranking, con eventuale mancata corrispondenza dichiarata.
  Delete = esclusione del tratto per questa ricerca, riusando la semantica interna
  change. Ignore = nessun vincolo, selezionato di default. Nessuna cancellazione
  di tratti salvati, luoghi, account o Passport.
- Le tre scelte sono mutuamente esclusive e reversibili, con stato testuale e
  accessibile; non affidare Ignore al secondo click su un'altra scelta.
- Target iniziale: ridurre almeno del 35% l'altezza editor+contesto prima della
  CTA con sei tratti a 390px rispetto al baseline da registrare. Conservare aree
  interattive di almeno 44px; non ottenere densità con testo illeggibile.
- Dopo invio compattare il form in un recap modificabile, lasciando l'esito nel
  medesimo punto di interazione. Nessuna perdita di scelte al ritorno in modifica.

### E · Risultato principale immediato e DNA

- Stati espliciti: idle, searching, success, empty, error e stale. Click mostra
  subito stato e pulsante busy; eventuale decorazione non sostituisce il testo.
- Successo: il pannello dell'azione diventa recap corto + numero di match +
  match principale. Desktop può affiancarlo; mobile lo sostituisce in posizione.
  Non aggiungere il risultato sotto tutto il form né forzare uno scroll in basso.
- Usare il risultato closest già restituito dal ranking, senza inventare uno
  score di compatibilità. Se nascosto, promuovere il successivo visibile e usare
  una descrizione onesta. Confronto tra opzioni trovate, non migliore della città.
- Nel viewport corrente mostrare almeno nome, perché, prezzo noto/ignoto e
  azione primaria senza scroll manuale, a 390×844 e 1440×900. A 320px, landscape
  corto e testo ingrandito privilegiare lettura e accesso anziché comprimere tutto.
- Con altri match visibili, mostrare See other matches ↓ e relativo conteggio.
  Il click porta al titolo degli altri match e vi trasferisce il focus; offset
  delle barre fisse e scorrimento immediato con reduced motion. Con un solo
  risultato o tutti gli altri nascosti, nessuna freccia inattiva.
- Altri match sotto; mappa coordinata e numerazione univoca, niente duplicato
  della card principale. Spostare il suggerimento di altre categorie dopo i match.
- Cambiare filtri non rilancia richieste automaticamente; risultati precedenti
  marcati stale, recap legato alla ricerca effettiva, aggiornamento esplicito.
  Abort e protezione da risposte vecchie su cambi di riferimento/categoria/account.
- Copy proposta: Matching your place’s DNA…; Your closest twin; Shared DNA;
  See other matches. Mantenere What’s different e spiegazioni concrete. Nessuna
  percentuale inventata, pretesa genetica o promessa di disponibilità.
- Errori/zero match nello stesso pannello della CTA, con retry o modifica senza
  perdere input; la semplice presenza di un live-region lontano non soddisfa UX.

### F · Motion visibile e coerente

- Hero Home, sequenza finita indicativa 0–1,3s: disegno linee di sicurezza,
  titolo/testo in breve stagger, pagina esempio che si assesta sulla rilegatura,
  bookmark e timbro. Almeno tre fasi distinguibili; form subito utilizzabili.
- Parallasse reale sulle sole foto/decorazioni: Home, cover City e foto Place;
  target indicativo 20–36px desktop, 8–16px mobile con overscan e limiti ai bordi.
  Controlli e testo non scorrono a velocità diverse dal loro contenitore.
- Reveal quando sezioni entrano nel viewport: titoli, gruppi carta, Cities,
  card City, editor e match Twin. Movimento 16–28px, stagger 60–90ms con tetto
  complessivo; eseguire una volta per elemento/ricerca, inclusi risultati asincroni.
- Passport, Saved, shared trip, Settings, Compare e stati usano una variante più
  discreta dello stesso vocabolario, senza ritardare azioni e lettura.
- Un solo proprietario della trasformazione per elemento; separare layer reveal
  e parallax per evitare conflitti tra wrapper Home e motion condivisa.
- GSAP già installato; leggere prima le guide Next installate pertinenti quando
  si scriverà codice. Cleanup su navigazione, resize e cambio preferenza motion.
- Reduced motion: niente parallax/scrub/scroll animato, contenuto statico leggibile
  e stessa informazione di stato. Fallback leggibile anche senza JS o con errori.
- Niente scroll hijacking, pinning lungo, loop decorativi continui o attese API
  per l'animazione hero. Riservare spazio alle immagini per evitare layout shift.

## Testing Decisions

- Seam principale: percorso browser con le fixture Playwright già presenti per
  Home, Passport world e acceptance. Testare azioni ed esiti osservabili, non
  nomi GSAP, classi CSS o singole funzioni interne come proxy del risultato.
- Seam confermati dall'owner il 25 ottobre 2026: percorso completo nel browser
  Home → Twin → primo match → altri match, più test della logica di ricerca
  per esclusioni, categorie e prezzi.
- Riutilizzare test servizio discovery/venue come unico seam inferiore necessario
  per riferimento firmato, categorie, prezzi, alias tratti, esclusioni su tutti
  i fallback e isolamento; fixture browser da sole non provano il backend.
- Fixture complete di riferimento e 0/1/3 match, ritardo, errore, risposta fuori
  ordine, prezzi ignoti, risultati nascosti, nomi lunghi e foto rotte; nessun
  account reale o consumo provider per regressioni ordinarie.
- Misurare che il match principale sia nel viewport dopo successo dal click,
  che la freccia porti agli altri match e al focus giusto, che retry/edit/stale
  conservino scelte e che mappa/lista non divergano.
- Matrice 320/375/390/768/1440px, 812×375 landscape, tastiera, testo 200%, reduced
  motion, Back/Forward, link legacy e navigazione ripetuta. Confrontare anche
  il punto di scroll al click: iniziale, metà pagina e CTA appena visibile.
- Motion: reveal sotto fold al momento giusto, nessun replay tornando indietro,
  offsets decorativi realmente variabili con lo scroll, contenuto mai bloccato.
- Registrare brevi video desktop/mobile e confronti prima/dopo: i test provano
  il funzionamento, la review visuale verifica qualità, ritmo e percepibilità.
  Controllare performance su browser e telefono reale separatamente; non
  dichiarare real-device o screen-reader acceptance usando solo emulazione.
- Gate finale: regressioni pertinenti, suite unit completa, typecheck, build e
  diff check; poi review del diff, rischio/privacy e review visiva indipendente.
  Questa pianificazione non ha eseguito nuovi test applicativi.

## Out of Scope

Nuovo brand, rifacimento quiz/auth, migrazione automatica di dati personali,
Google Places, garanzie di orari/prenotazioni, raccolta indiscriminata di dati,
schema o storage di produzione non specificati, pubblicazione dell'app,
cambio default branch/Vercel e riapertura di ticket conclusi. Nessuna nuova
skill condivisa necessaria per una singola pianificazione.

## Further Notes

### Ordine, ownership e gate

La review è stata svolta con root integratore e due agenti read-only (motion e
Twin). Per l'implementazione, un owner per pacchetto e worktree dedicato, creato
solo quando parte il lavoro. Harness: Codex; rami previsti codex/twin-<id>.
Gli ambiti condivisi sono integrati dall'owner A; nessuna scrittura parallela
sugli stessi moduli. Nessun ramo di implementazione è stato creato o integrato.

| ID | Pacchetto / owner previsto | Dipende da | Gate di integrazione |
|---|---|---|---|
| A | Twin e contratti / integratore | — | Inventario tutte le superfici; ADR/glossario aggiornati; link legacy verificati; contratti B/C definiti |
| B | Categorie e filtri / discovery agent | A | Matrice capacità con prove; percorso completo categorie supportate; Events datati veri o requisito aperto con proposta concreta |
| C | Prezzi / discovery agent, sequenziale a B nei moduli condivisi | A e fattibilità dati | Cinque fasce distinguibili, provenienza e soglie documentate; filtro server/UI e letture coerenti; ignoti corretti |
| D | Editor compatto / Twin UI agent | A, contratti B/C | Tre stati espliciti; Delete solo esclusione; riduzione altezza misurata; tastiera/touch e stato preservati |
| E | Match immediato / Twin UI agent, dopo D | B/C/D | Primo match visibile al click; altri match con scroll/focus; tutte le varianti asincrone; mappa coerente |
| F | Hero, parallasse e reveal / motion agent | A; integrazione Twin dopo D/E | Storyboard visibile; video desktop/mobile; cleanup, fallback, reduced motion e perf verificati |
| G | Accettazione / integratore + reviewer indipendente | B–F | Suite finale e review visuale; feedback corretti; limiti real-device documentati |

Tutte le card sono pianificate, non running/merged. Owner nominali sono ruoli
di assegnazione, non assignee GitHub inventati. Al claim registrare owner reale,
branch/worktree effettivi, stato, ultimo aggiornamento, link evidenze/handoff e
gate fallito. B/C lavorano in sequenza sul dominio; D/E nello stesso flusso UI;
F può procedere in parallelo sulla Home dopo A. Le modifiche Twin della motion
arrivano dopo il layout stabile. G non può chiudere Events o cinque fasce come
completati se manca la fattibilità: mantenere il requisito esplicitamente aperto.

### Prove e limiti della review

Le due review indipendenti hanno ispezionato il sorgente; nessuna nuova review
interattiva dell'app live, registrazione video o test su device è stata eseguita.
I precedenti test 15/15 sono un receipt storico, non una prova della qualità
richiesta oggi. Il parallasse assente è confermato; i reveal esistenti sono
parziali e deboli, non totalmente assenti.

Fonte primaria per il vincolo prezzo e le capacità da verificare:
[Qloo Insights API parameter reference](https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md).
La documentazione elenca price_level 1–4; non prova la copertura eventi del
contratto hackathon corrente. Nessuna richiesta live al provider in questa review.

### Tracker

Specifica padre: [#36](https://github.com/sararr25/TPD/issues/36).
Tutte le issue sono nuove e hanno etichetta ready-for-agent; non è uno stato
di implementazione completata. Le dipendenze sotto restano gate di avvio.

- [ ] A · [#37 — Twin e contratti](https://github.com/sararr25/TPD/issues/37)
- [ ] B · [#38 — Categorie e filtri](https://github.com/sararr25/TPD/issues/38), dopo #37
- [ ] C · [#39 — Cinque fasce prezzo](https://github.com/sararr25/TPD/issues/39), dopo #37 e verifica fattibilità; dominio sequenziale a B
- [ ] D · [#40 — Editor compatto](https://github.com/sararr25/TPD/issues/40), dopo #37 e contratti #38/#39
- [ ] E · [#41 — Match immediato](https://github.com/sararr25/TPD/issues/41), dopo #38/#39/#40
- [ ] F · [#42 — Hero e motion](https://github.com/sararr25/TPD/issues/42), dopo #37; integrazione Twin dopo #40/#41
- [ ] G · [#43 — Accettazione integrata](https://github.com/sararr25/TPD/issues/43), dopo #38–#42

### Matrice delle superfici

| Superficie | Terminologia / azioni | Categorie / prezzo | Motion / risultato |
|---|---|---|---|
| Home e demo | Twin, Find its twin, copy DNA | Ingressi coerenti, prezzi esempio se presenti | Hero coreografata, parallasse, reveal e feedback demo |
| Nav desktop/mobile | Twin e stato attivo | Contesto città conservato | Micro-feedback stabile |
| Cities | Link coerenti a City/Twin | Nessun filtro locale duplicato | Reveal progressivi delle card |
| City / For you e Twin | Tab Twin, azioni card | Registro categorie, filtri pertinenti e cinque fasce | Cover parallax; card/reveal; workspace embedded |
| Place | Find its twin per categorie supportate | Dettagli prezzo, categoria nel link | Foto parallax, ingresso leggibile |
| Twin standalone | Keep/Delete/Ignore e DNA | Stessi contratti e controlli di City | Editor compatto, primo match immediato e freccia |
| Saved / shared trip | Link Twin dove pertinente | Prezzi coerenti se mostrati, privacy invariata | Reveal discreti; nessun timbro di nuova azione al caricamento |
| Passport / Settings / quiz | Testi e spiegazioni coerenti | Solo indicazioni budget interessate dal contratto | Motion discreta; Delete ricerca non cancella profilo |
| Compare / empty / error / loading | Twin nei testi pertinenti | Nessuna capacità finta | Stesso feedback accessibile e fallback statico |
