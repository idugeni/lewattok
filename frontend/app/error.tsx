"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, RotateCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <section className="flex-1 flex items-center justify-center px-4 py-16">
      <div className={`max-w-md w-full text-center space-y-6 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="mx-auto size-16 rounded-2xl bg-destructive/10 border border-destructive/15 flex items-center justify-center">
          <AlertTriangle className="size-7 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}>
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred. This might be a temporary issue — try again or head back to the home page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={reset} className="gap-2 rounded-xl">
            <RotateCw className="size-4" />
            Try again
          </Button>
          <Button asChild variant="ghost" className="gap-2 rounded-xl text-muted-foreground">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-4 rounded-xl border bg-card text-left">
            <p className="text-xs font-mono text-destructive break-all">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
