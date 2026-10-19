# TPD — Design system e prototipo

Aggiornato: 20 ottobre 2026. Stato: prototipo HTML, non applicazione integrata.

## Fonte e direzione

Decisioni 3.19–3.21: desktop 1440 px, Passport calmo, colore a inchiostro, timbri ad anello. La scelta Carbone e fucsia sostituisce i candidati A2. Nome e logo definitivi restano aperti.

## Token

Fonte CSS condivisa: `design-mockups/tokens.css`.

| Token | Valore / uso |
|---|---|
| bg / paper | #F4F4F3 / #FFFFFF; tela e superfici |
| ink / ink-2 | #1E1D22 / #55535C; testo e testo secondario |
| line | #E0DFE2; separatori, mai unico indicatore interattivo |
| pass / on-pass | #26242C / #FFFFFF; copertina e CTA biglietto |
| stamp | #D61F69; timbri, selezione, accento corsivo |
| third | #D9860B; accento riservato, non testo piccolo su bianco |
| display | Familjen Grotesk 400–700, corsivo 600 |
| mono | Martian Mono 400–500, metadati |
| radius / radius-card | 8 / 16 px |
| space | 4, 8, 12, 16, 24, 32 px |
| shadow | 0 18px 40px -28px #26242c66 |

Un solo CTA biglietto per schermata; azioni secondarie a timbro o testuali. Testo e bordi distinguono gli stati anche senza colore. Focus visibile, controlli HTML nativi, stato selezionato tramite aria-pressed, movimento ridotto. Font con fallback di sistema; Google Fonts richiede connessione.

## Artefatto navigabile

`design-mockups/A4-product-prototype.html`: aprire nel browser; nessuna build necessaria.

Percorso: welcome → passport (3–5 scelte) oppure guest (3 profili) → swap → results → detail → dialog di accesso → collezione locale.

- Passport e collezione persistono solo nel localStorage `tpd-design-v1` di questo browser/origine. Nessuna password o chiave.
- I chip cambiano selezione ma non ricalcolano un ranking; il prototipo lo dichiara.
- Tutti i ristoranti sono inventati, nessuna risposta Qloo inclusa.
- Il login è un dialog di progetto, non un'autenticazione simulata riuscita.
- Confronto: metriche [N]/3, nessun benchmark eseguito.
- `#states` offre loading, nessun risultato, copertura insufficiente, quota, riferimento non trovato, errore provider. Loading è un'anteprima statica con uscita.
- Transfer, ricerca entità, mappe e verifica operativa restano da implementare dopo i test API.

## Verifica e limiti

Controllo sintassi JS e smoke check delle route con DOM minimale Node; non equivale a test browser. L'apertura file:// nel browser integrato è stata rifiutata dalla policy del tool. Restano da controllare rendering a 1440 px e larghezze strette, tastiera, contrasto, zoom e caricamento font in un browser autorizzato.

## Prossima implementazione

Prima dello scaffold: confermare stack e stato credenziali; eseguire le otto query Qloo e scegliere città/categorie sulla copertura effettiva. Nessun invio Discord, attivazione affiliati o accettazione termini effettuato in questo incremento.
