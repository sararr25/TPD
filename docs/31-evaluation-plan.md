# Beesyde — piano di valutazione e proposta miglioramenti

23 ottobre 2026. Input: [analisi attuale](30-site-evaluation.md).
Questo documento pianifica la valutazione necessaria prima delle modifiche.
Il primo passaggio esplorativo è già svolto nel report; i passi seguenti ne
colmano i limiti e rendono le proposte verificabili. Nessun esperimento è avviato.

Vincoli: ADR 0001–0004, quiz di 18 domande, due promesse allo stesso peso,
Google/Neon/Qloo/OSM correnti, voce inglese e brand invariati. Le proposte di
UI restano private finché non approvate. Non pubblicare dati account o fixture
ricavate da note/preferiti personali.

### Metodo di valutazione

Per ogni riscontro registrare ID, route, stato, viewport, azioni, atteso,
osservato, riproducibilità, fonte e timestamp. Un pass tecnico non sostituisce
l'accettazione visiva o una prova utente. Un requisito non esercitato resta
“non eseguito”, mai “pass”. Preparare sessioni guest pulite e account di prova;
non usare cancellazioni o nuove preferenze sul profilo personale.

Priorità: prima i blocchi al task o la confusione sui dati; poi attriti ripetuti;
infine opportunità. Impatto 1–3, frequenza 1–3, confidenza O/S/H; effort S/M/L.
Non inventare frequenze reali: fino alla misurazione scrivere “sconosciuta”.

### Scenari comuni

| Scenario | Task | Esito da osservare |
|---|---|---|
| T1 nuovo visitatore | Aprire una città e scegliere un luogo senza quiz | Comprensione della proposta e tempo alla prima scheda utile |
| T2 contesto | Applicare categoria/prezzo/area, aprire un luogo, tornare | Criteri e posizione conservati o reset esplicitamente spiegato |
| T3 Swap | Scegliere riferimento, Keep/Change, valutare un'alternativa | Comprensione dei compromessi e nessuna promessa operativa falsa |
| T4 onboarding | Iniziare, chiudere e riprendere il quiz; completarlo su profilo di prova | Lavoro conservato, preferiti sufficienti, ritorno coerente |
| T5 organizzazione | Salvare, cambiare lista, aggiungere nota, aprire Saved | Stato riconoscibile, recupero da errore e possibilità di correggere |
| T6 condivisione | Esaminare anteprima e aprire snapshot di prova in seconda sessione | Solo campi pubblici, nessuna nota, natura immutabile compresa |
| T7 account | Sessione normale, stesso account su secondo browser, cambio account di prova | Nessun lampeggio di dati altrui, persistenza e conflitti espliciti |
| T8 recupero | Offline/quota/token scaduto/zero risultati/immagine o tile guasti | Messaggio utile, scelte conservate, azione successiva funzionante |

Prove qualitative proposte: 5–8 persone per un primo ciclo formativo, includendo
nuovi visitatori e viaggiatori abituali; almeno un percorso assistivo dedicato.
Questo campione serve a scoprire attriti, non a stimare conversioni o significatività.
Non è stato reclutato né osservato in questa analisi.

Raccogliere completamento senza aiuto, tempo sul task, errori critici, richieste
di aiuto e facilità percepita (scala 1–7). Soglie di triage proposte: ogni blocco
critico va riprodotto; se almeno due persone incontrano lo stesso attrito, entra
nella prima tranche di valutazione. Non sono soglie statistiche di rilascio.

Per prestazioni usare mobile simulato e desktop con rete/CPU dichiarate,
tre misure per scenario e mediana/dispersione; distinguere cache fredda e calda.
Come obiettivi proposti, secondo i [Core Web Vitals](https://web.dev/articles/vitals), utilizzare LCP ≤2,5 s, CLS ≤0,1 e INP ≤200 ms al p75
quando esisteranno dati sul campo; le misure laboratorio non sostituiscono INP
sul campo e non autorizzano oggi una dichiarazione di superamento.

### Sequenza e uscite

Baseline → UI e percorsi → funzionalità/accessibilità → prestazioni →
misurazione → selezione della prima tranche. Le attività sono separabili,
ma questi documenti non avviano agenti, comandi o processi autonomi.
Le durate dipendono da accesso a dispositivi/partecipanti e account di prova;
non si fissano scadenze prima di tali disponibilità.

## Step 1 — Fissare baseline e criteri comuni

Definire il perimetro riproducibile della valutazione e distinguere sorgente, deploy e sessioni.

- Priorità: P1. Effort relativo: S. Dipendenze: nessuna.
- Deliverable: Matrice route × stato × dispositivo; registro evidenze anonimizzato; SHA deploy e timestamp.
- Acceptance: Baseline live identificata; ogni superficie ha stato e scenario; severità e copertura sono esplicite.

## Step 2 — Valutare gerarchia UI e densità mobile

Valutare composizione, scansione, immagini, tipografia e raggiungibilità delle azioni mantenendo il design approvato.

- Priorità: P1. Effort relativo: M. Dipendenze: 1.
- Deliverable: Confronto degli stati attuali e proposte annotate private; inventario incoerenze con dimensioni misurate.
- Acceptance: Matrice 320/390/768/1440 px senza clipping bloccante; prima azione utile misurata; fallback foto riconoscibile da tutti i partecipanti della verifica qualitativa.

## Step 3 — Valutare continuità dei percorsi UX

Valutare il passaggio città → luogo → Swap → Saved e il percorso quiz/Passport, compresi ripresa e ritorno.

- Priorità: P1. Effort relativo: M. Dipendenze: 1; 2 per proposte visive.
- Deliverable: Journey map con attriti; osservazioni qualitative; specifica proposta per contesto e stati Passport.
- Acceptance: Ogni percorso ha esito e ostacoli documentati; Back/link interno sono distinti; quiz, preferiti e timbri hanno una spiegazione comprensibile.

## Step 4 — Valutare correttezza funzionale e recupero

Definire la valutazione di Swap, filtri, persistenza, errori, condivisione e limiti dei dati con scenari controllati.

- Priorità: P1. Effort relativo: L. Dipendenze: 1; 3 per aspettative di percorso.
- Deliverable: Matrice funzionale, fixture non personali, registro pass/fail/non eseguito, regressioni proposte.
- Acceptance: Change non rilassato e Keep non promesso come filtro; filtri e mappa coerenti; privacy share e isolamento account dimostrati nei casi eseguiti.

## Step 5 — Valutare accessibilità e interazioni

Definire la valutazione assistiva e degli input per tab, quiz, mappe, dialog e notifiche.

- Priorità: P1. Effort relativo: M. Dipendenze: 1; 2 e 3 per le proposte.
- Deliverable: Registro tastiera/VoiceOver e contrasto; criteri per focus, zoom e motion; difetti riproducibili.
- Acceptance: Percorsi essenziali completabili da tastiera; focus e annunci delle transizioni verificati; zoom e reduced motion provati senza perdere contenuto.

## Step 6 — Valutare prestazioni e resilienza

Definire misure ripetibili su carico iniziale, esempio Home, mappe, immagini e guasti asincroni.

- Priorità: P2. Effort relativo: M. Dipendenze: 1; 4 per scenari di errore.
- Deliverable: Rapporto prestazioni con ambiente/cache; waterfall e costi richieste aggregati; budget proposti e compromessi.
- Acceptance: Tre misure per scenario con mediana e variabilità; cache fredda/calda separate; fallimento di una fonte non toglie azioni indipendenti.

## Step 7 — Progettare misurazione e validazione delle proposte

Definire un funnel minimo, una baseline qualitativa e condizioni di ingresso per eventuali esperimenti.

- Priorità: P2. Effort relativo: M. Dipendenze: 1; 3 per eventi; 4 per guardrail.
- Deliverable: Dizionario eventi proposto; task e scheda partecipante; protocollo quantitativo non avviato.
- Acceptance: Definizioni metriche prive di ambiguità; nessun dato privato nei payload proposti; campione quantitativo derivato da traffico/baseline prima del lancio.

## Step 8 — Pianificare miglioramenti e accettazione

Consolidare i risultati in tranche implementabili, mantenendo separati difetti confermati e opportunità.

- Priorità: P1. Effort relativo: S. Dipendenze: 2–7; può iniziare con risultati parziali dichiarati.
- Deliverable: Backlog proposto con priorità, dipendenze, effort, criteri di accettazione e rischi; decisioni rinviate esplicite.
- Acceptance: Ogni proposta ha evidenza e criterio verificabile; nessuna riapertura automatica di ticket chiusi; primo pacchetto ridotto selezionato per beneficio e rischio.

### Decisione finale e perimetro

Per la prima tranche proporre al massimo 3–5 interventi, ciascuno collegato
agli ID del report. Candidati iniziali: contesto lista/dettaglio, fallback foto,
stati Passport/esempio, densità mobile e accessibilità delle transizioni.
Cambiare questo ordine se le prove trovano un blocco più grave.

Tutte le implementazioni, i nuovi ticket e il lancio della misurazione restano
proposte: la richiesta corrente è analisi e piano. Le cancellazioni irreversibili
richiedono un perimetro di prova esplicito. Qualsiasi modifica schema produzione
va approvata separatamente, come da convenzioni del progetto.

I comandi della [traduzione ECC](32-evaluation-commands.md) preparano piani
per ciascun passo; non eseguono la valutazione né le implementazioni da soli.
