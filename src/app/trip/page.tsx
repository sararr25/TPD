import type { Metadata } from "next";
import { SharedTripView } from "@/components/shared-trip-view";
export const metadata: Metadata = {
  title: "Shared trip · Beesyde",
  robots: { index: false, follow: false },
};
export default function SharedTripPage() {
  return <SharedTripView />;
}
