import { notFound } from "next/navigation";
import { HomeStory } from "@/components/home-story";
export const metadata = { title: "Home preview · Beesyde", robots: { index: false, follow: false } };
// A private local preview, never a publicly accessible unfinished Home.
export default function HomePreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <HomeStory />;
}
