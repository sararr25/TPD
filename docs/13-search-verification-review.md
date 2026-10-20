# Ricerca web, verifica comune e scheda A/B/C

20 ottobre 2026. Raccolta completa del pilot: 16 casi × tre condizioni × tre alternative = 144 occorrenze. E04 resta **parziale**: i voti umani e una verifica indipendente sistematica dei fatti sono ancora aperti. Nessuna superiorità qualitativa è stata misurata.

## Terza condizione: cosa rappresenta

La colonna `search` è **ricerca web con estrazione assistita e dichiarata**, non un test di persone che usano Google Maps senza assistenza. Le 16 query includono reference, Parigi/categoria, i nomi del Passport e i vincoli Keep/Change o la formulazione di budget moderato dove presente. Il budget testuale non certifica una fascia Qloo.

Le query sono state eseguite con lo strumento web in quattro batch. Il tool restituisce risultati aggregati per batch: la raccolta non pretende di ricostruire il ranking SERP della singola query. Il pool di fonti aperte è condiviso tra i quattro casi della stessa reference. Nessuna ricerca di fallback è stata necessaria dopo questi batch.

Per la selezione sono state preferite pagine ufficiali cittadine e guide editoriali riconoscibili; tale scelta di affidabilità è stata fatta dopo le query, prima dell’estrazione dei record, e non costituisce una preregistrazione indipendente. Il collector, consapevole del contesto precedente, non è un operatore cieco. Ha estratto i primi tre luoghi nominati eleggibili nell’ordine della pagina scelta, escludendo la reference e i luoghi esplicitamente fuori Parigi. Gli indirizzi sono stati trascritti dalle pagine aperte quando disponibili, altrimenti lasciati nulli. La costruzione dei record legge solo gli input comuni e l’archivio di ricerca, senza leggere i suggerimenti TPD/LLM.

Fonti di scoperta effettivamente aperte:

- [MICHELIN: Belleville](https://guide.michelin.com/fr/fr/article/travel/notre-guide-de-belleville-paris-tendances).
- [MICHELIN: selezione di ristoranti parigini](https://guide.michelin.com/ca/en/best-of/the-trendiest-restaurants-in-paris-our-inspectors-top-picks).
- [Ville de Paris: musei meno conosciuti](https://www.paris.fr/dossiers/les-musees-meconnus-de-paris-212).
- [Time Out: musei di scultura](https://www.timeout.com/paris/en/museums/sculpture-museums).

La guida Time Out è datata 2012: questo limite è registrato nei record. La guida MICHELIN di ristoranti alla moda non prova l’assenza del tag Change richiesto. Analogamente, non è stata inventata una correlazione tra la presenza in una guida e gli artisti del Passport. Le quattro estrazioni per reference coincidono tra profili/configurazioni: il metodo non ha prodotto personalizzazione, e i 16 casi restano correlati.

Tutte le query, le pagine aperte, il protocollo, l’ordine di estrazione e gli input/record effettivi sono solo in `.private/benchmark/paris-pilot-2026-10-20/search-*`. I record originali restano immutati per la valutazione; il controllo successivo non riempie, riordina o rimuove alternative per migliorarne il punteggio.

## Verifica comune

```sh
npm run benchmark:verify -- RUN_ID
```

Usa lo stesso `/search` Qloo per tutti i nomi restituiti dalle tre condizioni, con suffisso Paris e tipo place. Non usa gli ID delle raccomandazioni TPD per risolverle più facilmente. Il primo controllo ha eseguito **53 query distinte** e salvato checkpoint privati; la ripetizione dopo il miglioramento della disambiguazione ha usato gli stessi checkpoint senza nuove chiamate. Il numero di 144 è di occorrenze, non luoghi distinti o osservazioni indipendenti.

Il matcher accetta solo un nome normalizzato esatto, oppure nome e indirizzo esatti se vi sono omonimi. Se numero civico o codice postale sono in conflitto con l’unico candidato, l’identità resta incerta e i suoi vincoli non vengono attribuiti a un’altra sede. Non viene scelto il primo risultato e non si deduce che un nome assente dalla ricerca sia inventato.

Controlli: categoria/tag atteso, Paris/FR, presenza di indirizzo e coordinate, reference esclusa, assenza di flag chiuso, fascia massima dove applicabile e tag esclusi. Ogni controllo è pass/fail/unknown/not_applicable; la corrispondenza dell’indirizzo riportato è analizzata separatamente. `notFlaggedClosed` significa soltanto assenza del flag nei metadati, non conferma di apertura attuale.

| Condizione | Occorrenze | Compatibili con tutti i controlli sui metadati | In conflitto con almeno un controllo | Ignote / identità non risolta |
|---|---:|---:|---:|---:|
| TPD | 48 | 37 | 0 | 11 |
| LLM CLI | 48 | 16 | 4 | 28 |
| Ricerca web assistita | 48 | 20 | 4 | 24 |

Questa tabella **non misura accuratezza reale o qualità**. Il verificatore usa Qloo, quindi favorisce strutturalmente la copertura/tassonomia della fonte già usata da TPD. Le assenze, gli indirizzi alternativi e gli omonimi rimangono unknown; l’assenza di un tag museo nella tassonomia non prova che un luogo non sia un museo. I conflitti di fascia indicativa sono confronti nello stesso sistema Qloo, non confronti tra prezzi di menu.

Nel controllo separato degli indirizzi sono emersi conflitti numerici/postali in quattro occorrenze TPD (uno stesso nome ripetuto) e in una LLM. Sono conflitti tra indirizzi/sedi, non cinque indirizzi automaticamente dimostrati falsi. Il confronto conserva entrambe le evidenze senza sostituire la risposta originaria.

Un approfondimento del caso omonimo trova una fonte primaria che descrive un [ristorante in rue des Quatre Vents](https://www.restaurantlacremerie.com/) e una [scheda pubblica Acceslibre che classifica un omonimo in rue de Lancry come fromagerie](https://acceslibre.beta.gouv.fr/app/75-paris/a/cremerie-fromagerie/erp/la-cremerie-2/). Questa distinzione dimostra la necessità di verificare identità e attività oltre al tag Qloo; non certifica automaticamente servizi e stato attuale di tutti i risultati.

Prima del deploy resta aperto il ticket E09: integrazione di una fonte operativa e disambiguazione per indirizzo/attività, con gestione dei conflitti. L’audit non introduce blacklist nominali e non riscrive il ranking del campione dopo averne visto gli esiti. Tutti i risultati del prodotto restano L0.

## Stato del report

Il campo ambiguo `complete` è stato rinominato `collectionComplete`: ora indica soltanto che le tre condizioni sono raccolte. `collectionComplete=true` coesiste con `qualityUplift=null` e `independentOperationalVerification=false`. La conclusione di E04 richiede ancora validazione indipendente comparabile e valutazioni umane.

Righe e riepilogo di audit sono in `common-verification-rows.json` e `common-verification-summary.json`, privati. Il riepilogo registra l’hash del registro verificato per evitare di attribuire un audit a risposte cambiate. Gli script non aggiornano questi dati nel prodotto o in uno storage pubblico.

## Scheda per valutatori

Creata una sola chiave casuale A/B/C per ciascun caso:

```sh
npm run benchmark -- blind RUN_ID
npm run benchmark:review -- RUN_ID
```

La scheda locale è disponibile su `http://127.0.0.1:3212/study`. Il server ascolta solo su loopback ed espone quella pagina; chiave, risultati sorgente e directory danno 404. È anche salvato un HTML autonomo privato `review.html`. Non è stato pubblicato un sito né inviato il materiale a terzi.

La pagina mostra un caso alla volta, il contesto comune, tre colonne senza provider e opzioni A/B/C/parità/nessuna. Raccoglie un codice pseudonimo, dichiarazione di non aver visto la chiave e motivo facoltativo. La bozza resta in localStorage per hash della scheda; l’esportazione salva un array JSON compatibile con `benchmark score`. L’app non invia voti in rete e il collector non ne produce automaticamente.

La scheda richiede tutti i 16 casi prima dell’esportazione. Il protocollo originario suggerisce 8–10 valutatori. Chi riconosce risposte già viste deve segnalarlo: le etichette nascoste non garantiscono da sole una cecità sperimentale perfetta. Nessun voto umano è stato raccolto in questo incremento; durante il QA non sono stati selezionati voti o creati valutatori fittizi.

## Verifiche completate

`npm test` e `npm run typecheck` passano. Nuove fixture sintetiche coprono disambiguazione, conflitti di indirizzo, unknown, fascia/tag, normalizzazione sicura della scheda, hash e rifiuto di script injection. Prova HTTP: solo `/study` restituisce 200 con no-store, chiave/risultati/directory restituiscono 404. Browser: rendering dei tre gruppi, nessun voto iniziale, blocco export senza codice e passaggio al caso budget; nessuna scheda di voto reale esportata. Screenshot privato in `.private/qa/benchmark-review.png`.

Non è dichiarato un nuovo audit completo di tastiera/zoom, né una verifica operativa sistematica dei luoghi. Nessuna modifica al bundle o deploy del prodotto: in questo incremento cambiano script, pagina locale di studio e documentazione.
