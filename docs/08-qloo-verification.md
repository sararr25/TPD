# Qloo — Verifiche iniziali e guida ufficiale

20 ottobre 2026. Solo evidenze tecniche aggregate; nessuna risposta Qloo viene pubblicata qui.

## Guida riletta

La [guida ufficiale dell'hackathon](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide) è stata letta integralmente il 20 ottobre tramite download HTTPS dalla fonte ufficiale, poiché il tool web non riusciva ad aprire la pagina.

Regole applicate:

- Solo `https://hackathon.api.qloo.com`, header `X-Api-Key`, chiave lato server.
- Insights **GET**, parametri nella query string. Non utilizzare POST, anche se la documentazione generale menziona funzionalità POST.
- Risolvere prima le entità via `/search`; poi usare gli ID in `/v2/insights`. Per i tag, ottenere ID validi da `/v2/tags`.
- I tipi di `/search` vanno verificati separatamente dai tipi Insights.
- Per Insights usare solo tipi elencati nella guida hackathon; `urn:heatmap` non assunto disponibile.
- Parametri non validi possono essere ignorati senza errore: HTTP 200 da solo non prova un filtro.
- Controllare `query.explainability.warning`, oltre a eventuali warning generali.
- Cache privata server ammessa; nessun dato di risposta nel repository pubblico.

Fonte per il parametro Resy corretto e gli altri filtri: [Insights deep dive ufficiale](https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md).

## Accesso e primi risultati

Configurazione trovata nel worktree indicato dall'utente; solo `QLOO_API_KEY` e `QLOO_API_URL` copiate nella root `.env.local`, con permessi 0600 e esclusione Git. Valore e risposta grezza mai stampati. Verificata assenza del valore segreto nei bundle browser della build corrente.

Sono state eseguite **13 richieste HTTP riuscite**, sequenziali: cinque iniziali, sei feature probe, due correzioni/verifiche esterne. Prima di queste, un tentativo senza accesso di rete è fallito prima della risposta.

| Verifica | Evidenza | Limite |
|---|---|---|
| HTTP diretto | GET `/search` e `/v2/insights` rispondono 200 | Harness non necessario per questa prova |
| Riferimento ristorante Parigi | Tre candidati da search; seed selezionato per nome esatto, non automaticamente primo risultato | Identità/indirizzo richiedono verifica prima del flusso live |
| Museo Parigi | Tre candidati di tipo place da search, con tag | Ambiguità e categoria non ancora accettate |
| Locality Parigi, Tokyo, New York | Cinque place per query e metadati locality presenti | Nessun audit geografico completo né prova per singola categoria; città candidate, non supportate |
| Segnale entità | Cinque place per query seeded su Parigi | Non prova qualità soggettiva del matching |
| Explainability | Metadati a livello query e per cinque risultati, senza warning rilevati | Utilità delle spiegazioni e traduzione UX da valutare |
| Trends low | Lista differente dal baseline | Non equivale a minore affollamento |
| Popolarità massima 0.5 | Lista diversa; tutti i valori restituiti rispettano il tetto | Verifica limitata a questa query |
| Resy | `filter.external.exists=resy` produce zero risultati nello scenario Parigi | Il vecchio `filter.external.resy.exists=true` era privo di evidenza: stessi risultati baseline e nessun metadato Resy. Non usarlo |
| Tripadvisor rating minimo 4 | Cinque risultati, HTTP 200 | Valori restituiti e applicazione filtro ancora da controllare; non accettato come prova |
| Tag lookup | Cinque risultati da `/v2/tags` | Tag di categoria/Keep-Change da selezionare e verificare |
| Limiti | Header indicano 5 richieste/secondo e 10.000/mese per questa chiave al momento del test | Limiti osservati, non garanzia permanente; valori precisi solo nei riepiloghi locali |

## Stato I03

**Parziale.** Accesso e componenti fondamentali verificati; non sono ancora scelte città definitive. Restano audit categorie ristoranti/musei, confini geografici, indirizzi, tag Keep/Change, Tripadvisor e altre destinazioni. Gli otto punti del piano originario sono criteri di verifica, non otto chiamate rigidamente sufficienti. Bangkok e Phu Quoc del vecchio piano non sono state interrogate: prevalgono le destinazioni di DECISIONS sezione 2.

Nessuna prova di disponibilità, prezzi live, prenotabilità o provider operativo. Google Places, Viator e Ticketmaster non ancora integrati.

## Riproduzione

`npm run verify:qloo`, poi `npm run verify:qloo-features`. Ogni riesecuzione consuma quota. Per una correzione mirata: `node scripts/check-qloo-features.mjs --only=external-resy,tripadvisor`.

Risposte grezze e riepiloghi: `.private/qloo/`, esclusa da Git. Gli script non leggono il worktree; usano la root `.env.local` o le variabili di ambiente.

## Continuazione: audit categorie e primo flusso

Vedi `docs/09-restaurant-swap-implementation.md`: otto query aggiuntive hanno verificato ristoranti/musei e Keep/Change. Scelto il pilot Parigi; Tokyo/New York non esposti nel flusso finché il confine geografico non è chiarito. Adapter e Restaurant Swap implementati e provati nel browser. I primi 13 tentativi HTTP erano il totale del precedente incremento, non il totale corrente; i test live successivi hanno consumato ulteriore quota.
