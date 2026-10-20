# Baseline LLM via Codex CLI

20 ottobre 2026. Alternativa richiesta dall’utente dopo il blocco ChatGPT web `cloudflare_challenge`. Questo documento aggiorna il protocollo di docs/11; il baseline è identificato come **Codex CLI / gpt-6-sol**, non come una risposta della UI ChatGPT né come una versione equivalente del modello mostrato nel browser.

## Metodo

Verificati la [modalità non interattiva ufficiale](https://learn.chatgpt.com/docs/non-interactive-mode), il [riferimento CLI](https://learn.chatgpt.com/docs/cli/reference) e il [riferimento configurazione](https://learn.chatgpt.com/docs/config-file/config-reference). La CLI installata è `codex-cli 0.163.0-alpha.10.2`; `codex login status` conferma l’accesso salvato tramite ChatGPT. Non sono stati letti/esportati token di autenticazione o cookie dal browser, non è stata creata una chiave API e non viene chiamato un endpoint web non documentato.

Il modello richiesto è `gpt-6-sol`, presente nel catalogo CLI locale, reasoning `high`. Il catalogo del CLI e l’etichetta GPT-6 vista sul sito non provano che le due esperienze usino lo stesso modello/configurazione. Non è esposta una revisione immutabile del backend: provenienza e report mantengono questo limite. Le richieste possono consumare i limiti del piano collegato.

Ogni caso usa un processo nuovo e lo stesso prompt congelato del benchmark, preceduto dalla stessa istruzione di usare solo la conoscenza esistente, senza ricerca, app, Qloo o lookup esterni. Il prefisso effettivo è registrato con il prompt nei file privati di tentativo. Nessun suggerimento TPD viene inviato al modello.

Isolamento per invocazione, senza cambiare le impostazioni globali dell’utente:

- Directory di lavoro temporanea vuota, fuori dal repository; sandbox read-only.
- `--ignore-user-config`, `--ephemeral`, `project_doc_max_bytes=0` e discovery degli skill host disabilitata per il processo.
- Web search, shell, app/plugin, memoria, multi-agent, browser/computer, immagini e ricerca skill disabilitati. Nessun subtask di implementazione viene delegato: la CLI produce soltanto la risposta al caso.
- Ambiente del processo costruito con una allowlist di variabili di sistema/trasporto. Non inoltra `OPENAI_API_KEY`, `CODEX_API_KEY`, `QLOO_API_KEY` o credenziali di altri provider dall’ambiente del progetto.
- Nessuna lettura dei risultati TPD nel contesto del processo modello; il collector legge il registro solo per fare checkpoint e non reinviare casi già completati.
- Eventi del CLI controllati: una chiamata a strumenti o un tipo di item inatteso interrompe il caso e ne impedisce l’import. I warning diagnostici del CLI non vengono interpretati come risposte o strumenti.

Rimane un harness di Codex con le sue istruzioni integrate; queste non sono identiche alle istruzioni interne di ChatGPT web o a una chiamata API generica. Il risultato è un baseline LLM senza Qloo con trasporto dichiarato, non un confronto controllato tra frontend identici.

## Riproduzione

Richiede la CLI ufficiale installata e un login ChatGPT già disponibile. Il comando rifiuta altre modalità di autenticazione invece di usare chiavi implicitamente.

```sh
# Run esistente con manifest e input congelati; consuma richieste del piano CLI.
npm run benchmark:cli -- RUN_ID
# Prova di un solo caso ancora mancante:
npm run benchmark:cli -- RUN_ID 1
# Report locale senza nuove chiamate:
npm run benchmark -- report RUN_ID
```

Il collector usa un lock prima di leggere il registro modificabile, salva dopo ogni risposta accettata e salta i casi già raccolti. Una precedente esecuzione senza risposta importata richiede ispezione esplicita: non viene ritentata o sovrascritta automaticamente. Timeout massimo per processo: tre minuti. Gli eventuali retry di trasporto interni alla versione CLI non sono completamente controllati dall’harness; la rigenerazione automatica di un caso da parte del collector è invece esclusa.

Risposte originali, JSONL degli eventi, diagnostica e metadati di tentativo sono solo in `.private/benchmark/RUN_ID/cli-raw/`, ignorata da Git, con file 0600. Nessuna risposta provider viene aggiunta a fixture pubbliche. Le risposte valide vengono proiettate nello schema comune senza correggere luoghi, indirizzi, motivazioni o differenze. Una semplice rimozione di fence Markdown è ammessa solo per il parsing; l’originale rimane immutato.

## Esiti da non confondere con generazioni del modello

Il primo controllo del login ha letto solo stdout mentre la CLI scrive lo stato su stderr: interruzione prima di qualsiasi prompt. Corretto il controllo senza mostrare credenziali.

Un successivo avvio diagnostico con alias `gpt-6` è stato interrotto dall’harness perché un warning CLI era stato classificato erroneamente come uso di strumenti. Il log contiene solo `thread.started` e warning, senza `turn.started`, risposta del modello o chiamate a strumenti. È conservato come `baratin-p0-baseline-instrumentation-abort-*`, con stato corretto e spiegazione esplicita. Il collector è stato corretto e il modello richiesto cambiato nell’ID effettivamente presente nel catalogo, prima della prima generazione completa.

Il tentativo web bloccato da Cloudflare resta nell’archivio separato `chatgpt-raw/`. Non viene trasformato in una risposta vuota né sommato ai casi CLI riusciti.

## Validazione e confini

Test sintetici verificano parsing senza inventare risposte, distinzione warning/strumenti, obbligo di turno completato, rifiuto di chiamate a strumenti, processo isolato, eliminazione delle chiavi dall’ambiente, checkpoint, assenza di retry e rilascio del lock sugli errori. La prova del collector usa un CLI finto locale e non contatta un modello.

Il successo della raccolta verifica il trasporto e il formato. Non dimostra correttezza dei fatti, rispetto del budget delle raccomandazioni LLM o superiorità qualitativa. Per questi punti restano necessari gli stessi controlli sui risultati di tutte le condizioni, la ricerca normale e i voti umani.

## Esito verificato

Run `paris-pilot-2026-10-20`: **16/16 casi CLI completati, 48 alternative**. Tutti i turni hanno un evento di completamento; gli unici tipi di item nei log sono diagnostica (`error`) e messaggi del modello (`agent_message`). Nessuna chiamata a strumenti osservata. Per tutti i casi l’hash dell’input corrisponde al manifest e i dati importati corrispondono al parsing delle prime risposte originali. Audit privato in `cli-audit-summary.json`; file raw verificati/corretti a permessi 0600 all’interno della directory privata. Il collector precrea ora l’output con questi permessi anche per i run futuri.

Il report corrente ha TPD 16/16 e LLM CLI 16/16, ricerca normale 0/16, `complete=false`, `qualityUplift=null`. Mancano ancora raccolta della ricerca normale, controllo comune dei fatti e valutazioni umane. Nessun confronto qualitativo viene dichiarato concluso.

`npm test` e `npm run typecheck` passano. L’incremento modifica script e documentazione, senza cambiamenti al bundle o al comportamento del prodotto ospitato; nessun deploy.
