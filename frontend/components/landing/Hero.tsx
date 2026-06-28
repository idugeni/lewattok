"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, Zap, Sparkles } from "lucide-react";
import { AuroraBackground } from "./AuroraCanvas";

const TRUST_ITEMS = [
  { icon: Zap, label: "No signup" },
  { icon: Shield, label: "No tracking" },
  { icon: Clock, label: "Auto-deletes in 15 min" },
];

export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center justify-center px-4 sm:px-5">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30">
        <AuroraBackground />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-card/50 backdrop-blur-sm transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Sparkles className="size-3.5 text-aurora-indigo" />
          <span className="text-xs font-medium text-muted-foreground">
            Free disposable email — no account required
          </span>
        </div>

        {/* Headline */}
        <h1
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] transition-all duration-700 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
        >
          <span className="block">Email that</span>
          <span className="block aurora-text">vanishes.</span>
          <span className="block text-muted-foreground/60 text-3xl sm:text-4xl md:text-5xl mt-2 font-medium">
            No trace left behind.
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className={`text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Generate a temporary inbox in one click. Receive emails in real-time.
          Everything auto-deletes after 15 minutes — permanently.
        </p>

        {/* CTA */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-700 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button
            asChild
            size="lg"
            className="relative gap-2 px-8 h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-aurora-indigo to-aurora-violet hover:from-aurora-indigo/90 hover:to-aurora-violet/90 shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Link href="/inbox">
              Get a temporary inbox
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="gap-2 px-6 h-12 text-sm font-medium rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Link href="/docs">
              View API docs
            </Link>
          </Button>
        </div>

        {/* Trust signals */}
        <div
          className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 transition-all duration-700 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Icon className="size-3.5 text-muted-foreground/60" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
