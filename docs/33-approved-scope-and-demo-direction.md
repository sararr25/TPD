# Beesyde — perimetro approvato e direzione demo

24 ottobre 2026. Continua l'analisi in [docs/30](30-site-evaluation.md) e il
[piano di valutazione](31-evaluation-plan.md). Baseline letta: `1022c80`.
Branch di release confermato su GitHub; nessuna issue aperta al controllo.

## Autorizzazione ricevuta

L'owner approva: continuità City/Place/ritorno; navigazione coerente; compattezza
mobile; immagini trasparenti; approfondimento e correzione del Passport; verifiche.
Aggiunge due richieste: catalogo curato per le undici città della demo, con Neon;
Home meno generica, con mini presentazione iniziale e animazioni GSAP allo scroll.
Il 24 ottobre l'owner ha accettato la proposta dettagliata e richiesto di
registrarne i prossimi passi nell'[handover corrente](28-handover.md). Storyboard
Home e pilota Lisbon sono approvati come direzione; restano l'anteprima privata
e l'approvazione dello schema/storage produzione prima della relativa applicazione.
Nessun codice applicativo è ancora cambiato.

## Pacchetto A — continuità e leggibilità già approvate

- Ripristinare categoria, filtri per categoria, tab, List/Map e punto di lettura
  dopo la visita di un luogo. Separare link interno e Back/Forward. Conservare
  stato di navigazione soltanto, senza nuovi dati personali o schema database.
- Riconoscere la città nei percorsi annidati e rendere coerente la selezione
  Cities/Swap. Apertura Swap nella città nota; scelta città se non nota.
- Copertina cittadina più breve su mobile, gerarchia per titoli lunghi, azioni
  principali più vicine al nome. Conservare il nome completo e la leggibilità.
- Distinguere foto reale luogo, cover città e placeholder; regola coerente fra
  card, dettaglio e Saved. Non presentare un'immagine generica come prova del luogo.
- Accettazione: ritorno con criteri invariati, navigazione attiva coerente,
  nessun overflow a 320/390/768/1440 px, tastiera e reduced motion verificati.

## Pacchetto B — Passport: prima diagnosi, poi soluzione

### Riscontri sorgente, non diagnosi di perdita dati

- `PassportBuilder` carica quiz e preferiti tramite API separate e inizializza
  l'ingresso da localStorage prima di avere completato il caricamento account.
- Il profilo grafico deriva dalle risposte al quiz; i suggerimenti basati su
  preferiti richiedono almeno tre selezioni. Timbri e feedback sono altre risorse.
- `saveUserPassport` accetta da zero a cinque preferiti; un account con zero
  preferiti può quindi essere valido, anche se ha un profilo quiz visibile.
- `finishQuiz` scrive localmente e poi salva account Passport e quiz con due
  operazioni sequenziali. Il successo parziale è un caso da riprodurre.
- L'adozione di un esempio chiama la stessa funzione di salvataggio dei preferiti.
  L'anteprima dell'esempio e la sostituzione dei gusti personali vanno distinte.

Questi riscontri spiegano perché non basta cambiare una scritta; non dimostrano
la causa dei preferiti vuoti nell'account osservato. Nessuna nuova lettura di
record personali o modifica dell'account è stata effettuata per questo documento.

### Diagnosi da eseguire

Costruire una riproduzione al confine UI/API usando fixture non personali:
guest nuovo, guest con quiz, account con quiz e zero preferiti, 1–2 preferiti,
3–5 preferiti, risposta account ritardata, errore fra i due salvataggi, esempio
aperto da profilo esistente. Stabilire prima una verifica che fallisca sul sintomo
specifico; poi formulare e confrontare ipotesi. La diagnosi non è ancora conclusa.

### Comportamento desiderato approvato come obiettivo

| Stato | Cosa vede la persona | Azione |
|---|---|---|
| Caricamento account | Stato neutro di caricamento; nessun quiz avviato per errore | Attendere o riprovare in caso di errore |
| Nuovo | Funzione del Passport e quiz di 18 domande | Make your Passport |
| Quiz presente, meno di 3 preferiti | Profilo conservato e spiegazione di ciò che manca | Completare i preferiti senza rifare tutto |
| Pronto | Profilo, gusti e accesso ai suggerimenti personali | Aprire una città |
| Salvataggio in corso / parziale | Distinzione fra copia browser e copia account | Riprovare il passaggio fallito conservando i dati |
| Esempio | Preview dichiarata, separata dal Passport personale | Provare i risultati; adozione soltanto esplicita |

La stessa definizione di stato deve guidare Passport, City, Place e Home.
I timbri descrivono l'attività, non certificano che i gusti siano completi.
L'eventuale necessità di un endpoint atomico va valutata dopo il repro, senza
modifiche schema preventive. Le prove copriranno account switch e sync oltre
allo stato felice; nessun ripristino inventato di preferiti mancanti.

## Pacchetto C — Home: mini racconto allo scroll

Proposta: una composizione editoriale aperta, con spazio, fotografia e tipografia;
le card restano per i luoghi, ma non ogni frase viene chiusa in un riquadro.
Palette, font e due promesse del prodotto rimangono quelli approvati.

1. **Your taste.** Un Passport si apre; tre gusti e un timbro lo compongono.
   Per nuovi visitatori è un esempio dichiarato; per chi ha un profilo pronto
   può usare i propri dati senza renderli pubblici o inviarli a nuove fonti.
2. **Your city.** La composizione si trasforma in una città e pochi luoghi reali,
   spiegando il legame con i gusti quando esiste evidenza.
3. **Your next place.** Un luogo diventa il punto di partenza e si affianca
   un'alternativa con Keep/Change: il prodotto si capisce vedendolo funzionare.

GSAP + ScrollTrigger per una timeline breve; ingresso prodotto disponibile
subito e collegamento per saltare la presentazione. Scroll nativo, nessun
preloader obbligatorio. Su mobile scene più corte e meno elementi simultanei;
con reduced motion versione statica completa. Cleanup alla navigazione e
fallback leggibile se script o dati non arrivano. Nessuna foto generata di
un locale presentata come foto reale. Nessun feed di risultati finti.

Accettazione proposta: scena leggibile senza animazione, entrate City/Swap
sempre raggiungibili, zero overflow, focus stabile, nessun contenuto critico
bloccato in attesa del provider; valutazione del carico aggiunto prima del deploy.
La proposta visiva va mostrata in un'anteprima privata prima della sostituzione
 della Home pubblica. Questa descrizione è uno storyboard, non un mockup approvato.

## Pacchetto D — catalogo della demo

### Proposta

Un catalogo privato delle undici città, deduplicato per ID provider, con:
identità, città/categoria, indirizzo e coordinate quando presenti, attributi
supportati, data/fonte, stato di controllo editoriale, qualità della foto e
riferimento all'immagine. Metadati in Neon Postgres; eventuali file in Object
Storage se disponibile sul progetto, altrimenti mantenere gli URL consentiti
finché non viene scelta e approvata una gestione dei file.

Obiettivo iniziale proposto: **30–50 luoghi per città**, distribuiti fra categorie,
zone e fasce di prezzo quando il catalogo lo permette; fino a 330–550 luoghi
complessivi. Numeri di lavoro, non copertura già misurata. Le categorie con
pochi dati non vanno riempite con luoghi fuori tema: in particolare non
inventare musei nelle città in cui la copertura è assente.

È una base curata per stabilità e qualità visiva, non un censimento completo.
Gli abbinamenti personali restano guidati dal motore di gusto corrente; il
catalogo non deve congelare gli stessi suggerimenti per tutti né introdurre
fallback silenziosi spacciati per raccomandazioni live.

### Sequenza

1. Inventario delle proiezioni già disponibili nella cache privata e della
   copertura storica; conteggi aggregati, senza esportare record account.
2. Pilota Lisbon: 30–50 luoghi come obiettivo, deduplica e controllo immagini.
3. Mostrare qualità, categorie coperte e quantità di integrazioni necessarie.
4. Presentare schema minimo, eventuale bucket, costo/quota e politica aggiornamento.
5. Approvazione della modifica produzione; poi estensione alle altre dieci città.

Non scaricare o ripubblicare immagini provider senza verificare le condizioni
applicabili. Il repo pubblico contiene solo logica e schema, non dump grezzi.
La cache esistente `provider_cache` è temporanea: non va trasformata in un
catalogo editoriale cambiandone implicitamente il significato.

## Riferimenti verificati

- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [GSAP React e cleanup](https://gsap.com/resources/React/)
- [Neon: file in Object Storage, metadati in Postgres](https://neon.com/blog/building-a-private-searchable-photo-library-on-the-neon-backend)
- [Qloo: parametri di filtraggio geografico](https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md)
- [Copertura storica del progetto](18-destination-coverage.md): snapshot del
  20–21 ottobre, utile per pianificare e non promosso a conteggio attuale.

## Ordine di consegna

Prima diagnosi Passport e pacchetto A; quindi anteprima Home e pilota catalogo;
poi implementazione Passport coerente con il risultato della diagnosi; infine
verifica integrata. Lavori indipendenti possono avanzare mentre si raccolgono
le verifiche e l’approvazione della modifica produzione. Nessun nuovo schema, bucket o import massivo
è stato eseguito da questo documento.
