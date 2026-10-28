# Beesyde — revisione UI, UX e compatibilità mobile

28 ottobre 2026 · Report di valutazione e proposta, senza modifiche all’applicazione.

Continuazione successiva approvata: [programma dei 28 ticket e primo ciclo di implementazione](73-ui-ux-mobile-ticket-plan-and-first-cycle.md), #60. Il presente report conserva le osservazioni della baseline; lo stato di attuazione e le nuove verifiche sono nella continuazione.

## Valutazione

**Beesyde ha un’identità visiva riconoscibile. Il salto di qualità passa dalla gerarchia delle informazioni e dalla facilità di scegliere un posto.** Passport, carta, timbri, Instrument Serif e berry/lemon costituiscono una firma da conservare. La cornice occupa però molto spazio nei percorsi operativi; la personalizzazione viene spiegata tardi e alcune azioni importanti risultano meno evidenti dell’invito al quiz.

Il momento più convincente osservato è Twin quando mostra un risultato reale: luogo di partenza, alternativa, caratteristiche condivise, prezzo e differenze. È il modello da estendere al resto dell’esperienza: una sorpresa personale sostenuta da informazioni utili e verificabili.

| Campo | Stato osservato | Miglioramento determinante |
|---|---|---|
| UI | Identità forte; gerarchia e fotografia disomogenee | Far emergere nome, ragione della proposta e azione; assegnare alla decorazione un peso diverso nelle pagine operative |
| UX | Percorsi principali comprensibili dopo l’esplorazione; primo utilizzo e confini dei dati richiedono troppo apprendimento | Rendere espliciti lo stato della personalizzazione, il prossimo passo e l’effetto di ogni azione |
| Mobile | Buona base responsive nelle larghezze campionate; densità, confronto e quiz landscape da correggere | Progettare per altezza disponibile, lettura con una mano, tastiera e testo ingrandito, oltre che per larghezza |

Questi sono giudizi di revisione, non punteggi ricavati da utenti o misure di conversione. Non assegno un voto numerico senza una scala e un campione comparabile.

## Perimetro e affidabilità

- Checkout iniziale pulito: `codex/twin-motion-ux`, SHA `7b4e3a1400cd32d6fb6c17158d88a38f852b2b21`.
- Default GitHub verificato: `claude/blissful-gauss-dymbeo`. Unico issue aperto al controllo: [#59, accettazione manuale](https://github.com/sararr25/TPD/issues/59), senza commenti. I ticket tecnici precedenti restano chiusi.
- Letti README, docs/28, handover 71 con precedenti 69/70/68, Glossary, ADR e sorgenti pertinenti. La [ricevuta di release #44](https://github.com/sararr25/TPD/issues/44#issuecomment-6456053667), riletta su GitHub, associa quello SHA al dominio pubblico. In questa revisione il sito è stato visitato direttamente; il legame SHA/deployment proviene dalla ricevuta, non da una nuova ispezione Vercel.
- Browser: in-app browser, sessione guest. Osservazioni visuali, albero di accessibilità, DOM e geometrie effettive; nessun account personale usato. Il contesto guest registra normalmente attività, bozza quiz e ricerca recente: non equivale a un browser completamente privo di stato a fine percorso.
- Percorsi osservati: Home, Cities, Lisbon/For you, dettaglio Pastéis de Belém, Twin con Time Out Market, risultato Carmo e alternative, confronto di due luoghi, Passport iniziale, introduzione/prima domanda quiz, Saved vuoto, Settings e Qloo vs AI iniziale.
- Una ricerca Twin completa, con Keep Seafood, ha restituito tre alternative reali: Carmo, CHIADO TERRASSE e Fama d’Alfama. Nessun benchmark o raccolta massiva; nessuna nuova esecuzione del confronto con il modello AI.
- Filtro prezzo fino a €€: lista da 9 a 5 risultati; riepilogo visibile anche con filtri chiusi; mappa con gli stessi 5 luoghi. Il ritorno dal dettaglio conserva i parametri prezzo/vista nel percorso osservato.
- Save, note, organizzazione di un trip popolato, visite, notebook/esportazioni, recupero errori e account: revisione dei sorgenti e delle ricevute esistenti, **non nuova accettazione end-to-end**. L’auto-review ha respinto il clic Save perché comporta persistenza non autorizzata da una richiesta di revisione. Non è stato aggirato il blocco né eseguito un salvataggio.
- Nessun test fisico iPhone/Android, VoiceOver/TalkBack, ascolto audio, tastiera mobile reale o Google su due dispositivi in questa sessione. Restano nella [checklist manuale](70-physical-account-acceptance.md).
- Nessun nuovo axe, Lighthouse, tracciamento completo delle richieste, misura field dei Core Web Vitals o esperimento con utenti. Non si deduce conformità WCAG o compatibilità completa dai controlli di layout.
- Screenshot osservati nella sessione di revisione; non allegati al repository pubblico. Le misure sotto sono trascritte dalle letture DOM del browser. Non costituiscono un archivio di screenshot riproducibile automaticamente.

## Evidenze principali

Coordinate in CSS px, nel campione indicato; dipendono da viewport, stato e contenuti. I valori verticali dei primi tre rilievi sono relativi all’inizio pagina, con scroll iniziale zero.

| Rilievo | Risultato | Conseguenza |
|---|---|---|
| Home guest, 390×844 | Altezza documento circa 5.780 px nel primo campione | Molta narrazione da attraversare; utile compattare la visita di ritorno |
| Lisbon, 390×844, lista iniziale | Primo nome luogo a y=976; tab bar in basso visibile | Il primo schermo mostra copertina, controlli e invito al quiz, ma non il nome del primo posto |
| Stessa lista Lisbon | “Popular picks, not yet shaped by your taste.” a y=4.667,5 | La spiegazione dello stato generico arriva dopo tutti i risultati |
| Passport guest, 390×844 | Pulsante Make your Passport a y≈1.135,8 | Il nuovo visitatore incontra prima una pagina di timbri vuota; esiste comunque lo shortcut Your taste |
| Twin, 390 px, prima della ricerca | CTA Find its twin a y≈1.008,3 nel viewport corrente dopo la scelta del riferimento | L’editor richiede ulteriore scroll; evitare di aggiungere altre istruzioni sopra la CTA |
| Quiz domanda 1, 667×375 | Tile alte 44 px; inizio righe a 157,90 / 195,09 / 232,27 / 269,46 | Passo verticale ≈37,19 px: sovrapposizione ≈6,81 px fra righe; etichette 10 px |
| Confronto, 390×844 | Prima scheda quasi a tutta larghezza; seconda parzialmente visibile; contenuto lungo in entrambe | Confronto simultaneo difficile e navigazione su due assi |
| Selezione pin mobile | Il pin Pastéis de Belém apre la vista List e focalizza il titolo della card | Transizione funzionale ma cambia il contesto spaziale |
| Confronto → Passport | La barra con due luoghi selezionati rimane anche sul Passport | Continuità utile, ma la barra deve spiegare meglio cosa contiene e potersi comprimere |
| Console nei campioni Lisbon/Twin | Nessun warn/error restituito dalle letture effettuate | Esito circoscritto, non prova dell’assenza di errori su tutto il sito |

### Matrice di larghezza

Ogni cella riporta `scrollWidth / viewportWidth`, dopo comparsa dell’heading atteso. Un valore uguale non esclude clipping interno, errori con testo grande o problemi durante le animazioni.

| Pagina | 320×844 | 375×844 | 768×844 | 1440×1000 |
|---|---|---|---|---|
| Cities | 320/320 | 375/375 | 768/768 | 1440/1440 |
| Passport iniziale | 320/320 | 375/375 | 768/768 | 1440/1440 |
| Saved vuoto | 320/320 | 375/375 | 768/768 | 1440/1440 |
| Settings guest | 320/320 | 375/375 | 768/768 | 1440/1440 |

In queste 16 letture: un H1 visibile per pagina; nessun `button/input/select` visibile nel main con una dimensione inferiore a 24 px. È un controllo geometrico parziale: non include tutti i link, la separazione fra target, i dialoghi chiusi o lo screen reader.

Home aggiuntiva: 320/320, 768/768 e 1440/1440; il campione precedente a 390 era 390/390. Lisbon e relativo editor Twin a 390 erano 390/390. La matrice non rappresenta una prova di tutte le undici città o di ogni stato dati.

## Come leggere i feedback

- **O**: osservato nel browser attuale. **S**: confermato o esaminato nei sorgenti. **V**: verifica ancora necessaria; non è un difetto diagnosticato.
- **P1**: primo ciclo, perché ostacola lettura, comprensione o fiducia; i gate V/P1 richiedono prove prima di dichiarare compatibilità. **P2**: miglioramento successivo. **P3**: rifinitura.
- S/M/L indicano complessità relativa di realizzazione, non giorni promessi. Le priorità sono di prodotto: non trasformano automaticamente tutti i rilievi in bug o ticket riaperti.

## 1. UI — gerarchia, coerenza e personalità

### UI-01 · Dare precedenza alle azioni della pagina — P1 · O/S · M

**Feedback.** Nel dettaglio Pastéis de Belém il pulsante berry Make your Passport occupa tutta la larghezza e precede Find its twin, Save e Directions. Queste ultime azioni finiscono vicino o sotto la navigazione inferiore nella prima schermata. Il colore più forte invita a lasciare il compito corrente.

**Miglioramento.** Tenere Find its twin come azione principale coerente con ADR 0001; Save e Directions subito vicine e testuali. Trasformare il prompt Passport in un invito secondario, breve, collocato dopo le informazioni operative. Mantenere l’accesso al quiz e il ritorno al luogo.

**Accettazione.** A 390×844, dopo apertura del luogo, nome e azioni principali sono raggiungibili nella stessa schermata operativa con al massimo un breve scroll; nessuna CTA è coperta dalla tab bar. Con testo grande il layout può crescere e scorrere.

### UI-02 · Alzare la qualità editoriale delle immagini — P2 · O/S · M/L

**Feedback.** La griglia desktop accosta una fotografia architettonica, un interno affollato e un logo Hard Rock ingrandito e tagliato. La dimensione uniforme delle card rende ancora più evidente la discontinuità. Il fallback di Fama d’Alfama è correttamente dichiarato come foto della città.

**Miglioramento.** Definire regole per foto del luogo, logo, fotografia di città e assenza immagine. I loghi vanno contenuti, non tagliati come fotografie; i fallback devono mantenere una didascalia leggibile. Proporre una selezione fotografica con diritti e provenienza verificati prima di ogni eventuale import.

**Accettazione.** Nessun logo deformato o ritagliato; le immagini sostitutive sono riconoscibili. Lista, dettaglio e Saved mantengono lo stesso soggetto quando disponibile. Nessuna promessa di nuovo catalogo già attivo.

### UI-03 · Variare l’intensità della cornice Passport — P2 · O · M

**Feedback.** Copertina berry, bordo spesso, cucitura, segnalibro, timbro e pannello di carta ricorrono su molte schermate. L’identità è coerente, ma ogni blocco compete per attenzione e spazio.

**Miglioramento.** Usare tre intensità: piena espressione su Home e Passport; intestazione compatta su City; cornice leggera su filtri, impostazioni e strumenti. Conservare il libro a pagine uguali e i timbri nella struttura approvata.

**Accettazione.** Ogni pagina ha un punto focale riconoscibile; uno strumento secondario non appare più importante di un risultato. Confrontare le stesse schermate prima/dopo, senza introdurre un nuovo tema.

### UI-04 · Rendere la tipografia operativa più leggibile — P2 · O/S · S/M

**Feedback.** La serif funziona nei titoli grandi. Nei titoli lunghi delle card e nelle colonne strette del confronto, la combinazione di serif, molte righe e testo di supporto fitto rallenta la scansione. Nel quiz corto alcune etichette arrivano a 10 px.

**Miglioramento.** Conservare Instrument Serif per titoli e momenti espressivi; dare spazio ai nomi lunghi, usare Hanken per controlli e dettagli, limitare DM Mono a metadati. Obiettivo editoriale: corpo utile 16–18 px, etichette normalmente almeno 14 px; non ridurre il testo per far entrare tutto.

**Accettazione.** Nome lungo, indirizzo e prezzo restano leggibili a 320 px e con testo ingrandito. Le soglie editoriali non vengono presentate come un minimo WCAG universale.

### UI-05 · Dare un significato visibile alle icone — P1 · O/S · S

**Feedback.** X e freccia diagonale nelle card Twin hanno nomi accessibili, ma per una persona che guarda lo schermo possono significare chiudi, rimuovi, apri o naviga. Un tooltip al passaggio del mouse aiuta poco sul telefono.

**Miglioramento.** Nei risultati principali affiancare testi brevi: Save, Directions e Not for me. Riservare l’icona isolata ai contesti in cui il significato è già chiaro, con nome accessibile specifico. Conservare dimensioni e distanze dei target.

**Accettazione.** In una prova di comprensione le persone sanno prevedere l’effetto della X senza premere. La riga rimane usabile a 320 px anche distribuendo le azioni su due righe.

### UI-06 · Rivedere il ritaglio del Twin principale — P2 · O · M

**Feedback.** A 390 px Carmo appare con la foto in una striscia verticale molto stretta, alta quasi quanto il contenuto. L’immagine perde il soggetto e il testo occupa una colonna relativamente compressa.

**Miglioramento.** Studiare due composizioni reali: foto orizzontale breve sopra al risultato oppure miniatura proporzionata vicino al nome, con motivazione e azioni a tutta larghezza. Conservare l’arrivo del primo risultato nel viewport dopo la risposta.

**Accettazione.** Il soggetto resta riconoscibile e il nome non si spezza inutilmente; motivazione, prezzo e azioni restano immediatamente individuabili. Valutare anche foto assente e nomi lunghi.

### UI-07 · Ripulire il rumore nei tag — P2 · O/S · S/M

**Feedback.** Seafood e Fresh seafood sono molto vicini; alcune card mescolano cucina, atmosfera e indicazioni poco naturali come Specialty non alcoholic. Questo sembra un elenco di dati più che un consiglio selezionato.

**Miglioramento.** Presentare prima 2–3 caratteristiche distinte e comprensibili, con un dettaglio espandibile per i tag rimanenti. Consolidare sinonimi nella presentazione solo quando semanticamente equivalenti, mantenendo gli identificativi e l’effetto reale dei filtri.

**Accettazione.** Nessuna ripetizione evidente nei primi chip; non vengono cancellati o inventati attributi del provider. Prezzo e “unknown” mantengono una posizione coerente.

### UI-08 · Disegnare stati vuoti specifici — P2 · O · S/M

**Feedback.** Saved vuoto dà un buon prossimo passo, ma l’invito Google occupa quasi lo stesso spazio del messaggio iniziale. Il Passport iniziale offre molto spazio ai timbri ancora vuoti. Il confronto Qloo vs AI ripete due grandi blocchi Ready to compare e tre pulsanti Compare complessivi.

**Miglioramento.** Un prossimo passo prevalente per stato, illustrazione proporzionata, istruzione concreta e strumenti secondari più discreti. Nel confronto dimostrativo, una sola azione condivisa sopra i due risultati e stati vuoti più compatti.

**Accettazione.** Prima di avere dati, la persona sa quale azione iniziare. Non mostrare campioni come contenuti personali e non introdurre consenso o login obbligatori.

## 2. UX — comprensione e continuità dei percorsi

### UX-01 · Spiegare subito quando le proposte sono generiche — P1 · O/S · S

**Feedback.** La tab è For you anche senza Passport. La precisazione Popular picks compare dopo tutti i risultati: a circa 4.668 px nella lista campionata. Il banner invita al quiz ma non chiarisce esplicitamente la natura della lista attuale.

**Miglioramento.** Portare la frase prima dei risultati, vicina al titolo o al conteggio. Esempio: “Popular in Lisbon · Make your Passport for personal picks.” Conservare il nome della tab approvato, qualificandone lo stato.

**Accettazione.** Un guest distingue le proposte popolari da quelle personalizzate senza arrivare al footer. Con un profilo pronto la spiegazione corrisponde alle fonti realmente usate.

### UX-02 · Rendere immediato il primo Passport — P1 · O · M

**Feedback.** Nel Passport mobile la pagina sinistra vuota precede il contenuto di gusto e la CTA quiz a y≈1.136. Your taste consente già di saltare alla sezione; resta un passaggio da capire per il nuovo visitatore.

**Miglioramento.** Per il solo stato nuovo, aggiungere un invito compatto Make your Passport vicino all’introduzione o rendere esplicito lo shortcut (“Start your Passport”). Conservare pagina sinistra/viaggi e pagina destra/profilo; chi ritorna deve vedere il proprio profilo, con Redo the quiz in Settings.

**Accettazione.** Il primo visitatore trova l’avvio senza scorrere una pagina vuota. Non si altera la struttura approvata del libro né si reintroduce il quiz nel pannello Add what you love.

### UX-03 · Riordinare Settings attorno alle azioni frequenti — P1 · O/S · S

**Feedback.** Il primo pannello operativo è Trip organisation & visit feedback con Clear trip organisation and visits, anche nel guest senza trip. La modifica del gusto arriva dopo.

**Miglioramento.** Ordinare: preferenze/quiz, ciò che è stato appreso, luoghi nascosti, stato del salvataggio, gestione dati. Raggruppare i reset più in basso in una sezione esplicita; disabilitare o spiegare quelli senza dati interessati. Mantenere le conferme esistenti.

**Accettazione.** L’azione iniziale di Settings è utile alla situazione corrente; nessuna azione distruttiva appare come naturale primo passo. Non cambiare contratti o dati per realizzare il riordino.

### UX-04 · Dare struttura al processo Twin — P2 · O · M

**Feedback.** La sequenza Search → Choose → Keep/Delete/Ignore → Find its twin è comprensibile dopo averla usata, ma richiede più passaggi e spiegazioni rispetto alla promessa iniziale.

**Miglioramento.** Rendere esplicite tre fasi leggere: luogo, preferenze, alternative. Conservare la scelta del riferimento e non selezionare automaticamente il primo omonimo. Dopo Choose compattare il riepilogo del riferimento e lasciare Change sempre disponibile.

**Accettazione.** È chiaro a che punto ci si trova e cosa manca. Si modifica il luogo senza perdere inconsapevolmente scelte valide; nessuna richiesta aggiuntiva parte a ogni modifica dei trait.

### UX-05 · Migliorare la scoperta di Keep/Delete/Ignore — P2 · O/S · S/M

**Feedback.** I controlli testuali marcati rispettano la scelta del prodotto; la spiegazione lunga è però necessaria per capire che Delete non cancella dati. Con cinque trait si presentano quindici piccoli comandi.

**Miglioramento.** Conservare le etichette dirette, senza tendine o selettori a pallini. Mostrare un solo esempio didattico breve e il riepilogo Prefer/Exclude; mantenere “Only for this search” vicino al contesto. Eventuale aiuto esteso in About these choices, già presente.

**Accettazione.** La persona riesce a favorire seafood, escludere casual e lasciare modern aperto, spiegando che il Passport resta invariato. I tre stati sono mutuamente esclusivi e distinguibili anche senza colore.

### UX-06 · Dare più controllo all’avanzamento del quiz — P2 · O/S · M

**Feedback.** La prima domanda dice che l’ultima scelta fa avanzare; nel codice alcune risposte avanzano automaticamente, con timer e pulsanti Back/Continue. Può accelerare il quiz ma rende meno prevedibile il momento del cambio schermata. Non è stato eseguito un test con utenti sull’errore di selezione.

**Miglioramento.** Prototipare avanzamento esplicito per domande con più risposte, mantenendo un feedback immediato della selezione. Per le scelte singole valutare auto-avanzamento con un’indicazione chiara e ritorno facile. Non modificare numero o significato delle 18 domande in questa revisione.

**Accettazione.** La persona riesce a correggere una risposta senza chiedersi se sia stata registrata. Valutare errori e completamento su entrambe le varianti; non dichiarare un vincitore dal solo confronto tecnico.

### UX-07 · Rendere il confronto persistente più comprensibile — P2 · O/S · M

**Feedback.** Dopo aver scelto Carmo e CHIADO TERRASSE, la barra “2 of 3 places” rimane navigando al Passport. La persistenza aiuta a non perdere la selezione, ma non mostra i nomi o il contesto e aggiunge un pannello su pagine con altri compiti.

**Miglioramento.** Barra compatta con nomi abbreviati, conteggio e pulsante Compare; possibilità di minimizzarla. Mantenerla facilmente richiamabile nei percorsi di scoperta. “Select one more to compare” quando è scelto un solo luogo spiega meglio il pulsante disabilitato.

**Accettazione.** Si riconoscono i luoghi selezionati senza aprire il dialogo; la barra non copre contenuto/focus e non fa perdere la selezione al cambio pagina. Nessuna persistenza dei token oltre il contratto già previsto.

### UX-08 · Conservare il contesto dopo un tap sulla mappa — P2 · O/S · M/L

**Feedback.** Toccando il pin mobile si passa a List e il focus raggiunge il titolo della card. Il risultato è accessibile ma interrompe il confronto spaziale.

**Miglioramento.** Valutare una scheda breve sopra la mappa con nome, prezzo disponibile, Open place e Save; lasciare List come azione esplicita. Per pin sovrapposti conservare il chooser già esistente. La scheda deve avere gestione di focus, chiusura e altezza limitata.

**Accettazione.** Si esplorano due pin senza riaprire la mappa ogni volta. Mappa e lista restano coerenti; rimane un percorso equivalente da tastiera e senza mappa. È una proposta di interazione, non la diagnosi di un pin rotto.

### UX-09 · Contestualizzare gli inviti a Paris Events — P2 · O · S

**Feedback.** Lisbon e Twin Lisbon terminano con un collegamento al pilot Events di Parigi. È onesto sulla copertura ma poco legato al compito nella città corrente.

**Miglioramento.** Tenere l’accesso al pilot nella guida di Parigi e in una sede esplorativa secondaria. Evitare il richiamo sistematico nei risultati di altre città. Nessuna espansione della copertura Events è implicita.

**Accettazione.** Una ricerca a Lisbon non suggerisce involontariamente di avere eventi locali disponibili; il pilot di Parigi resta raggiungibile.

### UX-10 · Spiegare il posto consigliato con parole utili — P2 · O/S · M

**Feedback.** Twin riesce a spiegare tratti condivisi e differenze; le card della lista guest mostrano soprattutto chip e prezzo. “Why this place” è il collegamento più importante fra la promessa personale e una decisione concreta.

**Miglioramento.** Quando esiste una ragione sostenuta dai dati, metterla subito sotto al nome: una frase, poi dettagli. Quando non esiste, dare una descrizione neutra della lista e del luogo. Usare differenze e prezzo per scegliere, senza percentuali di affinità o condizioni live inventate.

**Accettazione.** La ragione deriva da preferenze o metadati effettivamente disponibili; risultati generici, esempio e personali si distinguono. In assenza di dati non viene costruita una falsa motivazione.

### UX-11 · Rendere coerenti le spiegazioni di salvataggio e sync — P2 · S/V · M

**Feedback.** I sorgenti distinguono Passport, Saved, organizzazione trip, attività e città visitate; per l’utente sono aspetti dello stesso viaggio. Le ricevute indicano visited-city account sync disabilitato, mentre altri dati hanno API proprie. Questa revisione non ha rifatto prove account reali né ricontrollato l’environment Vercel.

**Miglioramento.** Esplicitare il perimetro nel punto d’uso: “On this browser”, “Saved to your account” o “Not synced yet” per la specifica risorsa. Separare i messaggi di errore da una conferma generale dell’account. Verificare l’attuale configurazione prima di cambiare il copy.

**Accettazione.** Due dispositivi mostrano ciò che il contratto effettivamente sincronizza; i dati locali sono dichiarati. Il test usa account controllati dal proprietario e non modifica le impostazioni di sync per superare la prova.

### UX-12 · Rendere più utile il ritorno al prodotto — P2 · O/S · M

**Feedback.** Dopo la ricerca, Home mostra Pick up where you left off e avverte correttamente che il riferimento richiede un nuovo controllo. La ripresa arriva però dopo gran parte del racconto introduttivo.

**Miglioramento.** Per chi ritorna, portare una piccola sezione Resume vicino alle due entrate principali; mantenere il racconto completo per la prima visita e accessibile alle successive. Mostrare città, luogo e numero di preferenze, con azione esplicita per riprendere.

**Accettazione.** Riprendere una ricerca richiede una scelta chiara e non invia automaticamente richieste. Nessun risultato scaduto è presentato come aggiornato. Restano disponibili città e Twin con pari dignità.

## 3. Mobile — layout, interazioni e compatibilità

### MOB-01 · Correggere il quiz landscape con poca altezza — P1 · O/S · M

**Feedback.** A 667×375 le tile della prima domanda si sovrappongono di circa 6,81 px. Le illustrazioni si riducono quasi a punti e le label a 10 px. Il sorgente combina righe `minmax(0,1fr)`, altezza limitata e target di almeno 44 px; il contenuto eccedente viene nascosto.

**Miglioramento.** Con poca altezza passare a contenuto centrale scorrevole, righe ad altezza minima reale e illustrazioni ridotte con criterio o rimosse dal layout. Header/progresso e navigazione devono lasciare spazio sufficiente al contenuto. Non risolvere rimpicciolendo ulteriormente testo o target.

**Accettazione.** A 667×375, 844×390 e 320×568 nessuna risposta si sovrappone o resta irraggiungibile. Tutte le domande, il riepilogo e le eventuali preferenze aggiuntive sono verificati, inclusi testo lungo e 200% text resize. Aggiungere una regressione geometrica che controlli intersezioni fra tile, non soltanto overflow del documento.

### MOB-02 · Ripensare il confronto per lettura mobile — P1 · O/S · M/L

**Feedback.** Il dialogo usa colonne di almeno 220 px e scorrimento orizzontale. A 390 px mostra una card e parte della seconda, con testo molto lungo in verticale: ricordare e confrontare prezzi/ragioni richiede spostamenti su due assi. Lo scroll è dichiarato, quindi non è una funzionalità assente.

**Miglioramento.** Preferire una vista per attributi: luoghi brevi in testa, poi righe Prezzo, Perché, Differenze e Distanza quando disponibile. In alternativa, card verticali con identico ordine e un riepilogo compatto delle differenze. Tenere chiusura e azioni raggiungibili.

**Accettazione.** Si confrontano due e tre luoghi a 320/390 px senza perdere l’associazione fra attributo e luogo. Testare nomi lunghi, dati mancanti e testo ingrandito. La soluzione desktop può mantenere colonne affiancate.

### MOB-03 · Ridurre il tempo per leggere il primo luogo — P1 · O · M

**Feedback.** A 390×844 il nome del primo risultato Lisbon è a y=976. Copertina, tab, categorie, filtri e invito Passport occupano la zona iniziale. Vedere una porzione di foto non permette ancora di scegliere.

**Miglioramento.** Intestazione City più compatta su mobile, conteggio vicino alla lista, invito al quiz meno alto. Ridurre spazi ripetuti prima di comprimere il testo. Prevedere una card con immagine più breve e nome/azioni sempre vicini.

**Accettazione.** Obiettivo di design a 390×844: nome del primo luogo e almeno l’accesso al dettaglio prima del bordo superiore della tab bar, con dati pronti e testo standard. Alle altre dimensioni privilegiare leggibilità e scroll naturale rispetto a una quota rigida.

### MOB-04 · Rendere scopribili le categorie fuori schermo — P2 · O/S · S

**Feedback.** La riga orizzontale mobile mostra Restaurants, Bars, Cafés e una parte di Museums; Hotels e Neighbourhoods richiedono scorrimento. Il taglio suggerisce continuità, ma manca una panoramica immediata delle categorie disponibili.

**Miglioramento.** Confrontare una riga con indizio di scorrimento più netto e una disposizione compatta su due righe. Conservare selezione attiva e visibilità della categoria scelta. Le etichette testuali devono restare complete e i target comodi.

**Accettazione.** Una persona trova Hotels senza una spiegazione verbale; usando tastiera, la categoria focalizzata entra in vista senza spostare l’intera pagina lateralmente.

### MOB-05 · Verificare tastiera, sheet e sovrapposizioni — P1 · S/V · M

**Feedback.** I CSS usano `dvh`, safe area e dialog top-layer per Save; è una buona base. Mancano in questa sessione prove con tastiera iOS/Android aperta, suggestion bar, notch e viewport visuale ridotta. Non è stato osservato un difetto di Save perché il test persistente è stato bloccato.

**Miglioramento.** Su un ambiente di test autorizzato aprire note, nuova lista e ricerca con tastiera reale; regolare altezza e scroll interno solo sui difetti riprodotti. Verificare insieme tab bar, toast, comparison tray e pannello.

**Accettazione.** Campo attivo e azione di conferma restano visibili; scorrere il pannello non muove accidentalmente lo sfondo; Close/Escape restituisce il focus all’origine. Nessun reset di dati per preparare le prove.

### MOB-06 · Concludere text resize e assistive technology — P1 · S/V · M/L

**Feedback.** I controlli hanno spesso label specifiche e il quiz trasferisce il focus al titolo. La matrice di larghezza non dimostra però lettura a 200%, ordine del focus, annunci e swipe con VoiceOver/TalkBack.

**Miglioramento.** Eseguire la checklist fisica #59, includendo quiz, filtri, risultati, Save, conflitti e chiusura dei dialoghi; aggiungere audit automatico come supporto. Provare text resize 200%, reflow e focus con pannelli fissi attivi.

**Accettazione.** Ogni compito principale è completabile con screen reader reale; errori e risultati vengono annunciati una volta in modo comprensibile; il focus non è nascosto. Un audit automatico pulito non basta a chiudere questa voce.

### MOB-07 · Dare un budget alla motion e al caricamento — P2 · O/S/V · M

**Feedback.** I motivi animati rendono il prodotto personale. Nei caricamenti appaiono placeholder e, per Passport, uno stato iniziale quasi vuoto. La mappa desktop ha inizialmente mostrato i pin prima delle tile, poi si è caricata: non è rimasta rotta nel campione. Non sono stati misurati CWV o fluidità su hardware reale.

**Miglioramento.** Mantenere motion finita, contenuto subito usabile e fallback reduced motion; usare placeholder proporzionati al contenuto finale. Caricare la mappa quando serve, senza ritardare la lista. Misurare tre cold journey comparabili sullo stesso telefono prima di ottimizzare.

**Accettazione.** Nessuna attesa decorativa imposta a input e CTA; ritorno Back senza replay invasivo. Obiettivi field: LCP ≤2,5 s, INP ≤200 ms, CLS ≤0,1 al 75° percentile; da misurare, non risultati già ottenuti.

### MOB-08 · Completare browser, download e condizioni reali — P1 · V · L

**Feedback.** I risultati attuali riguardano il browser in-app e le ricevute precedenti. Non certificano Safari iPhone, Chrome Android, download/print del notebook, audio percepito o sincronizzazione su due dispositivi.

**Miglioramento.** Eseguire #59 su almeno iPhone/Safari e Android/Chrome, portrait/landscape, rete normale e rallentata, motion ridotta, testo grande. Coprire Google normale, ripresa, note, privacy dello sharing e notebook con dati sintetici autorizzati.

**Accettazione.** Ogni prova registra modello/OS/browser, SHA, task, osservazione e pass/fail/not-run. Finché manca l’evidenza, la compatibilità completa resta non verificata. Non riaprire i ticket tecnici chiusi per sostituire questo registro umano.

## Direzione “intuitiva e wow”

### Una firma visiva, tre momenti memorabili

1. **Il Passport prende forma.** All’uscita del quiz, una sintesi leggibile delle preferenze, un’illustrazione pertinente e un breve movimento di stampa. Subito dopo: una città e un percorso concreto per esplorare. I contenuti devono derivare dalle risposte; un profilo parziale resta dichiarato.
2. **Il collegamento fra due luoghi diventa chiaro.** In Twin, il passaggio dal riferimento al risultato mette in evidenza ciò che si conserva e ciò che cambia, poi lascia ferma la card per leggerla. Seafood, prezzo e differenze contano più di un’animazione aggiuntiva.
3. **La raccolta racconta un viaggio.** Saved e i timbri reali possono diventare una memoria personale bella da consultare e condividere deliberatamente. Le attività nell’app e le visite dichiarate devono restare distinte; note private escluse dai formati pubblici.

Tutti e tre i momenti hanno una versione statica equivalente. Le animazioni completano un’azione o spiegano una relazione; la navigazione rimane disponibile durante la coreografia.

### Percorsi obiettivo

| Persona / intento | Sequenza proposta | Cosa deve capire subito |
|---|---|---|
| Prima visita, curiosità su una città | Home → città → primo luogo → dettaglio | Può esplorare senza account; i risultati guest sono generici |
| Vuole un’alternativa | Home/Twin → luogo → Keep/Delete/Ignore → primo match | Quali caratteristiche conserva e cosa cambia; nessuna garanzia di disponibilità |
| Vuole consigli personali | Make your Passport → quiz → sintesi → città | Quanto dura, come correggere, cosa sarà usato per i consigli |
| Torna a organizzare | Resume o Saved → lista/gruppo → luogo | Dove sono salvati i dati e quale azione può fare subito |

## Piano di miglioramento

L’ordine rende prima il prodotto comprensibile e leggibile, poi ne rafforza l’espressione. È una proposta di lavoro; il report non implementa né pubblica queste modifiche.

| Ciclo | Interventi | Uscita verificabile |
|---|---|---|
| 1 — Correzioni e comprensione | MOB-01; UX-01; UI-01; UX-02; UX-03; UI-05 | Quiz landscape senza intersezioni; natura dei risultati evidente; azioni e primo avvio riconoscibili |
| 2 — Decisione sul telefono | MOB-02/03/04; UI-04/06/07; UX-04/05/07/08 | Stesso percorso mobile più facile da leggere, confrontare e correggere |
| 3 — Personalità e ritorno | UI-02/03/08; UX-09/10/11/12; MOB-07 | Fotografia coerente, ragioni utili, ritorno rapido e motion con budget |
| Gate prima della compatibilità dichiarata | MOB-05/06/08 e prove di persistenza/esportazione | Ricevute dispositivi/account/screen reader, errori documentati e corretti |

Avviare i test fisici in parallelo ai cicli, appena disponibili dispositivi e account: non rimandarli alla fine. Gli interventi sul confronto e sulla mappa meritano un prototipo locale utilizzabile prima della sostituzione della UI. Nuove immagini/catalogo restano soggetti alle decisioni su diritti e storage esistenti.

### Come verificare che migliori davvero

Fare prima un test formativo con 5–8 persone nuove al prodotto: è un campione per trovare attriti, non per stimare uplift statistico. Stessi task su desktop e telefono: scegliere un posto a Lisbon, trovare un Twin con una preferenza ed esclusione, capire se la lista è personale, avviare/correggere il quiz, confrontare due posti e recuperare una ricerca.

Registrare successo senza aiuto, primo clic, esitazioni, errori recuperati, tempo sul task e risposta alla domanda “Perché ti è stato mostrato questo posto?”. Chiedere anche quali tre dettagli ricordano e quanto si fiderebbero delle informazioni. Le risposte guidano l’iterazione; non trasformare preferenze estetiche in una misura di qualità dei consigli.

Per una successiva implementazione: confrontare identici dati, viewport e stati prima/dopo; includere foto assente, titolo lungo, errore, nessun risultato, tre risultati e testo ingrandito. Aggiungere regressioni funzionali solo per comportamenti e difetti reali. Le suite storiche non sono state rieseguite in questo audit documentale.

## Parti da conservare

- Palette, font e metafora del Passport approvati; pagina sinistra per viaggi reali e destra per profilo, con pagine uguali su desktop.
- Le due entrate City e Twin, senza obbligo di quiz o login per esplorare.
- Controlli Keep/Delete/Ignore testuali e marcati; quattro tier indicativi €–€€€€ e unknown esplicito.
- Trasparenza su foto di città, prezzi indicativi, distanze in linea d’aria e assenza di verifica di orari/prenotazioni.
- Filtri riepilogati, conteggi coerenti fra lista e mappa, ritorno al contesto e focus sui risultati.
- Recupero bozza, errori che conservano l’input, separazione per owner e reduced motion: da preservare e ritestare nei cambiamenti.

## Riferimenti e tracciabilità

### Sorgenti per area

| Area | File da cui partire |
|---|---|
| City e motivazioni | `src/components/city-view.tsx`, `use-city.ts`, `src/lib/recommendation-copy.ts`, `src/styles/city.css` |
| Luogo, card e foto | `src/components/place-view.tsx`, `place-card.tsx`, `place-photo.tsx`, `src/styles/place.css`, `place-card.css` |
| Twin e confronto | `src/components/swap-workspace.tsx`, `place-comparison.tsx`, `src/styles/swap.css`, `travel-tools.css` |
| Passport e impostazioni | `src/components/passport-folio.tsx`, `passport-builder.tsx`, `passport-settings.tsx`, `src/styles/passport-folio.css` |
| Quiz | `src/components/quiz-flow.tsx`, `quiz-panel.tsx`, `src/styles/taste-quiz.css` |
| Saved, note e viaggio | `src/components/save-button.tsx`, `collections-view.tsx`, `trip-organisation.tsx`, `travel-notebook.tsx`, `share-trip.tsx` |
| Home e ripresa | `src/app/page.tsx`, `src/components/resume-search.tsx`, `home-passport-motion.tsx`, `src/styles/home.css` |
| Navigazione e token | `src/components/main-nav.tsx`, `tab-bar.tsx`, `src/styles/shell.css`, `tokens.css` |

Il rilievo di overflow e la semantica hanno limiti: il DOM snapshot includeva link fotografici senza nome, ma il controllo del sorgente mostra overlay intenzionalmente `aria-hidden` e `tabIndex=-1` con link nominato sul titolo. Non viene registrato un falso difetto di accessibilità su questi overlay. Le immagini lazy non ancora caricate fuori schermo non sono state contate come immagini rotte. La mappa inizialmente incompleta si è caricata al controllo successivo.

### Standard consultati

- [W3C — Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): riferimento per il contenuto a 320 CSS px, con eccezioni per layout realmente bidimensionali. Una mappa e una scheda di testo richiedono valutazioni diverse.
- [W3C — Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html): ingrandimento del testo al 200% senza perdita di contenuto o funzionalità.
- [W3C — WCAG 2.2, Target Size](https://www.w3.org/TR/WCAG22/#target-size-minimum): requisito AA di 24×24 CSS px con eccezioni; il progetto usa 44 px come obiettivo più comodo per il touch. Nessuna equivalenza automatica fra “44 px” e conformità dell’interfaccia.
- [Google — Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals): soglie LCP/INP/CLS citate come obiettivi futuri, non misurate in questa revisione.

Riferimenti di progetto: [ADR visivo](adr/0004-visual-direction.md), [promessa e architettura](adr/0001-product-promise-and-architecture.md), [onboarding](adr/0002-onboarding-and-learning-passport.md), [voce e lessico](adr/0003-voice-language-vocabulary.md), [ultima consegna tecnica](71-handover-historical-closure.md), [prove storiche e loro limiti](69-historical-acceptance-and-ab.md), [gate fisici/account](70-physical-account-acceptance.md).

**Esito della revisione:** base convincente da rifinire; primo ciclo raccomandato prima di considerare concluso il lavoro UI/UX. Compatibilità mobile completa e accessibilità assistiva restano **non certificate**. I 28 feedback sopra comprendono proposte di design e gate di verifica, distinti dai difetti riprodotti.
