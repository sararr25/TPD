# Museum Swap e Transfer — pilot Parigi

20 ottobre 2026. Implementato e verificato localmente; nessun deploy.

Lo stesso Passport guida ora Restaurant Swap e Museum Swap. Il selettore di categoria e il pulsante «Try museums/restaurants with this Passport» mantengono le preferenze salvate e richiedono una nuova reference nella categoria scelta. Reference, chip, budget e risultati precedenti vengono azzerati al cambio; richieste client pendenti vengono annullate. Una richiesta già ricevuta dal server può comunque consumare quota Qloo.

## Contratto dei dati

- Categorie ammesse: `restaurant` e `museum`; il valore omesso conserva il comportamento ristoranti. Altre categorie danno HTTP 400.
- Entrambe usano `/search` e `/v2/insights` GET attraverso l'adapter server esistente. Ricontrollati la [guida hackathon](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide) e il [riferimento parametri ufficiale](https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md).
- Museo: `urn:tag:genre:place:museum`, locality Paris con radius=0. Controllo locale di tipo place, categoria, Paris/FR, indirizzo, coordinate, chiusura ed esclusioni. Un ristorante con nome del museo non basta.
- La firma della reference non basta da sola: la categoria viene ricontrollata nel server prima delle chiamate Insights.
- Chip museo da tag Qloo di atmosfera, interessi, decorazione, attività e intenzione di visita; massimo sei. Nessun tag sintetico. Keep è un segnale di gusto con peso comune 2, non un filtro obbligatorio; Change esclude il tag e viene ricontrollato sulla risposta.
- Il budget a fasce resta solo nei ristoranti. Il server rifiuta un budget museo: i prezzi d'ingresso e le mostre non sono stati verificati.
- I tre ruoli mantengono la logica descritta in docs/09. Tutti i risultati restano L0; nessuna promessa su orari, biglietti o disponibilità.

## Prove completate

`npm test`, `npm run build` e `npm run typecheck` passano. Le fixture automatiche sono sintetiche e coprono categoria errata, reference di altra categoria, budget museo rifiutato, stessi segnali Passport nella query, Keep pesato, Change, ruoli distinti, risposta vuota e locality non confermata. I test non chiamano Qloo.

Test live ripetibile, con app avviata su `127.0.0.1:3000`:

```sh
npm run dev -- --hostname 127.0.0.1 --port 3000
# In un secondo terminale; consuma quota Qloo:
npm run verify:qloo-transfer
```

La verifica usa un solo Passport ospite musica/cinema, una reference ristorante e una museo selezionate per nome esatto. Nel campione eseguito:

| Scenario | Candidati ammessi | Risultati distinti | Scartati localmente |
|---|---:|---:|---:|
| Ristorante baseline | 20 | 3 | 0 |
| Museo baseline | 20 | 3 | 0 |
| Museo Keep | 20 | 3 | 0 |
| Museo Change | 20 | 3 | 0 |

Categoria, città/paese, coordinate/indirizzo e assenza dei tag Change sono controllati sui risultati effettivi. Questi conteggi sono un campione tecnico, non una misura di qualità o di copertura generale. HTTP 200 da solo non è il criterio. Risposte proiettate e riepilogo sono esclusivamente in `.private/qloo/transfer-*.json`, ignorati da Git; nessuna risposta provider commessa.

Verifiche HTTP aggiuntive: categoria hotel, reference ristorante usata per musei e budget museo restituiscono 400 con errori specifici, prima di interrogare Qloo.

Browser: profilo ospite risolto e salvato → ricerca/conferma ristorante → tre alternative → pulsante Transfer → stessi tre preferiti visibili nel museo → ricerca/conferma museo → Keep e tre alternative → Change e ricalcolo → dettaglio L0 espanso. Nessuna fascia prezzo ristorante nel museo. Screenshot solo in `.private/qa/museum-transfer.png`. La nuova UI è stata controllata nella viewport del browser integrato; non viene dichiarato un nuovo audit completo di desktop, zoom, contrasto o tastiera.

## Confini e prossimo passo

Transfer significa riutilizzare le stesse preferenze su una nuova categoria con una nuova reference. Non dimostra ancora un vantaggio rispetto a un LLM o alla ricerca senza Passport. Il benchmark E04 resta aperto: stessi vincoli, 15–20 casi, confronto cieco ove possibile e risultati reali, anche negativi. Nessun provider LLM, nuovo servizio o costo di modello è stato attivato.

Gallerie, quartieri e altre città restano fuori da questo incremento. Storage/rate limiting condivisi, verifica operativa e deploy restano aperti come in docs/09.
