import Link from "next/link";
import {QuizEnergyPrototype} from "@/components/quiz-energy-prototype";
import { notFound } from "next/navigation";
import { PlaceView } from "@/components/place-view";
import type { Entity } from "@/lib/discovery";
// Non-personal fixture for browser checks of the real Place component.
export default async function PlaceChecks({ searchParams }: { searchParams: Promise<{ photo?: string; details?: string; quizEnergy?: string; variant?: string; step?: string }> }) {
  const query = await searchParams;
  if(query.quizEnergy === "1" && process.env.VERCEL_ENV !== "production") {
    const variant=query.variant === "B" ? "B" : query.variant === "C" ? "C" : "A";
    return <QuizEnergyPrototype key={variant} variant={variant} initialStep={query.step==="0"?0:query.step==="1"?1:2} showSwitcher={process.env.NODE_ENV !== "production"}/>;
  }
  if (process.env.NODE_ENV !== "development") notFound();
  const knownPhoto = query.photo === "known";
  const place: Entity = { id: "00000000-0000-4000-8000-000000000001", name: "A deliberately long place name for checking small screens and readable actions", type: "place", city: "Lisbon", country: "PT", address: null, context: null, lat: null, lon: null, price: null, popularity: null, image: knownPhoto ? "https://images.qloo.com/fixture.jpg" : "/missing-fixture-photo.jpg", closed: false, tags: [], evidence: [] };
  if (query.details === "1") {
    place.address = "42 Fixture Avenue, Lisbon, Portugal";
    place.lat = 38.71; place.lon = -9.14; place.price = 2;
    place.tags = [{ id:"urn:tag:fixture:portuguese", name:"Portuguese", type:"urn:tag:cuisine:qloo" }, { id:"urn:tag:fixture:casual", name:"Casual", type:"urn:tag:ambience:qloo" }];
  }
  return <><PlaceView city="Lisbon" place={place} token="" category="restaurant" /><Link href="/preview/checks">Check missing detail photo</Link></>;
}
