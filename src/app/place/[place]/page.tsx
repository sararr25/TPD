import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { CITIES, UUID, citySlug, explorePlace } from "@/lib/discovery";
import { checkBudget } from "@/lib/server/budget";
import { entityById } from "@/lib/server/qloo";

// Older account saves have only an id and address. Resolve their city from
// the provider when opened, rather than guessing from an arbitrary list name.
// Prefetch is off on Saved links so a trip never triggers a lookup per card.
export default async function SavedPlacePage({ params }: { params: Promise<{ place: string }> }) {
  const { place } = await params;
  if (!UUID.test(place)) notFound();
  await checkBudget(new Request("http://place.local", { headers: await headers() }), false);
  const { entity } = await entityById(place);
  if (!entity) notFound();
  const city = Object.keys(CITIES).find((name) =>
    (["restaurant", "museum", "bar", "hotel"] as const).some((category) => explorePlace(entity, name, category)),
  );
  if (!city) notFound();
  redirect(`/${citySlug(city)}/${place.toLowerCase()}`);
}
