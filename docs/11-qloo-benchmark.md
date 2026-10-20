# Benchmark Qloo / LLM / ricerca normale

20 ottobre 2026. E04 **parziale**: harness implementato, colonna TPD raccolta; LLM, ricerca normale e valutazioni umane non ancora raccolti. Nessun confronto vincente dichiarato, nessun nuovo provider attivato, nessuna modifica alla UI pubblica.

## Protocollo del pilot

Il protocollo in DECISIONS 6.1 prevede 15–20 richieste, tre condizioni e una valutazione possibilmente cieca. Il pilot usa 16 scenari: quattro reference × due Passport ospiti × due configurazioni. Otto scenari ristoranti e otto musei, tutti Paris/FR. È un campione esplorativo e correlato, non 16 utenti o 16 casi indipendenti.

Reference e configurazioni definite in `scripts/benchmark/core.mjs` prima della raccolta principale:

- Ristorante A: base / fascia massima 2.
- Ristorante B: base / Change del primo chip di gusto disponibile.
- Museo A: base / Keep del primo chip di gusto disponibile.
- Museo B: base / Change del primo chip di gusto disponibile.

I nomi dei riferimenti sono input pubblici di ricerca nello script; ID risolti, chip effettivi, risposte e token restano privati. Si richiede un solo candidato dal nome esatto ammesso: niente scelta automatica del primo risultato. Il manifest privato congela input, prompt, hash e richieste. Una ripresa usa quel manifest, senza ricostruire i casi; selezioni scadute richiedono un nuovo run, non un bypass delle firme.

Nel preflight iniziale «Musée du Louvre» non è stato risolto dalla ricerca dell'app. Prima di raccogliere i 16 casi principali il quarto riferimento è stato cambiato in Musée Rodin, già osservato come candidato museo. L'esito negativo è conservato in `.private/benchmark/paris-pilot-2026-10-20/louvre-resolution.json`. Il campione principale è quindi condizionato a reference risolvibili: non misura copertura o successo end-to-end su input arbitrari. Il problema di risoluzione del Louvre resta aperto; non si dichiara che Qloo non possieda l'entità.

## Tre condizioni, stessi input

1. **TPD:** l'app locale con Qloo, Passport, reference e vincoli, senza variazioni al ranking per il benchmark.
2. **LLM senza Qloo:** esattamente il prompt esportato, modello identificato, nessuna navigazione, ricerca o accesso ai risultati TPD. Raccogliere ogni risposta in una conversazione indipendente per evitare contaminazione tra casi. Conservare modello/versione, timestamp ed eventuale configurazione effettiva nel record di provenienza. La modalità API o raccolta manuale deve essere esplicita. L’utente ha scelto la raccolta manuale da ChatGPT; nessuna API LLM da attivare per questo baseline.
3. **Ricerca normale:** ricerca web/Maps realmente eseguita, usando gli stessi vincoli e preferenze come contesto; registrare query effettiva, fonte, URL e timestamp. La curatela dell'operatore va dichiarata. Non sostituire questa condizione con una query Qloo senza Passport.

`baseline-inputs.json` esporta solo i contesti umani e i prompt, senza risultati TPD, entità provider complete o token. Le risposte devono usare lo stesso formato, con massimo tre alternative distinte; sono ammessi meno risultati o una lista vuota. Non inventare indirizzi, fasce prezzo o disponibilità. Nessun riempimento automatico di colonne mancanti.

## Esecuzione

Avviare l'app locale in un terminale:

```sh
npm run dev -- --hostname 127.0.0.1 --port 3000
```

In un altro terminale, usare un ID run nuovo oppure riprendere quello esistente:

```sh
npm run benchmark -- collect RUN_ID
npm run benchmark -- report RUN_ID
```

`collect` effettua richieste sequenziali all'app, consuma quota Qloo e non ritenta automaticamente. Salva dopo ogni caso completato; riprendendo lo stesso run salta quelli già raccolti. Un errore interrompe il processo, preservando i casi precedenti. Un lock impedisce due comandi simultanei sullo stesso run. Le durate includono rete, app ed eventuale cache: non sono un benchmark di velocità dei provider.

Output esclusivamente in `.private/benchmark/RUN_ID/` (ignorata da Git): directory 0700, JSON 0600 e scritture atomiche. Il manifest contiene selezioni firmate: non condividerlo. Non usare questa cartella come cache ospitata o renderla pubblica per la demo.

Completare i template privati con risposte reali e provenienza:

```sh
npm run benchmark -- import RUN_ID llm /absolute/path/llm-records.json
npm run benchmark -- import RUN_ID search /absolute/path/search-records.json
npm run benchmark -- report RUN_ID
```

Formato di ogni record, in un array JSON:

```json
{
  "caseId": "ID dal template",
  "condition": "llm",
  "inputHash": "hash dal template",
  "items": [
    {"name": "Nome reale restituito", "address": null, "why": "Motivazione restituita", "different": "Differenza restituita"}
  ],
  "provenance": {
    "source": "API o applicazione usata realmente",
    "model": "modello effettivo",
    "collectedAt": "timestamp ISO effettivo",
    "qlooUsed": false,
    "browsing": false
  }
}
```

Per `search`, sostituire `model`/`browsing` con `query` e `urls` (almeno un URL http/https). Gli import rifiutano contesti diversi, casi sconosciuti/duplicati, risposte già importate, fonti mancanti, più di tre risultati o nomi duplicati. La provenienza è una dichiarazione di raccolta, non una verifica automatica della sua autenticità. Conservare gli output originali privati per audit. I template vengono creati se mancanti e non sovrascritti dai comandi, per preservare il lavoro di raccolta. Importare solo i casi nuovi; non importare template vuoti come se fossero risposte reali.

## Valutazione cieca e conteggi

Solo quando tutte e tre le condizioni sono raccolte:

```sh
npm run benchmark -- blind RUN_ID
```

Crea `blind-review.json` con colonne A/B/C permutate casualmente per ogni caso, contesto comune e soli nomi/indirizzi. Le spiegazioni vengono omesse per evitare indizi come il nome del provider e differenze di lunghezza: questa scheda valuta l'utilità delle scelte, non la qualità delle spiegazioni. Non condividere `blind-key-DO-NOT-SHARE.json`, manifest o record sorgenti con i valutatori. Il comando rifiuta di rigenerare una scheda già creata, per preservare la corrispondenza delle schede di voto.

Ogni valutatore compila una copia di `ballot-template.json`: identificativo pseudonimo, dichiarazione di cecità, voto A/B/C/tie/none e motivo. Non serve il nome personale. Per aggregare un array di schede:

```sh
npm run benchmark -- score RUN_ID /absolute/path/ballots.json
```

L'aggregazione verifica l'hash della scheda, rifiuta valutatori/casi duplicati e separa parità e «nessuna». Riporta conteggi e denominatori; non calcola automaticamente un uplift statistico. Una scheda parziale non diventa una valutazione completa. Il protocollo originario suggerisce 8–10 persone: non sono state ancora reclutate né contattate.

## Evidenza raccolta

Run privato `paris-pilot-2026-10-20`:

| Condizione | Casi raccolti | Alternative restituite |
|---|---:|---:|
| TPD | 16/16 | 48 |
| LLM senza Qloo | 0/16 | — |
| Ricerca normale | 0/16 | — |

Nei 16 casi TPD: tre alternative distinte per caso, nessun risultato vuoto, 20 candidati ammessi per caso e zero scarti locali riportati. Tutte le 48 alternative rispettano i controlli locali sui metadati Qloo: categoria, Paris/FR, indirizzo/coordinate, riferimento escluso, tag Change e fascia massima dove presente. Si tratta di controlli della risposta filtrata dell'app, non di una verifica operativa indipendente né di una misura comparativa di precisione. Il ranking a monte e i candidati scartati da Qloo non sono osservati da questo harness.

Nelle otto coppie a parità di reference/configurazione, cambiando Passport cambia il primo risultato in 3 coppie e il set di tre risultati in 6. Overlap Jaccard medio 0,5125. Sono misure di sensibilità dell'output; non provano che una proposta sia migliore. I due Passport hanno gusti in parte condivisi e i casi sono correlati.

Il report mantiene `complete=false` e `qualityUplift=null`. Non sono state valutate qualità soggettiva, esistenza/orari/prezzi esterni, superiorità rispetto al modello o preferenze di utenti. Nessun numero di vittoria va inserito nel pitch o nell'app finché mancano confronti e voti.

## Verifica dell'harness e prossimi passi

`npm test` comprende fixture sintetiche per i 16 scenari, prompt/hash, provenienza, import, duplicati, rifiuto del confronto incompleto, etichette casuali persistenti e aggregazione voti. La prova integrata dei comandi usa solo dati sintetici e pulisce la propria directory temporanea. `npm run typecheck` passa. Nessuna nuova build necessaria: l'incremento modifica script e documentazione, non il bundle dell'app.

Per chiudere E04: scegliere e raccogliere il baseline LLM, raccogliere la ricerca normale, controllare i fatti con lo stesso criterio per tutte le condizioni (ignoto resta ignoto), effettuare la valutazione umana e analizzare anche casi neutri o sfavorevoli a TPD. Il pannello di confronto nel prodotto e lo storage privato ospitato restano successivi a risultati reali; nessun confronto fittizio viene esposto.

## Raccolta manuale ChatGPT scelta dall’utente

Esportazione senza chiamate provider:

```sh
npm run benchmark -- manual RUN_ID
```

Genera `chatgpt-manual.md` privato con i prompt esatti dei soli casi LLM mancanti. Il file non include risultati TPD, token o chiavi e non viene sovrascritto se esiste già. Il pacchetto del run corrente è stato generato e contiene 16 casi.

Usare una conversazione nuova per ogni caso, stesso modello dichiarato, senza strumenti di ricerca o contesto TPD. Annotare l’etichetta del modello effettivamente mostrata e l’eventuale personalizzazione/memoria applicata. Il nome commerciale visibile non garantisce la riproducibilità di una versione interna: questo limite deve restare esplicito. Conservare la prima risposta integrale, inclusi errori, rifiuti e richieste di chiarimento, senza rigenerazioni selettive. Restituire a Codex risposta originale, ID caso, modello, data/ora e stato strumenti; gli hash sono già nel manifest e non serve compilarli a mano.

Le risposte non conformi non vanno trasformate in una lista vuota o in consigli inventati. La normalizzazione di un output realmente raccolto deve conservarne l’originale e non correggerne i fatti; eventuali fallimenti di formato vanno registrati separatamente prima dell’import. Nessuna risposta manuale è stata ancora ricevuta/importata.
