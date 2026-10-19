# TPD: ricerca per la direzione di design

**Data:** 19 ottobre 2026
**Scopo:** fare un passo indietro sul design prima di disegnare le schermate. Analizzo i riferimenti scelti, cerco agenzie piccole e medie bold e creative, mappo i prodotti simili a TPD e propongo un moodboard fatto di design esistenti.
**Metodo:** ogni sito è stato aperto in un browser vero (Chromium, 1440×900) e fotografato. Colori e font vengono dagli stili calcolati della pagina, non sono stimati a occhio. Dove un sito bloccava il browser automatico (Cloudflare o Vercel) lo segnalo e non invento ciò che non ho visto.

> Gli screenshot non sono nel repository, perché sono materiale di terzi e il repo sarà pubblico. Restano nella sessione di lavoro e si rigenerano dagli URL elencati qui.

---

## 1. I tuoi riferimenti, uno per uno

| Riferimento | Cosa si vede davvero | Cosa prendere per TPD | Cosa lasciare |
|---|---|---|---|
| **[Dribbble, "Travel Agency Website" di Imran Hossen](https://dribbble.com/shots/27636900-Travel-Agency-Website)** ("AIVENTURE") | Palette salvia e verde scuro (`#A0B1AE`, `#255246`, `#091413`). Titolo in maiuscolo molto pesante, foto ritagliata con una forma morbida, dati sovrapposti alla foto (rischio, km, best route), nav a pillole con icona. | L'idea di **mettere i dati sopra l'immagine** come etichette leggere. I chip di funzione in fondo alla pagina. | Il badge **"92% Match"**, che va contro la decisione 3.13 (niente punteggi non spiegabili). Il look "AI dashboard" in glassmorphism, già visto ovunque. È un concept Dribbble, non un prodotto. |
| **[Studio Ping Pong](https://studiopingpong.com/)** (Bengaluru e Kolkata, "tiny-mighty") | Giallo pieno `#FFD60D` in apertura, palline da ping pong che compongono il nome, poi la pagina passa a crema `#FFFFF3`. Tre font: **Obviously Narrow** per i titoli, **Degular Mono** per etichette e filtri, **Dejanire** serif per i testi. Sticker "TAP FOR A BIG WIN". | Il sistema a **tre voci tipografiche**: display per l'emozione, mono per i fatti, serif per il racconto. Le etichette mono in pillola ("FOOD & BEVERAGE") sono quasi identiche a quelle che servono per categorie e livelli di verifica. Gli sticker cliccabili come premio. | La home senza testo leggibile al primo colpo: funziona per uno studio, non per un'app dove un giudice deve capire in 5 secondi. |
| **[Dropbox Brand, Voice & Tone](https://brand.dropbox.com/voice-and-tone)** | Fondo quasi nero, **griglia visibile** a linee sottili, titolo enorme in **Sharp Grotesk**, blocchi di colore pieni (giallo `#FAD24B`, verde scuro, blu `#0061FE`, arancio `#FA551E`) che contengono frasi. Menu a sinistra sempre uguale. | **Colore come contenitore di significato**: ogni blocco è una cosa sola. La griglia visibile dà ordine anche quando tutto è grande. I quattro principi di voce (Simple, Helpful, Human, Magic) sono un buon modello per il tono di TPD. | Niente da lasciare: è il riferimento più vicino al "bold ma chiaro". |
| **[Elegant Seagulls, Case studies](https://www.elegantseagulls.com/case-studies)** | Bianco, un solo accento **lime `#E8FD64`** (pillola della voce di menu attiva), font **Haffer**, paragrafo d'apertura gigante, griglia di case study a immagini piene. | L'**accento unico usato con parsimonia**, che basta a dire "sei qui". | Il paragrafo enorme di testo commerciale. |
| **[Linktree](https://linktr.ee/)** | Ogni sezione ha un colore pieno: lime `#D2E823` con verde scuro, bordeaux `#780016` con rosa `#E9C0E9`, navy `#1E2330`. Font proprietario **Link Sans** molto pesante. Nav a pillola bianca, foto vere con il prodotto in mano. | La prova che **colori fortissimi e UI semplicissima convivono**: nav, input e CTA restano convenzionali e il bold sta nel fondo e nel titolo. Le card del prodotto sovrapposte a ventaglio funzionano bene per mostrare "un Passport, tanti posti". | La combinazione lime più scuro, che ormai è ovunque (Linktree, Seagulls, Rizzle). |
| **[Ramotion, Rizzle](https://www.ramotion.com/rizzle-product-design/)** | Viola profondo e lime, logo con una **linea curva** che sostituisce le due "z". Il case study racconta di un motivo grafico ("lasciare un segno") e di micro-interazioni testate con utenti. | **Un solo motivo grafico che diventa sistema.** Per TPD potrebbe essere la freccia o la linea dello Swap: lo stesso segno nel logo, nelle transizioni e nel "What's different". | La palette, troppo vicina a quella di mille app creator. |
| **[Unseen Studio, Projects](https://unseen.co/projects/)** (Bristol e Londra) | Mondo 3D con grana e archi, schermata d'ingresso con audio, titolo in **Neue Montreal** con **Saol Display** per i contrasti. I progetti hanno filtri in pillola **con il numero di risultati** ("Digital 20"). | I **filtri con il conteggio** sono chiari anche dentro un sito molto scenografico. Grana e profondità si possono usare in piccolo, per esempio sulla scheda Passport. | La schermata d'attesa e l'ingresso a scelta: nella demo ogni secondo conta. |
| **[Klook, "The Best You"](https://www.experiencethebestyou.com/en-GB/)** | Arancio Klook `#FF5B00` sfumato in viola e blu, al centro un **passaporto 3D viola olografico** con biglietti, titolo che scorre in orizzontale. Quiz di circa 10 passi, **una domanda per schermata**, carte da trascinare, valigia da disfare, 8 profili finali condivisibili. | È il riferimento più vicino in assoluto: **un passaporto come oggetto del gusto**, un ingresso a quiz e un risultato da condividere. Conferma che la metafora funziona e piace. | Proprio perché è vicinissimo, TPD **non deve somigliargli**: niente passaporto viola olografico identico. Inoltre il risultato del quiz è un tipo di personalità fisso, mentre il Passport di TPD è vivo e si modifica. |

### Cosa hanno in comune i riferimenti che funzionano

1. **Il bold sta nella cornice, non nei dati.** Linktree, Dropbox e Ping Pong urlano nei titoli e nei fondi, ma input, menu e bottoni restano quelli che tutti sanno usare.
2. **Un colore ha un solo significato.** Dropbox usa un blocco per frase, Seagulls usa il lime solo per "sei qui", Linktree usa un colore per sezione.
3. **C'è sempre una voce "fredda" accanto a quella calda.** Ping Pong usa il mono per le etichette, Unseen il conteggio nei filtri. È il posto naturale delle etichette di verifica L0–L3.
4. **Un oggetto o un segno ricorrente** (la linea di Rizzle, le palline di Ping Pong, il passaporto di Klook) tiene insieme tutto senza bisogno di decorazioni in più.
5. **Una cosa per schermata quando si chiede qualcosa** (il quiz Klook). Quando si mostrano risultati, invece, griglia e filtri chiari (Unseen).

---

## 2. Agenzie piccole e medie, bold ma funzionali

Selezione fatta guardando i siti. Le dimensioni degli studi non sono verificate dove non lo dico.

| Studio | Dove | Perché guardarlo per TPD |
|---|---|---|
| **[Studio Ping Pong](https://studiopingpong.com/)** | Bengaluru e Kolkata, piccolissimo | Il tuo riferimento: gioco, sticker e tre voci tipografiche. Ha anche progetti di travel ("This is how India travels"). |
| **[Locomotive](https://locomotive.ca/en)** | Montréal | Rosso pieno, titolo serif condensato con etichette tecniche incorniciate ("OPS / DES / DEV"). Mostra come una **micro-etichetta in riquadro** possa portare informazione dentro un'immagine forte. |
| **[Instrument](https://www.instrument.com/)** | Portland | Il nome dello studio occupa tutta la larghezza in un grotesk nero pesantissimo, mentre la nav resta in piccole pillole. Il contrasto **titolo gigante contro controlli piccoli e ordinati** è molto chiaro. Fa anche prodotto, non solo brand. |
| **[DixonBaxi](https://www.dixonbaxi.com/)** | Londra | Apertura con un input ("Ask us anything."), poi carosello di card verticali a colori pieni (lime, verde fluo, personaggi). È un buon modello per le **card dei risultati che cambiano colore per categoria**. |
| **[basement.studio](https://basement.studio/)** | Indipendente, lavora soprattutto con brand tech USA | Wireframe 3D in bianco e nero, tono irriverente ("We make cool shit that performs"). È utile come estremo: mostra fin dove si può spingere senza perdere la nav. |
| **[Build in Amsterdam](https://www.buildinamsterdam.com/)** | Amsterdam | Titolo condensato tutto maiuscolo con un serif per il corpo, metà schermo nero e metà bianco. Fa e-commerce, quindi bold con l'obiettivo di **far completare un'azione**. |
| **[Ragged Edge](https://www.raggededge.com/)** | Londra, brand | Font con carattere (Grit e ABC Diatype Expanded). Lo guarderei per il **naming e l'identità**, che sono ancora da decidere (7.7). |
| **[Ramotion](https://www.ramotion.com/)** | San Francisco, product e brand | Il tuo riferimento Rizzle. È utile per i case study che mettono insieme **brand e UI di app** nella stessa pagina. |
| **[Halo Lab](https://www.halo-lab.com/)** | Ucraina, media | Più convenzionale (blu notte e 3D), ma pubblica molti case study di **UI di prodotto**. È il riferimento per "come si fa la parte noiosa bene". |
| **[Metalab](https://www.metalab.com/)** | Victoria e Remote, media-grande | "We make interfaces": serif elegante su fondo scuro e lista clienti in pillole. Ha lavorato su prodotti molto usati. È più sobrio, ma mostra come si fa prodotto serio. |

**Lettura onesta:** molte homepage di agenzie del 2026 sono nere, minimal e con un video (Fantasy, Koto, Rejouice, Metalab). Sono belle ma non insegnano molto per un'app. Per TPD contano di più gli studi che mostrano **prodotti con bold e controlli chiari**: Ping Pong, Instrument, DixonBaxi, Locomotive e Linktree (brand in-house).

---

## 3. Prodotti simili a TPD: chi esiste e com'è disegnato

### 3.1 I diretti (taste o vibe applicati ai luoghi)

| Prodotto | Cosa fa | Design | Voto creatività |
|---|---|---|---|
| **[Savler](https://www.savler.com/)** | "Same vibe, fewer crowds": destinazioni "dupe" | Foto di cielo, titolo bianco centrato, griglia di città con foto. Geist e Tailwind standard. | Basic |
| **[Mindtrip](https://mindtrip.ai/)** | Assistente di viaggio AI che "impara cosa ti importa" | **"Travel that gets you."** in un grotesk nero enorme sopra foto del deserto, CTA a pillola. Il resto è un planner standard. | Medio: il titolo è bold, il prodotto no |
| **[Airial](https://www.airial.travel/)** | Planner AI dalla scoperta alla prenotazione | Foto di strada, logo centrato, due card in glassmorphism. | Basic |
| **[Vibemap](https://vibemap.com/)** | Scoperta di luoghi ed eventi "by your vibe", soprattutto B2B per città e DMO | Box bianco su gradiente azzurro-verde, serif Nantes. | Basic |
| **[TasteGraph](https://www.tastegraph.xyz/)** | Profilo di gusto unificato tra musica, cibo, moda, architettura e film. Il travel è "in arrivo". | "Your Taste, **Mapped.**" con gradiente rosa-viola e un grafo di nodi. | Basic, look da "AI startup" |
| **[Beli](https://beliapp.com/)** | Classifica personale di ristoranti, punteggio di compatibilità con gli amici | Bianco, mockup del telefono con mappa a pin verdi. | Basic sul web, l'app è più curata |
| **Corner** (corner.inc) | Mappa sociale di posti salvati, "vibe-checked", impara il tuo gusto | Il sito blocca il browser automatico. Dalle recensioni dell'App Store risulta "aesthetic and intuitive". Solo iOS. | Non verificato |
| **Vibe – Venue Finder** (iOS) | Trova locali **simili** per atmosfera, prezzo e pubblico partendo da uno che conosci | Solo app, non ho visto le schermate | È il più vicino al gesto Swap: da tenere d'occhio come concorrente |

### 3.2 Adiacenti, ma più creativi

| Prodotto | Perché è creativo | Cosa insegna a TPD |
|---|---|---|
| **[Polarsteps](https://www.polarsteps.com/)** | Font proprietari (Fellix, più LORE Alternates per le etichette tipo "TRAVEL TRACKER"), foto immersive, telefono con la **mappa del percorso come protagonista**. | La mappa e il viaggio diventano un **oggetto personale**, non uno strumento. |
| **[Klook "The Best You"](https://www.experiencethebestyou.com/en-GB/)** | Quiz con passaporto 3D e risultati condivisibili | Vedi sopra: l'onboarding come gioco. |
| **[Partiful](https://partiful.com/)** | Nero, titolo condensato "PARTIES ARE BACK", foto con **bolle di chat** sovrapposte. Il prodotto è un semplice form di invito. | Il tono social e giovane funziona con pochissimi elementi. |
| **[Cosmos](https://www.cosmos.so/)** | Immagini che **fluttuano ruotate** intorno a una barra di ricerca centrale, con il titolo "Find your next go-to outfit". | Una sola azione chiara (cerca) dentro una scena giocosa. È un ottimo modello per la home di TPD: "cerca il posto che volevi". |
| **[The Infatuation](https://www.theinfatuation.com/)** | Blu elettrico, titoli **tutti maiuscoli pesantissimi** sui ristoranti, fotografia del cibo molto ravvicinata. | Il tono editoriale con opinione ("The Best…") applicato ai locali. È utile per la voce del "Why it matches you". |
| **[Resy](https://resy.com/)** | Rosso Resy, titolo in GT America Condensed molto grande, e per il resto liste pulitissime. | Un bold "da ristorante" con un solo colore. |

### 3.3 Cosa ne esce

- **Avevi ragione:** i prodotti nello stesso spazio di TPD (Savler, Airial, Vibemap, TasteGraph, Holiwise, Headout) usano quasi tutti la stessa formula: foto hero di paesaggio, titolo bianco, card con foto e bottone scuro. **Non ne ho trovato nessuno che sia davvero creativo e che faccia anche sostituzione basata sul gusto.**
- Il più vicino come design è **Mindtrip**, e solo per il titolo. Il più vicino come metafora è **Klook The Best You**, che però è una campagna e non un prodotto.
- È uno spazio libero: un TPD con identità forte si distinguerebbe subito in una giuria abituata a vedere "AI travel planner" tutti uguali.
- Non ho potuto aprire Atlas Obscura, Spotted by Locals, Corner, Layla, Wanderboat e TasteDive, che bloccano il browser automatico. Vanno guardati a mano se servono.

---

## 4. Proposta di moodboard

Tre direzioni, tutte fatte di design esistenti. Non si escludono a vicenda: la mia raccomandazione è in fondo.

### Direzione A: "Passport e timbri" (l'identità)

Il Taste Passport è un **oggetto fisico da collezionare**: copertina, pagine, timbri. I livelli di verifica L0–L3 diventano timbri sobri, e ogni Swap riuscito lascia un timbro.

- [Klook The Best You](https://www.experiencethebestyou.com/en-GB/): il passaporto come protagonista e il quiz una domanda alla volta.
- **Spotify Wrapped** e **Spotify Taste Profile** (beta da marzo 2026): il gusto come carta da condividere e il profilo che si può correggere.
- [Studio Ping Pong](https://studiopingpong.com/): sticker, etichette mono in pillola, giallo pieno.
- [Polarsteps](https://www.polarsteps.com/): il viaggio come oggetto personale e un font di carattere solo per le etichette.

**Rischio:** finire troppo vicini a Klook. Per evitarlo: niente viola olografico, niente personaggio, un passaporto più tipografico che illustrato.

### Direzione B: "Editoriale bold" (il sistema di layout)

Titoli enormi e condensati, **un colore pieno per categoria** (ristoranti, cultura, quartieri…), griglia visibile e una voce mono per i fatti.

- [Dropbox Brand](https://brand.dropbox.com/voice-and-tone): griglia, blocchi di colore, principi di voce.
- [Instrument](https://www.instrument.com/) e [Partiful](https://partiful.com/): il titolo gigante contro controlli piccoli.
- [The Infatuation](https://www.theinfatuation.com/) e [Resy](https://resy.com/): il bold applicato ai ristoranti.
- [Linktree](https://linktr.ee/): sezioni a colore pieno, nav e input normalissimi.

**Rischio:** sembrare una rivista invece di un'app. Per evitarlo: il bold va solo su titoli e fondi, mentre le card dei risultati restano compatte e leggibili.

### Direzione C: "Tattile e giocosa" (le interazioni)

Chip Keep/Change che si **toccano e si spostano** come oggetti, card che si ricompongono a ogni tocco, una scena giocosa intorno a una sola azione.

- [Cosmos](https://www.cosmos.so/): immagini che fluttuano intorno a una sola ricerca.
- [Unseen](https://unseen.co/projects/): profondità e grana, filtri con conteggio.
- [Ramotion, Rizzle](https://www.ramotion.com/rizzle-product-design/): un segno grafico (la linea) che diventa sistema, da usare come **segno dello Swap**.
- [DixonBaxi](https://www.dixonbaxi.com/): card verticali a colori pieni.

**Rischio:** animazioni che rallentano la demo. Serve sempre una versione a movimento ridotto (`prefers-reduced-motion`).

### Raccomandazione

**A per l'identità, B per il layout, C solo dove c'è l'interazione chiave** (chip Keep/Change e passaggio Swap → risultati).

Regola di fondo, presa dai riferimenti: **forte nella cornice, quieto nei dati.** Passport, home e transizioni possono essere rumorosi. "Why it matches you · What's different · What we verified" e le etichette di verifica devono essere sobri, in mono, senza colori festosi.

### Cosa evitare (visto nella ricerca)

- I badge "92% match" o "vibe score" (Dribbble AIVENTURE): vietati dalla decisione 3.13.
- Il gradiente viola-rosa "da AI startup" (TasteGraph, mille landing): rende anonimi.
- La foto hero di paesaggio con titolo bianco centrato: è esattamente ciò che fanno tutti i competitor.
- Lime più scuro come palette principale: è il colore "creativo" del 2025–26, già preso da Linktree, Elegant Seagulls e Rizzle.
- Schermate d'ingresso, loader lunghi e audio (Unseen, Klook): costano secondi preziosi alla giuria.

---

## 5. Prossimi passi proposti

1. Scegliere tra le direzioni (o confermare la combinazione A+B+C).
2. Decidere il nome (7.7), perché identità e nome si influenzano. Ragged Edge e Ping Pong sono utili per vedere come lavorano naming e tono insieme.
3. Fare una tavola visiva (Figma o pagina HTML) con gli screenshot di questa ricerca, raggruppati per direzione.
4. Disegnare prima **due schermate soltanto**, la scheda Passport e una card risultato con le tre sezioni, per testare "forte nella cornice, quieto nei dati" prima di estendere.
