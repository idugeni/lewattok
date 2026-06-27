import type { Metadata } from "next";
import { HomePageClient } from "@/components/HomePageClient";

export const metadata: Metadata = {
  title: "Temporary Email",
  description:
    "Generate disposable email addresses that vanish in 15 minutes. No sign-up, no spam, no tracking.",
  openGraph: {
    title: "Aurelion — Temporary Email",
    description:
      "Generate disposable email addresses that vanish in 15 minutes. No sign-up, no spam, no tracking.",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}