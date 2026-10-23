# Plan-Orchestrate Result

**Plan**: `docs/31-evaluation-plan.md`
**Steps**: 8
**Scope**: all
**Emitted**: 8 · **Blocked**: 0

Applicata la skill `ecc:plan-orchestrate`, modalità solo generazione.
I passi richiedono valutazione/progettazione: il comando appropriato è `/plan`,
con argomento libero verificato in `commands/plan.md` della versione installata.
I comandi producono il piano dettagliato del passo; non sono stati invocati.
Non sono comandi per avviare automaticamente suite o revisioni del codice.

## Steps overview

| # | Title | Tags | Command | Status |
|---|---|---|---|---|
| 1 | Fissare baseline e criteri comuni | design, plan | `/plan` | emitted |
| 2 | Valutare gerarchia UI e densità mobile | design, plan | `/plan` | emitted |
| 3 | Valutare continuità dei percorsi UX | design, plan | `/plan` | emitted |
| 4 | Valutare correttezza funzionale e recupero | design, plan | `/plan` | emitted |
| 5 | Valutare accessibilità e interazioni | design, plan | `/plan` | emitted |
| 6 | Valutare prestazioni e resilienza | design, plan | `/plan` | emitted |
| 7 | Progettare misurazione e validazione delle proposte | design, plan | `/plan` | emitted |
| 8 | Pianificare miglioramenti e accettazione | design, plan | `/plan` | emitted |

## Step 1 — Fissare baseline e criteri comuni

**Intent**: Definire il perimetro riproducibile della valutazione e distinguere sorgente, deploy e sessioni.

**Tags**: design, plan

**Command rationale**: `/plan` conserva lo scope della valutazione e i criteri; non implementa automaticamente le proposte.

```text
/plan "[Plan: docs/31-evaluation-plan.md#step-1] Pianificare la baseline Beesyde di UI, UX e funzionalità: identificare deploy, route e stati guest/account. Acceptance: SHA e timestamp registrati; matrice route/stato/dispositivo completa; evidenze anonimizzate distinguono osservato, sorgente e ipotesi."
```

## Step 2 — Valutare gerarchia UI e densità mobile

**Intent**: Valutare composizione, scansione, immagini, tipografia e raggiungibilità delle azioni mantenendo il design approvato.

**Tags**: design, plan

**Command rationale**: `/plan` conserva lo scope della valutazione e i criteri; non implementa automaticamente le proposte.

```text
/plan "[Plan: docs/31-evaluation-plan.md#step-2] Valutare la UI Beesyde mantenendo berry/lemon e font approvati: copertine City, titoli Place, immagini e azioni mobili. Acceptance: misure a 320/390/768/1440 px; proposte con evidenze prima/dopo; fallback cittadini distinguibili dalle foto dei luoghi."
```

## Step 3 — Valutare continuità dei percorsi UX

**Intent**: Valutare il passaggio città → luogo → Swap → Saved e il percorso quiz/Passport, compresi ripresa e ritorno.

**Tags**: design, plan

**Command rationale**: `/plan` conserva lo scope della valutazione e i criteri; non implementa automaticamente le proposte.

```text
/plan "[Plan: docs/31-evaluation-plan.md#step-3] Valutare i percorsi Beesyde da City a Place, Swap e Saved e dal quiz al Passport. Acceptance: contesto e ritorno documentati per Back e link interno; ripresa quiz ed esempio analizzati; stati quiz/preferiti/timbri distinti con criteri osservabili."
```

## Step 4 — Valutare correttezza funzionale e recupero

**Intent**: Definire la valutazione di Swap, filtri, persistenza, errori, condivisione e limiti dei dati con scenari controllati.

**Tags**: design, plan

**Command rationale**: `/plan` conserva lo scope della valutazione e i criteri; non implementa automaticamente le proposte.

```text
/plan "[Plan: docs/31-evaluation-plan.md#step-4] Valutare funzionalità Beesyde con scenari controllati per Swap, filtri, salvataggi, share e sync. Acceptance: Change resta esclusione e Keep preferenza; errori preservano scelte e recupero; registro distingue verifiche locali, provider e sessioni reali."
```

## Step 5 — Valutare accessibilità e interazioni

**Intent**: Definire la valutazione assistiva e degli input per tab, quiz, mappe, dialog e notifiche.

**Tags**: design, plan

**Command rationale**: `/plan` conserva lo scope della valutazione e i criteri; non implementa automaticamente le proposte.

```text
/plan "[Plan: docs/31-evaluation-plan.md#step-5] Valutare accessibilità Beesyde su tab, quiz, mappe, dialog e toast. Acceptance: percorsi principali documentati da tastiera e VoiceOver; zoom 200/400 percento e reduced motion verificati; difetti di focus e annunci riproducibili senza dichiarazioni globali di conformità."
```

## Step 6 — Valutare prestazioni e resilienza

**Intent**: Definire misure ripetibili su carico iniziale, esempio Home, mappe, immagini e guasti asincroni.

**Tags**: design, plan

**Command rationale**: `/plan` conserva lo scope della valutazione e i criteri; non implementa automaticamente le proposte.

```text
/plan "[Plan: docs/31-evaluation-plan.md#step-6] Valutare prestazioni e resilienza Beesyde per Home, City, Place e Saved: immagini, esempio e mappe. Acceptance: tre misure per scenario con cache e rete dichiarate; mediana e variabilità riportate; costi richieste e recupero da errori asincroni documentati."
```

## Step 7 — Progettare misurazione e validazione delle proposte

**Intent**: Definire un funnel minimo, una baseline qualitativa e condizioni di ingresso per eventuali esperimenti.

**Tags**: design, plan

**Command rationale**: `/plan` conserva lo scope della valutazione e i criteri; non implementa automaticamente le proposte.

```text
/plan "[Plan: docs/31-evaluation-plan.md#step-7] Progettare la valutazione del valore Beesyde: funnel da ricerca a salvataggio e criteri per esperimenti futuri. Acceptance: metriche e denominatori definiti; payload senza note o preferiti personali; campione quantitativo subordinato a baseline e traffico osservati."
```

## Step 8 — Pianificare miglioramenti e accettazione

**Intent**: Consolidare i risultati in tranche implementabili, mantenendo separati difetti confermati e opportunità.

**Tags**: design, plan

**Command rationale**: `/plan` conserva lo scope della valutazione e i criteri; non implementa automaticamente le proposte.

```text
/plan "[Plan: docs/31-evaluation-plan.md#step-8] Pianificare i miglioramenti Beesyde dai risultati UI, UX e funzionali raccolti. Acceptance: ogni voce collega evidenza, priorità e criterio verificabile; tranche con dipendenze ed effort relativo; difetti confermati separati da ipotesi e ticket precedenti chiusi."
```

## Batch execution

Raccolta delle istruzioni da usare quando opportuno; non attiva un processo autonomo.

```text
/plan "[Plan: docs/31-evaluation-plan.md#step-1] Pianificare la baseline Beesyde di UI, UX e funzionalità: identificare deploy, route e stati guest/account. Acceptance: SHA e timestamp registrati; matrice route/stato/dispositivo completa; evidenze anonimizzate distinguono osservato, sorgente e ipotesi."
/plan "[Plan: docs/31-evaluation-plan.md#step-2] Valutare la UI Beesyde mantenendo berry/lemon e font approvati: copertine City, titoli Place, immagini e azioni mobili. Acceptance: misure a 320/390/768/1440 px; proposte con evidenze prima/dopo; fallback cittadini distinguibili dalle foto dei luoghi."
/plan "[Plan: docs/31-evaluation-plan.md#step-3] Valutare i percorsi Beesyde da City a Place, Swap e Saved e dal quiz al Passport. Acceptance: contesto e ritorno documentati per Back e link interno; ripresa quiz ed esempio analizzati; stati quiz/preferiti/timbri distinti con criteri osservabili."
/plan "[Plan: docs/31-evaluation-plan.md#step-4] Valutare funzionalità Beesyde con scenari controllati per Swap, filtri, salvataggi, share e sync. Acceptance: Change resta esclusione e Keep preferenza; errori preservano scelte e recupero; registro distingue verifiche locali, provider e sessioni reali."
/plan "[Plan: docs/31-evaluation-plan.md#step-5] Valutare accessibilità Beesyde su tab, quiz, mappe, dialog e toast. Acceptance: percorsi principali documentati da tastiera e VoiceOver; zoom 200/400 percento e reduced motion verificati; difetti di focus e annunci riproducibili senza dichiarazioni globali di conformità."
/plan "[Plan: docs/31-evaluation-plan.md#step-6] Valutare prestazioni e resilienza Beesyde per Home, City, Place e Saved: immagini, esempio e mappe. Acceptance: tre misure per scenario con cache e rete dichiarate; mediana e variabilità riportate; costi richieste e recupero da errori asincroni documentati."
/plan "[Plan: docs/31-evaluation-plan.md#step-7] Progettare la valutazione del valore Beesyde: funnel da ricerca a salvataggio e criteri per esperimenti futuri. Acceptance: metriche e denominatori definiti; payload senza note o preferiti personali; campione quantitativo subordinato a baseline e traffico osservati."
/plan "[Plan: docs/31-evaluation-plan.md#step-8] Pianificare i miglioramenti Beesyde dai risultati UI, UX e funzionali raccolti. Acceptance: ogni voce collega evidenza, priorità e criterio verificabile; tranche con dipendenze ed effort relativo; difetti confermati separati da ipotesi e ticket precedenti chiusi."
```
