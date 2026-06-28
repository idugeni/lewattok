import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { UseCases } from "@/components/landing/UseCases";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";

export const metadata: Metadata = {
  title: "Temporary Email That Vanishes in 15 Minutes",
  description:
    "Generate disposable email addresses that vanish in 15 minutes. No sign-up, no spam, no tracking. Perfect for developers, QA testing, and privacy.",
  openGraph: {
    title: "Aurelion — Temporary Email That Vanishes",
    description:
      "Generate disposable email addresses that vanish in 15 minutes. No sign-up, no spam, no tracking.",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <FAQ />
      <CTA />
    </>
  );
}