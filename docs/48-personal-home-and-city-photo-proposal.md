# Personal Home cities and photographic proposal — 25 October 2026

## Owner direction

Home should surface 3–4 cities personally relevant to the Passport or most
visited by that user, rather than a fixed editorial shortlist. The owner asked
for a real photographic set to review before replacing app covers.

## Confirmed data limits / questions pending

- `src/lib/stamps.ts` records one first guide-open stamp per city; reopening
  retains the first date. It is not a visit counter or proof of physical travel.
- No existing city-affinity ranking is implemented. The earlier destination
  audits rank places within each city; their result counts cannot be repurposed
  as comparable city-affinity scores.
- Official [Qloo Insights documentation](https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md)
  documents destination entities, but support/coverage under this app's actual
  hackathon access has not been probed for this feature. No live provider calls
  or private owner-profile requests were made in this follow-up.
- Asked owner: affinity-first or visits-first when both exist; whether visits
  means app guide opens or real-world travel; what to show without either signal.
  Do not invent priority, history, user counts or a fixed guest shortlist.

## Photographs — proposal only

Local review board: `.private/city-photo-proposal/index.html`; preview screenshot
`board.png`; source metadata `candidates.json`. Eleven images were checked as
loaded in Chrome and their proposed 16:9 crops were visually inspected.
Images are referenced remotely, not copied into app assets. CSS preview applies
slightly reduced saturation/contrast; sources remain unmodified. No app cover
has been replaced and no owner approval is implied.

Initial darker/less distinctive Lisbon, Madrid, Hanoi and Ho Chi Minh City
candidates were replaced after a comparison sheet. Final proposed set:

| City | Photographer credit from source | Source license label | Original resolution | File / source |
|---|---|---|---|---|
| Lisbon | Julianibarra | CC BY-SA 3.0 | 2133 × 1600 | [Lisbon Rooftops 10.jpg](https://commons.wikimedia.org/wiki/File:Lisbon_Rooftops_10.jpg) |
| Porto | Chmee2 | CC BY-SA 3.0 | 4667 × 1831 | [Porto(panorama).jpg](https://commons.wikimedia.org/wiki/File:Porto(panorama).jpg) |
| Paris | CherryX | CC BY-SA 3.0 | 1875 × 1250 | [Eiffel Tower as seen from Arc de Triomphe 2012.jpg](https://commons.wikimedia.org/wiki/File:Eiffel_Tower_as_seen_from_Arc_de_Triomphe_2012.jpg) |
| Barcelona | Mike McBey | CC BY 2.0 | 5936 × 3337 | [Barcelona in evening light (49598614983).jpg](https://commons.wikimedia.org/wiki/File:Barcelona_in_evening_light_(49598614983).jpg) |
| Madrid | AudaCity3371 | CC BY-SA 3.0 | 1600 × 1156 | [Madrid Gran Via Metropolis Building - panoramio.jpg](https://commons.wikimedia.org/wiki/File:Madrid_Gran_Via_Metropolis_Building_-_panoramio.jpg) |
| New York | Peter Zoon from Castricum, The Netherlands | CC BY 2.0 | 3405 × 1122 | [Manhattan Skyline - Flickr - Peter Zoon.jpg](https://commons.wikimedia.org/wiki/File:Manhattan_Skyline_-_Flickr_-_Peter_Zoon.jpg) |
| Tokyo | David Kernan | CC BY 4.0 | 5995 × 3372 | [Minato City, Tokyo, Japan.jpg](https://commons.wikimedia.org/wiki/File:Minato_City,_Tokyo,_Japan.jpg) |
| Osaka | Martin Falbisoner | CC BY-SA 4.0 | 5131 × 3420 | [Osaka Castle Outer Moat and Osaka Business Park, November 2016.jpg](https://commons.wikimedia.org/wiki/File:Osaka_Castle_Outer_Moat_and_Osaka_Business_Park,_November_2016.jpg) |
| Ho Chi Minh City | flowcomm | CC BY 2.0 | 5661 × 3624 | [Ho Chi Minh City, Saigon, Vietnam (49579585976).jpg](https://commons.wikimedia.org/wiki/File:Ho_Chi_Minh_City,_Saigon,_Vietnam_(49579585976).jpg) |
| Hanoi | P. Hughes | CC BY 4.0 | 3974 × 2672 | [Hanoi - Turtle Tower (Tháp Rùa), Hoàn Kiếm Lake.jpg](https://commons.wikimedia.org/wiki/File:Hanoi_-_Turtle_Tower_(Th%C3%A1p_R%C3%B9a),_Ho%C3%A0n_Ki%E1%BA%BFm_Lake.jpg) |
| Phu Quoc | Elmschrat | CC BY-SA 4.0 | 4080 × 3072 | [2 Phu Quoc beach.jpg](https://commons.wikimedia.org/wiki/File:2_Phu_Quoc_beach.jpg) |

Source and license labels above are transcribed from Wikimedia Commons image
metadata, with a source/individual license link per candidate in the board.
These are candidate source records, not a blanket rights clearance. On approval,
retain the photographer/source/license information and record applied crops in
an app-accessible image credit surface. Review large City cover crops as well
as Home cards before replacing the shared `cityCover()` source.

No application code changed in this follow-up. The earlier validated UI changes
and pending F06/F07/F09 boundaries remain recorded in docs/47.
