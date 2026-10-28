# Feedback owner dopo la pubblicazione — 28 ottobre 2026

Feedback raccolto per il prossimo intervento. Nessuna modifica applicativa o pubblicazione eseguita in questa raccolta; i problemi sotto sono segnalazioni dell’owner, non riproduzioni tecniche già confermate.

## Priorità funzionale: luogo suggerito → Twin

A Lisbona l’app ha proposto un luogo chiamato “Gardens”. La scheda si apre e Directions trova il luogo, ma “Find its twin” segnala che non esiste/non viene trovato.

Verificare il percorso completo dalla proposta alla scheda e a Twin: identità e dati del luogo, contesto città/categoria, parametri e recupero del punto di partenza. Non assumere che sia un collegamento rotto prima della riproduzione. Directions funzionante non prova che Twin riceva o riconosca la stessa identità. Il luogo preciso va identificato durante la diagnosi: il solo nome “Gardens” non basta a distinguerlo con certezza.

Accettazione: un luogo suggerito dall’app e compatibile con Twin deve arrivare come punto di partenza senza richiedere di ritrovarlo manualmente. Distinguere chiaramente un luogo non riconosciuto dall’assenza di alternative; verificare anche gli altri ingressi alle schede e conservare una regressione del caso riprodotto.

## Un solo invito a completare i favoriti

“Complete your favorites” compare troppe volte, spesso attaccato ad altri contenuti. L’owner chiede un solo punto dedicato, senza ripeterlo nei post/card o nei vari blocchi. Il tono attuale sembra brusco: usare un invito più gentile, una forma arrotondata e un’animazione curata di suggerimento, rispettando la preferenza di movimento ridotto. Collocazione e testo definitivi da risolvere nella composizione, senza moltiplicare i richiami.

Accettazione: un unico invito coerente nel percorso, senza duplicati tra sezioni; stati incompleti comprensibili senza accumulare CTA.

## Spaziatura, gerarchia e dimensioni dei pulsanti

- Twin: separare visivamente i filtri Restaurant / Bar / Café dai blocchi “Starting place” e “Preferences and matches”. Eliminare il richiamo ripetuto ai favoriti.
- Passport: sotto “Explore cities” si accumulano “Your profile is here”, “Add 3 more favorites” e “Complete your favorites”. Consolidare messaggio e azione, evitando testi e pulsanti ravvicinati.
- Rivedere i pulsanti troppo grandi o privi di una collocazione chiara, con dimensioni proporzionate alla gerarchia e bersagli accessibili. Controllare il risultato su mobile e desktop.

## Animazione condivisa delle schede luogo

L’owner rifiuta la piccola animazione con libro, puntino e puntatore: a quelle dimensioni non comunica nulla. Nella scheda “Gardens” propone di portarla più in alto, sopra il titolo, usando meglio lo spazio disponibile; linea più spessa e lunga, raffigurazioni più leggibili e presenza visiva maggiore.

Applicare la revisione a tutti i punti in cui compare la stessa animazione. Verificare composizione e leggibilità nelle diverse larghezze e una versione statica comprensibile con movimento ridotto. Non confondere questo feedback con il teatro C del quiz approvato in docs/78.

## Limiti della raccolta

Checkout osservato su `main`, senza modifiche iniziali. README e handover corrente consultati. La verifica live del default branch e degli issue/commenti via `gh` non è riuscita per indisponibilità della connessione a api.github.com. Prima di implementare, completare la lettura dei documenti di dominio/ADR e delle guide Next installate pertinenti, verificare tracker e release attuali, quindi riprodurre il difetto funzionale.
