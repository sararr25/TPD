# TPD — Ricerca marketing, ricerca Qloo e brainstorming (19 ottobre 2026)

Complementa il brief `TPD_Product_Research_and_Hackathon_Brief.md`. Dove i dati vengono da ricerca web e non da fonti primarie, è indicato.

**Limite di accesso:** `qloo.devpost.com` e `/rules` restituiscono 403 al mio fetch. Date, premi e criteri qui sotto restano quelli del brief, e un post LinkedIn secondario li conferma (30 set – 30 ott 2026, $25k, demo pubblica + repo con licenza open source). Rileggi le regole ufficiali a mano prima di consegnare.

---

## 1. Ricerca marketing

### 1.1 Cosa dicono i dati sul problema

| Segnale | Dato | Fonte / affidabilità |
|---|---|---|
| Evitare i luoghi affollati | 43% dei viaggiatori nel 2026 vuole evitare destinazioni sovraffollate (32.500 intervistati, 35 mercati) | Booking.com Travel & Sustainability Report 2026, sondaggio ampio |
| Cercare il "quieto" | 34% cerca attivamente destinazioni più tranquille | Skyscanner 2026 |
| Alternative al bucket-list | 45% cercherebbe un'alternativa a una meta bucket-list | Contiki, sondaggio del brand |
| Disponibilità a cambiare | 90% "considererebbe un'alternativa meno popolare" | Global Rescue 2025, intenzione dichiarata |
| AI che sbaglia | Tra chi usa l'AI per viaggiare, 55% ha ricevuto almeno una raccomandazione errata, chiusa o inesistente; circa 1 su 6 un luogo inesistente | Greetwell, agosto 2026, 1.000 viaggiatori USA |
| Calo di fiducia | Chi ha avuto un problema ha 4 volte più probabilità di dichiarare meno fiducia nell'AI | Greetwell |
| Fiducia nel prenotare | Circa 70% preferisce prenotare con brand di viaggio fidati, non con chatbot o agenti | Expedia "AI Trust Gap", aprile 2026 |
| Adozione | Molti pianificano con l'AI, solo una minoranza (11% in Greetwell) la usa anche per prenotare | Greetwell, Holafly |

**Cautele:** sono intenzioni dichiarate, non comportamento. I sondaggi di brand (Contiki, Global Rescue) sono parziali. Nessuna fonte trovata misura direttamente "ristorante pieno, cerco un'alternativa". **Questo è il buco da colmare con un test, non con un'affermazione di pitch.**

### 1.2 Cosa significa per il prodotto

1. **La fiducia è il vero campo di battaglia.** Il dato più utile non riguarda l'AI che pianifica, ma l'AI che inventa. Un prodotto in cui *ogni luogo ha un ID verificabile* e dove si distingue "verificato" da "non verificato" risponde a un dolore misurato. Va in prima fila nel pitch, prima di "vibe".
2. **La domanda "alternativa" esiste a livello di intenzione.** Evitare la folla è un trend 2026 solido. Con "stessa sensazione, posto diverso" TPD si aggancia a quel trend senza dipendere dal posizionamento "hidden gems", già affollato.
3. **Il pubblico B2C è episodico.** Si usa in viaggio o poco prima, e Google Maps è già installato. Retention e monetizzazione B2C sono deboli per costruzione: va dichiarato nel pitch, non nascosto.
4. **B2B hospitality: direzione plausibile, numeri non affidabili.** Accor ha lanciato un concierge AI conversazionale, e Mews/Cloudbeds integrano già messaggistica AI. Le cifre di mercato e ROI che circolano sono promozionali. Tratta il B2B come ipotesi da testare con 3–5 interviste, non come tesi.

### 1.3 Segmenti e jobs-to-be-done (da validare)

| Segmento | Momento | Job | Perché TPD |
|---|---|---|---|
| **Viaggiatore con un riferimento in testa** (primario) | Prima/durante il viaggio, il posto desiderato è pieno, affollato o fuori budget | "Dammi la stessa cosa, ma che si possa fare" | Reference-based + Keep/Change |
| **Viaggiatore già sul posto** | Sera libera, pioggia, piano saltato | "Cosa faccio qui, nel mio stile?" | Within-destination, mobile |
| **Concierge / boutique hotel** (futuro) | L'ospite chiede, il tavolo non c'è | "Proponi qualcosa che gli somigli" | Widget brandizzato |
| **DMO** (futuro) | Distribuire i flussi oltre i punti noti | "Mostra il resto del territorio ai profili giusti" | Alternative + dati aggregati |

### 1.4 Posizionamento e messaggi

- **Da non dire:** "scopri hidden gems con l'AI", "città simili a quelle famose" (Savler, Atlas Obscura, Spotted by Locals già lì).
- **Da dire:** "Il posto che volevi è pieno. Ecco quello giusto per te, e cosa abbiamo verificato."
- **Prova da mostrare:** lo stesso Passport, usato su un ristorante a Bangkok e su un museo a Parigi. Nessun competitor travel lo fa, ed è la capacità cross-domain di Qloo.
- **Antagonista chiaro:** Google Maps/Ask Maps e ChatGPT. Il confronto *Qloo vs LLM-only* sulla stessa richiesta è anche il materiale di marketing migliore.

### 1.5 Esperimenti di validazione, a costo quasi zero

1. **Test cieco (15–20 richieste):** 3 colonne (ricerca normale, LLM puro, TPD). 8–10 persone votano senza sapere quale sia quale. Serve per la demo e per il pitch.
2. **Smoke test di domanda:** landing page con la domanda "Il posto che volevi è pieno?" e un campo per inserirlo. Misura quante persone scrivono un riferimento reale.
3. **5 interviste a viaggiatori:** "L'ultima volta che il posto che volevi era pieno, cosa hai fatto?" Serve a validare la frequenza del problema.
4. **3 messaggi a boutique hotel/concierge:** solo per capire se il problema esiste per loro. Nessun pitch.

---

## 2. Ricerca Qloo

### 2.1 Come si accede (cambia l'architettura)

Dal kit ufficiale (`qloo/qloo-hackathon-kit`):

- Tutto passa dal pacchetto npm **`@qloo/qloo-harness`** (Node ≥ 22.19, versione ≥ 0.1.26). Tre vie: `qloo explore` (chat agente), `qloo exec` / `qloo api` (CLI da script/backend, JSON), `qloo mcp` (server MCP per il tuo modello). `exec`, `explore` e `mcp` restituiscono la stessa forma di risultato; `api` dà la risposta grezza.
- L'API vera è `https://api.qloo.com` (v2, OpenAPI 3.1 in `qloo/docs-public`).
- **Regole che vincolano il design:** la credenziale è personale, non va nel repo, **non nel browser**, non in MCP pubblici, non nelle demo registrate. Niente scraping massivo, niente ricostruzione di un database, cache solo se serve, retry limitati. Quota e rate limit **non sono pubblici**: li comunica l'organizzatore con la credenziale.
- I modi `integrate`, `plan` e `build` dell'harness sono **esclusi** dall'hackathon.

**Conseguenze:**
1. Backend obbligatorio per chiamare Qloo da un'app ospitata. Next.js route handler/serverless va bene.
2. **Domanda aperta da chiarire subito:** la credenziale dell'evento funziona anche come chiave per chiamate HTTP dirette a `api.qloo.com` da un server pubblico, o solo tramite harness (`qloo exec`)? Il kit parla di "gateway autenticato approvato dagli organizzatori". Va chiesto nel canale/Discord dell'hackathon *prima* di scrivere codice. Se solo l'harness è permesso, il backend deve lanciare `qloo exec` come subprocess o usare `qloo mcp`.
3. Quota ignota ⇒ cache dei risultati per le query demo e un set di casi precalcolati come fallback.

### 2.2 Cosa offre l'Insights API, riletto per TPD

Parametri letti nella deep dive ufficiale. Tutto quanto segue va confermato con la tua chiave.

**Più utile di quanto il brief assumesse:**

| Funzione | Parametro | Perché conta per TPD |
|---|---|---|
| Risolvere il riferimento in un colpo | `signal.interests.entities.query` (POST, array di `{name, address}`, `resolve_to`: place/brand) | Il ristorante dell'utente diventa segnale senza una chiamata di ricerca separata |
| **Segnali di prenotabilità** | `filter.external.exists` = `resy` / `michelin` / `tablet`, più `filter.external.resy.rating.min`, `party_size`, `filter.external.tripadvisor.rating.min`, `rating.count.min` | **Prossimo a un proxy di "prenotabile e valutato"**. Resy presente non significa tavolo libero, ma ti avvicina senza un provider di booking. Testare |
| Orario | `filter.hours` (giorno della settimana) | Filtro "aperto di lunedì" grezzo, non "aperto alle 20:00" |
| Vicinanza | `sort_by=distance` + `filter.location` | "Non lontano da qui" |
| Diversificare | `diversify.by=properties.geocode.city` / `metro`, `diversify.take` | Evita 10 risultati nello stesso quartiere |
| Tendenze | `bias.trends` (off/low/medium/high) | Manopola "più/meno di moda" per categorie supportate. Può realizzare "meno mainstream" meglio di `popularity.max` |
| Pesi | `signal.*.weight`, `tags` con `{tag, weight}` | **Implementazione diretta di Keep/Change**: Keep = peso alto sul tag, Change = tag escluso (`filter.exclude.tags`) o peso basso |
| Esclusioni | `filter.exclude.entities`, `filter.exclude.entities.query` | "Non questo" dopo un rifiuto |
| Spiegazioni | `feature.explainability` | Punteggio 0–1 per entità di input, soglia ≥ 0.1 sempre inclusa. Può fallire con `warning`: gestirlo |
| Tipi | `urn:entity:place`, `destination`, `artist`, `movie`, `book`, `brand`, `podcast`, `tv_show`, `videogame`, `person` | Passport cross-domain + `destination` per la modalità Destination Swap |
| Altro | `signal.demographics.*`, audiences, heatmap (`urn:heatmap`), `analysis/compare`, trending | Heatmap = idea per una vista "dove vivono i tuoi gusti nella città" |

**Prezzo e popolarità:** `filter.price_level` (1–4) e `price_range` solo per i Places; `popularity.min/max` è un percentile 0–1 (popolarità relativa, non folla di oggi). Paginazione: `take` max 50.

**Limiti documentati:** i parametri `external.*` valgono per i Places; la doc stessa è incoerente su `location.radius` (la deep dive sconsiglia di usarlo e preferisce locality o polygon); query o località non riconosciute danno 400; qualche parametro è solo POST. Nessuna disponibilità o prezzo reale.

### 2.3 Cosa il brief diceva e va corretto o affinato

- **Correzione:** per il confine geografico preferire `filter.location.query` (locality) o un POLYGON con `radius=0` per restare *strettamente* nei confini. Il raggio in metri sfoca il confine. Per Phu Quoc, un'isola, questo decide se i risultati escono dall'isola.
- **Novità:** `filter.external.*` (Resy/Michelin/Tablet/Tripadvisor) è un asset che il brief non usa. Per Restaurant Swap può sostituire gran parte dell'arricchimento esterno e dare un segnale di "esiste ed è valutato".
- **Novità:** `bias.trends` + `popularity` + `diversify` sono tre leve distinte per "cambia la notorietà".
- **Conferma:** `explainability` esiste, con le limitazioni che il brief già citava.

### 2.4 Cosa fa ben figurare con un'azienda che è anche giudice

Qloo è sponsor e organizzatore, quindi il punteggio "implementazione tecnica di Qloo" (criterio paritario da brief) premia un uso profondo e leggibile:

1. **Più endpoint, non uno solo:** Insights (place + destination + artist/movie/book), search/tags, analysis/compare, eventualmente heatmap.
2. **Tag e pesi come linguaggio del prodotto:** Keep/Change si traduce in pesi sui tag. Mostrarlo nell'interfaccia (chip tag modificabili) rende visibile l'integrazione.
3. **Explainability in primo piano**, con gestione onesta del caso `warning`.
4. **Cross-domain reale:** il Passport nasce da artista/film/libro e produce posti. È il cuore dell'offerta Qloo (musica → hotel, moda → ristoranti).
5. **Il pannello "Qloo vs LLM-only"** è il pezzo che il tema dell'hackathon chiede esplicitamente.
6. **Guardrail dichiarati** (no scraping, quota, niente dati individuali): citare le linee guida di uso sicuro nel README mostra che si è letto il kit.

### 2.5 Verifica tecnica da fare con la chiave (giorno 1)

Sono 8 query, mezz'ora di lavoro, e decidono lo scope:

1. La credenziale funziona via HTTP diretto o solo via harness? (vedi 2.1)
2. Risoluzione di un ristorante reale a Bangkok per nome + indirizzo: trovato? Quanti candidati restituisce per `place` con `locality=Bangkok`?
3. Stessa cosa per un museo a Parigi. I musei sono entità `place` con tag ricavabili?
4. Phu Quoc: la locality esiste? Quanti place? Se pochi, la storia "Explore Within" va ripensata o spostata su un'altra isola/destinazione di piccola taglia.
5. `filter.external.resy.exists`, `tripadvisor.rating`: quali campi tornano nella risposta, per Bangkok?
6. `explainability`: la risposta contiene dati utili o quasi sempre `warning`?
7. `bias.trends` e `popularity.max`: cambiano davvero la lista?
8. Quota/rate limit effettivi (header o messaggio).

---

## 3. Brainstorming: com'è il prodotto

### 3.1 Tre forme possibili

| | A. **Swap** (focus sulla sostituzione) | B. **Taste Passport portatile** | C. **Concierge widget** |
|---|---|---|---|
| Idea | Parti da un posto che volevi. Keep/Change. Ricevi alternative motivate | Profilo di gusto che ti segue tra ristoranti, musei, destinazioni | Widget per hotel con lo stesso motore |
| Forza | Problema concreto, demo chiara, tesi Qloo vs LLM facile | Mostra il cross-domain di Qloo | Storia di business chiara |
| Debolezza | Un solo "momento" d'uso | Rischio di sembrare un quiz di gusti | Richiede un cliente, fuori dal tempo disponibile |
| Tempo | Fattibile | Fattibile come parte di A | Non fattibile in 11 giorni |

**Raccomandazione: A, con il Passport (B) come motore e C solo come slide di roadmap.** È già la direzione del brief; la ricerca la conferma.

### 3.2 Decisioni di prodotto proposte

**D1. Il gesto centrale è "il posto che volevi non va → trova quello giusto".** L'ingresso è un campo "Cosa volevi?" (nome + città), non una chat vuota. Un agente che parte da una chat generica sembra un altro LLM.

**D2. Keep/Change come tag con peso.** Dopo la risoluzione del riferimento, l'app mostra 4–6 chip derivati dai tag Qloo (cucina, atmosfera, fascia di prezzo, zona). Ogni chip è Keep / Change / Ignora. Tradotto in `signal.interests.tags` con peso e `filter.exclude.tags`. L'interfaccia *è* l'uso di Qloo. Ricalcolo a ogni cambio.

**D3. Tre ruoli di risultato**, come nel brief (Closest cultural match / Best practical match / Unexpected but relevant), ma con una regola: ogni card ha *Why it matches you* (solo da explainability o tag realmente usati), *What's different*, *What we verified*.

**D4. La fiducia è una feature visibile.** Un indicatore su ogni card: "Esiste su Qloo ✓ · Posizione verificata ✓ · Disponibilità: non verificata → Controlla". È la risposta diretta al 55% di raccomandazioni errate.

**D5. Taste Passport leggero.** Si crea in 20 secondi scegliendo 3–5 elementi (un artista, un film, un libro, un posto). Salvato localmente (nessun account) con opzione di esportare. Il momento "wow" è il **Transfer**: stesso Passport, ristorante a Bangkok, poi museo a Parigi.

**D6. Il confronto con l'LLM è una schermata di prodotto**, non solo una nota nel README: toggle "Mostra cosa farebbe un LLM senza Qloo" sulla stessa richiesta, affiancato. Serve a persone e giudici. Va eseguito con una cache per non consumare quota.

**D7. Scope onesto.** Due flussi solidi (Restaurant Swap Bangkok, Culture Swap Parigi), terzo (Phu Quoc) solo se la verifica 2.5 lo regge. Destination Swap fuori dall'MVP, citata nella roadmap.

### 3.3 Idee di differenziazione da valutare (una o due, non tutte)

| Idea | Valore | Costo | Verdetto |
|---|---|---|---|
| **"Perché non quello?"**: per ogni risultato scartato mostra la ragione ("fuori budget Change", "stessa zona") | Trasparenza, forte per i giudici | Basso | **Sì** |
| **Heatmap dei gusti** della città (`urn:heatmap`) come sfondo della mappa | Visuale, usa un endpoint diverso | Medio | Se resta tempo |
| **Cross-domain onboarding**: partire da una canzone e arrivare a un ristorante | Spiega Qloo in 10 secondi | Basso | **Sì**, è l'onboarding |
| **Scheda condivisibile** "Il mio Taste Passport" come immagine | Distribuzione sociale, Qloo la può rilanciare | Basso–medio | Se resta tempo |
| **Modalità "sono qui adesso"** con geolocalizzazione e `sort_by=distance` | Momento d'uso forte | Basso | Sì, un semplice toggle |
| Chat conversazionale libera | Sembra un chatbot generico | Medio | **No**, indebolisce la tesi |
| Itinerari multi-giorno | Fuori scope | Alto | **No** |
| Prenotazione end-to-end | Fuori scope e rischio affidabilità | Alto | **No** |

### 3.4 Rischi principali e come ci si copre

1. **Qloo non restituisce abbastanza per una località:** scegliere le destinazioni demo *dopo* la verifica 2.5, non prima. Phu Quoc è l'ipotesi più rischiosa.
2. **Credenziale solo via harness:** progettare il backend come "adapter" Qloo sostituibile (HTTP o subprocess).
3. **Quota sconosciuta:** cache e fallback precalcolati, nessun polling.
4. **Nessun booking provider:** l'interfaccia non dice mai "prenota ora". Usa "Controlla disponibilità" con link.
5. **"Vibe" vaga:** non esiste un punteggio. Mostra i tag e i segnali effettivi.

### 3.5 Decisioni che servono da te

Sono tre. Le risposte cambiano il piano di lavoro.

1. **Domanda al canale hackathon sull'accesso API** (HTTP diretto o solo harness). La faccio io scrivere come bozza di messaggio oppure la mandi tu?
2. **Prima destinazione demo:** Bangkok + Parigi come nel brief, oppure sostituire Phu Quoc con un'altra isola/destinazione piccola se la verifica dà pochi dati?
3. **Stack:** Next.js + TypeScript su Vercel (consigliato: deploy pubblico immediato, route handler server-side per la chiave) oppure altro?
