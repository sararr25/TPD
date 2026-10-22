import { redirect } from "next/navigation";
import { SwapWorkspace } from "@/components/swap-workspace";
import { cityFromSlug, citySlug } from "@/lib/discovery";

// Swap lives in the city page (ADR 0001, #21). A /swap link that names a
// city goes to that city's Swap tab with its query kept; without a city
// this page asks for one.
export default async function SwapPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const named = typeof params.city === "string" ? params.city : null;
  const city = named && (cityFromSlug(citySlug(named)) ?? null);
  if (city) {
    const next = new URLSearchParams({ tab: "swap" });
    for (const key of ["q", "category", "ref"])
      if (typeof params[key] === "string") next.set(key, params[key]);
    redirect(`/${citySlug(city)}?${next}`);
  }
  return <SwapWorkspace />;
}
