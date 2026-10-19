# TPD — Guida API Qloo, piattaforme in Asia e strategia di verifica (19 ottobre 2026)

**Cosa ho interpretato come "il problema" (punto 1):** nessuna singola fonte copre eventi, attività e disponibilità nelle sei destinazioni (Portogallo, Francia, Spagna, Vietnam, Giappone, New York). Ticketmaster è debole in Asia e nessun provider dà la disponibilità reale dei ristoranti. Se intendevi un altro problema, dimmelo e rivedo la sezione 3.

Legenda delle fonti: **[verificato]** = letto in una pagina ufficiale o in una ricerca di oggi; **[ricerca]** = da articoli o directory di terze parti; **[conoscenza]** = mia conoscenza generale, non verificata oggi.

---

## 1. Cosa dice la guida ufficiale Qloo per l'hackathon

Fonte: `docs.qloo.com/reference/qloo-llm-hackathon-developer-guide` [verificato].

### Accesso
- Chiave richiesta con un modulo, inviata per email "entro pochi giorni lavorativi". Valida **solo** sull'URL base dell'hackathon e attiva fino alla fine del giudizio.
- **URL base:** `https://hackathon.api.qloo.com`. Le chiavi dell'hackathon non funzionano su staging o produzione, e l'URL sbagliato è "la causa più comune dei 401".
- **Header:** `X-Api-Key: <chiave>`. `Authorization: Bearer` e la chiave in query string sono indicati come errati.
- **Chiamate HTTP dirette sono previste** (esempio `curl` e `requests` nella guida). Questo risolve in gran parte la domanda aperta del documento 01: **non serve passare dall'harness `@qloo/qloo-harness`**. Resta valido il divieto di mettere la chiave nel browser o nel repo, quindi la chiamata avviene dal backend. Conferma finale quando arriva la chiave.
- **Limiti:** nessun numero pubblicato; "abbastanza alti per i progetti tipici". Si può chiedere di più su `#api-help` nel Discord dell'hackathon con i dettagli del progetto.

### Endpoint e tipi
- `GET /v2/insights` (principale), `GET /search` (ID entità da un nome), `GET /v2/tags` (ID dei tag). `/recommendations` e `/recs` sono legacy e **non** supportati.
- `filter.type` supportati: `urn:entity:artist`, `book`, `brand`, `destination`, `movie`, `person`, `place`, `podcast`, `tv_show`, `video_game`. Un 403 indica un tipo non supportato.
- **Differenza dalla deep dive:** nella guida dell'hackathon **non compare `urn:heatmap`**, e il tipo è scritto `video_game`. Il documento 01 e il documento 02 citavano gli heatmap come possibile estensione: va considerato non disponibile finché non è provato.
- Cibo e bevande: `urn:entity:place` oppure `urn:entity:brand`.

### Trappole documentate
- **I parametri non validi vengono ignorati in silenzio.** Un risultato vuoto o sospettosamente generico può significare che un filtro non è stato applicato. Va sempre controllato che la risposta rifletta i parametri inviati.
- I parametri validi dipendono da `filter.type` (c'è un "Entity Type Parameter Guide").
- Tag e audience devono essere ID o URN validi, non stringhe libere (quindi `/search` e `/v2/tags` fanno parte del flusso).
- La risposta è sempre completa: non si possono ridurre i campi.

### Dati e cache
- Cache privata lato server **consentita senza limiti di tempo**.
- **Non salvare le risposte Qloo in un repository pubblico.** Questo incide sul progetto: il repository deve essere pubblico con licenza open source, quindi i casi precalcolati per il confronto Qloo vs LLM e le fixture della demo **non possono essere committati**. Vanno in un database privato (o in una cache lato server) e il repository contiene solo gli script per rigenerarli.

### Cosa la guida NON dice
La pagina non elenca quali dati ci siano per ristoranti, hotel, eventi, né la copertura geografica. Dice solo che "l'ambiente dell'hackathon potrebbe non avere dati per ogni entità o regione" e che per i dettagli bisogna chiedere su `#api-help`.

**Quindi la risposta alla tua domanda è no: non dice quali dati Qloo ha a disposizione per Asia, hotel o eventi.** Si scopre in due modi: chiedendolo su `#api-help` e provando le query con la chiave.

### Messaggio da inviare su #api-help (bozza in inglese)
> Hi! We're building a taste-based "alternative discovery" app. Before we commit scope, could you tell us (1) which categories have data in the hackathon environment for `urn:entity:place` — restaurants, bars, hotels, museums, attractions, neighborhoods; (2) how deep the coverage is for Japan (Tokyo/Kyoto/Osaka), Vietnam (Hanoi/Ho Chi Minh City/Da Nang), New York, Paris, Lisbon/Porto and Barcelona/Madrid; (3) whether `filter.external.exists` (Resy/Michelin) e filtri rating Tripadvisor documentati, `bias.trends`, `diversify.*` and `explainability` are enabled for hackathon keys; (4) whether events or shows exist as entities; (5) current rate limits for our key. Thanks!

---

## 2. Piattaforme in Asia (al posto di Ticketmaster)

**Non ho trovato nessuna API pubblica per i grandi servizi di biglietteria in Giappone o per Ticketbox in Vietnam.** Il confronto qui sotto è per questo motivo diviso tra "esiste un'API accessibile" e "esiste solo come destinazione di un link".

### Giappone
| Categoria | Piattaforme | API accessibile? |
|---|---|---|
| Concerti, teatro, sport | Ticket Pia, e+ (eplus), Lawson Ticket, Rakuten Ticket [ricerca] | **Nessuna API pubblica trovata.** Per gli acquirenti stranieri sono note frizioni: carte estere, verifica telefonica, lotterie di prevendita, ritiro al konbini [ricerca] |
| Eventi e incontri | Peatix (27 paesi, fortissima in Giappone; ricerca per categoria solo per Giappone, Singapore e Malesia) [ricerca] | Nessuna API ufficiale trovata; esistono scraper di terzi, da **non** usare (vedi sotto) |
| Esperienze, tour, biglietti attrazioni | Klook, KKday, Veltra, Asoview, GetYourGuide, Viator [ricerca] | Viator e GetYourGuide hanno API partner (sezione 3). Klook: affiliazione con deep link; l'accesso API è incerto |
| Ristoranti | Tabelog, TableCheck, Gurunavi, Omakase [conoscenza] | **TableCheck ha un'API REST documentata** (usata in oltre 3.000 ristoranti in 20+ paesi); le regole di accesso non sono chiare [ricerca]. Per gli altri non ho verificato nulla |

### Vietnam
| Categoria | Piattaforme | API accessibile? |
|---|---|---|
| Eventi, concerti | Ticketbox [ricerca] | **Nessuna API o affiliazione pubblica trovata**; l'accesso andrebbe chiesto all'azienda |
| Esperienze e tour | Klook (affiliazione, Vietnam tra i paesi promossi), Viator, GetYourGuide [ricerca]; Traveloka [conoscenza] | Come sopra |
| Ristoranti | Nessuna piattaforma di prenotazione dominante verificata | — |

### Klook: cosa sappiamo
- Programma di affiliazione a pagamento per vendita (CPS): commissioni "dal 2% al 20% a seconda della categoria", con cookie di 7–30 giorni a seconda della fonte; deep link e banner consentiti [ricerca; le fonti non concordano sui numeri].
- Un articolo del 2019 sostiene che Klook non dava API agli OTA; esiste una pagina di terzi su una "Partner API" e un caso giapponese di connessione API lato fornitore [ricerca, datata o commerciale]. **Va verificato direttamente con Klook.**

### Una regola da fissare
Esistono scraper a pagamento (Apify) per Peatix, Klook, Viator e GetYourGuide. **Non vanno usati**: violano probabilmente i termini d'uso di quelle piattaforme, e il regolamento Qloo vieta lo scraping massivo per le sue API. Sarebbe un rischio inutile per un progetto pubblico e open source.

---

## 3. Come risolvere il problema: una "scala di verifica"

### Il principio
Non cercare una fonte che copra tutto: **ogni risultato dichiara fino a che livello è stato verificato**, e l'app usa il livello più alto che la combinazione destinazione + categoria permette. Questo è coerente con il dato più forte della ricerca di mercato: il 55% degli utenti AI ha ricevuto almeno un consiglio errato o inesistente [Greetwell 2026].

| Livello | Cosa significa | Fonte | Etichetta nell'app |
|---|---|---|---|
| **L0** | Esiste in Qloo e corrisponde ai gusti | Qloo | "Consigliato per il tuo gusto" |
| **L1** | Identità, posizione e stato verificati; orari della settimana | Google Places (`businessStatus`, `currentOpeningHours`, `regularOpeningHours`, `googleMapsUri`, `websiteUri`, `reservable`) [verificato] | "Esiste, aperto di martedì" |
| **L2** | Esiste una pagina dove controllare o prenotare | Sito del luogo o ricerca/deep link del provider del paese | "Controlla disponibilità su …" |
| **L3** | Disponibilità/prezzo dal provider | Solo dove un'API reale lo permette (es. tour Viator) | "Disponibile il 12 novembre da €…" |

Alcuni limiti di Google Places [verificato]: `reservable` dice solo se il luogo accetta prenotazioni, **non se ci sono posti liberi**; le recensioni sono al massimo cinque; **non c'è un campo per un link di prenotazione**; gli orari possono essere obsoleti. Quindi per i ristoranti in nessuna destinazione si arriva a L3, e l'app non deve mai scrivere "prenota" né "disponibile".

### Dove si può arrivare a L3
**Viator** [ricerca, da confermare nella documentazione ufficiale]:
- Tre livelli di accesso affiliato. **Basic** è immediato, senza approvazione, e include contenuti e disponibilità dei prodotti; il cliente completa l'acquisto su viator.com.
- **Full** (recensioni, foto, disponibilità in tempo reale) e **Full + Booking** richiedono approvazione e certificazione.
- Copre Giappone, Vietnam, Europa e New York. È quindi la strada più concreta per "attività ed escursioni" in tutte le destinazioni.
- Aggiunge un modello di ricavo realistico (commissione per vendita), utile come risposta alla domanda sulla monetizzazione B2C.

**GetYourGuide** [ricerca]: specifica OpenAPI pubblica su GitHub, ma l'accesso live richiede registrazione e certificazione in più fasi, e i termini limitano l'uso dei contenuti. In 11 giorni è meno realistico di Viator.

**Ticketmaster Discovery** [conoscenza + brief]: eventi con date e link per USA ed Europa. La copertura per Portogallo, Francia e Spagna va controllata paese per paese prima di promettere nulla.

### Matrice proposta per l'MVP (da correggere dopo le query Qloo)
| | Ristoranti/bar | Musei/cultura | Hotel | Quartieri | Attività/escursioni | Spettacoli/eventi |
|---|---|---|---|---|---|---|
| **New York** | Qloo + Places (L1–L2) | Qloo + Places | Qloo + Places | Qloo | Viator (L3) | **Ticketmaster** |
| **Francia / Parigi** | idem | idem | idem | Qloo | Viator | Ticketmaster (da verificare) |
| **Spagna** | idem | idem | idem | Qloo | Viator | Ticketmaster (da verificare) |
| **Portogallo** | idem | idem | idem | Qloo | Viator | Da verificare / link |
| **Giappone** | Qloo + Places; link TableCheck/Tabelog | idem | idem | Qloo | Viator (L3) | **Link a Peatix/e+/Pia; nessun dato live** |
| **Vietnam** | Qloo + Places | idem | idem | Qloo | Viator (L3) | **Nessun dato live; link a Ticketbox** |

### Tre decisioni di prodotto che ne discendono
1. **Registro "paese × categoria → provider".** Un file di configurazione che dice, per ogni coppia, quale provider usare e con che modello (API, deep link, nessuno). Se un'integrazione cade, si cambia una riga. Lo stesso registro alimenta l'etichetta di verifica nell'interfaccia.
2. **Gli "spettacoli" in Asia non sono concerti.** Per Giappone e Vietnam la categoria diventa "esperienze culturali dal vivo" (spettacoli tradizionali, tour a tema, workshop) prese da Viator, perché la biglietteria locale non è accessibile. Il concerto resta un link di uscita, dichiarato come tale.
3. **Onestà come funzione.** Dove il livello massimo è L1/L2 la card lo dice in modo sobrio: "Verificato: esiste e orari. Non verificato: disponibilità". È coerente con il tono giocoso solo se l'etichetta resta precisa.

### Opzioni che scarto, con motivo
- **Ricerca web dell'LLM per riempire i buchi:** riporta il rischio di luoghi o date inventati, cioè il problema che il prodotto vuole risolvere.
- **Scraper di terzi (Peatix, Klook, Viator, GetYourGuide):** rischio sui termini d'uso e sul regolamento.
- **Promettere disponibilità dei ristoranti:** nessun accesso reale a Resy (nessuna documentazione pubblica per sviluppatori) né a OpenTable (programma affiliato con approvazione di 3–4 settimane) [ricerca]. TheFork e TableCheck richiedono credenziali emesse dalle aziende.

### Rischio residuo
Tutta la tabella dipende da due cose che non conosco ancora: **quanti dati ha Qloo per Giappone e Vietnam** e **se Viator Basic è davvero attivabile in giornata**. Il piano di fallback, se Qloo ha pochi dati in Asia, è limitare Asia a due città (Tokyo e Hanoi o Ho Chi Minh) e dichiararlo, oppure portare Giappone e Vietnam a "prova di concetto" e fare il grosso della demo su New York e sull'Europa.

---

## 4. Impatto sui documenti precedenti

- **Doc 01, sezione 2.1:** l'accesso è **HTTP diretto** su `hackathon.api.qloo.com` con `X-Api-Key`; l'harness resta opzionale.
- **Doc 01 e 02:** `urn:heatmap` **non è nell'elenco dei tipi supportati**; i riferimenti agli heatmap diventano "forse".
- **Doc 02, tensione 2 e 4:** sostituite dalla scala di verifica e dalla matrice di questo documento.
- **Nuovo vincolo:** le risposte Qloo non si salvano nel repository pubblico (cache e fixture in un database privato).

---

## 5. Decisioni prese (19 ottobre 2026)

| Tema | Decisione |
|---|---|
| Eventi in Giappone e Vietnam | "Spettacoli" = **esperienze culturali dal vivo prenotabili via Viator** (L3). I concerti restano **link di uscita** (Peatix, e+, Ticketbox), dichiarati non verificati |
| Monetizzazione | **Link affiliati dichiarati** (Viator Basic, eventualmente Klook) con nota visibile. Primo ricavo B2C da citare nel pitch. Consiglio: aggiungere in README che il ranking non dipende dalla commissione, e rendere vera l'affermazione nel codice |
| Fallback Asia | Se Qloo ha pochi dati: **2 città** (Tokyo + Hanoi o Ho Chi Minh), dichiarate; il grosso della demo su New York ed Europa |

### Prossimi passi
1. Inviare il messaggio su `#api-help` (bozza nella sezione 1).
2. Registrarsi a Viator Affiliate Basic e verificare che l'endpoint di ricerca e disponibilità funzioni per Tokyo, Hanoi, Parigi, Lisbona, Barcellona, New York.
3. All'arrivo della chiave Qloo: le 8 query del documento 01 (sezione 2.5), adesso su `hackathon.api.qloo.com`.
4. Verificare la copertura Ticketmaster per Portogallo, Francia e Spagna.
5. Decidere città definitive per ogni paese in base ai risultati.

## Verifica del 20 ottobre

Guida hackathon riletta integralmente e accesso HTTP provato. Insights richiede GET; risoluzione riferimento tramite `/search`, poi ID. Per Resy usare `filter.external.exists=resy`, non `filter.external.resy.exists=true`. Stato e limiti delle query in `docs/08-qloo-verification.md`; copertura definitiva ancora aperta.
