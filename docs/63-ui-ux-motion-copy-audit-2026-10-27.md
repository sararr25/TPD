# Beesyde — audit UI, UX, motion, icone e copy

27 ottobre 2026. Audit richiesto dall’owner; nessuna modifica applicativa o pubblicazione.

## Valutazione

Beesyde ha una direzione visiva riconoscibile e un’idea utile: usare il gusto personale sia per scoprire una città sia per trovare un’alternativa a un locale. Il Passport, la palette berry/lemon, le illustrazioni e il primo risultato Twin sono gli elementi da conservare. La prossima iterazione dovrebbe rendere più rapido il passaggio dalla presentazione alla scelta e correggere alcune incoerenze di stato e accessibilità.

Non assegno un voto numerico: questa è una review euristica con verifiche browser e sorgente, non uno studio con utenti o una certificazione WCAG.

## Metodo e perimetro

- App pubblica: https://beesyde.vercel.app. Sorgente locale pulito prima dell’audit, commit `dfb92e2`, branch `codex/twin-motion-ux`. Il default GitHub verificato è `claude/blissful-gauss-dymbeo`. Non ho interrogato Vercel per attestare nuovamente il deployment SHA.
- Letti README, handover 28 e precedente 27, glossario, ADR e pubblicazione 62. Consultati tracker aperto e commenti #36–44; non riapro requisiti storici o decisioni già prese.
- Percorsi esercitati: Home senza profilo, Cities, Lisbon senza e con Passport, locale, Save e modifica liste, Twin da Time Out Market, primo match e altri risultati, Passport prima/dopo quiz, preview personale aperta esplicitamente, Settings, Saved e anteprima condivisione. Compare ispezionato nello stato iniziale, senza lanciare il confronto AI.
- Contesto browser isolato, dati ospite sintetici. Nessun accesso/account reale, condivisione esterna, invio messaggi, modifica schema o configurazione. Le normali aperture e ricerche possono usare gli endpoint reali di discovery; non ho eseguito probe massivi.
- Desktop: viewport effettivo rilevato 1440×780. Mobile: 375×812. Controlli aggiuntivi Home a 768×1024 e Settings/intro quiz/Compare a 812×375. Prova aggiuntiva della Home con zoom CSS 2×, che non equivale a verificare Dynamic Type o zoom nativo in tutti i browser.
- Quiz: scelta multipla iniziale, passaggio swipe, Skip sulle restanti domande, top-up con 3 preferiti, salvataggio ospite e profilo risultante. Verificata separatamente la perdita della bozza chiudendo e riaprendo da Settings. Non è una verifica completa di ogni combinazione delle 18 domande.
- Nessun overflow orizzontale nei campioni misurati. Empty state riprodotto con prezzo € e cucina Seafood: messaggio e Clear filters presenti.
- Motion: ispezione visiva durante navigazione/scroll, stati DOM e sorgente GSAP/CSS. Reduced motion e cleanup presenti nel sorgente; non ho eseguito una nuova prova del cambio della preferenza OS. Nessuna nuova misura di frame rate, Core Web Vitals o performance sul campo.
- Limiti: telefoni fisici, Safari nativo, VoiceOver/TalkBack, audio reale, account e sincronizzazione tra dispositivi non verificati. Nessuna suite automatizzata rilanciata: l’audit non cambia il codice applicativo. Le evidenze storiche di #44 restano distinte da queste osservazioni.

Skill applicate: ui-ux-pro-max e shadcn-ui. Eseguiti ricerca design-system e passaggio UX animation/accessibility/loading. I suggerimenti generici del database su nuovi font, palette e scorrimento orizzontale non sono adottati: il brand approvato e lo stack Next/React del repository prevalgono sul modello generico della skill, orientato anche alle app native.

## Cosa funziona bene

| Ambito | Evidenza e valore |
|---|---|
| Identità | Passport rilegato, carta, timbri, serif e berry/lemon compongono un sistema memorabile. Home, City, Saved e Passport appartengono allo stesso prodotto. |
| Due ingressi | Pick a city e Find its twin sono distinti. Twin è utilizzabile senza completare prima il quiz. La navigazione mantiene il contesto Lisbon. |
| Twin | Nel caso provato, Keep Seafood + Delete Casual produce 3 match. Palácio Chiado viene portato in vista con nome, motivazione, prezzo e Save; non occorre ritrovare il risultato sotto il form. |
| Confronto onesto | Il primo match esplicita €€€€ contro €€ del riferimento e distanza in linea d’aria. Non compaiono percentuali inventate di compatibilità. |
| Altri risultati | See other matches porta agli altri match e trasferisce davvero il focus al relativo titolo. |
| Quiz | Illustrazioni originali leggibili, scelta visuale, pulsanti alternativi allo swipe, Back/Skip/Undo e progresso. L’intro in landscape è utilizzabile. |
| Personalizzazione | Dopo il quiz le card riportano i preferiti effettivi. Il Passport mostra il profilo e permette di aprire una preview; la città deve essere scelta esplicitamente. |
| Salvataggio | Un tap salva nel viaggio della città; conferma con Undo/Change. Saved dice chiaramente “On this device only”. |
| Condivisione | L’anteprima spiega che link e cartolina escludono le note, e che il link è una fotografia del viaggio che non cambia con le modifiche successive. |
| Stati vuoti | Combinando filtri senza risultati si ottiene un messaggio comprensibile e Clear filters. I prezzi sconosciuti non vengono trasformati in una fascia inventata. |
| Base motion | Token condivisi, reveal finiti, contenuti leggibili a riposo, form esclusi dalla timeline Home, parallasse su decorazioni/foto, cleanup e reduced motion nel codice. |
| Mobile | Quattro destinazioni nella barra inferiore, testo sotto le icone, stato attivo riconoscibile e nessun overflow nei campioni misurati. |

## Da cambiare con priorità

P1 indica attrito importante, perdita di lavoro o barriera di accessibilità; P2 indica chiarezza e qualità percepita. Nessun crash bloccante è stato riprodotto in questi percorsi.

### F01 · P1 — Il top-up del quiz continua a chiedere preferiti già selezionati

**Riproduzione:** arrivare al finale senza preferiti dalle domande swipe. Il titolo dice “Pick 3 more you’d give a try”. Selezionare tre tile: il titolo resta uguale, mentre Build my Passport diventa utilizzabile e salva correttamente.

**Causa nel codice:** `remaining` usa soltanto `seeds.length`, prima di unire `validExtra` in `selectedFavourites` (`src/components/quiz-flow.tsx:26`).

**Intervento:** calcolare il numero mancante sull’unione finale deduplicata; mostrare “Choose 3 favourites to finish”, poi “2 more to go”, “1 more to go”, infine “Your choices are ready”. Aggiungere “3 of 5 selected” e mantenere visibile la selezione. Il copy deve distinguere ciò che piace davvero da ciò che si sarebbe soltanto disposti a provare.

**Accettazione:** titolo, contatore e disponibilità della CTA concordano per 0–5 selezioni, anche dopo deselect e Back.

### F02 · P1 — La chiusura del quiz perde la bozza e la scelta audio

**Riproduzione:** Settings → Redo the quiz → Sound off → Start → selezionare Bookstore → Close quiz → Redo. Si riparte dall’intro con “Sound on”. Lo stato del componente si azzera allo smontaggio (`quiz-flow.tsx:17–19`).

**Intervento:** conservare una bozza locale separata dal Passport definitivo, con step, risposte, storico swipe e top-up; conservarne correttamente l’appartenenza ospite/account. All’apertura: “Continue your quiz” e “Start again”. Persistenza della preferenza audio distinta dalla bozza. Se si vuole mantenere l’attuale comportamento, occorre almeno avvertire prima di scartare risposte già date.

**Accettazione:** chiusura/refresh non cancellano silenziosamente il progresso; una bozza non sostituisce mai il Passport salvato e non passa a un altro account.

### F03 · P1 — Il quiz dal Passport non ha la stessa modalità accessibile degli altri ingressi

**Evidenza:** PassportBuilder monta direttamente QuizFlow come `section role="dialog" aria-modal="true"`; header, navigazione, timbri e footer restano nell’albero di accessibilità. Il percorso condiviso usa invece un `<dialog>` con `showModal()`. Il trap Tab locale esiste, ma non rende inerte il resto della pagina. Questa è un’incoerenza verificata di struttura; l’esperienza effettiva con VoiceOver rimane da provare.

**Intervento:** usare un unico contenitore modale per tutti gli ingressi, con background inerte, focus iniziale, Escape, focus di ritorno e gestione del salvataggio in corso. Si può riusare il dialogo nativo esistente; shadcn Dialog è un’alternativa da valutare, non una migrazione necessaria.

**Accettazione:** Home, Passport e Settings hanno lo stesso comportamento; lo screen reader non esplora la pagina dietro il quiz e il focus torna a un elemento esistente alla chiusura.

### F04 · P1 — Alcuni controlli mobile sono troppo stretti

**Misure:** Keep ~31×44 px, Delete ~39×44, Ignore ~38×44. Skip ~27×44. Pin della mappa desktop 28×28 e zoom circa 29×29.

**Intervento:** target comodo minimo 44×44 CSS px; tre segmenti di larghezza uniforme per i tratti, con label che non si riducono. Si può ingrandire l’area cliccabile dei pin mantenendo il cerchio visivo piccolo, verificando le sovrapposizioni tra punti vicini.

**Precisazione:** 44×44 è l’obiettivo di comodità scelto per il prodotto. WCAG 2.2 AA 2.5.8 prevede 24×24 CSS px o condizioni/eccezioni di spaziatura: le misure inferiori a 44, da sole, non provano una violazione AA.

### F05 · P1 — Presentazione troppo alta prima delle azioni e dei risultati

**Misure:** sulla Home desktop 1440×780 il campo città inizia a y≈828; su Home mobile è invece visibile a y≈605, con CTA a y≈665. Su Lisbon mobile il primo risultato personalizzato si trova a y≈1326 dopo cover, categorie e filtri.

**Intervento:** mantenere il Passport aperto e la composizione approvata, riducendo spazio verticale sopra il selettore desktop; far partire il form prima dell’emblema decorativo. Nella City accorciare la cover e mettere i filtri secondari in “Filters”, con riepilogo delle scelte attive e Clear. La modalità Twin non dovrebbe ripetere un’introduzione alla città lunga prima di un compito già preciso.

**Accettazione:** la prima schermata desktop consente di iniziare entrambe le azioni; su telefono la City mostra prima il contesto essenziale e l’accesso ai risultati, senza dover eliminare la fotografia o cambiare tema.

## Da migliorare

| ID | Evidenza | Come intervenire |
|---|---|---|
| F06 · P2 | La tab bar usa SVG uniformi; Save/Hide/Directions e alcuni controlli usano `♡ ♥ ✕ ↗ ＋` tipografici. | Un’unica famiglia SVG per le azioni di sistema, con dimensioni e stroke condivisi. Cuore per Save oppure bookmark, ma la scelta deve essere coerente tra navigazione, card e stato salvato. Timbri e illustrazioni restano artwork distinti. |
| F07 · P2 | In una pagina personale tutte le nove motivazioni osservate ripetono “Because you like Khruangbin and Nina Simone”. | Portare la motivazione comune nell’introduzione della lista; sulle card mostrare informazioni diverse e documentabili sul posto. Se non c’è una ragione specifica affidabile, non inventarla per variare il testo. |
| F08 · P2 | Cuisine contiene anche “Local favorites”, “Healthy”, “Brunch”; placeholder “Any listed trait”. | Dare un nome coerente all’insieme, oppure separare cucina e caratteristiche. Presentare le label provider con una mappatura editoriale, mantenendo gli ID e i contratti originali. |
| F09 · P2 | Keep/Delete/Ignore sono spiegati, ma richiedono di ricordare tre significati. | Conservare i nomi approvati; aggiungere un riepilogo persistente “Prefer: Seafood · Exclude: Casual”. Una frase vicina: “For this search only. Your Passport stays the same.” Niente conferma distruttiva per Delete, che non cancella dati. |
| F10 · P2 | “What’s different & search details” compete con i dettagli già mostrati; il maggiore prezzo è importante per la decisione. | Separare “What changes” visibile da dettagli tecnici espandibili. Segnalare subito “Higher price tier · €€€€ vs €€” senza convertirlo in prezzi reali o costi stimati. |
| F11 · P2 | Il Passport distingue verbalmente viaggi reali e attività, ma chiama entrambi stamps. | Conservare i timbri viaggio come elemento principale; chiamare il registro inferiore “Your Beesyde activity”. Azione “Add a visited city” al posto del più astratto “Add stamps”. |
| F12 · P2 | Dopo una sola domanda e molte Skip viene comunque assegnato un archetipo deciso, “The Spontaneous Flâneur”, con motto “Culture first, food close behind”. | Rendere esplicito che il profilo è iniziale/parziale quando le risposte sono poche; basare le frasi solo sulle risposte disponibili. Proporre completamento da Settings senza rimettere il retake al centro del Passport. |
| F13 · P2 | La pagina Pastéis de Belém mostra un fallback dichiarato “Lisbon city photo”, mentre in Saved era disponibile una foto del locale. Il dettaglio offre soprattutto nome, indirizzo, chip e mappa. | Conservare dove possibile la foto valida lungo lo stesso percorso, nel rispetto dei dati/diritti disponibili. Rendere molto visibile il fallback. Portare nel dettaglio il contesto del risultato di provenienza quando ancora valido; non inventare una spiegazione da un semplice lookup. |
| F14 · P2 | Il save editor è un pannello assoluto custom con `role="group"`; il focus resta sul trigger all’apertura. I toast si sostituiscono uno con l’altro. | Desktop: popover che gestisca viewport e focus; mobile: sheet con titolo, chiusura chiara e ritorno al trigger. Definire una politica per non far sparire Undo/Change a causa di feedback secondari; errori importanti anche vicino al controllo. Il focus sul trigger non è, da solo, un bug per ogni popover. |
| F15 · P2 | Nel quiz mobile diverse label e status sono 9–12 px; l’avanzamento automatico usa una pausa di 1050 ms e la chiusura non mantiene il mute. | Ingrandire istruzioni e status importanti; rendere prevedibile l’avanzamento e lasciare controllo esplicito su multiselezione. Persistenza audio come F02. Verificare separatamente testo 200% e screen reader. |
| F16 · P2 | Events · Paris pilot è visibile anche nella City Lisbon. È etichettato correttamente, ma sembra una categoria locale adiacente alle altre. | Presentarlo come accesso distinto al pilot di Parigi; non inserirlo sullo stesso piano delle categorie della città corrente. Non espandere implicitamente copertura o Twin eventi. |

## Motion: cosa conservare e cosa cambiare

La motion deve mostrare il nesso tra azione e risultato e lasciare al Passport il ruolo narrativo. Il codice ha già una buona base: press 90 ms, control 150, exit 140, panel 220, stamp 280, reveal 340, hero 550 e journey 3,6 s. Il quiz usa anche tempi propri: fade 450, uscita swipe 350, settle 400 ms.

**Conservare:** assestamento della pagina sulla rilegatura, timbro dopo Save, mappa a inchiostro con impronte, foto con parallasse discreta, risultato Twin che sostituisce lo stato di ricerca. La scena di 3,6 secondi non è di per sé un problema se decorativa e non blocca l’uso; le microinterazioni richiedono tempi diversi da una scena narrativa.

**Migliorare:**

1. Evidenziare per 150–250 ms la scelta Keep/Delete e il riepilogo risultante; il feedback deve essere immediato anche mentre il risultato aspetta la rete.
2. Dare priorità a nome, differenza, prezzo e Save nella comparsa del match. Fare entrare le decorazioni dopo, con stagger complessivo breve.
3. Ridurre l’intensità della parallasse nelle schermate di lavoro e nelle visite ripetute. Non riavviare intere scene quando cambiano soltanto filtri o selezioni.
4. Consolidare i tempi quiz nel sistema condiviso, ammettendo valori dedicati dove servono allo swipe. Evitare pause fisse che sembrano attese di caricamento.
5. Mantenere l’equivalente statico: una scelta deve essere leggibile da testo/stato, non solo da traiettoria o colore. Verificare cambio reduced motion durante una transizione, Back/Forward e CPU lenta su device reale prima dell’accettazione.

## Copy proposto

Il prodotto resta in inglese come da ADR. Questi esempi vanno adattati allo stato reale, senza modificare i termini approvati Twin e Keep/Delete/Ignore.

| Punto | Proposta |
|---|---|
| Home, spiegazione | “Places shaped by what you love. Explore a city or find an alternative to a place you know.” |
| Quiz, intro | “Tell us what you like. We’ll use it to personalise your city picks.” |
| Finale quiz | “Choose 3 favourites to finish” → “1 more to go” → “Your choices are ready.” |
| Quiz parziale | “A first sketch of your taste, based on the answers you gave.” |
| Campo locale Twin | “Which place would you like an alternative to?” |
| Riepilogo Twin | “Prefer: Seafood · Exclude: Casual” |
| Ambito Delete | “For this search only. Your Passport stays the same.” |
| Differenza prezzo | “Higher price tier: €€€€ instead of €€.” |
| Risultati non disponibili | “No matches with these choices. Try removing one exclusion.” Solo se l’esclusione è una leva effettivamente attiva; altrimenti suggerire il filtro pertinente. |
| Visite | “Add a visited city” e “Cities you’ve visited”. |
| Attività | “Your Beesyde activity” con “Guides opened” e “Places saved”. |
| Save | “Saved to Lisbon trip” con “Undo” e “Change trip”. |
| Immagine fallback | “City photo · place photo unavailable”. |
| Filtri | “Filter these results” e “Clear filters”; niente gergo “listed trait” nel testo operativo. |

## Uso mirato di shadcn/ui

Il progetto non risulta configurato con shadcn/Tailwind nel package.json ispezionato. Non lancerei `init` per un audit e non sostituirei il linguaggio visivo con un preset. Le correzioni possono riusare CSS e `<dialog>` esistenti. Se si decide di introdurre shadcn, farlo per comportamento e manutenzione di pochi componenti, conservando token, font, forme e artwork Beesyde.

| Bisogno | Componente/pattern da valutare |
|---|---|
| Un solo quiz e editor accessibili | Dialog, con titolo e descrizione, focus e ritorno al trigger. |
| Liste e note al salvataggio | Popover desktop e Sheet mobile. |
| Tre stati dei tratti | Toggle Group o Radio Group con una scelta attiva per tratto; non richiedere click ciclici per raggiungere uno stato. |
| Ricerca città e preferiti | Combobox con tastiera, stato vuoto e loading. I select nativi possono rimanere dove l’elenco breve li rende efficaci. |
| Filtri mobile | Sheet, badge delle scelte e reset esplicito. |
| Feedback | Toast con politica di coda/durata/azioni verificata; Sonner da valutare sul registry/versione effettivamente scelti. |

La documentazione live consultata ha reindirizzato il vecchio percorso `/docs/components/sonner` a Base Toast: questo è un motivo per ricontrollare il componente attuale prima di installare, non per eseguire ciecamente i comandi della skill. Scegliere una sola base coerente e non mescolare API Radix/Base.

## Nuovi elementi e funzioni proposti

Queste sono proposte, non funzionalità già realizzate. Le prime tre hanno il rapporto valore/complessità più favorevole e usano il nucleo attuale del prodotto.

| Ordine | Funzione | Esperienza concreta | Vincoli e criterio di successo |
|---|---|---|---|
| 1 | Confronta 2–3 posti | Da due card salvate o risultati Twin: confronto compatto su fascia prezzo, tratti comuni/diversi, posizione, motivo e Save. Distinto dal confronto provider esistente. | Solo dati disponibili; nessuno score inventato. L’utente deve poter scegliere senza aprire e chiudere più pagine. |
| 2 | Preferenze per questa ricerca | Un piccolo pannello “For this search” sopra le scelte Twin, con riepilogo e reset. Evoluzione dei controlli attuali, non un secondo profilo. | Non modifica il Passport; chiarire quando un valore è una preferenza e quando è un’esclusione. Misurare comprensione e completamento, non solo click. |
| 3 | Riprendi da dove eri | Home di ritorno con viaggio recente e ultima ricerca recuperabile. Riutilizzo delle scelte, con aggiornamento esplicito dei risultati quando necessario. | Separazione ospite/account e scadenza delle selezioni/token. Mai mostrare risultati scaduti come attuali. |
| 4 | Organizza il viaggio | Evolvere Saved con gruppi liberi “Da provare”, “Sabato”, “Alternative”, riordino e nota. La mappa segue la selezione. | Nessuna pretesa di orari o percorso ottimale. Richiede decidere modello e persistenza prima di sviluppare. |
| 5 | Feedback esplicito dopo la visita | “Have you been?” → “Would go again / Not for me”, con possibilità di spiegare facoltativamente il motivo e annullare. | Solo azione deliberata: salvare o aprire un posto non equivale a esserci andati. Rendere chiaro cosa insegna al Passport. |
| 6 | Taccuino da viaggio | Versione stampabile dei posti scelti, con indirizzi, mappa statica se consentita e indicazioni di verifica. Estensione della cartolina già disponibile, non duplicato dello sharing. | Dati e mappe solo secondo diritti/retention disponibili. Chiarire data dell’esportazione; non promettere navigazione offline live. |
| 7 | Scelta insieme | Un viaggio condiviso con voto sui posti selezionati, prima di combinare eventuali profili personali. | Nuovo ambito backend/privacy da progettare. Nessuna pubblicazione di gusti, cronologia o note per default. |

Non prioritizzerei un chatbot generico, feed social, nuova palette, dark mode o ampliamento indiscriminato delle città. Il catalogo e la qualità delle spiegazioni attuali devono sostenere prima la promessa di trovare un posto adatto. “Open now”, prezzi reali e prenotazione richiedono dati che il contratto attuale non garantisce.

## Sequenza raccomandata

1. Correggere stato finale, bozza/mute e contenitore quiz; verificare i percorsi Home/Passport/Settings.
2. Allargare target e ridurre l’altezza prima delle azioni, preservando la composizione Passport.
3. Uniformare icone, copy operativo, differenze Twin e foto/fallback.
4. Rifinire motion e salvataggio, con prova fisica Safari/VoiceOver e Android.
5. Prototipare confronto posti e ripresa del contesto; validare con persone che devono scegliere davvero un posto. Misurare completamento, errori e capacità di spiegare la propria scelta; nessuna stima di uplift prima del test.

## Fonti

- Sorgente e ADR di questo repository; `docs/62-passport-and-backlog-release.md`.
- [Programma e commenti #44](https://github.com/sararr25/TPD/issues/44), in particolare i limiti di accettazione fisica e il receipt di pubblicazione. Non sono risultati eseguiti nuovamente durante questo audit.
- [WCAG 2.2 — Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- [shadcn Dialog](https://ui.shadcn.com/docs/components/radix/dialog) e [Toast, destinazione del redirect Sonner](https://ui.shadcn.com/docs/components/base/toast), consultati il 27 ottobre 2026.

