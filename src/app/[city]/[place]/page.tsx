import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cityFromSlug } from "@/lib/discovery";
import { placeById } from "@/lib/server/discovery-service";
import { checkBudget } from "@/lib/server/budget";
import { DiscoveryError } from "@/lib/server/qloo";
import { PlaceView } from "@/components/place-view";

// One page per place: /lisbon/<qloo-id> (docs/adr/0001). The place is fetched
// by id on the server, so the URL can be shared. Unknown city or place: 404.
// Other failures (quota, provider down) are not "not found": they reach the
// error page.
const load = cache(async (citySlug: string, id: string) => {
  const city = cityFromSlug(citySlug);
  if (!city) notFound();
  try {
    await checkBudget(new Request("http://place.local", { headers: await headers() }), false);
    return { city, ...(await placeById(id, city)) };
  } catch (error) {
    if (error instanceof DiscoveryError && error.code === "not_found") notFound();
    throw error;
  }
});

type Params = Promise<{ city: string; place: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { city, place } = await params;
  const found = await load(city, place);
  return { title: `${found.entity.name} · ${found.city} · Beesyde` };
}

export default async function PlacePage({ params }: { params: Params }) {
  const { city, place } = await params;
  const found = await load(city, place);
  return <PlaceView city={found.city} place={found.entity} token={found.token} category={found.category} />;
}
