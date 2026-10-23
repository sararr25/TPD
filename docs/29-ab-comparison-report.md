# Beesyde — confronto A/B e chiusura ticket, 23 ottobre 2026

## Protocollo fissato prima delle richieste

Confronto tecnico appaiato sulla pagina pubblica `/compare`: A = Qloo,
B = modello generale tramite Pollinations. Una sola differenza: la fonte
delle raccomandazioni. Gli stessi preferiti di esempio, città e categoria
sono inviati a entrambe le fonti; non viene usato il Passport personale.

Ipotesi: Qloo restituisce più spesso tre suggerimenti utilizzabili nella
demo rispetto al servizio AI gratuito. Metrica primaria: richieste che
terminano con tre suggerimenti visibili. Guardrail: errori espliciti,
nessuna sostituzione silenziosa, nessuna modifica del profilo personale.

Campione fissato: tre coppie, nell'ordine Lisbon/restaurant,
Paris/museum, Porto/bar. Una richiesta per fonte e scenario, nessun retry
o arresto anticipato in base ai risultati. Il tempo non viene usato per
classificare le fonti: osservazioni UI e cache non consentono un confronto
di latenza controllato.

È un controllo tecnico su tre scenari, non un esperimento randomizzato
su utenti: non può misurare preferenza, conversione, accuratezza dei luoghi
o superiorità causale. Nessun vincitore statistico sarà dichiarato.

## Risultati

Preferiti di esempio effettivamente mostrati in tutte le prove:
Khruangbin, Nina Simone, Before Sunrise. Esecuzione sulla release pubblica
`27a7dfd`, browser Chrome normale, senza cambiare codice o provider.

| Scenario | A: Qloo | B: AI generale |
|---|---|---|
| Lisbon / ristoranti | 3 suggerimenti visibili | 3 suggerimenti visibili |
| Paris / musei | 3 suggerimenti visibili | 3 suggerimenti visibili |
| Porto / bar | 3 suggerimenti visibili | Errore esplicito: modello gratuito senza risposta |

Completamento con tre suggerimenti: **A 3/3, B 2/3**. Nessun retry.
L'errore AI non è stato nascosto o sostituito da risultati Qloo. Tornando
al Passport, i quattro timbri e il profilo personale risultavano ancora
caricati dall'account. Non sono stati raccolti voti o conversioni.

Decisione: mantenere Qloo come fonte corrente della demo e l'AI come
confronto esplicitamente sperimentale. Queste tre prove segnalano un rischio
di disponibilità dell'AI gratuita; non stimano il suo tasso di affidabilità
generale e non dimostrano una superiorità di qualità o rilevanza di Qloo.

Le prove salvate sono schermate private in
`.private/qa/2026-10-23-final-acceptance/ab-*.png`.
Non sono state pubblicate risposte grezze dei provider.

## Cosa si può concludere

Il numero di risultati misura il completamento tecnico, non la loro qualità.
Il catalogo Qloo e le descrizioni AI non costituiscono una verifica indipendente
di città, categoria, orari o disponibilità. Il precedente benchmark a tre
condizioni resta separato: nessun voto umano o uplift viene dedotto da esso.

Un A/B su utenti resta **non avviato**: nessuna assegnazione casuale,
esposizione o conversione è stata raccolta. Per misurare il valore prodotto,
il protocollo successivo dovrà assegnare ogni visitatore stabilmente 50/50
a una sola fonte e usare come metrica primaria almeno un luogo salvato
entro la sessione di ricerca. Errori e pertinenza verificata sono guardrail.
Baseline e traffico osservati dovranno determinare campione e durata prima
del lancio; non sono disponibili qui e non vengono inventati. La valutazione
umana era stata rimandata dall'owner e non viene imposta per chiudere i ticket.

## Stato dei ticket e repository

Zero issue aperte su GitHub dopo la chiusura di #32 e della specifica #3.
Tutti i ticket figli #4–#34 risultano chiusi. L'owner ha approvato le schermate
di #26 e confermato i tre timbri sull'altro dispositivo; l'agente ha aggiunto
Paris e verificato quattro timbri dopo il ricaricamento completo dall'account.
La creazione dal secondo dispositivo e il ritorno della modifica non sono
stati eseguiti e non sono dichiarati verificati.

Branch locale e default GitHub: `claude/blissful-gauss-dymbeo`.
L'app pubblica READY al momento della prova corrispondeva a `27a7dfd`.
Il vecchio PR #1 è ancora aperto come proposta storica separata.
