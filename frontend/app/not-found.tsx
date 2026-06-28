"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <section className="flex-1 flex items-center justify-center px-4 py-16">
      <div className={`max-w-md w-full text-center space-y-6 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        {/* Glitch number */}
        <div className="relative">
          <span
            className="text-8xl sm:text-9xl font-bold tracking-tighter text-muted-foreground/10 select-none"
            style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
            aria-hidden="true"
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-aurora-indigo/15 to-aurora-violet/15 border border-aurora-indigo/10 flex items-center justify-center">
              <Zap className="size-7 text-aurora-indigo" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}>
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This page has vanished — just like a 15-minute email. It may have expired or the link is incorrect.
          </p>
        </div>

        <Button asChild className="gap-2 rounded-xl">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </Button>
      </div>
    </section>
  );
}
