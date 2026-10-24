import { notFound } from "next/navigation";
import { PlaceView } from "@/components/place-view";
import type { Entity } from "@/lib/discovery";
// Non-personal fixture for browser checks of the real Place component.
export default function PlaceChecks() {
  if (process.env.NODE_ENV !== "development") notFound();
  const place: Entity = { id: "00000000-0000-4000-8000-000000000001", name: "A deliberately long place name for checking small screens and readable actions", type: "place", city: "Lisbon", country: "PT", address: null, context: null, lat: null, lon: null, price: null, popularity: null, image: "/missing-fixture-photo.jpg", closed: false, tags: [], evidence: [] };
  return <PlaceView city="Lisbon" place={place} token="" category="restaurant" />;
}
