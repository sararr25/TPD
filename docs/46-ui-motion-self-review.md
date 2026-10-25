# Auto-review UI e motion — 25 ottobre 2026

Versione recensita: `b6795cd`, ramo locale `codex/twin-motion-ux`.
Skill applicate: top-design e gpt-taste. Stato: feedback, nessuna correzione
applicativa eseguita in questo passaggio. Questa è un'auto-review dell'integratore,
non sostituisce la review indipendente rimasta aperta nel precedente receipt.

## Verdetto

**6,2/10.** L'identità Passport è riconoscibile e il percorso Twin è più chiaro.
L'esperienza ha ancora un livello di composizione e motion prevalentemente
funzionale. Il valore della scoperta non produce ancora un momento distintivo.
Il superamento dei test precedenti dimostra comportamento, non qualità estetica.

| Categoria top-design | Voto | Peso | Valutazione |
|---|---:|---:|---|
| Tipografia | 7,0 | 25% | Serif/sans coerenti, H1 in due righe; manca contrasto di scala nei momenti decisivi |
| Composizione | 5,5 | 25% | Passport desktop convincente; mobile lungo, molta ripetizione, featured match poco distinto |
| Motion e interazione | 5,0 | 20% | Parallasse e reveal esistono; sequenza mobile parzialmente fuori campo, poca narrazione |
| Colore e atmosfera | 8,0 | 15% | Berry, lemon, carta e inchiostro hanno identità; uso degli accenti poco gerarchizzato |
| Dettagli e craft | 5,5 | 15% | Focus/esiti curati; instabilità al caricamento, foto disomogenee, controlli troppo uniformi |

Calcolo ponderato: 6,15, arrotondato a 6,2. È un giudizio progettuale, non una
misura statistica né una certificazione Awwwards.

## Metodo e limiti

- Nuova ispezione della build compilata locale a **1440×900** e **390×844**.
- Nuovi screenshot, registrazioni, percorso iniziale/scroll, editor, attesa,
  successo, altri match, Passport e Saved. Verifica sorgente per City/Place e
  comportamento degli eventi. Non ho eseguito una nuova visita interattiva a
  ogni Place reale né un nuovo controllo completo degli eventi in questa review.
- Contesti browser nuovi, account guest, preferiti/riferimento/risultati
  **sintetici dichiarati**. Tutte le API personali/discovery intercettate: nessuna
  scrittura reale, nessuna ricerca Qloo live o accesso al Passport dell'owner.
- Foto delle città: asset CDN effettivamente usati dall'app. Le foto dei risultati
  sintetici riusano un'immagine nota: non giudicare la varietà dei veri risultati
  da queste fixture. La diversità/qualità delle cover città è invece osservabile.
- Evidenza privata in `.private/design-self-review/`: screenshot, due video,
  `measurements.json` e `initial-load-stability.json`. Non pubblicare questi
  asset nel repository o su issue pubbliche.
- Stabilità iniziale: due caricamenti desktop e uno mobile, osservazione di
  3,5 secondi, senza input e separata dagli screenshot full-page. È un controllo
  locale con fixture; non è un audit field, Lighthouse o una prova di 60fps.
- Nessuna prova nuova su telefono fisico o screen reader. I dati fixture non
  dimostrano qualità del ranking, varietà effettiva o disponibilità dei luoghi.

## Feedback prioritario

### F01 · P1 · La CTA Home mobile nasce sotto la barra inferiore

**Evidenza.** A 390×844 la cover misura circa 740px e parte a y=153. Il gruppo
di ingresso finisce a circa y=826, mentre la barra inferiore comincia intorno a
788. Lo screenshot `home-390-600.png` mostra il pulsante Open the city solo in
parte. Non è irraggiungibile: diventa leggibile scorrendo. Ma il primo viewport
non consegna una CTA completa.

**Effetto.** Il simbolo Passport occupa il centro, mentre l'azione utile viene
spinta al limite dello schermo. La prima impressione privilegia la decorazione.

**Intervento.** Alleggerire lo spazio verticale prima del form; ridurre il ruolo
centrale dell'emblema; fare entrare titolo, promessa, ingresso e CTA completa
nell'area realmente disponibile. Conservare carta/rilegatura e font approvati.

**Accettazione.** A 375×812 e 390×844, CTA interamente sopra la barra senza scroll
iniziale, font normali, tastiera chiusa; testo 200% ancora raggiungibile senza
compressione forzata.

**Sorgente.** `src/styles/home.css:608`, `src/styles/home.css:638`.

### F02 · P1 · La coreografia più interessante termina fuori campo su mobile

**Evidenza.** La pagina esempio inizia a **y≈893**, sotto il viewport da 844px.
La timeline fa partire pagina a 0,18s, bookmark a 0,4s e timbro a 0,8s; termina
intorno a 1,25s, indipendentemente dalla visibilità. Quando si arriva alla pagina
esempio, questi momenti sono già finiti. È distinto dai reveal condivisi, che
usano effettivamente l'intersezione.

**Effetto.** Il codice è più animato di quanto l'esperienza mobile faccia vedere.
La parte più riconoscibile della sequenza manca per chi inizia dal telefono.

**Intervento.** Separare l'ingresso della cover da quello della pagina esempio;
attivare quest'ultima alla prima visibilità. Disegnare mobile e desktop con tempi
propri, mantenendo un unico racconto. Non riattivare tutto a ogni scroll.

**Accettazione.** Registrazione mobile: bookmark e timbro iniziano mentre sono
visibili; si eseguono una sola volta; reduced motion conserva la pagina completa.

**Sorgente.** `src/components/home-passport-motion.tsx:22`.

### F03 · P1 · Il caricamento non è abbastanza stabile per sembrare rifinito

**Evidenza.** Due osservazioni desktop danno una somma locale dei layout shift
senza input di **0,669** e **0,459**; mobile **0,045**. In entrambe le prove
desktop il placeholder `.meta` dell'accesso si sposta da x≈204 a x≈1353 e
l'header passa da 58 a 69px. In una prova si muove anche il footer quando il
contenuto principale sostituisce il fallback. Font/testi producono contributi
molto più piccoli nelle stesse tracce.

**Effetto.** Un salto strutturale compete con la coreografia voluta. La sensazione
può essere di caricamento che si assesta, anziché di movimento intenzionale.

**Intervento.** Riservare da subito altezza dell'header, spazio della navigazione
e slot auth allineato a destra. Usare un fallback principale con ingombro coerente.
La separazione delle cause va confermata con regressione prima della modifica:
i dati provano gli spostamenti, non una diagnosi completa di tutta la pipeline.

**Accettazione.** Caricamenti freddi desktop ripetuti con traccia delle sorgenti;
nessun cambio di posizione del controllo auth; nessun salto del footer attraverso
il viewport. Target indicativo CLS ≤0,1, poi verifica su rete/device realistici.

**Sorgente.** `src/components/auth-button.tsx:42`, `src/app/layout.tsx:50`,
`src/app/layout.tsx:55`, `src/styles/shell.css:4`.

### F04 · P1 · Il miglior match ha meno forza visiva degli altri

**Evidenza.** Sotto 600px `.twin-spotlight .place-photo` è `display:none`.
Scorrendo agli altri match, le loro foto tornano grandi e dominanti. Il primo
match è una normale card testuale, seguita da una barra lemon più evidente delle
azioni Save/hide. Screenshot `twin-390-result.png` e `twin-390-other.png`.

**Effetto.** Il risultato dichiarato più forte sembra meno desiderabile delle
alternative. Il comando più evidente invita ad abbandonarlo, mentre Save resta
un'icona piccola all'interno di una fascia molto larga.

**Intervento.** Una vera card featured compatta: piccola foto significativa,
nome, motivo concreto, prezzo e un'azione Save esplicita. Dare al risultato il
massimo rilievo; See other matches deve restare chiaro ma subordinato.

**Accettazione.** Il match principale si distingue dalle alternative anche senza
leggere il badge. Foto, nome, motivo e azione entrano nel viewport mobile senza
ripristinare una card alta quanto lo schermo.

**Sorgente.** `src/styles/swap.css:166`, `src/styles/swap.css:174`,
`src/styles/swap.css:187`, `src/components/swap-workspace.tsx:486`.

### F05 · P1 · Manca una scena che racconti perché due posti sono twin

**Evidenza.** La hero combina ingressi y/opacity, piccola rotazione della pagina,
emblema e timbro. I reveal successivi riusano sostanzialmente la stessa grammatica
24px/opacity e wipe fotografico. Nel matching, DNA è soprattutto una frase di
attesa; il collegamento tra tratti selezionati e risultato non viene mostrato.

**Effetto.** I singoli movimenti decorano un'identità già presente, ma non
costruiscono ancora una scoperta specifica di Beesyde.

**Intervento.** Progettare una sola scena distintiva: i tratti scelti si collegano
al match, si evidenziano le somiglianze verificate e compare una differenza chiara.
La geometria può venire dalle linee di sicurezza del Passport. Dare un picco
visivo al momento dell'esito, con il resto della pagina più quieto.

**Accettazione.** In una breve registrazione si capisce il legame tra input e
output senza leggere tutti i dettagli. Nessuna compatibilità percentuale inventata,
nessun risultato finto e nessun blocco dell'interazione in attesa dell'animazione.

**Sorgente.** `src/components/home-passport-motion.tsx:19`,
`src/components/travel-motion.tsx:34`, `src/components/swap-workspace.tsx:514`.

### F06 · P2 · La Home mobile è molto lunga prima di tornare a Twin

**Evidenza.** La pagina catturata misura circa **7.373px**. La sola griglia città
mostra undici card da 238px con gap da 16px, oltre **2.770px**: più di tre
viewport prima delle altre sezioni. Il percorso resta una successione di blocchi
con peso simile. Questa misura dipende dalla fixture e dal viewport, non dal
traffico reale.

**Intervento.** Home con 3–4 città curate e accesso evidente a tutte le undici;
lista completa in Cities. Portare la dimostrazione Twin prima del catalogo lungo.
Alternare una sezione densa a un momento breve di racconto.

**Accettazione.** Un visitatore incontra la prova del valore di Twin nei primi
2–3 viewport utili; l'accesso a ogni città rimane immediato.

**Sorgente.** `src/components/home-cities.tsx:19`, `src/styles/home.css:634`.

### F07 · P2 · La griglia è dense, ma ha comunque un vuoto finale

**Evidenza.** Desktop: quattro colonne, prima card 2×2, altre dieci card 1×1.
Sono **14 celle occupate** in una struttura che ne richiede 16, quindi restano
**due celle vuote** in fondo. `grid-auto-flow:dense` è già presente e non risolve
questa aritmetica. Non è necessariamente un difetto per una lista dinamica, ma
nella Home editoriale il vuoto non comunica una scelta precisa.

**Intervento.** Comporre l'ultima riga con uno span motivato, oppure una chiusura
utile del catalogo; evitare riempitivi decorativi. Verificare anche i filtri regione.

**Accettazione.** La griglia Home termina con un equilibrio intenzionale a ogni
breakpoint e insieme filtrato, senza imporre la simmetria al contenuto.

**Sorgente.** `src/styles/home.css:458`, `src/styles/home.css:476`.

### F08 · P2 · Ignore domina un editor che dovrebbe valorizzare le preferenze

**Evidenza.** Sei tratti producono **18 pulsanti** più CTA. Tutti gli Ignore
default sono pieni berry, lo stesso trattamento di Keep/Delete selezionati.
L'editor è più corto del precedente, ma la ripetizione di pillole pesa ancora.

**Intervento.** Segmented control più unitario; Ignore selezionato in tono neutro,
Keep con accento positivo e Delete con segno di esclusione comprensibile, senza
affidare l'informazione solo al colore. Conservare i tre stati espliciti richiesti
dall'owner e aree di almeno 44px.

**Accettazione.** A colpo d'occhio si leggono le scelte attive; i default non
sembrano sei azioni primarie. I nomi Keep/Delete/Ignore restano invariati.

**Sorgente.** `src/styles/swap.css:151`, `src/styles/swap.css:155`.

### F09 · P2 · Le fotografie delle città non hanno una direzione abbastanza uniforme

**Evidenza.** Le cover reali mostrano una qualità disomogenea: sul grande frame
Parigi compare un watermark; Porto appare poco nitida; tagli e soggetti variano
tra interni, monumenti e scorci. Il fallback Phu Quoc è un pannello di colore
pieno. La review non stabilisce i diritti di riuso delle singole fotografie.

**Intervento.** Curare un set con risoluzione adeguata al crop, soggetto
riconoscibile, punto focale e trattamento tonale coerente; dichiarare i fallback.
Mantenere immagini vere della città e provenienza verificabile.

**Accettazione.** Nessun watermark che interferisca con la card, niente immagini
sgranate al display previsto, fallback riconoscibile come stato progettato.

**Sorgente.** `src/lib/city-covers.ts:2`, `src/components/home-cities.tsx:55`.

### F10 · P2 · Il parallasse esiste, ma da solo non dà profondità al Passport

**Evidenza.** Il movimento massimo è ±18px desktop e ±8px mobile, applicato
alla foto. Testo, bookmark e linework non hanno una relazione di scroll tra loro.
Su mobile la variazione effettivamente vista in una porzione dello scroll è
ancora minore dei 16px complessivi. L'effetto è leggero, non assente.

**Intervento.** Differenziare due o tre livelli decorativi nella scena principale,
con velocità motivate e overscan. Conservare testo e controlli stabili. Usare
progressione lineare per lo scrub è corretto: non è un difetto da eliminare
solo perché una skill sconsiglia genericamente il linear easing.

**Accettazione.** La profondità si percepisce a velocità di scroll normale senza
misurare i pixel; non emergono bordi vuoti e reduced motion è statico.

**Sorgente.** `src/components/travel-motion.tsx:20`.

### F11 · P2 · Il passaggio ricerca → esito è un cambio di pannello poco raccordato

**Evidenza.** L'editor viene nascosto subito e lo scroll viene normalizzato con
un salto istantaneo; durante l'attesa appare uno skeleton generico, poi una card
con reveal. Il risultato rimane visibile e il focus è gestito: il problema è
il raccordo percettivo, non la perdita dell'esito.

**Intervento.** Conservare un piccolo riepilogo visivo del riferimento mentre
si cerca; far evolvere quell'area verso il match. Breve transizione con geometria
stabile, distinguendo searching/success/empty/error; niente animazioni di durata
fissa che ritardano risposte già pronte.

**Accettazione.** Il visitatore capisce che il risultato deriva dalla ricerca
appena inviata; nessun salto inatteso, focus e freccia restano corretti.

**Sorgente.** `src/components/swap-workspace.tsx:180`,
`src/components/swap-workspace.tsx:516`.

### F12 · P2 · Events sembra una categoria Twin, ma apre un altro tipo di esperienza

**Evidenza.** Events compare accanto a Restaurants/Bars/Cafés nello stesso gruppo,
ma apre browsing municipale datato, con copertura Paris-only, senza matching
Twin. Il comportamento è dichiarato nel testo: non è nascosto, ma arriva dopo
aver scelto la categoria.

**Intervento.** Segnalare prima del click la natura e la copertura: per esempio
Events · Paris pilot; rendere distinguibili ricerca di luoghi e agenda. Nella
città non coperta, offrire un passaggio diretto al pilot e all'agenda ufficiale.

**Accettazione.** Nessuna aspettativa di trovare il twin di un evento usando
lo stesso confronto tra locali, finché quel contratto non esiste.

**Sorgente.** `src/components/swap-workspace.tsx:137`,
`src/components/events-explorer.tsx:42`.

## Cosa conservare

- Coppia Instrument Serif/Hanken Grotesk, H1 in due righe e palette berry/lemon.
  A 1440px H1=74px, body=16px; a 390px H1≈41px, body=15px: leggibili e coerenti.
- Passport desktop aperto come oggetto unitario; timbri e rilegatura sono elementi
  identitari approvati, non badge casuali da eliminare per una regola generica.
- Risultato immediato, conteggio chiaro, freccia esplicita e focus del nuovo titolo.
- Esclusioni/preferenze oneste, prezzi indicativi, dati ignoti dichiarati.
- Reduced motion e controlli utilizzabili durante le animazioni.
- Passport e Saved hanno un linguaggio coerente; Saved vuoto offre un'azione
  concreta. Le pagine di servizio beneficiano di motion più sobria della Home.

## Roadmap progettuale per salire di livello

1. **Prima stabilità e primo viewport:** F01, F02, F03. Nessun effetto aggiuntivo
   può compensare una CTA parzialmente nascosta o un movimento strutturale involontario.
2. **Poi il momento distintivo:** F04, F05, F11. Fare del risultato Twin la scena
   principale, con una relazione visiva chiara tra gusti, città e luogo.
3. **Infine ritmo e craft:** F06–F10 e F12. Curatela immagini, densità e controllo
   degli accenti; utilità preservata.

Per puntare a 9–10/10 servono una scena riconoscibile, gerarchia impeccabile,
mobile disegnato come esperienza propria e performance/accessibilità misurate
su device reali. Aggiungere pinning, un cursore custom, una libreria smooth-scroll
o testo gigantesco non costituisce automaticamente un miglioramento. Il brief
è un prodotto di scoperta e un Passport approvato: la qualità va costruita lì.

## Interpretazione delle skill

I criteri di gerarchia, composizione, ritmo, qualità degli asset e motion sono
applicati alla review. Le prescrizioni per generare nuovo codice/layout casuale
di gpt-taste non si applicano a questo lavoro di valutazione. Nessun layout,
font o palette è stato sorteggiato o sostituito; nessun codice UI è stato scritto.
Non sono state applicate le indicazioni che confliggono con le decisioni owner
(timbri Passport, font approvati e compattezza delle pagine operative).
