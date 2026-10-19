# TPD — Product Vision, Research & Qloo Hackathon Brief

> **Working name:** TPD (nome provvisorio)  
> **Versione:** 1.0 — 19 ottobre 2026  
> **Tipo di documento:** Brief strategico e di prodotto, con ricerca competitiva e proposta MVP  
> **Stato:** Concept da validare; nessun risultato live dell'API Qloo o test utenti è ancora documentato qui.

## Executive summary

**TPD è un motore di scoperta di esperienze alternative basato sui gusti personali.** Non nasce come un altro travel planner che genera itinerari generici e non si limita a proporre città meno famose: parte da un luogo o un'esperienza che la persona desidera e trova alternative che **preservino ciò che ama e cambino ciò che non funziona**.

Esempi:

- A Bangkok un ristorante desiderato è pieno: TPD cerca locali alternativi coerenti non solo per cucina, ma anche per *vibe*, fascia di prezzo, zona e preferenze del viaggiatore. La disponibilità va verificata tramite fonti di prenotazione esterne.
- A Parigi interessa un museo, ma non l'esperienza mainstream: TPD cerca musei, gallerie o mostre culturalmente pertinenti, mantenendo la città come vincolo.
- A Phu Quoc il viaggiatore **vuole restare sull'isola**: TPD esplora esperienze e luoghi alternativi *nella stessa destinazione*, invece di proporre di andare altrove.
- Prima di scegliere una destinazione, TPD può anche suggerire **città o territori alternativi** in base a ciò che piace della destinazione originale: questa funzione è complementare, non l'unico prodotto.

La proposta di valore è racchiusa in una frase, da considerare come **tagline di lavoro**:

> **Keep what you love. Change what doesn't work.**

**Strategia:** costruire per il **Qloo Agentic Hackathon 2026** un'esperienza B2C mobile-first, pubblica e utilizzabile end-to-end, che dimostri il valore delle affinità culturali di Qloo. Disegnare il prodotto e raccogliere segnali di utilizzo in modo che possa evolvere in un'offerta **B2B per hotel, boutique resort, concierge e organizzazioni turistiche**, senza cercare di realizzare già oggi l'intera piattaforma enterprise.

---

## 1. Problema e opportunità

### Il problema non è soltanto “dove andare”

Oggi un viaggiatore può trovare facilmente i “10 migliori ristoranti”, musei molto recensiti o destinazioni popolari. È più difficile rispondere a richieste come:

- «Questo posto sembra esattamente nel mio stile, ma è tutto prenotato: qual è l'alternativa che mantiene le qualità per cui l'avevo scelto?»
- «Mi interessa il tipo di arte, non la folla del museo più famoso.»
- «Sono già qui: fammi scoprire qualcosa di più adatto a me senza cambiare città o isola.»
- «Adoro una certa destinazione per la sua vita culturale e i locali: dove posso trovare una combinazione affine, anche se il luogo è molto diverso?»

Le ricerche convenzionali filtrano spesso per **categoria, prossimità, rating e prezzo**. Le piattaforme di travel AI possono interpretare domande complesse, ma il loro vantaggio dipende dalla qualità delle fonti e della personalizzazione. Un modello linguistico da solo può produrre suggerimenti plausibili senza un segnale fondato sulle affinità culturali.

### Bisogno che TPD vuole coprire

**Sostituire un'esperienza, non semplicemente suggerirne un'altra.** L'utente sceglie che cosa rendere *invariabile* e che cosa *modificare*, mentre l'app usa un profilo personale persistente per distinguere una buona alternativa per quella persona da una proposta genericamente valida.

**Due scale, un unico motore:**

1. **Within destination (priorità MVP):** ristoranti, luoghi culturali ed esperienze alternative nella **stessa città/area/isola**.
2. **Across destinations (estensione):** destinazioni alternative che condividano gli aspetti desiderati di una città o località di partenza.

L'elemento decisivo è che la destinazione **può essere un vincolo non negoziabile**.

---

## 2. Visione di prodotto e posizionamento

### Cos'è TPD

**Categoria proposta:** *Taste-Powered Alternative Discovery Engine*.

TPD mette insieme:

- **Taste Passport:** profilo dinamico di preferenze culturali ed esperienziali;
- **Keep / Change:** controllo esplicito di cosa conservare o modificare;
- **Qloo Taste Graph:** scoperta e ranking di affinità cross-domain (luoghi, artisti, film, libri, destinazioni, brand e altre categorie supportate);
- **Alternative Agent:** ricerca, verifica vincoli, confronto e spiegazione dei suggerimenti;
- **Dati operativi esterni:** orari, posizione, informazioni su prezzi, eventi e prenotazioni quando effettivamente disponibili.

### Cosa NON è

- Non è principalmente un generatore di itinerari completi.
- Non è una lista statica di *hidden gems*.
- Non è un clone di Google Maps con un chatbot.
- Non è un sistema che certifica affollamento o disponibilità senza dati real-time.
- Non è una piattaforma che costringe a cambiare destinazione per trovare alternative.

### Posizionamento suggerito

> **TPD helps travelers find a different place for the same feeling — guided by cultural taste, real-world constraints and clear explanations.**

Il focus competitivo non è “abbiamo più locali di Google” o “abbiamo i segreti dei local”. È **la qualità e la controllabilità della sostituzione**: parto da un'esperienza specifica, dico perché la desidero e ottengo alternative motivate che rispettano il contesto.

### I tre elementi di differenziazione da dimostrare

1. **Reference-based discovery:** si parte da **quel ristorante, museo, evento o luogo** che volevo davvero, non da una keyword generica.
2. **Constraint-aware substitution:** *Keep / Change* distingue vincoli duri (città, budget massimo, data) da preferenze flessibili (atmosfera, notorietà, tipo di esperienza).
3. **Explainable cultural matching:** si rende visibile **perché** un'alternativa è culturalmente affine, **in cosa differisce** e **quali fatti operativi sono stati verificati**.

Queste caratteristiche costituiscono **un'ipotesi di differenziazione**, non una prova che nessun competitor sappia fare qualcosa di simile.

---

## 3. Ricerca di mercato e competitor (verifica del 19 ottobre 2026)

**Lettura generale:** il mercato travel discovery e AI trip planning è **molto competitivo**. Esistono già prodotti funzionanti, con audience, integrazioni, partnership e modelli economici. Lo spazio di TPD non è “AI travel” in generale, ma un workflow di **alternative matching personalizzato e controllabile**. Mancano ancora dati indipendenti per affermare che questo workflow abbia una domanda pagante sufficiente.

| Prodotto | Cosa offre oggi | Perché è rilevante | Gap/opportunità per TPD |
|---|---|---|---|
| **Google Maps / Ask Maps** | Ricerca conversazionale con Gemini, informazioni su luoghi, personalizzazione, foto e recensioni; funzionalità agentiche in evoluzione. | **Il competitor più forte** per dati geografici, aggiornamento e frizione di utilizzo minima. | TPD deve eccellere nel sostituire una **scelta specifica** conservando le qualità desiderate e spiegando i trade-off, non nella ricerca generica di luoghi. [S3] [S4] |
| **Mindtrip** | AI travel planning, itinerari, mappe e strumenti B2B per destinazioni. Partnership con enti turistici, incluso il Norwegian Travel Cluster. | Dimostra domanda industriale per la personalizzazione e una concorrenza B2B già concreta. | TPD si concentra su **alternative contestuali e decisioni puntuali**, non su “plan your whole trip”. [S5] [S6] |
| **Savler** | Suggerisce *destination dupes* di luoghi famosi in base a temi e *vibe*, con itinerari e link affiliate. | **Sovrapposizione diretta** con la prima idea “città alternative”. | Spostare il centro da **città simili** a **esperienze alternative nella stessa destinazione**, mantenendo anche l'uso cross-destination. [S7] |
| **Spotted by Locals** | Guide editoriali scritte da residenti, luoghi meno turistici, salvataggi, accesso a pagamento. | Validazione di una domanda per discovery non-mainstream; esempio di contenuto umano distintivo. | TPD propone matching personalizzato a partire da un riferimento; può integrarsi con contenuti locali, ma non deve fingere di avere la stessa curatela. [S8] |
| **Atlas Obscura** | Catalogo e mappa di oltre 24.000 luoghi insoliti, storie e liste. | Prova che “scoprire l'inatteso” ha un pubblico riconoscibile. | TPD non parte dall'essere insolito: parte dall'essere **adatto ai gusti dell'utente** e al suo problema specifico. [S9] |
| **Tripadvisor** | Catalogo di recensioni, luoghi, attrazioni, prenotazioni e strumenti di pianificazione. | Ampiezza e profondità dei contenuti user-generated. | Non sfidarlo sulla quantità di recensioni; distinguersi su profilo cross-culturale, controllo Keep/Change e evidenze dei risultati. |
| **Beli** | Preferenze e ranking personali nel settore ristorazione. | Il valore di un profilo di gusto alimentato nel tempo è già intuitivo per i consumatori. | Taste Passport opera **tra categorie** e in viaggio; non solo una classifica di ristoranti. |
| **Fever** | Discovery e ticketing di eventi ed esperienze, con catalogo commerciale. | Esiste una domanda per attività locali prenotabili. | TPD non deve essere vincolato al solo inventario del proprio marketplace; deve cercare alternative anche tra provider differenti, con diritti e fonti rispettati. |

### Cosa sappiamo e cosa no

**Segnali verificati:** Google ha lanciato Ask Maps nel marzo 2026; Mindtrip vende già a organizzazioni turistiche; Savler offre una funzione quasi identica alla prima idea delle destination dupes; Spotted by Locals commercializza guide locali; Atlas Obscura pubblica un catalogo ampio. [S3] [S5] [S6] [S7] [S8] [S9]

**Non dimostrato:** che i competitor siano tutti profittevoli, che il mercato per un'app di “replacement discovery” sia grande, o che TPD riesca a superare Google/LLM con dati reali. Questi punti richiedono esperimenti, non storytelling.

### Implicazione strategica

**Da evitare:** “Scopri posti nascosti con AI” e “Scopri città simili a quelle famose”: posizionamenti troppo generici, già occupati.

**Da esplorare:** “Hai già una prima scelta? Trova la sua alternativa giusta **per te**, mantenendo intenzioni e vincoli”. È un prodotto pensato per una decisione, non per generare un elenco.

---

## 4. Il ruolo reale di Qloo

Qloo è la **ragione tecnica del prodotto**, non un semplice plugin al chatbot. L'Insights API può classificare entità sulla base di segnali di gusto, recuperare luoghi geolocalizzati e applicare filtri; non è, da sola, un database universale di disponibilità o prezzi in tempo reale. La documentazione pubblica Qloo e lo starter kit ufficiale sono le fonti principali. [S10] [S11] [S12]

### Capacità documentate da valorizzare

| Bisogno TPD | Componente Qloo | Cosa significa e limite |
|---|---|---|
| Trovare un'alternativa affine a un luogo | `signal.interests.entities` e `filter.type=urn:entity:place` | Ricerca di candidati culturalmente affini, non garanzia di atmosfera identica. |
| Incrociare i gusti del Passport | Interessi su più entità / tag | Affinità cross-domain: libri, artisti, film, brand, luoghi ecc. I segnali devono essere entità/tag riconosciuti da Qloo. |
| Restare nella stessa città/area | `filter.location`, `filter.location.query`, `filter.location.radius` | Il raggio usa metri; bisogna verificare i confini della località e la copertura reale. |
| Cercare luoghi meno noti | `filter.popularity.max` | Popolarità relativa, **non** affollamento in tempo reale o assenza di turisti. |
| Preservare una fascia di prezzo ristorante | `filter.price_level.min` / `.max` (1–4) | Fascia indicativa, **non** prezzo esatto del menu; il parametro si applica ai luoghi supportati. |
| Spiegare i suggerimenti | `feature.explainability=true` | Metadati di contributo dei segnali **quando calcolabili**; non inventare spiegazioni causali o percentuali. |
| Escludere risultati già visti/rifiutati | `filter.exclude.entities` | Evita di ripresentare luoghi scartati; le esclusioni esplicite dell'utente vanno gestite anche dall'app. |

> **Da verificare immediatamente:** compatibilità esatta dei parametri con le credenziali **dell'hackathon**, copertura di Bangkok, Parigi e Phu Quoc, tipi di luoghi museali rappresentati, qualità delle classifiche e metadati effettivamente restituiti. Le capacità della documentazione generale non garantiscono risultati uguali per ogni tipologia o località.

### Divisione delle responsabilità

| Sistema | Responsabilità | Non deve pretendere di fare |
|---|---|---|
| **Qloo** | Taste matching, affinità, ricerca cross-domain, filtri culturali e geografici, metadati | Confermare affollamento attuale, tavoli disponibili, durata code, prezzi esatti |
| **LLM / agente** | Interpretare richiesta, costruire query Qloo, scomporre Keep/Change, confrontare evidenze e spiegare | Inventare locali, dati, orari o risultati Qloo |
| **Places / dati geospaziali** | Identità e posizione dei luoghi, orari, rating, informazioni pratiche quando presenti | Garantire che le recensioni descrivano tutta l'esperienza o che i dati siano sempre freschi |
| **Event provider** | Eventi effettivi, date, sedi e link biglietti | Coprire tutti gli eventi indipendenti di ogni città |
| **Booking provider** | Disponibilità e prenotazioni effettive **solo se integrate e autorizzate** | Presumere un tavolo libero sulla base di una semplice scheda del ristorante |
| **TPD** | Taste Passport, vincoli, ranking composito, feedback, stato della verifica, UX | Presentare una singola *vibe score* come misura scientifica |

**Fonti/API candidate:** Google Places per POI, orari e price level; Ticketmaster Discovery per una parte degli eventi. Le integrazioni vanno verificate per costi, licenze, quote, attribuzioni, caching e copertura geografica. [S13] [S14]

---

## 5. Il prodotto B2C: esperienza utente

### 5.1 Taste Passport

Un profilo opzionale, costruito progressivamente con **pochi input di alta qualità**:

- Luoghi, ristoranti e destinazioni apprezzati;
- Film, musicisti, libri, brand e interessi culturali riconosciuti da Qloo;
- Preferenze contestuali: serata elegante vs pranzo informale, arte contemporanea vs storia, zone vive vs tranquille;
- Segnali positivi, negativi e feedback sulle alternative proposte;
- Vincoli pratici che non sono gusti culturali (budget, distanze, mobilità, dieta, data).

**Principio:** il Passport deve distinguere gusti stabili e preferenze del momento. Una persona può amare hotel di design e ristoranti locali semplici senza essere “incoerente”.

**Cold start:** consentire una prima ricerca con 1–3 riferimenti, senza un onboarding lungo o account obbligatorio. Registrazione solo quando serve salvare e ritrovare il Passport.

### 5.2 Keep / Change — Interazione centrale

L'utente parte da un luogo o un'esperienza e marca ciò che vuole:

- **KEEP:** categoria / tipo di esperienza, gusto culturale, stile, fascia prezzo, zona, orario, specifici elementi della *vibe*;
- **CHANGE:** notorietà, distanza, livello di formalità, prezzo, specifici aspetti estetici o logistici;
- **MUST:** vincoli non negoziabili, per esempio *restare a Phu Quoc*, *aperto stasera*, *budget massimo*, *accessibile*;
- **NICE TO HAVE:** elementi desiderabili ma sacrificabili.

Gli attributi non supportati da Qloo vanno applicati con dati esterni o lasciati esplicitamente non verificati.

### 5.3 Tre risultati con logiche diverse (non tre sinonimi)

Invece di una lista di 20 card indistinguibili, la UX può evidenziare:

1. **Closest cultural match** — massima coerenza con riferimento e Taste Passport;
2. **Best practical match** — miglior compromesso con tempo, budget, distanza e orari verificati;
3. **Unexpected but relevant** — scoperta meno ovvia che conserva le caratteristiche essenziali.

Ogni proposta espone tre sezioni:

- **Why it matches you:** segnali Qloo e preferenze del Passport realmente utilizzati;
- **What's different:** differenze reali rispetto alla scelta originale;
- **What we verified:** fonti, orario della verifica, informazioni confermate e aspetti non verificati.

Non mostrare “96% vibe match” o “80% meno affollato” senza un metodo misurabile documentato.

### 5.4 Flusso agente, dall'input all'azione

```text
Utente: luogo di partenza + città + Keep/Change + vincoli
        |
        v
Intent & constraint parser
        |
        v
Entity resolution (Qloo / POI data) ----> reference not found? chiedi conferma
        |
        v
Cultural candidate retrieval (Qloo Insights)
        |
        v
Candidate enrichment (Places / Events / booking if supported)
        |
        v
Hard-constraint validation + deduplication + ranking
        |
        v
Alternative cards with provenance & uncertainty
        |
        +--> user tweaks Keep/Change --> rerank / new Qloo request
        |
        +--> save / maps / ticket or reservation link
        |
        +--> feedback to improve Passport
```

**Comportamento agentico autentico:** l'agente non si limita a rispondere con testo: pianifica le chiamate, interpreta risultati strutturati, elimina opzioni incompatibili, decide quando serve un controllo aggiuntivo, segnala incertezza e aggiorna la ricerca quando cambiano i vincoli. Non effettua acquisti o prenotazioni senza azione esplicita dell'utente.

---

## 6. Tre scenari dimostrativi

### A. Restaurant Swap — Bangkok

**Prompt utente:** «Volevo andare da questo ristorante stasera, ma non c'è posto. Trova qualcosa di simile per atmosfera, cucina e prezzo, preferibilmente non lontano».

**Come funziona:** riconoscere il ristorante → risolverne l'entità Qloo → cercare luoghi affini nella stessa area → tenere conto dei segnali Passport → controllare cucina, prezzo, distanza e orari da altre fonti → mostrare alternative motivate.

**Punto critico:** “ristorante simile” e “ristorante disponibile oggi alle 20:00” sono domande diverse. Solo un provider di booking può confermare la seconda. In sua assenza, l'azione corretta è **Check availability**, non **Book now** con orario presunto.

### B. Museum / Culture Swap — Parigi

**Prompt utente:** «Mi interessa questo museo, ma non voglio un'esperienza mainstream o troppo affollata».

**Come funziona:** comprendere il contenuto artistico desiderato → cercare luoghi culturalmente affini entro la città → dare preferenza a opzioni meno popolari, se il filtro funziona → arricchire con orari, mostre ed eventi disponibili da fonti autorizzate.

**Punto critico:** popolarità bassa ≠ poca folla oggi; e mostre temporanee ≠ entità sempre coperte da Qloo.

### C. Explore Within — Phu Quoc

**Prompt utente:** «Vado a Phu Quoc e ci voglio restare. Trovami spiagge, ristoranti ed esperienze nello stile che piace a me».

**Come funziona:** destinazione fissa → ricerca territoriale e ranking sul Passport → filtro per tipologia, tempi di spostamento e vincoli → mappa di alternative.

**Punto critico:** non assumere una copertura Qloo uniforme rispetto a città più grandi; se il catalogo Qloo è scarso, presentare risultati basati su altre fonti con etichettatura chiara, **senza attribuire a Qloo un matching mai avvenuto**.

### D. Destination Swap — fase successiva

**Prompt utente:** «Adoro questa destinazione per i suoi locali e l'arte, ma cerco un'alternativa».

È una seconda modalità, non la storia principale dell'MVP. Richiede fonti aggiuntive per prezzi, stagionalità, infrastruttura e sovraffollamento.

---

## 7. MVP per il Qloo Agentic Hackathon 2026

### Informazioni ufficiali

- **Evento:** [Qloo Agentic Hackathon — “Agents, but with taste”](https://qloo.devpost.com/). [S1]
- **Periodo submission:** 30 settembre – **30 ottobre 2026 alle 23:45 EDT**, cioè **31 ottobre alle 04:45 a Copenhagen** (dopo il passaggio all'ora solare europea). Verificare sempre il countdown ufficiale. [S2]
- **Premi:** $15.000 primo, $6.000 secondo, $4.000 terzo = **$25.000 in premi cash**. [S1]
- **Possibilità aggiuntiva:** Jason Calacanis ha annunciato l'intenzione di **investire $25.000 nel suo progetto preferito**; investimento separato, **non un premio cash garantito**, condizioni non pubblicate. [S1]
- **Criteri paritari:** implementazione tecnica di Qloo; design; impatto concreto; qualità/originalità dell'idea. [S2]
- **Richiesto:** app funzionante e ospitata pubblicamente, URL demo, repository pubblico con codice/istruzioni e licenza open source, descrizione testuale; materiali di submission in inglese. **Il video non è obbligatorio.** [S1] [S2]
- **Tema:** il progetto deve funzionare **meglio grazie al cultural grounding di Qloo**; un LLM generico non deve essere un sostituto equivalente. [S1]
- **Periodo giudizio:** 2–16 novembre 2026; annuncio intorno al 23 novembre 2026. [S2]

### Obiettivo della demo

Dimostrare in modo **misurabile e intuitivo** che TPD trova alternative più pertinenti e controllabili grazie a Qloo rispetto a una ricerca generica.

### Scope raccomandato (MVP)

**Must have:**

1. Web app mobile-first, senza login obbligatorio per provare la demo.
2. Taste Passport minimo: 3–5 segnali selezionabili e riutilizzabili fra ricerche.
3. Ricerca di un **luogo specifico** come riferimento.
4. Interfaccia **Keep / Change**, più vincoli duri (stessa città, budget, data se rilevante).
5. **Restaurant Swap** funzionante con risultati veri (Qloo + arricchimento fonte esterna).
6. **Culture / POI Swap** nella stessa città, almeno per luoghi permanenti compatibili con la copertura API.
7. Alternative motivate, mappa/link al luogo, distinzione fra dati verificati e non verificati.
8. Possibilità di cambiare un attributo e **far ricalcolare le alternative**.
9. Stato di caricamento, gestione errori, nessun risultato, rate limit e fallback trasparente.
10. Un mini **Qloo vs LLM-only comparison** su casi selezionati e riproducibili.

**Should have, solo se i dati reggono:**

- Terzo scenario Phu Quoc come prova della funzionalità “stay within destination”.
- Event discovery con un provider reale e link al biglietto.
- Persistenza opzionale del Passport e salvataggio preferiti.

**Fuori scope hackathon:**

- Booking end-to-end universale, pagamenti, marketplace e inventario proprietario;
- Planner multi-giorno completo, collaborazione di gruppo;
- Previsioni di affollamento real-time non supportate;
- White-label B2B completo, dashboard DMO e analytics enterprise;
- Destinazioni alternative su scala mondiale senza test della qualità.

### Storytelling della demo

1. **Cold start:** selezione di un artista, film o luogo preferito; TPD crea un Passport iniziale.
2. **Reference:** scelgo un ristorante famoso di Bangkok che non posso usare.
3. **Keep / Change:** mantengo atmosfera e budget, cambio posizione e disponibilità; la disponibilità viene etichettata **non verificata** se manca il provider di prenotazione.
4. **Qloo discovery:** vedo come i segnali culturali influenzano il ranking, senza simulare metadata inesistenti.
5. **Comparison:** tolgo un vincolo o rifiuto una proposta, e l'agente cerca alternative nuove.
6. **Transfer:** uso **lo stesso Passport** per trovare un museo alternativo a Parigi; la dimostrazione evidenzia la natura cross-domain di Qloo.

**Per Qloo come sponsor:** questo è un esempio facilmente raccontabile sui social: “Un gusto culturale, molte esperienze del mondo reale; un agente che mantiene ciò che ami quando la tua prima scelta non funziona”.

### Benchmark minimo contro LLM-only

- Preparare **15–20 richieste test** su Bangkok, Parigi e una destinazione meno coperta, con vincoli equivalenti.
- Tre condizioni: ricerca categoria/prossimità, LLM + informazioni pubbliche senza Qloo, TPD con Qloo.
- Valutazione umana possibilmente **cieca** su pertinenza, originalità utile, rispetto dei vincoli e credibilità delle spiegazioni.
- Misurare inoltre tasso di risultati validi, percentuale di vincoli soddisfatti, latenza e costo per ricerca.
- **Non** usare numeri o vittorie inventate: la superiorità va mostrata con risultati verificabili; considerare anche i casi in cui Qloo non aggiunge valore.

---

## 8. Architettura tecnica proposta

**Stack suggerito, non obbligatorio:** Next.js / React + TypeScript, backend server-side, database Postgres o Supabase per profili e feedback, Qloo API lato server; un LLM per orchestrazione strutturata e spiegazioni; Google Maps/Places o altra fonte POI licenziata; provider eventi opzionale.

```text
Mobile-first UI
  ├── Taste Passport
  ├── Keep / Change
  ├── Results + Map + Evidence
  └── Saved / Feedback
         |
         v
Backend Agent Orchestrator
  ├── Intent + hard constraints parser
  ├── Qloo entity resolution / taste retrieval
  ├── Qloo Insights ranking
  ├── POI / events / booking adapters
  ├── Evidence + freshness validation
  ├── Composite ranking (hard constraints first)
  └── Provenance + explanation generator
         |
         v
Database (consented preferences, saved searches, feedback,
         source timestamps; no unnecessary personal profiling)
```

### Principi di implementazione

- **Server-side key:** chiave Qloo solo sul backend; non nelle variabili esposte al browser né nel repo.
- **No hallucinated POIs:** ogni luogo deve avere un ID e fonte riconoscibile.
- **No fake realtime:** disponibilità, code e popolarità live solo se provenienti da sistemi che realmente le attestano.
- **Strict geographic scope:** se la persona dice Phu Quoc, non mostrare suggerimenti fuori dall'isola; verificare coordinate/limiti.
- **Hard vs soft constraints:** i vincoli duri filtrano prima del ranking, non si compensano con un buon punteggio Qloo.
- **Explainability grounded:** mostrare input e metadati Qloo soltanto quando presenti; altrimenti descrivere chiaramente un'interpretazione dell'agente.
- **Tolleranza ai fallimenti:** no-results, risposte incomplete, quota esaurita e luogo non trovato devono essere stati di UX previsti.
- **Feedback:** salvataggi, scarti e modifiche dei vincoli migliorano il Passport, ma vanno trattati nel rispetto della privacy.

**Operatività API:** l'hackathon richiede credenziali specifiche. Lo starter kit ufficiale Qloo e le note sull'accesso chiariscono l'uso delle credenziali attribuibili, delle quote e della sicurezza. Non assumere che l'accesso gratuito dell'hackathon sia disponibile commercialmente dopo l'evento. [S11] [S12]

---

## 9. Verso una startup: B2C ora, B2B dopo

### Perché il B2C è la prima fase giusta per l'hackathon

- Mostra Qloo **direttamente all'utente**: gusti, affinità, confronto prima/dopo.
- È relativamente rapido da provare con persone esterne, senza vendere il prodotto a un'azienda.
- Consente una demo breve, sorprendente e visuale.
- Può raccogliere segnali utili su ricerche, destinazioni e tipologie di alternative **senza vendere dati personali**.

**Limite:** la domanda B2C può essere episodica (solo in viaggio) e gli utenti possono preferire Google Maps, che già hanno installato. Questo è un rischio serio per retention e monetizzazione.

### Evoluzione B2B plausibile: TPD for Hospitality & Destinations

**A. Boutique hotels / resort / concierge.** Un *alternative experience concierge*: ospiti che non trovano posto nel ristorante desiderato o cercano qualcosa di meno mainstream ricevono proposte compatibili, nel contesto di strutture e destinazioni. Integrazione via widget o link brandizzato.

**B. Destination Marketing Organizations (DMO).** Un motore di discovery che presenta esperienze diverse a viaggiatori con interessi diversi, permettendo di esplorare il territorio oltre i luoghi più famosi. Il cliente controlla catalogo e contenuti territoriali; report su coinvolgimento e referral aggregati.

**C. Agenzie travel specializzate.** Strumento di *alternative matching* per rimpiazzare attività non disponibili o proporre varianti coerenti con il gusto del cliente, integrabile nel loro workflow.

**Evidenza di mercato:** Mindtrip offre già prodotti per le DMO e dichiara partnership negli USA e in Europa, inclusa una rete norvegese di 29 organizzazioni. Qloo mostra pubblicamente il caso Michelin/Tablet Hotels per raccomandazioni travel personalizzate. Sono segnali che il B2B è concreto, **ma anche che esistono competitor ben posizionati**. [S5] [S6] [S15]

### Strategia commerciale ipotetica

| Modello | Valore per il cliente | Stato |
|---|---|---|
| **B2C gratuito** | Accesso alla discovery; crescita e test di uso ripetuto | Ipotesi di lancio |
| **Referral / affiliate** | Ricavo da click o prenotazioni su partner autorizzati | Dipende da partner, attribuzione e conversione |
| **B2B widget per hotel** | Concierge personalizzato senza costruire un motore interno | Da validare con 3–5 strutture pilota |
| **Licenza DMO / enterprise** | Esperienza di discovery e analytics aggregati | Roadmap, non scope hackathon |
| **API/SDK in futuro** | Alternative matching come modulo integrabile | Solo dopo validazione di domanda e costi API |

**Da NON affermare in pitch:** “Il B2B è validato solo perché esiste Mindtrip” oppure “abbiamo un mercato infinito”. In pitch serve distinguere chiaramente prova di fattibilità, interesse cliente, disponibilità a pagare e ricavi reali.

### Metriche di validazione per un investitore

1. **Activation:** percentuale di nuovi utenti che arrivano a una ricerca conclusa.
2. **Alternative acceptance:** percentuale di sessioni in cui si salva, apre indicazioni o visita il sito di almeno un risultato.
3. **Constraint satisfaction:** quante raccomandazioni rispettano davvero luogo, orario, budget e vincoli scelti.
4. **Repeat use:** utenti che tornano per una seconda categoria/destinazione.
5. **Qloo uplift:** differenza nella qualità percepita rispetto al benchmark senza Qloo.
6. **B2B intent:** interviste/lettere d'interesse/pilot con hotel o DMO.
7. **Unit economics:** costo API per ricerca, costo acquisizione utenti/clienti, potenziale conversione partner.

---

## 10. Rischi e decisioni aperte

| Rischio | Gravità | Mitigazione |
|---|---|---|
| Google Ask Maps integra una funzione simile | Alta | Specializzazione sul reference-based matching + Keep/Change + Passport cross-domain; misurare differenza reale. |
| Qloo copre in modo non uniforme destinazioni minori | Alta | Benchmark per città; fallback dichiarato; scegliere demo con copertura sufficiente. |
| Qloo non conosce il singolo evento / mostra temporanea | Alta | Fonte eventi separata; non spacciare matching del luogo per matching dell'evento. |
| Dati non aggiornati su orari/disponibilità | Alta | Timestamp, link al provider, verifiche live autorizzate, stati “da verificare”. |
| La parola *vibe* resta vaga | Media | Trasformarla in fattori descrivibili (ambiente, volume, formalità, prezzo, tema culturale) con evidenze. |
| Scarsa volontà di pagare lato B2C | Alta | B2C come discovery/validazione, B2B dopo segnali reali di valore. |
| Costi e termini delle API | Alta | Test quote, cache consentita, attribuzioni e controllo billing; design modulare dei provider. |
| Privacy / GDPR in Europa | Alta | Minimizzazione dati, consenso, opzioni eliminazione Passport, niente rivendita dati individuali. |
| “Hidden gems” sposta il sovraffollamento altrove | Media | Non spingere luoghi fragili o non attrezzati; non promettere impatto sostenibile senza dati. |
| Futura startup vs repo open-source hackathon | Media | Valore nel prodotto, brand, integrazioni, learning e distribuzione; gestione corretta licenze. |

### Questioni da risolvere prima del codice esteso

- Chiave dell'hackathon attiva e limiti effettivi?
- Quanti risultati Qloo utili produce per **Bangkok, Parigi e Phu Quoc**?
- I risultati POI Qloo si possono risolvere in modo affidabile contro un provider di Places?
- Qual è il provider minimo di eventi disponibile per la demo?
- Il primo caso d'uso deve promettere *disponibilità adesso* o soltanto alternative culturalmente rilevanti con link di verifica?
- Quante persone preferiscono le alternative Qloo rispetto al benchmark su test ciechi?
- Quale segmento B2B accetta di testare un widget (hotel/resort vs DMO)?

---

## 11. Roadmap di lavoro suggerita (19–30 ottobre 2026)

| Fase | Obiettivo | Deliverable |
|---|---|---|
| **19–20 ottobre** | Verifica tecnica e qualità dati | API Qloo attiva, set di 20 query test, copertura città, primi confronti con LLM-only |
| **21–23 ottobre** | Motore core | Taste Passport, entity resolution, Keep/Change, Qloo retrieval, vincoli geografici |
| **24–26 ottobre** | Esperienza end-to-end | Restaurant Swap, Culture Swap, risultati spiegabili, mappa/link e stati errore |
| **27–28 ottobre** | Qualità e prove | Test utenti, benchmark, review di quote/licenze, casi no-result e fallback |
| **29–30 ottobre** | Submission | Deploy pubblico, repository open source, README, istruzioni, descrizione in inglese e test finale |

Priorità: **meglio due flussi reali e solidi che dieci schermate demo con suggerimenti fittizi.**

---

## 12. Pitch di lavoro

### One-liner

> **TPD finds the right alternative when the place you wanted doesn't work — preserving what you love and changing what you don't.**

### Short pitch per hackathon (inglese, da rifinire)

> Travel discovery is great at showing the most popular places. It's worse at understanding *why* you wanted a specific place — and finding a meaningful alternative when it's too crowded, fully booked or simply not right for you. TPD is a taste-powered alternative discovery agent. Tell it what you wanted, what you want to keep and what you need to change. Using Qloo's cross-domain cultural affinities alongside verified location and experience data, TPD finds alternatives that make sense for your personal taste, whether you're exploring another city or staying exactly where you are.

### Tesi da dimostrare, non da assumere

> **Qloo turns a generic “find something similar” search into an evidence-backed, personalized alternative matching experience across different cultural domains.**

Il prodotto deve **mostrarlo** nel confronto con un'esperienza LLM-only; non basta dichiararlo nella descrizione.

---

## Fonti e riferimenti principali

_Fonti consultate o ricontrollate il 19 ottobre 2026. I dati di adozione e i risultati commerciali dichiarati dalle aziende sono da trattare come claim delle rispettive aziende, non come verifiche indipendenti._

- **[S1]** [Qloo Agentic Hackathon — overview, challenge, premi e bonus investment](https://qloo.devpost.com/)
- **[S2]** [Qloo Agentic Hackathon — regolamento, criteri, submission, date](https://qloo.devpost.com/rules)
- **[S3]** [Google — Ask Maps, lancio 12 marzo 2026](https://blog.google/products-and-platforms/products/maps/ask-maps-immersive-navigation/)
- **[S4]** [Google — aggiornamento agentico Ask Maps, agosto 2026](https://blog.google/products-and-platforms/products/maps/order-food-in-ask-maps/)
- **[S5]** [Mindtrip — prodotto per le destinazioni](https://mindtrip.ai/business/destinations)
- **[S6]** [Mindtrip — partnership Norway by Locals, 14 ottobre 2026](https://mindtrip.ai/press/mindtrip-partners-with-norway-by-locals-to-power-ai-driven-discovery-across-norways-29-destination-regions)
- **[S7]** [Savler — destination dupes, come funziona](https://savler.vercel.app/)
- **[S8]** [Spotted by Locals — modello e prezzi](https://www.spottedbylocals.com/pricing/)
- **[S9]** [Atlas Obscura — app e catalogo luoghi](https://app.atlasobscura.com/)
- **[S10]** [Qloo — Insights API Deep Dive, parametri e explainability](https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md)
- **[S11]** [Qloo — Hackathon starter kit ufficiale](https://github.com/qloo/qloo-hackathon-kit)
- **[S12]** [Qloo — API Access and Limits per hackathon](https://github.com/qloo/qloo-hackathon-kit/blob/main/docs/API_ACCESS.md)
- **[S13]** [Google Places API — data model e campi](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places)
- **[S14]** [Ticketmaster — Discovery API](https://developer.ticketmaster.com/products-and-docs/apis/discovery/)
- **[S15]** [Qloo — caso Michelin, personalizzazione travel](https://www.qloo.com/capabilities/recommendations)
- **[S16]** [Qloo — use case cold start con pochi segnali](https://www.qloo.com/use-cases/overcome-cold-start-challenges)
- **[S17]** [Mindtrip — partner Visit Santa Fe (caso B2B)](https://mindtrip.ai/press/visit-santa-fe-partners-with-mindtrip-to-incorporate-new-ai-discovery-tool-on-santafeorg)

---

**Conclusione:** il valore di TPD non è avere “più mete” o generare “più consigli”, ma **ridurre l'attrito quando un'esperienza desiderata non è possibile o non è ideale**. Per l'hackathon il proof point dev'essere tangibile: un Taste Passport, un riferimento preciso, un controllo Keep/Change, dati Qloo reali e alternative verificabili. Il futuro B2B diventa credibile se da questo comportamento emerge un motore che hotel e destinazioni sarebbero disposti a integrare e pagare.
