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

### Aggiornamento D03

Cancellazione locale tramite dialog di conferma, limitata a `tpd-design-v1`. Dati ricaricati validati e salvataggi deduplicati. Se lo storage non è scrivibile il prototipo dichiara che le modifiche durano solo nella sessione. Verifica ripetibile: `node scripts/check-prototype.cjs`; nessuna nuova prova browser.

### Scaffold locale

Stack confermato il 20 ottobre. App in `src/app`, componenti in `src/components`; token CSS condivisi con il prototipo. Passport Next.js usa `tpd-passport-v1`, separato da `tpd-design-v1` del prototipo storico. Font caricati via CSS da Google Fonts con fallback; rendering font e QA browser ancora da verificare. Stato provider in docs/08.

## Update — 22 October 2026 (English from here on)

The live site now follows Home mockup A. Tokens are unchanged (`src/app/globals.css`).

- **Shell:** wordmark "beesyde" + stamp-coloured full stop; sticky header on `--bg`; nav Cities · Swap a place · Saved · Your Passport, current page underlined in `--stamp`; footer repeats the links plus the Qloo note.
- **Surfaces:** dark cover panels (`--pass`, radius 24px, white text, accent `#F27AAB` for contrast on dark); paper cards (`--paper`, 1px `--line`, radius 16px, no tilt, no heavy shadow).
- **Buttons:** `.ticket` primary (stamp fill, white, radius 8px, weight 600); `.stamp` secondary (1px `--ink` border, radius 8px, display font); `.text` underlined link; `.pill` for toggles and filters (pressed = `--pass` fill).
- **Type:** headings weight 600; `<em>` in headings upright in `--stamp`; mono micro-labels 12px in sentence case. Uppercase only for real codes (LIS, NYC).
- **Page head:** `.page-head` = mono label + h1 with `<em>` second clause + optional lead in `--ink-2`. No numbered eyebrows.
- **Rings:** circular stamp marks for city codes and the Lisbon example, animated only under `prefers-reduced-motion: no-preference`.
- **Photos:** Qloo place photo → city cover (`src/lib/city-covers.ts`) → text label.
