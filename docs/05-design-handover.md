# TPD: handover design

**Data:** 20 ottobre 2026
**Branch:** `claude/pensive-lovelace-k81d2t` · **PR:** https://github.com/sararr25/TPD/pull/2 (aperta, mergeable, nessun commento aperto)

## Dove siamo

1. **Ricerca fatta** (`docs/04-design-direction-research.md`): analisi dei riferimenti, agenzie bold, competitor (quasi tutti "basic"), tre direzioni di moodboard.
2. **Piattaforma decisa:** web app **desktop**, non mobile (decisione 3.19). Il brief (`docs/00`, `01`, `02`) è aggiornato.
3. **Direzione scelta (decisione 3.20):** base **A, "Passport e timbri"**, in versione **calma**. I timbri sono inchiostro su carta, con pochissimi tocchi della C (solo Keep/Change cliccabile).
4. **Scelta definitiva:** Carbone e fucsia, Familjen Grotesk + Martian Mono (decisione 3.21). I candidati A2 sono superati.
5. **Incremento 20 ottobre:** prototipo navigabile `design-mockups/A4-product-prototype.html`, token condivisi `design-mockups/tokens.css`, specifica `docs/06-design-system.md`.

## File da guardare

| File | Stato |
|---|---|
| `design-mockups/A2-oltremare.html` | **Storico, superato da A4.** Passaporto blu oltremare, timbri corallo e rosa, fondo grigio-lilla chiaro. |
| `design-mockups/A2-prugna.html` | **Storico, superato da A4.** Passaporto prugna, timbri mandarino e blu cobalto, fondo grigio-rosato chiaro. |
| `design-mockups/AC-1-pop-postale.html` | Scartato: troppo bold. Tenuto solo come storico. |
| `design-mockups/A-passport-stamps.html`, `B-taste-atlas.html`, `C-sticker-album.html`, `AC-2-mercato.html`, `AC-3-cielo.html` | Scartati. Contengono i colori vietati: **non riproporli**. |

Gli stessi file A2 sono visibili come artefatti privati:
- Oltremare: https://claude.ai/artifact/K3UBJDj5vxLGNGWTVRqJWW
- Prugna: https://claude.ai/artifact/BbmSAvU3dXeRwFucsSWKzY

## Regole emerse dal feedback (da rispettare)

- **Mai azzurro chiaro, mai verde scuro.**
- Niente look troppo bold. Le cose sbagliate erano blocchi pieni di colore, adesivi storti ovunque e stile "album di figurine". Il colore va dato **a inchiostro** (bordi, timbri, una parola), non a riempimento.
- No ai colori della prima A: crema, navy e rosso insieme.
- Più "Passport" della A originale: passaporto aperto, timbri ad anello e risultati come biglietti con la matrice.
- La B (brutalista nero o mappa) è scartata: "vista e rivista, non si adatta al brand, non si capisce".
- Le schermate vanno mostrate come **artefatti HTML cliccabili**, non come canvas Design e non come semplici file.
- Restano valide le regole di prodotto: niente "% match", niente "Prenota" o "Disponibile" non verificati, e i numeri del confronto Qloo vs LLM restano `[N]/3` finché non sono reali.

## Struttura della pagina A2 (già nei mockup)

1. Nav testuale con il logo-timbro.
2. Hero con il form Swap ("The place you wanted" + città + motivo) e il passaporto aperto (copertina, pagina identità, timbri).
3. Fascia con i gusti.
4. "How it works" in tre francobolli dentellati.
5. Area Swap: pannello Keep/Change cliccabile e tre biglietti, uno per ruolo, con la verifica L0–L2 nella matrice.
6. Transfer: pagina "Visas" del passaporto con tre francobolli (ristorante, galleria, quartiere).
7. Qloo vs LLM affiancati.

Font dei vecchi A2: Bricolage Grotesque, DM Mono, Instrument Serif. **Non usare nel nuovo prodotto:** A4 usa Familjen Grotesk e Martian Mono.

## Prossimi passi

1. ~~Scegliere tra Oltremare e Prugna~~ Fatto: scelto Carbone e fucsia + Familjen Grotesk/Martian Mono, timbri ad anello, bottoni timbro e un solo bottone biglietto (decisione 3.21).
2. Rifinire la versione scelta: densità dei timbri, quanto bianco, colore del passaporto.
3. Disegnare le schermate che mancano: costruzione del Passport (3–5 scelte), dettaglio risultato, collezioni, login/ospite, stati vuoti ed errori.
4. Fissare i token (colori, font, raggi, ombre) in un piccolo design system prima dello scaffold Next.js.
5. Nome del prodotto e logo (7.7) sono ancora aperti, e influenzano l'identità.

## Stato dei passi al 20 ottobre

- Passo 2: prima rifinitura realizzata in A4: copertina carbone, bianco prevalente, un timbro ad anello, fucsia a inchiostro. Validazione visiva ancora aperta.
- Passo 3: Passport 3–5 scelte, tre ospiti, dettaglio, collezioni locali, dialog accesso e sei stati navigabili realizzati nel prototipo. Non sono integrazioni live.
- Passo 4: token CSS e design system documentati in docs/06.
- Passo 5: naming e logo restano aperti; TPD provvisorio preservato.
- Verifica: sintassi JS e smoke route Node; browser integrato blocca file://, quindi nessuna accettazione visiva dichiarata.
- Prima del backend: stato chiave Qloo, otto query, città effettive, stack e autenticazione. Nessun provider attivato o messaggio inviato.

## Continuazione ticket — 20 ottobre

Registro ordinato: `docs/07-ticket-board.md`. Nessuna issue GitHub trovata nella ricerca corrente. D03 aggiunge validazione dei dati locali, deduplicazione, cancellazione con conferma e avviso storage indisponibile. Verifica: `node scripts/check-prototype.cjs` (logica e 17 route, non browser).

E01 attende la risposta alla domanda sullo stack; I03 attende lo stato della chiave Qloo. Naming e login restano aperti.
