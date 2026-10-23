# Beesyde — analisi UI, UX e funzionalità

Data: 23 ottobre 2026. Sito: https://beesyde.vercel.app.
Baseline sorgente e HEAD remoto: `fa7359ab82818ef2e9d78148ff4b441db1144473`.
Branch locale e default GitHub: `claude/blissful-gauss-dymbeo`.

## Esito

Beesyde ha un'identità visiva riconoscibile e un nucleo funzionante: città,
luoghi, Swap, Passport e viaggi salvati sono collegati. Il prossimo investimento
utile è rendere più rapida e comprensibile la scelta di un luogo, conservando il
contesto fra le pagine. Non emerge da questo campione la necessità di rifare il
brand o sostituire i provider.

Il rischio principale è una promessa di personalizzazione poco leggibile negli
stati intermedi: un quiz completato, i preferiti utilizzabili e i timbri sono tre
cose diverse, ma l'interfaccia può farli sembrare un unico Passport pronto.
Seguono la densità mobile, le foto non rappresentative e la perdita del contesto.

Non assegno un voto numerico globale: mancano una baseline di usabilità, dati
sul traffico, misure prestazionali controllate e una verifica assistiva completa.

## Metodo e limiti delle prove

- Letti README → handover 28 → 27, approfondimento 26, GLOSSARY e ADR 0001–0004.
- GitHub verificato live: default branch e HEAD coincidenti; tutte le issue
  #3–#34 chiuse; letti i commenti restituiti dalla lista completa. Nessun ticket
  precedente viene riaperto automaticamente da questa analisi.
- Browser Chrome normale collegato, con sessione account già esistente:
  Home desktop, Lisbon desktop/mobile, scheda luogo mobile, Swap mobile,
  Saved mobile, Passport, Compare, indice città mobile e ingresso `/trip`.
- Desktop nel viewport disponibile di circa 1230×842; mobile imposto a 390×844.
  Sulla guida Lisbon `scrollWidth = innerWidth = 390`: nessun overflow orizzontale
  in quella vista. Non è una verifica di ogni pagina a ogni larghezza.
- Swap reale: Lisbon, Time Out Market, Keep Seafood, Change Casual → tre
  alternative visibili con recap coerente. Una ricerca del riferimento e una
  ricerca alternative, nessun retry. Non misura qualità generale o disponibilità.
- `npm test` e `npm run typecheck`: superati durante questa analisi. Log dei test:
  `/tmp/beesyde-audit-tests.log`. Non eseguito un nuovo build/deploy.
- Non modificati quiz, preferiti, salvataggi o note dell'account; nessuna
  cancellazione, pubblicazione di viaggi o nuova procedura Google. Visitare una
  guida usa il normale meccanismo dei timbri; la città osservata era già presente.
- Non esportati dati personali o schermate account nel repository pubblico.
- Ispezione sorgente per gli stati non esercitati: condivisione, cancellazioni,
  errori provider, recupero, tastiera e persistenza. Non equivale a esecuzione E2E.
- Mancano nuove prove su telefono fisico, VoiceOver/TalkBack, rete rallentata,
  reverse sync fra dispositivi e cancellazione account. Il precedente esito
  positivo #32 resta valido nel suo perimetro, senza ampliarlo.
- Non verificata in questo turno la corrispondenza SHA del deploy Vercel:
  il sito live è osservato, ma HEAD remoto da solo non identifica il deploy.

Legenda: **O** osservato live; **S** confermato nel sorgente; **H** ipotesi da
validare. Priorità: **P1** prima tranche, **P2** seconda, **P3** opportunità.
Nessun P0 è dimostrato nel campione. Effort relativo S/M/L, da stimare prima
 dell'implementazione; non è una promessa di durata.

## Valutazione UI

### Punti solidi

Palette berry/lemon su stone, superfici paper, Instrument Serif e Hanken Grotesk
formano un sistema coerente. Gli accenti cittadini sono piccoli e le grandi
superfici restano desaturate. L'indice città è leggibile su mobile. Save, chip,
pulsanti e navigazione inferiore hanno forme consistenti. Non propongo nuove
palette, nuovi font o una diversa metafora di prodotto.

### Riscontri

| ID | Evidenza | Impatto e proposta | Priorità / effort |
|---|---|---|---|
| UI-01 | O: a 390×844 la copertina Lisbon arriva a circa y=630; sotto compaiono tab/categorie, nessun luogo nella prima schermata | Ridurre copertina e introduzione mobile; valutare progressiva riduzione della foto e controlli compatti, preservando il carattere editoriale | P1 / M |
| UI-02 | O+S: scheda del primo luogo Lisbon con lunga denominazione; titolo su molte righe e azioni principali sotto la prima schermata | Separare nome breve leggibile da denominazione completa, o contenere la tipografia; valutare azioni raggiungibili senza attraversare tutto il testo | P1 / M |
| UI-03 | O+S: la scheda luogo mostra la cover generica Lisbon quando manca la foto, senza indicazione della sostituzione | Etichetta visibile “Lisbon city photo”, equivalente accessibile e placeholder neutro se anche la cover fallisce | P1 / S |
| UI-04 | O: una card del campione mostra un logo; la scheda dettaglio mostra invece la cover città | Rivalutare qualità e coerenza delle immagini fra card/dettaglio; usare una regola unica, senza dichiarare che il filtraggio precedente non esista | P2 / M |
| UI-05 | O+S: Saved offre card/mappe, ma record precedenti senza foto/città producono pannelli generici | Preferire placeholder informativi compatti; non nascondere luoghi validi e mantenere la risoluzione legacy `/place/[id]` | P2 / M |
| UI-06 | O+S: Home espone più inviti al Passport, insieme a due entrate principali e all'esempio live | Valutare la gerarchia e l'ordine per far riconoscere subito le due promesse; non rimuovere una delle due entrate decise nell'ADR | P2 / M |

## Valutazione UX

| ID | Evidenza | Impatto e proposta | Priorità / effort |
|---|---|---|---|
| UX-01 | S: categoria, prezzo, area e List/Map vivono nello state di CityView; il link di ritorno Place punta al solo slug città | Tornare da un dettaglio può azzerare i criteri; definire ripristino di filtri, tab e posizione con URL o stato di sessione. Provare separatamente Back browser e link interno | P1 / M |
| UX-02 | O+S: scheda mobile è una pagina autonoma; CSS solo grid, assente la bottom sheet contestuale prevista dall'ADR 0001 | Decidere un'implementazione che preservi lista e contesto sotto il dettaglio, mantenendo URL diretto e accessibilità. L'eventuale revisione dell'ADR richiede decisione esplicita | P1 / L |
| UX-03 | O+S: nessuna voce attiva della bottom nav sulla scheda; codice confronta tutto `path.slice(1)` con uno slug | Riconoscere il segmento città sui percorsi annidati; nella tab Swap cittadina rendere coerente lo stato attivo. Distinguere route e modalità | P1 / S |
| UX-04 | O+S: il menu Swap apre `/swap` autonomo, pur ricordando Lisbon; l'ADR preferisce il tab della città corrente | Portare l'utente al tab della città nota, conservando un ingresso per chi non ha città; non duplicare due esperienze indipendenti | P2 / M |
| UX-05 | S: `QuizFlow` tiene risposte/step solo in memoria e il dialog smonta il flusso alla chiusura | Chiusura accidentale può far perdere il lavoro. Valutare bozza riprendibile e una scelta esplicita per ricominciare; conservare le 18 domande decise | P1 / M |
| UX-06 | S: il quiz dialog conclude con `callbackURL="/passport"` | Google porta al Passport anziché al contesto di partenza. Conservare un ritorno interno sicuro, inclusi tab/filtri; richiede prova OAuth normale per accettazione | P1 / M |
| UX-07 | S: “Try this Passport” punta a `?guest=1`; PassportBuilder può mostrare prima il quiz se non trova preferiti | L'esempio promesso non è immediatamente accessibile al nuovo visitatore. Rendere il preview esplicito e separarlo dall'adozione nel proprio profilo | P1 / M |
| UX-08 | O+S: nel campione Passport ha profilo quiz e timbri, ma zero preferiti; City invita ancora a creare il Passport | Spiegare gli stati “quiz pronto”, “preferiti mancanti” e “picks personali attivi”. Non trattare come perdita dati: la causa dei preferiti vuoti non è determinata | P1 / M |
| UX-09 | O+S: dopo Swap la proposta “Try museums” precede le tre alternative nel DOM | Valutare di presentare prima i risultati richiesti e poi la scoperta di un'altra categoria; misurare il tempo alla prima alternativa utile | P2 / S |
| UX-10 | S: toast unico, sostituzione immediata e scadenza 5 secondi, senza pausa focus/hover | Messaggi di apprendimento o errore possono sottrarre Undo/Change. Definire priorità e coda; mantenere le azioni finché l'utente le può raggiungere | P1 / M |

## Valutazione funzionalità e affidabilità

| Area | Stato osservato o nel codice | Miglioramento da valutare |
|---|---|---|
| Città e categorie | O: 11 città, filtri regionali, Lisbon con 9 risultati nel campione. S: categorie e filtro prezzo/area sui risultati caricati | Mostrare chiaramente “filter these picks”; distinguere copertura del catalogo da universo completo della città. Testare prezzi sconosciuti e zero risultati |
| Swap | O: riferimento scelto, Keep/Change, 3 alternative con differenze e distanza in linea d'aria | Preservare esclusione Change e Keep preferenziale; valutare leggibilità del compromesso senza garantire cucina, prenotabilità o prossimità assoluta |
| Passport | O: profilo, timbri e stato account visibili. S: quiz e selezioni sono risorse separate | F-01, P1/M: definire una macchina degli stati utente comprensibile, inclusi meno di 3 preferiti, caricamento account e token scaduto |
| Saved | O: liste account caricate, card e mappe. S: note, spostamento e legacy resolver presenti | F-02, P2/M: validare rimozione recuperabile, gestione liste e note; valutare ricerca/ordinamento solo se il volume reale lo richiede |
| Share | S: anteprima, snapshot in fragment, whitelist, note escluse, avviso che la copia non si revoca | Conservare queste garanzie. Valutare limiti dei link lunghi, apertura sui browser mobili e postcard >12 luoghi; nessuna nuova condivisione eseguita |
| Compare | O: ingresso e limiti leggibili. S: select modificabili durante/dopo una richiesta, intestazione basata sullo state corrente, risultati precedenti mantenuti | F-03, P2/M: congelare lo scenario eseguito e marcare risultati precedenti dopo cambio selezione. Un retry di una colonna rilancia entrambe: renderlo esplicito o separare le azioni |
| Errori | S: messaggi quota/rete/token, empty state e retry esistono | F-04, P1/M: matrice fault injection su locale, senza nuove chiamate reali ripetitive. Verificare persistenza delle scelte e recupero coerente |
| Mappa | O: pin e lista nel campione. S: catch copre inizializzazione, non risulta un listener `map.on("error")` | F-05, P2/M: verificare guasti asincroni di tile/style e WebGL; card e Directions devono restare utilizzabili |
| Account | O: sessione preesistente e dati caricati. S: import guest e cancellazioni presenti | F-06, P1/L: completare QA su account di prova, errore sync, cambio account e ritorno Google; non dedurre isolamento da un semplice caricamento riuscito |

## Accessibilità e qualità trasversale

| ID | Riscontro | Proposta / prova necessaria | Priorità |
|---|---|---|---|
| A-01 | S: role tab, aria-selected e aria-controls presenti; assenti handler frecce/Home/End e roving tabIndex | Completare comportamento tastiera dei tab e validarlo con tecnologia assistiva | P1 |
| A-02 | S: layout globale non espone skip link | Valutare “Skip to content” visibile al focus e focus destinazione, soprattutto nelle viste lunghe | P2 |
| A-03 | S: quiz sostituisce domanda con stesso h2; non emerge focus esplicito dopo avanzamento | Verificare annuncio domanda/progresso e focus. Native dialog da solo non garantisce questa transizione | P1 |
| A-04 | S: selezione pin scrolla la card ma non trasferisce focus | Provare tastiera e screen reader; rendere percepibile il legame mappa/lista senza spostamenti inattesi | P2 |
| A-05 | S: reduced motion e contrast tokens esistono; precedenti correzioni #26 acquisite | Nuova verifica a 200%/400%, 320/390/768/1440 px, contrasto negli stati effettivi, OS reduced motion e VoiceOver. Non dichiarare conformità WCAG completa | P1 |

**Prestazioni:** HomeExample avvia una richiesta guest e tre explore in parallelo
prima di qualsiasi azione; `Promise.all` rende l'esempio indivisibile se fallisce
una categoria. Sorgente confermato, non prova di lentezza o esaurimento quota.
Valutare risultati parziali, priorità del contenuto e caricamento sotto la piega.
Libreria mappa dinamica e mappe montate su richiesta nella guida mobile sono
buone basi; Saved monta una mappa per lista con coordinate, quindi va misurato
su raccolte più grandi. Servono misure controllate prima di ottimizzare.

**SEO e accesso diretto:** titoli città/luogo dinamici presenti; root condivisa per
altre pagine e nessun sitemap/robots file individuato nell'albero `src/app`.
Valutare canonical, Open Graph, favicon/social preview e indicizzazione solo
delle pagine pubbliche utili. `/trip` dichiara già noindex/nofollow; non indicizzare
Passport, Saved o dati account. Una sitemap non è prioritaria rispetto ai flussi.

**Fiducia e privacy di prodotto:** disclaimer ore/prezzi/prenotazioni e preview
share sono coerenti. Valutare una spiegazione raggiungibile di cosa resta nel
browser/account e di cosa viene condiviso; Settings & privacy è già presente.
Nessun parere legale o certificazione di sicurezza deriva da questa analisi.

**Misurazione:** non individuato un funnel applicativo nel sorgente esaminato.
Potrebbero esistere dati Vercel esterni non consultati. Prima di aggiungere
telemetria verificare ciò che è già disponibile; non raccogliere note, nomi dei
preferiti, identità account o contenuto dei fragment dei viaggi.

## Matrice della copertura

| Superficie | Live attuale | Fonte / verifiche rimanenti |
|---|---|---|
| Home | desktop, gerarchia ed esempio in caricamento | campione nuovo visitatore, esempio completato/errore e funnel |
| Cities | mobile, elenco e controlli regionali | ricerca copertura e tastiera |
| City | Lisbon desktop e mobile; risultati/mappe visibili | filtri attivi + ritorno, tutte le categorie/città, errori |
| Place | mobile, link diretto, indirizzo e azioni visibili | desktop, sheet contestuale, accesso da Saved/Swap, dati assenti |
| Swap | mobile, search/choose/Keep/Change/3 risultati | museo, zero risultati, cambio input dopo ricerca, rete/quota |
| Passport | caricamento account e profilo | guest pulito, 18 domande complete, ripresa e ritorno Google |
| Settings | sorgente | Undo, Show again e cancellazioni su account di prova |
| Saved | mobile, dati account caricati | editing/rimozione/note, errori/import e grandi raccolte |
| Share / Trip | ingresso `/trip` privo di fragment; caricamento osservato | parsing/privacy test superati; esito errore live e snapshot valido da provare |
| Compare | mobile, form e disclaimer | scenari congelati, retry e indisponibilità; nessuna nuova coppia provider invocata |
| 404 / error | sorgente | route ignota e fault injection nel protocollo |

## Ordine consigliato

1. P1: contesto lista/dettaglio, foto fallback, stato Passport ed esempio promesso.
2. P1: densità mobile, ripresa quiz/ritorno, tastiera e toast recuperabili.
3. P1/P2: errori, persistenza e resilienza con dati di prova.
4. P2: carico iniziale, mappe, Compare e gestione raccolte.
5. P3: SEO/social e sperimentazione quantitativa dopo una baseline affidabile.

L'ordine è una valutazione esperta; non deriva da conversioni misurate. Una
priorità può cambiare se il protocollo trova un blocco al completamento.

Il [piano di valutazione](31-evaluation-plan.md) definisce campioni, criteri,
sequenza e decisioni. I [comandi ECC](32-evaluation-commands.md) preparano i
singoli piani: non sono stati eseguiti e non applicano automaticamente le proposte.

## Indice delle evidenze sorgente

I riferimenti indicano la baseline citata in apertura; le osservazioni live sono
registrate nelle sezioni e non vengono promosse a prove di tutte le varianti.

| Riscontri | Sorgente principale |
|---|---|
| UI-01, UX-01, UX-08, A-01 | [CityView](../src/components/city-view.tsx), [city.css](../src/styles/city.css) |
| UI-02/03, UX-02 | [PlaceView](../src/components/place-view.tsx), [place.css](../src/styles/place.css) |
| UX-03/04 | [MainNav](../src/components/main-nav.tsx), [TabBar](../src/components/tab-bar.tsx), [Swap route](../src/app/swap/page.tsx) |
| UX-05/06, A-03 | [QuizFlow](../src/components/quiz-flow.tsx), [QuizPanel](../src/components/quiz-panel.tsx), [finishQuiz](../src/lib/quiz-finish.ts) |
| UX-07/08 | [HomeExample](../src/components/home-example.tsx), [PassportBuilder](../src/components/passport-builder.tsx) |
| UX-09, Swap | [SwapWorkspace](../src/components/swap-workspace.tsx), [discovery service](../src/lib/server/discovery-service.ts) |
| UX-10 | [ToastProvider](../src/components/toast.tsx), [SaveButton](../src/components/save-button.tsx), [feedback](../src/components/use-feedback.ts) |
| Saved e Share | [CollectionsView](../src/components/collections-view.tsx), [ShareTrip](../src/components/share-trip.tsx), [shared-trip](../src/lib/shared-trip.ts) |
| F-03 | [CompareView](../src/components/compare-view.tsx) |
| F-04/05, A-04 | [discovery client](../src/lib/discovery-client.ts), [CityMap](../src/components/city-map.tsx) |
| F-06 | [account](../src/lib/account.ts), [PassportSettings](../src/components/passport-settings.tsx), [stamps client](../src/lib/stamps-client.ts) |
| A-02, SEO | [layout](../src/app/layout.tsx), [trip metadata](../src/app/trip/page.tsx) |

Riferimenti primari consultati il 23 ottobre 2026: comportamento tastiera dei
[tab secondo W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), con
Home/End opzionali; soglie e distinzione laboratorio/campo nei
[Core Web Vitals di Google](https://web.dev/articles/vitals).
