# Quiz, Passport e cartografia d'inchiostro — 26 ottobre 2026

## Decisione e perimetro

Dopo l'audit docs/52, l'owner ha autorizzato l'implementazione dei feedback e richiesto un remake visivo, UX e motion di quiz e Passport. Ha inoltre chiesto di espandere il piccolo percorso di Twin nella box e riprenderlo nella chiusura della Home, citando come atmosfera la Mappa del Malandrino.

Implementazione locale su `codex/twin-motion-ux`, partendo da `25c095b`. Rimangono font Instrument Serif/Hanken Grotesk, palette berry/lemon/carta, domande del quiz, significato dei dati, provider e contratti esistenti. Nessuna pubblicazione, modifica dello schema, importazione di dati personali o modifica della configurazione di produzione.

## Risultato

### Correzione owner — card originale, sola animazione

Lo screenshot successivo dell'owner ha identificato il bersaglio corretto: **la copertina berry City/Twin con la fotografia a destra**, non la landing standalone `/swap`. La landing standalone è quindi ripristinata alla composizione e al piccolo ornamento preesistenti.

`CityInkMap` disegna tre percorsi tratteggiati e impronte che si diffondono sulla superficie libera della copertina città. È un overlay assoluto, senza cambi a dimensioni, font, testo, pulsante o fotografia. Le maschere proteggono gli ingombri reali delle righe di testo e della foto, aggiornati al resize e dopo il caricamento dei font. Il piccolo ornamento precedente conserva solo il suo spazio di layout durante il tab Twin; il nuovo disegno occupa l'intera superficie della copertina. Nel tab For you rimane il comportamento precedente.

Rivelazione finita tramite maschere SVG, nessuna linea continua visibile; pausa fuori viewport/in background e versione statica con movimento ridotto. Due test mirati desktop/mobile passano: geometria invariata, copertura dell'overlay, foto mascherata, tratteggio persistente e ritorno a For you. Verifica visiva con la fotografia Paris reale e screenshot iniziale/finale in `.private/qa/2026-10-26-remake/cover-*.png`.

Anche la chiusura Home conserva la card lemon e il suo emblema con la sola traccia aggiunta. Questa correzione supersede la precedente composizione più alta, la card bianca e il successivo tentativo sulla landing standalone sbagliata.

L'owner ha poi approvato la collocazione sulla copertina e richiesto un'illustrazione/motion più vicini alla prima proposta. Reintrodotti quindi isolati, stradine, giardini e puntatore di destinazione, con comparsa progressiva della cartografia e percorsi meno aggrovigliati. I percorsi di cammino rimangono tratteggiati anche al termine della sequenza; le maschere di testo/foto e la geometria originale della card restano invariate.

### Cartografia originale Beesyde

`CityInkMap` anima la copertina City/Twin descritta sopra. `InkJourney` rimane la variante più compatta per la chiusura Home e l'illustrazione del quiz. Sono percorsi immaginari decorativi, non itinerari reali o rappresentazioni dei risultati.

Il disegno mobile è dedicato: partenza e destinazione rimangono entrambe visibili, senza ritagliare la versione desktop. La firma viene ripresa nella CTA di chiusura Home. La sequenza è finita, parte alla visibilità, si ferma fuori viewport o in una scheda nascosta e diventa statica con movimento ridotto. Nessun asset di Harry Potter viene riprodotto.

### Quiz come taccuino

- Impaginazione con copertina berry e pagina chiara su desktop; pagina compatta su mobile e nei dialog.
- Domanda dominante, illustrazioni SVG già presenti nel prodotto, indicatore discreto di avanzamento e comandi raccolti.
- Nessun timbro storico o contenuto Passport estraneo durante le domande.
- Apertura inline con posizione di lettura e focus corretti; focus sul titolo dopo risposta, Skip e Back; ritorno al Passport al termine o alla chiusura.
- Ingresso direzionale per avanti/indietro, progress bar via transform, swipe senza render React a ogni pointermove.
- Soglie esplicite di distanza/velocità con prevalenza orizzontale; pointercancel, comandi da tastiera, pulsanti equivalenti, blocco dei doppi invii e risposta alla preferenza ridotta modificata a runtime.
- Uscita della carta e ritorno elastico breve. Dopo l'ultimo swipe, un fallimento nel salvataggio lascia un comando Continue che riprova le medesime scelte.
- Le 18 domande, la logica del profilo, i preferiti e il recupero dei salvataggi account restano quelli del prodotto.

### Passport personale prima dell'editor

Il ritratto del viaggiatore viene prima dei controlli di modifica, anche nell'ordine DOM. Ha una pagina personale berry/lemon, tipo e motto leggibili, assi di gusto e interessi in forma di timbri; le percentuali degli interessi non sono esibite come precisione di matching. Gli stessi dati continuano a costruire il profilo e la condivisione.

I preferiti esistenti sono raccolti in un editor espandibile. Si apre direttamente quando serve completare il profilo. Ricerca, rimozione, anteprime d'esempio, stato di salvataggio e impostazioni restano raggiungibili. Visite dichiarate e attività rimangono sezioni distinte: aprire una guida non viene presentato come viaggio effettuato.

## Follow-through dell'audit

| Riferimento | Intervento |
|---|---|
| M01 | Tolti hover/pressioni con spostamento nella modalità ridotta; swipe statico e gestione del cambio preferenza durante il gesto |
| M02 | Focus tra domande e schermate finali; scroll corretto all'apertura inline; ripristino della CTA nei dialog |
| M03 | Toast sopra tab bar + safe area; azioni a capo; scadenza sospesa con focus, hover o scheda nascosta; uscita breve e ripristino focus |
| M04 | Overscan fotografico City corretto, con passepartout fisso che maschera gli estremi del movimento |
| M05 | Hero Home più breve e contenuta; ridotte scala/rotazione del timbro esempio |
| M06 | Card Cities con un solo ingresso principale, senza wipe interno della foto; distanza e stagger ridotti |
| M07 | Ridotta la ripresentazione degli ingressi condivisi su popstate; conservati contesto/ritorno City. Nessuna nuova transizione universale a elemento condiviso o bottom sheet Place |
| M08 | Swipe, direzione Back, progressione, focus e retry finale implementati |
| M09 | Timbri storici statici; empty state senza il colpo di timbro; enfasi mantenuta sui nuovi salvataggi riusciti |
| M10 | Ingresso/uscita dei dialog nativi, pannello Save mantenuto montato durante l'uscita e reso inert, chiusure/interruzioni e toast rifiniti |
| M11 | Ricomposizione locale dei soli elementi superstiti visibili, limitata a cinque; niente animazione dell'intero albero di risultati |
| M12 | Shimmer via transform, pausa fuori viewport e con scheda nascosta; geometria e stati asincroni esistenti conservati |
| M13 | Token GSAP condivisi per le nuove coreografie e per i reveal aggiornati, coordinati con il sistema di durate CSS esistente |
| M14 | Refresh ScrollTrigger raggruppati per frame; cleanup di observer/listener. Nessun miglioramento FPS/energia dichiarato senza profilo dedicato |

Le transizioni foto condivise tra route e un eventuale Place come sheet restano opzioni progettuali dell'audit, non funzionalità dichiarate come consegnate in questo remake.

## Rifiniture dopo l'approvazione della copertina

- Impronte circa doppie, ridisegnate con avampiede e tallone separati; su mobile meno passi per lasciare leggibile il percorso. La stessa sagoma è condivisa con Home/quiz.
- Centralizzati gli ultimi tempi ed easing GSAP di Home e Cities; anche la sequenza del piccolo libro Cities si ferma quando la scheda è nascosta.
- Corretto il calcolo delle posizioni delle card durante ricomposizioni successive: il riferimento è il layout, senza includere una trasformazione ancora in corso.
- Il ritorno nella cronologia distingue un cambio route dai soli cambi di tab/filtro nella stessa città.
- Uniformato anche lo shimmer della foto dell'esempio Home: transform al posto di background-position, pausa fuori viewport e in background, controlli utilizzabili durante l'attesa dell'esempio.
- Eliminato il montaggio di MapLibre nel pannello For you nascosto durante Twin/Events. La mappa si monta soltanto nel pannello visibile con coordinate disponibili; senza coordinate rimane un testo utile, senza inizializzare una mappa vuota.

Diagnostica in Chrome headless, build compilata locale, fixture sintetiche, viewport 1440×1000 e CPU rallentata 4×: il campione City/Twin passa da cinque long task successivi ai primi 600ms (massimo 453ms) a zero dopo la correzione della mappa nascosta. Il massimo intervallo rAF del campione passa da circa 433ms a 50ms; il percentile 95 resta circa 16,8ms. La somma dei layout shift osservati sulla copertina è zero. Sono due campioni diagnostici, non un benchmark statistico né una garanzia FPS/INP/CLS field.

La Home mantiene task di bootstrap sotto CPU 4× (massimo 326ms nel secondo campione); non è stato dichiarato risolto ogni costo iniziale del framework. Dati e metodo in `.private/qa/2026-10-26-remake/profile-before-map-gate.json`, `profile-motion.json` e `profile-motion.mts`.

## Verifica

- `npm test`, typecheck, build di produzione e `git diff --check` completati.
- Suite browser di sviluppo più rerun mirati: 82 scenari distinti superati; due vecchi confronti A/B restano esclusi perché richiedono le due baseline esplicite.
- Un primo controllo ha rilevato una regressione di posizionamento Twin al cambio editor/risultato: corretta separando la compensazione di layout dallo scroll animato, verificata su 320/390/1440 e landscape 812×375.
- Aggiornato il test della griglia Cities al comportamento approvato di ingresso unico. Il caso Home con errore di affinità ora seleziona il DOM visibile, escludendo i nodi nascosti di staging Next: il fallback e le verifiche dei dati rimangono presenti.
- Nuovi casi coprono cartografia e reduced motion, cornice foto, focus e conservazione risposte, swipe touch emulato, posizione/durata toast, modifica dei preferiti, riapertura dialog, completamento quiz e retry dopo errore sull'ultimo swipe.
- Screenshot sintetici desktop/mobile e script di revisione in `.private/qa/2026-10-26-remake/`. Non sono screenshot del Passport reale dell'owner e non valutano ranking o fotografie dei provider.

La build compilata ha superato separatamente **22/22 scenari** nei percorsi motion-remake, Twin ed Events. Dopo l'ultimo ritocco alla riapertura del dialog e alla leggibilità degli assi mobile, ricompilazione riuscita e **9/9 scenari remake** nuovamente superati. Typecheck e diff check finali passano. Non confondere questi controlli con un deployment pubblico.

Anteprima compilata disponibile a `http://127.0.0.1:3106`, in particolare `/paris?tab=swap` per la copertina approvata, `/passport` per il remake e `/` per la chiusura Home. Log locali: `/tmp/tpd-remake-unit.log`, `/tmp/tpd-remake-build.log` e `/tmp/tpd-remake-preview.log`.

### Ultima verifica integrata dopo l'ingrandimento delle impronte

- Suite browser completa in sviluppo: **83 passati, 2 A/B storici esclusi** (baseline separate richieste). Log `/tmp/tpd-remake-browser.log`.
- Due ulteriori scenari mirati coprono loading Home lento e montaggio/smontaggio della mappa interattiva: entrambi passati.
- Build di produzione finale: **33/33 passati**, inclusi i nuovi scenari, layout responsive Passport, quiz completo/retry, Twin e Events. Log `/tmp/tpd-remake-prod-browser.log`.
- Ritorno Place→City nuovamente verificato dopo la correzione della mappa: categoria, prezzo, vista e posizione di lettura preservati.
- Unit/service suite, typecheck e build passano. Non è stato eseguito un nuovo esperimento A/B né una prova con dati personali.

## Limiti di accettazione

Non sono stati verificati telefono fisico, Safari/iOS, VoiceOver, sign-in Google reale, sync tra dispositivi o prestazioni field. I gesti sono stati esercitati anche tramite eventi touch emulati Chrome, non certificati su hardware reale. Le prove locali intercettano API e dati sintetici; non dimostrano qualità dei risultati o disponibilità dei luoghi.

L'anteprima compilata è locale. Il sito pubblico resta alla pubblicazione precedente; non è stato eseguito push.
