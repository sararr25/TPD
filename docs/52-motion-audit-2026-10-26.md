# Audit di animazioni, motion graphics e transizioni — 26 ottobre 2026

## Valutazione

Beesyde ha un'identità motion riconoscibile: carta, rilegatura, inchiostro, timbri e itinerari. La conserverei. Il limite attuale è la gerarchia: molte decorazioni ricevono un trattamento ricco, mentre passaggi pratici come cambiare domanda, filtrare una lista, aprire un pannello o tornare indietro hanno meno continuità.

La proposta è **rendere il movimento più intenzionale**: una firma Passport all'ingresso, feedback brevi vicino all'azione, continuità nelle sostituzioni di contenuto e meno effetti contemporanei. Non propongo un nuovo tema visivo, né un cambio di libreria.

## Metodo, versione e confini

- Checkout pulito iniziale: `codex/twin-motion-ux`, `25c095b`. La ricevuta docs/51 identifica `d05395a` come commit applicativo pubblicato: non è una nuova verifica del deployment Vercel/SHA.
- Verificato su GitHub il default `claude/blissful-gauss-dymbeo`. Le issue #36–#43 risultano aperte; letti i commenti di #36, #42 e #43, incluso il receipt locale precedente. Questo audit non chiude ticket e non riapre decisioni di prodotto.
- Ispezione del sito pubblico: Home, Cities e Lisbon, anche con viewport/touch emulati. La Home e la City pubbliche hanno restituito un limite ricerche: l'errore è stato tenuto distinto dai difetti di movimento.
- Preview locale di questo checkout, Next in sviluppo, a `127.0.0.1:3106`. Nei percorsi di verifica sintetici, dati guest e API intercettate nel browser: nessuna scrittura personale o chiamata discovery reale in tali prove. Una prima apertura esplorativa della Home locale ha usato il normale caricamento dell'app.
- 24 ispezioni route/viewport: Home, Cities, City Lisbon, Twin landing, Passport, Settings, Saved popolato, viaggio condiviso, Compare iniziale, Photo credits, 404 e componente Place di verifica. Ogni template a 1440×1000 e 390×844. Nessun overflow orizzontale rilevato in queste ispezioni e nessun errore JavaScript di pagina raccolto.
- 18/18 test browser esistenti passati: 15 motion/Twin (parallasse, reveal, reduced motion, contenuto senza JS, risultato/azioni/focus, larghezze 320/390/1440 e landscape 812×375, categorie e stati 0/1 risultati/errore) e 3 Events (filtri, vuoto, città non supportata ed errore).
- Prove aggiuntive: hover con movimento ridotto, swipe nel quiz, cambio domanda/focus, geometria della foto City, salvataggio e toast mobile.
- Place verificato attraverso il suo componente nella route locale `/preview/checks`; non ho aperto ogni URL Place reale. Le città condividono il template City: il campione non verifica tutti gli undici inventari. Compare è stato visitato nello stato iniziale; la gestione delle colonne asincrone è stata valutata nel codice.
- Niente prova su telefono fisico, Safari/iOS, VoiceOver, sessione autenticata o sync tra dispositivi. Non è un benchmark FPS, INP, CLS o consumo energetico. Gli screenshot sintetici usano foto segnaposto e non valutano la qualità fotografica reale.
- Skill lette: `ecc:motion-advanced`, `motion-foundations`, `motion-patterns`. L'app usa GSAP, già scelto nel progetto: applico i principi su gerarchia, cleanup, accessibilità e gesti; il vincolo della skill su `motion/react` non diventa una proposta automatica di migrazione.

Evidenza privata riproducibile: `.private/qa/2026-10-26-motion/`, con `observations.json`, `probes.json`, script e screenshot. I test esistenti generano anche registrazioni nella cartella browser privata. `document.getAnimations()` registra gli effetti CSS/WAAPI, non è un inventario delle timeline GSAP.

## Cosa conserverei

1. **Il Passport come oggetto unico.** La rilegatura dà un motivo al movimento e distingue il sito da una griglia generica.
2. **Timbro dopo un salvataggio riuscito.** Il feedback dipende dal successo, non dal semplice tap; la conferma testuale resta disponibile.
3. **Foto che si muovono nel proprio contenitore.** L'idea protegge la leggibilità del testo, se il ritaglio viene corretto.
4. **Sequenze finite e reveal alla visibilità.** La pagina esempio Home ora aspetta il viewport; non considero ancora aperta la vecchia coreografia che terminava fuori campo.
5. **Interazione immediata.** I form non aspettano una lunga intro; la CTA Home è interamente accessibile nel campione mobile 390×844 attuale.
6. **Twin con primo risultato in evidenza.** Nome, motivo e azioni sono visibili nei percorsi testati; See other matches sposta anche il focus correttamente.
7. **Cleanup GSAP già presente.** `useGSAP`, `matchMedia().revert()` e disconnessione degli observer sono una base valida, non un sistema da riscrivere.

## Riscontri prioritari e soluzioni

Le etichette distinguono un difetto riprodotto da una proposta progettuale e da un rischio dedotto dal codice. P1: da correggere prima della rifinitura; P2: qualità/coerenza; P3: ottimizzazione da misurare.

### M01 — P1 — Movimento ridotto incompleto

**Riprodotto.** Con `prefers-reduced-motion: reduce`, l'hover di una City continua a scalare l'immagine: matrice `scale(1.045)`, con transizione quasi istantanea. Nel quiz un trascinamento di 80px continua a traslare la carta di 80px e ruotarla di 4°. La preferenza interrompe GSAP e azzera le durate CSS, ma non disattiva questi cambiamenti di trasformazione.

**Impatto.** L'effetto può diventare un salto invece di sparire. È particolarmente evidente per chi ha chiesto meno movimento.

**Soluzione.** Abilitare zoom hover e compressioni solo dentro `no-preference`; nella modalità ridotta usare colore, bordo e testo. Nel quiz mantenere i comandi Yes/No e la scelta semantica senza traslazione/rotazione animata. Non applicare indiscriminatamente `transform:none` a tutto: cancellerebbe anche rotazioni decorative e posizionamenti strutturali.

**Accettazione.** Hover, pressione, trascinamento, apertura e cambio preferenza a pagina aperta non producono spostamenti non necessari; eventuale dissolvenza entro 150–200ms. Controllare sia CSS sia trasformazioni inline.

**Fonti.** `src/styles/base.css:340`, `src/styles/buttons.css:36`, `src/styles/travel-world.css:24`, `src/styles/home.css:576`, `src/components/quiz-flow.tsx:277`.

### M02 — P1 — Il cambio domanda perde il focus

**Riprodotto.** Aprendo il quiz e premendo Skip, la nuova domanda compare ma `document.activeElement` diventa `body`. La schermata precedente viene rimossa senza una destinazione di focus per la successiva.

**Impatto.** La transizione visiva comunica un nuovo passaggio, mentre la navigazione da tastiera perde il punto di lettura. Non è una prova che il focus trap nativo del dialog sia assente: il problema osservato è il cambio interno di domanda.

**Soluzione.** Dare al titolo della domanda una destinazione programmatica e focalizzarla con `preventScroll` dopo il cambio di step; mantenere l'indicazione Question n/18 accessibile. Evitare di ritardare il focus fino alla fine dell'animazione. Gestire anche Back e il passaggio al completamento.

**Accettazione.** Dopo risposta, Skip e Back, il focus identifica la nuova domanda; Tab raggiunge i suoi controlli in ordine. La chiusura restituisce il focus alla CTA di apertura. Verifica successiva con screen reader reale.

**Fonti.** `src/components/quiz-flow.tsx:47`, `src/components/quiz-flow.tsx:94`, `src/components/quiz-panel.tsx`.

### M03 — P1 — Toast di salvataggio sopra la navigazione mobile

**Riprodotto.** A 390×844 il toast occupa circa y=762–823 durante l'ingresso, mentre la tab bar inizia a y=787: si sovrappone alla barra inferiore. Lo screenshot `390-twin-save.png` mostra Undo/Change sopra le destinazioni di navigazione.

**Impatto.** Una conferma utile ostacola l'azione successiva. Aumentare lo z-index non risolve la geometria.

**Soluzione.** Ancorare il toast sopra altezza tab bar + safe area + 12–16px; condividere la misura con il layout mobile. Consentire al messaggio e alle azioni di andare a capo sui telefoni stretti. Mettere in pausa la scadenza quando l'utente interagisce con le azioni o le mette a fuoco.

**Accettazione.** Nessuna intersezione toast/barra a 320, 390 e landscape; Undo/Change restano raggiungibili con zoom testo e safe area iOS. Verificare posizione anche a ingresso terminato.

**Fonti.** `src/styles/toast.css:5`, `src/styles/shell.css` (tab bar), `src/components/toast.tsx:24`.

### M04 — P2 — La parallasse City altera la cornice

**Riprodotto anche sul pubblico.** Sul mobile la cornice fotografica misura 92px e l'immagine 74px. Scorrendo, il margine superiore passa da circa 13,6px a 17px e quello inferiore da 4,4px a 1px. L'immagine si muove dentro la cornice senza la sovrabbondanza di dimensione prevista dal commento del componente.

**Causa confermata nel CSS.** `.travel-world .city-cover-photo img` ha specificità superiore alle regole di overscan in `travel-motion.css`: prevalgono `height:calc(100% - 16px)` e `inset:8px` sul mobile. Caricare dopo il foglio motion non basta.

**Soluzione.** Separare passepartout fisso, finestra interna con overflow nascosto e immagine sovradimensionata mobile/desktop. La foto deve muoversi nella finestra; il passepartout deve restare simmetrico. Un solo proprietario del transform.

**Accettazione.** Verificare i due estremi dello scroll: nessun bordo scoperto e nessuna variazione del passepartout. Il test attuale dimostra il movimento relativo, non la qualità del ritaglio.

**Fonti.** `src/styles/travel-world.css:32`, override mobile nello stesso file, `src/styles/travel-motion.css:3`, `src/components/travel-motion.tsx:29`.

### M05 — P2 — La Home ha troppi accenti nello stesso ingresso

**Valutazione progettuale.** L'ingresso combina hero, testo in stagger, emblema, tracciati, pagina, bookmark e timbro; poi si aggiungono i livelli in parallasse. Sono elementi coerenti, ma senza una priorità abbastanza netta. Il timbro parte da scala 1,8 e rotazione −32°: è un gesto più vistoso del necessario per un esempio.

**Soluzione.** Fare della rilegatura/pagina il gesto principale. Titolo e promessa si assestano entro circa 450–600ms; decorazione secondaria a basso contrasto; pagina esempio parte quando è visibile; timbro più breve, da scala 1,15–1,25. Conservare più energia per un vero risultato o salvataggio. Su mobile ridurre escursioni e sovrapposizioni, mantenendo lo storyboard approvato.

**Accettazione.** Nei primi 700ms il lettore individua subito titolo e ingresso operativo; nessun form si sposta mentre è usato; la decorazione non richiede attesa.

**Fonte.** `src/components/home-passport-motion.tsx:16`.

### M06 — P2 — Reveal ripetuti e annidati nella griglia Cities

**Confermato nel codice; giudizio di ritmo.** La card entra con traslazione di 24px/600ms e la foto interna si scopre con clip-path/650ms. Il ritardo della card può arrivare a 280ms. Un solo contenuto riceve quindi due ingressi differenti; durante lo scroll rapido può sembrare ancora in preparazione.

**Soluzione.** Per le griglie usare un solo ingresso principale: contenitore con 8–12px e 280–360ms, stagger massimo di gruppo 120–180ms. Riservare il reveal a tendina a una foto principale o a un momento narrativo. Nel filtro Europa/Asia/Americhe non rifare la presentazione di tutte le card.

**Accettazione.** Scroll rapido e cambio filtro lasciano titoli leggibili subito; le card già viste non si esibiscono nuovamente per un aggiornamento ordinario.

**Fonti.** `src/components/travel-motion.tsx:52`, `src/components/travel-motion.tsx:54`, `src/components/home-cities.tsx:85`.

### M07 — P2 — Mancano transizioni con una relazione tra le schermate

**Confermato nel codice.** Il sistema anima elementi in ingresso; non implementa una transizione coordinata tra card City e guida, né tra card Place e dettaglio. `TravelMotion` ricrea i suoi insiemi di elementi visti al cambio pathname. È diverso da una continuità di navigazione e può ripresentare gli ingressi al ritorno.

**Soluzione.** Conservare shell e posizione di ritorno; usare una transizione breve del contenuto interno, senza aspettare l'uscita per navigare. Eventuale foto condivisa City→City o Place→Place solo come rifinitura con fallback affidabile. Sul Back privilegiare orientamento, scroll e selezione già presenti. La presentazione mobile come bottom sheet è una possibilità coerente col dominio, ma richiede una scelta esplicita e gestione completa di URL, focus e chiusura: non basta una traslazione dal basso.

**Accettazione.** Navigazione rapida, Back/Forward e click interrotto non producono schermi vuoti, scroll rubato o due livelli che si animano in conflitto. Non introdurre una copertina a tutto schermo a ogni link.

**Fonti.** `src/components/travel-motion.tsx:94`, `src/app/layout.tsx`, `src/components/place-view.tsx`, `src/components/use-city-context.ts`.

### M08 — P2 — Quiz: gesto e cambio passo poco naturali

**Confermato nel codice.** Ogni pointermove aggiorna stato React; lo swipe decide solo oltre 100px; la carta successiva sostituisce la precedente riportando subito dx a zero. La rotazione di pagina è sempre nello stesso verso, anche con Back. Non sono presenti velocità, discriminazione orizzontale/verticale o una vera uscita della carta.

**Soluzione.** Aggiornare il trascinamento fuori dal ciclo di render, con motion value o GSAP quick setter e cleanup. Decidere con distanza e velocità: ad esempio gesto lungo ≥96px, oppure ≥32px e velocità ≥550px/s, con prevalenza orizzontale; sono valori iniziali da tarare. Ritorno elastico breve se il gesto è insufficiente; uscita/entrata distinte dopo conferma, senza bloccare comandi o focus. Invertire il verso su Back. Sostituire l'animazione di `width` della progress bar con `scaleX` e un indicatore separato.

**Accettazione.** Provare swipe lento, rapido, diagonale, scroll verticale, pointercancel e tap ripetuti su touch reale. Una sola risposta per gesto, nessuna perdita di scorrimento, stessi risultati con pulsanti e tastiera. Modalità ridotta come M01.

**Fonti.** `src/components/quiz-flow.tsx:38`, `src/components/quiz-flow.tsx:277`, `src/styles/quiz.css:21`.

### M09 — P2 — Timbri storici e stati negativi hanno troppa enfasi

**Confermato nel codice.** Le righe attività Passport animano il contenitore in CSS e il marchio interno in GSAP. Anche gli empty state usano il timbro con overshoot. Non è una collisione sullo stesso nodo, ma è una doppia enfasi; una pagina in errore riceve un gesto simile a una conferma positiva.

**Soluzione.** Riservare il colpo d'inchiostro a un nuovo successo. Per attività storiche usare marchi già stampati e, al massimo, un fade della sezione. Per errore/zero risultati usare un simbolo statico e una comparsa breve della spiegazione. Distinguere visivamente il timbro esempio Home da una nuova attività senza cambiare il significato dei dati.

**Accettazione.** Riaprire Passport non simula nuove conquiste; errore, vuoto e salvataggio riuscito hanno accenti diversi; rimane sempre una conferma testuale.

**Fonti.** `src/styles/passport.css:247`, `src/components/travel-motion.tsx:45`, `src/components/empty-state.tsx:12`.

### M10 — P2 — Pannelli e messaggi compaiono/escono bruscamente

**Confermato nel codice.** Quiz, condivisione e conferme usano dialog nativi; il pannello Save è montato/smontato; il toast ha ingresso CSS ma viene rimosso senza uscita. Il dialog nativo è una buona base funzionale, ma la sua apertura non ha una coreografia esplicita.

**Soluzione.** Un trattamento condiviso: backdrop 120–160ms; pannello 180–240ms con 6–10px; uscita 100–140ms. Per Save far percepire il legame con il cuore. Mantenere le semantiche native, Escape, focus trap e ripristino del focus: l'uscita non deve lasciare invisibili elementi interattivi. Pausa della scadenza toast su focus/hover, e tempo effettivo di lettura preservato quando si torna da un'altra scheda.

**Accettazione.** Aprire/chiudere rapidamente o durante un salvataggio non lascia overlay né focus nascosti; reduced motion mantiene tutto statico o con fade breve.

**Fonti.** `src/components/quiz-panel.tsx`, `src/components/share-trip.tsx`, `src/components/save-button.tsx:193`, `src/components/toast.tsx:28`, `src/styles/toast.css:29`.

### M11 — P2 — Liste e filtri cambiano più velocemente della loro continuità visiva

**Valutazione del codice e dei flussi.** Filtri City/Events, rimozioni Saved e cambi categoria sostituiscono o rimuovono elementi senza un trattamento comune dello spostamento. I reveal al montaggio non spiegano da soli dove siano finiti gli elementi precedenti.

**Soluzione.** Conservare chiavi e contenuti ancora validi; transizione breve solo sugli elementi interessati. Eventuale FLIP circoscritto alle card visibili e a piccoli insiemi, non animazione di layout su cinquanta risultati. Aggiornare il conteggio e annunciarlo senza spostare il focus. Per rimozione: uscita breve, ricomposizione e Undo persistente per il tempo utile. Nei campi filtro non animare ogni pressione del tasto.

**Accettazione.** Nessun salto della posizione di lettura; input immediati anche durante cambi rapidi; zero risultati ha un chiaro ritorno ai filtri precedenti.

**Fonti.** `src/components/city-view.tsx`, `src/components/events-explorer.tsx`, `src/components/collections-view.tsx`, `src/components/shared-trip-view.tsx`.

### M12 — P2 — Skeleton e loading non hanno una policy completa

**Confermato nel codice; costo energetico non misurato.** Skeleton Home e Place ripetono un'animazione di background-position a 1,2s, senza una pausa applicativa per scheda nascosta. Il browser può limitare il lavoro in background: non sostengo che mantenga una specifica attività GPU. Il tracciato di caricamento è finito e decorativo, quindi non misura il progresso reale.

**Soluzione.** Shimmer su pseudo-elemento via transform, pausa su scheda nascosta e fuori viewport, variante statica ridotta. Conservare dimensioni vicine al risultato finale; per richieste rapidissime evitare il lampeggio dello skeleton con una breve soglia di presentazione, senza ritardare dati già disponibili. Compare deve conservare indipendenza e stato di ciascuna colonna. Non mostrare percentuali o una fine del tracciato come promessa di completamento.

**Accettazione.** Ripresa dalla scheda nascosta corretta; loading, errore e retry distinguibili; nessuna attesa artificiale dopo l'arrivo del dato. Profilare paint/compositing prima di dichiarare miglioramenti prestazionali.

**Fonti.** `src/styles/place-card.css:29`, `src/styles/home.css:309`, `src/components/empty-state.tsx:23`, `src/components/compare-view.tsx:138`.

### M13 — P2 — Tempi ed easing non hanno ancora una sola regia

**Confermato nel codice.** Esistono token CSS, ma GSAP usa molti valori inline e alcune animazioni CSS usano tempi propri. Hero, reveal, route SVG, timbri, quiz e toast sono coerenti come metafora, meno come famiglia di ritmi.

**Soluzione.** Un insieme di token semantici condivisi tra CSS e GSAP: press, control, panel, reveal, stamp, route. Separare durata e distanza per mobile e desktop. Mantenere GSAP; non aggiungere una seconda libreria per ottenere semplicemente un fade.

**Accettazione.** Una modifica del ritmo globale non richiede interventi su ogni componente; nessuna durata introduce un blocco degli input; gli elementi della stessa classe di azione si comportano nello stesso modo.

**Fonti.** `src/styles/tokens.css:116`, `src/components/travel-motion.tsx`, `src/components/home-passport-motion.tsx`, `src/components/journey-animation.tsx`, `src/styles/swap.css:229`.

### M14 — P3 — Observer e refresh: ottimizzare solo dopo misura

**Rischio da codice, non rallentamento dimostrato.** Il MutationObserver visita i nodi aggiunti nel contenuto, e il ResizeObserver della radice chiama `ScrollTrigger.refresh()`. Durante una cascata di contenuti asincroni possono esserci scansioni/refresh ravvicinati. Il cleanup è già presente.

**Soluzione.** Misurare un percorso lungo con filtri e navigazioni ripetute; raggruppare refresh in un frame e limitarli ai cambi geometrici utili, lasciando completare il resize senza loop. Valutare registrazioni esplicite nei componenti al posto di allargare ancora il selettore globale. Ridurre clip-path simultanei solo se il profilo mostra paint costoso.

**Accettazione.** Nessuna crescita di trigger/listener dopo visite ripetute; nessun long task attribuibile ai refresh nel percorso misurato; riduzione confermata dal profilo, non soltanto dal numero di righe di codice.

**Fonte.** `src/components/travel-motion.tsx:74`.

## Feedback per area del sito

| Area | Giudizio attuale | Intervento proposto |
|---|---|---|
| Home | La firma più riuscita; azione mobile accessibile nel campione; pagina esempio correttamente legata al viewport | Un gesto protagonista, ingresso più compatto, timbro esempio meno enfatico; errore del provider leggibile e stabile |
| Cities | Belle metafore di viaggio, ma card e foto hanno reveal sovrapposti | Un ingresso per card; filtri rapidi; hover disattivato in reduced motion |
| City / For you | Buona separazione tra contenuto e decorazione; cornice foto non preservata dalla parallasse | Correggere finestra/overscan; mantenere filtri fermi; continuità lista/mappa senza animare il canvas 3D |
| Twin landing/editor | Le etichette Keep/Delete/Ignore sono già esplicite e comprensibili | Feedback colore/segno 120–160ms; Delete disegna una barra breve, Keep evidenzia; nessuna danza di tutta la riga |
| Twin risultato | La relazione riferimento→match è visibile; risultato e azioni funzionano nei test | Tratto di collegamento breve, poi primo match; differenza e altri risultati subordinati; nessun ritardo del contenuto in attesa del disegno |
| Place | Carta e foto coerenti; il dettaglio è un cambio pagina anche su mobile | Continuità dalla card e Back affidabile; eventuale sheet richiede progetto completo; ridurre decorazione vicino alle azioni |
| Passport | Timbri significativi, ma storico e nuovo successo troppo simili nel movimento | Animare la nuova acquisizione; storico quieto; feedback locale su modifica delle città visitate senza suggerire viaggi inventati |
| Quiz | Ricco di interazioni, parte tecnicamente meno rifinita | Focus per step, direzione Back, swipe con fisica/soglie e movimento ridotto; progress via transform |
| Saved | Lettura chiara, cambi/rimozioni piuttosto bruschi | Ricomposizione limitata, Undo accessibile, toast sopra la tab bar; dialog coerenti |
| Trip condiviso | Il formato cartaceo basta già a caratterizzarlo | Ingresso breve del foglio, poi statico; conferma Copy/Download locale senza ripetere l'intro |
| Events | Le card usano i reveal condivisi; i filtri funzionano nei test | Privilegiare data e conteggio; transizioni piccole; errori e città non supportate senza timbro celebrativo |
| Compare | Colonne e stati iniziali leggibili; il page-turn non spiega il lavoro asincrono | Loading indipendente e stabile per colonna; nessuna animazione che faccia apparire un provider come vincitore |
| Settings, privacy, Photo credits | Appropriate come aree più tranquille | Stati statici e feedback brevi; azioni distruttive leggibili, senza effetti giocosi |
| 404, errori, vuoti | Identità condivisa, ma timbro troppo simile alla riuscita | Icona/marchio statico, testo e recupero prioritari; messaggio stabile durante retry |
| Shell e navigazione | Geometria stabile; nessuna regia comune tra destinazioni | Mantenerla ferma; indicatore attivo breve; tutelare posizione e focus; correggere overlap toast |

## Regia motion proposta

Valori iniziali progettuali, da tarare su registrazioni e touch reale, non misure ottimali già dimostrate.

| Funzione | Tempo indicativo | Movimento |
|---|---|---|
| Pressione | 80–100ms | Scala minima, solo se consentita |
| Toggle / Keep / Delete | 120–160ms | Colore, tratto o evidenziazione; testo fermo |
| Toast / popover / pannello | 160–240ms | 6–10px e opacità; uscita più breve |
| Card / risultato | 280–360ms | 8–12px; nessuna attesa per leggere o cliccare |
| Gesto principale Passport | 450–650ms | Un livello principale, decorazione subordinata |
| Timbro di successo | 220–320ms | Breve impatto; overshoot contenuto; testo persistente |
| Itinerario SVG | 600–900ms | Tracciato finito, senza percentuale inventata |
| Ridotto | Statico, oppure fade ≤150–200ms | Nessun parallax, zoom o rotazione interattiva |

Le molle hanno senso nel ritorno da un trascinamento e nella manipolazione diretta. Per testo, lettura, filtri e navigazione preferirei easing breve e controllato. Non aggiungerei cursore inseguitore, testo lettera per lettera, magnetic button, loop ornamentali o scroll bloccato: non aiutano questi compiti.

## Ordine di intervento e verifica

1. **Accessibilità e geometria:** M01–M04. Aggiungere verifiche mirate per focus del quiz, hover/swipe ridotti, collisione toast/tab bar e cornice fotografica. I test verdi attuali non coprono questi quattro casi.
2. **Regia condivisa:** M05, M06, M09, M13. Definire token e gerarchia, poi registrare Home/Cities/Passport desktop e mobile con identici percorsi prima/dopo.
3. **Continuità delle azioni:** M07, M08, M10, M11. Verificare apertura/chiusura interrotte, Back/Forward, swipe/cancel, filtri rapidi e Undo; evitare input bloccati dalle sequenze.
4. **Loading e prestazioni:** M12, M14. Profilare build di produzione, CPU rallentata e telefono reale; misurare tempi frame, paint e task prima/dopo. Nessuna promessa di 60fps sulla base dei soli screenshot o test funzionali.

Per l'accettazione finale: 320/390/1440px, landscape, touch fisico, tastiera, movimento ridotto attivo prima del caricamento e modificato a runtime, ritorno da background, richieste veloci/lente/errore, navigazione durante le animazioni, caricamento fotografie tardivo e zoom testo. Conservare la direzione Passport A e le decisioni Keep/Delete/Ignore già approvate.

## Stato della consegna

Audit e proposte soltanto. Nessuna modifica a componenti, stili applicativi, database, ticket, branch remoto o deployment. Le evidenze restano private; il solo nuovo documento di progetto è questo report.
