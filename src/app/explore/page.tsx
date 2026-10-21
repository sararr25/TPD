import { redirect } from "next/navigation";
import { CITIES, citySlug } from "@/lib/discovery";
import { ExploreRedirect } from "@/components/explore-redirect";

// Explore now lives on city pages (docs/24). Old ?city= links go straight
// there; otherwise the browser's last city decides.
export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const { city } = await searchParams;
  if (city && Object.hasOwn(CITIES, city)) redirect(`/${citySlug(city)}`);
  return <ExploreRedirect />;
}
