import type { Metadata } from "next";
import { PassportSettings } from "@/components/passport-settings";

export const metadata: Metadata = { title: "Settings & privacy" };

export default function PassportSettingsPage() {
  return <PassportSettings />;
}
