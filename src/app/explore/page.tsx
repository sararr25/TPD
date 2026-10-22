import { redirect } from "next/navigation";
import { CITIES, citySlug } from "@/lib/discovery";
import { HomeCities } from "@/components/home-cities";

export const metadata = { title: "Cities · Beesyde" };

// /explore is the Cities index (#11): every city, filterable by region.
// Old ?city= links still go straight to the city page (docs/24).
export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const { city } = await searchParams;
  if (city && Object.hasOwn(CITIES, city)) redirect(`/${citySlug(city)}`);
  return <HomeCities page />;
}
