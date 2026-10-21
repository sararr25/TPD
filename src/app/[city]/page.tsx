import { notFound } from "next/navigation";
import { CITIES, citySlug, cityFromSlug } from "@/lib/discovery";
import { CityView } from "@/components/city-view";

// One page per city: /lisbon, /new-york… (docs/24). Unknown slugs are 404s.
export function generateStaticParams() {
  return Object.keys(CITIES).map((city) => ({ city: citySlug(city) }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const city = cityFromSlug((await params).city);
  return { title: city ? `${city} · Beesyde` : "Beesyde" };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const city = cityFromSlug((await params).city);
  if (!city) notFound();
  return <CityView city={city} />;
}
