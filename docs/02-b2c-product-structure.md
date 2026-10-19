# TPD — Struttura del prodotto B2C (decisioni del brainstorming, 19 ottobre 2026)

Questo documento fissa le scelte fatte nel brainstorming. Dove una scelta ha un costo o un rischio, è segnalato in "Tensioni da gestire". Tutto ciò che dipende dalla copertura Qloo resta **da verificare con la chiave** (vedi `01-research-and-brainstorm.md`, sezione 2.5).

## 1. Decisioni prese

| Area | Decisione |
|---|---|
| Ingresso | **Passport prima di tutto**: la prima cosa che l'utente fa è comporre il proprio Taste Passport |
| Prova senza registrazione | **Demo ospite con Passport precompilato** (2–3 profili di esempio) |
| Account | **Login** per salvare Passport e collezioni |
| Categorie | Ristoranti e bar · musei, gallerie e cultura · hotel e alloggi · quartieri e zone · attività, spettacoli ed escursioni |
| Segnali del Passport | Artisti/musica · film, serie, libri · luoghi già amati |
| Keep/Change | **Chip dai tag Qloo**, ciascuno Keep / Change / Ignora, ricalcolo a ogni tocco |
| Risultati | **3 ruoli distinti** (Closest cultural match, Best practical match, Unexpected but relevant) |
| Dati operativi | **Qloo + Google Places + Ticketmaster** |
| Azioni sul risultato | Salva in collezioni · apri mappa e indicazioni · feedback che aggiorna il Passport |
| Momento "wow" | **Transfer cross-domain** (guida la demo) + **Qloo vs LLM affiancati** |
| Destinazioni demo | Portogallo, Francia (Parigi), Spagna (Barcellona/Madrid), Vietnam, Giappone, New York |
| Identità | **Giocoso e social**: la scheda Passport come "carta d'identità del gusto" |

## 2. Flussi principali

### 2.1 Primo accesso
```
Landing → [Crea il tuo Passport]  oppure  [Prova come ospite → scegli un profilo]
        → Passport: scegli 3–5 segnali (artisti, film/serie/libri, luoghi amati)
        → Home personale
```
- Il Passport si può costruire **senza account**, salvato in locale. Il login compare al primo "Salva" o "Condividi", così la scelta "Passport prima" non diventa un muro di registrazione.
- Il profilo ospite precompilato serve ai giudici: provano subito, senza scrivere nulla.

### 2.2 Swap (flusso centrale)
```
Home → "Cosa volevi?" (nome del posto + città)
     → risoluzione del riferimento (conferma se ambiguo)
     → chip Keep / Change / Ignora (4–6, dai tag Qloo)
     → 3 risultati con ruoli distinti
     → l'utente tocca un chip → ricalcolo
     → salva / mappa / feedback
```

### 2.3 Explore Within (sono già qui)
Selezione della destinazione (o geolocalizzazione) + categoria. Stessa pipeline, senza riferimento: il Passport è il solo segnale. Ordinamento per distanza opzionale.

### 2.4 Transfer
Dopo uno Swap, un invito: "Usa lo stesso gusto in un'altra categoria o città". Stesso Passport, categoria diversa (ristorante → museo → quartiere). È il filo della demo.

### 2.5 Confronto Qloo vs LLM
Toggle sulla schermata dei risultati: **"Cosa farebbe un LLM senza Qloo"**. Due colonne sulla stessa richiesta e con gli stessi vincoli, risultati precalcolati e in cache per non consumare quota. Ogni colonna mostra quanti risultati rispettano i vincoli duri e quanti sono verificabili.

## 3. Schermate (web app desktop)

1. **Landing** — promessa ("Il posto che volevi è pieno? Trova quello giusto per te"), ingresso Passport, ingresso ospite.
2. **Costruzione Passport** — ricerca di entità Qloo (artista, film, libro, luogo), 3–5 scelte, anteprima della "carta del gusto".
3. **Home** — campo "Cosa volevi?", scorciatoie per categoria, ultimo Swap, collezioni.
4. **Riferimento + Keep/Change** — card del posto riconosciuto, chip modificabili, vincoli duri (città, budget).
5. **Risultati** — i tre ruoli, mappa, toggle Qloo vs LLM.
6. **Dettaglio alternativa** — Why it matches you · What's different · What we verified, mappa e indicazioni, salva.
7. **Collezioni** — raccolte per viaggio/città.
8. **Scheda Passport** — carta condivisibile (immagine) con gusti principali.
9. **Stati** — caricamento, nessun risultato, località poco coperta, quota esaurita, riferimento non trovato.

## 4. Come Qloo alimenta ogni elemento

| Elemento di prodotto | Uso di Qloo (da confermare con la chiave) |
|---|---|
| Passport | Ricerca/risoluzione entità `artist`, `movie`, `tv_show`, `book`, `place` → `signal.interests.entities` |
| Riferimento "Cosa volevi?" | `/search` con conferma identità/indirizzo → ID in `signal.interests.entities` (Insights GET; guida hackathon riletta il 20 ottobre) |
| Chip Keep/Change | Tag del riferimento → `signal.interests.tags` con peso (Keep) e `filter.exclude.tags` (Change) |
| Vincolo di città | `filter.location.query` o locality con `radius=0` per restare nei confini |
| Cambia notorietà | `bias.trends` e `filter.popularity.max` |
| Prezzo (solo luoghi) | `filter.price_level.min/max` |
| Varietà dei risultati | `diversify.by` / `diversify.take` |
| Segnali di qualità/prenotabilità | `filter.external.*` (Resy, Michelin, Tablet, Tripadvisor) per i ristoranti |
| "Sono qui" | `sort_by=distance` |
| Why it matches you | `feature.explainability`, mostrato **solo** quando Qloo lo restituisce (gestire il caso `warning`) |
| Scarti | `filter.exclude.entities` dopo un feedback negativo |
| Quartieri | locality e, se resta tempo, `urn:heatmap` |
| Cross-domain / Transfer | Stesso Passport su `filter.type` diversi (`place`, `destination`) |

Google Places fornisce identità, posizione, orari e foto. Ticketmaster fornisce date, sedi e biglietti per spettacoli ed eventi. Qloo non fornisce disponibilità né prezzi reali.

## 5. Dati e account

- **Passport:** segnali (entità e tag), vincoli, esclusioni, feedback. Salvato in locale per gli ospiti e su database per chi ha un account.
- **Collezioni:** riferimenti agli ID di luogo, nota, data. Nessuna copia massiva di dati Qloo (il kit lo vieta: niente ricostruzione di un database).
- **Privacy:** consenso al salvataggio, cancellazione del Passport, nessuna vendita di dati individuali. Qloo stesso descrive risultati come affinità aggregate, non come prove sulla singola persona: la copy non deve prometterlo.
- **Login:** metodo da scegliere (magic link o Google). Va tenuto minimo.

## 6. Tensioni da gestire

1. **Scope.** Cinque categorie, login, collezioni, scheda condivisibile e confronto con LLM in 11 giorni sono molti. Proposta: costruire una pipeline unica e poi aggiungere una categoria alla volta, in quest'ordine di priorità — ristoranti → musei/cultura → quartieri → hotel → attività/spettacoli. Se una categoria non regge i dati, esce dall'MVP, non si finge.
2. **Ticketmaster.** Copertura forte in USA e Europa, debole in Vietnam e Giappone. Per quei paesi le attività si basano su Qloo e Places, e l'interfaccia lo dichiara.
3. **Sei destinazioni da testare.** Si inizia con una per area (Parigi, Tokyo o Osaka, New York) e si aggiungono Portogallo, Spagna e Vietnam solo se la copertura Qloo lo consente. Non scrivere "supportato" nell'app per ciò che non è stato provato.
4. **Link per verificare la disponibilità.** Non è stato scelto tra le azioni. Senza di esso "What we verified" non può mai dire "disponibile": l'interfaccia deve dire apertamente che la disponibilità non è verificata, e non mostrare mai "Prenota".
5. **Tono giocoso e fiducia.** La fiducia è il dolore misurato nella ricerca. Il tono leggero va bene, ma le etichette di verifica restano sobrie e precise.
6. **Account e demo.** Gli ospiti devono poter fare tutto tranne salvare. Il flusso ospite va testato come primo percorso, non come ripiego.

## 7. Sequenza di costruzione

1. Verifica API (8 query, 2.5 del documento 01) e scelta delle destinazioni effettive.
2. Backend adapter Qloo (HTTP o harness) + cache.
3. Passport (ospite/locale) → Swap per ristoranti con chip Keep/Change e tre ruoli.
4. Confronto Qloo vs LLM, con casi precalcolati.
5. Musei/cultura e Transfer.
6. Login, salvataggio, collezioni, feedback.
7. Scheda Passport condivisibile.
8. Quartieri, hotel, attività/spettacoli, solo se i dati reggono.
9. Rifinitura, stati di errore, README, deploy pubblico, descrizione in inglese.

## 8. Ancora aperto

- Risposta degli organizzatori sull'accesso API (HTTP diretto o solo harness), già richiesta.
- Quota e rate limit dell'evento.
- Metodo di login (magic link o Google).
- Nome del prodotto e dell'identità visiva ("TPD" è provvisorio).
