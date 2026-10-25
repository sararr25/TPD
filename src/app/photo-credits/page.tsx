import Link from "next/link";
import { CITY_PHOTOS } from "@/lib/city-photos";

export const metadata = { title: "Photo credits · Beesyde" };
export default function PhotoCredits() {
  return <section className="photo-credits" aria-labelledby="photo-credits-title">
    <div className="page-head"><h1 id="photo-credits-title">The cities, through their lenses.</h1>
      <p>Credits for our city covers and the city photographs shown when a place has no photo.</p></div>
    <p>These photographs appear with responsive crops and, on city covers, slightly reduced saturation and contrast. Each source links to the original file, photographer information and license. Place photographs supplied with search results are separate from this city collection.</p>
    <ul className="photo-credit-list">{Object.entries(CITY_PHOTOS).map(([city, photo]) => <li key={city}>
      <img src={photo.small} alt={`${city} city photograph`} width={320} height={180} loading="lazy" />
      <div><h2>{city}</h2><p><a href={photo.source} target="_blank" rel="noreferrer">{photo.title}</a></p>
        <p>Photograph: {photo.author} · <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a></p></div>
    </li>)}</ul>
    <Link className="btn btn-secondary" href="/explore">Explore all cities →</Link>
  </section>;
}
