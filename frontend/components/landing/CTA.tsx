"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative px-4 sm:px-5 py-20 sm:py-28">
      <div className="max-w-2xl mx-auto text-center">
        <div
          className={`relative rounded-3xl border bg-gradient-to-br from-card/80 to-muted/30 p-10 sm:p-14 space-y-6 overflow-hidden transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Decorative glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-aurora-indigo/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-4">
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
            >
              Try it now — it&apos;s instant
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              No signup, no waiting. Your disposable inbox is one click away.
            </p>
          </div>

          <div className="relative z-10">
            <Button
              asChild
              size="lg"
              className="gap-2 px-8 h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-aurora-indigo to-aurora-violet hover:from-aurora-indigo/90 hover:to-aurora-violet/90 shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Link href="/inbox">
                Get a temporary inbox
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
