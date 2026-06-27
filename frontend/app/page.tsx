"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Inbox } from "@/components/Inbox";

export default function HomePage() {
  const [address, setAddress] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generate();
  }, []);

  const generate = async () => {
    try {
      setAddress(null);
      setError(null);
      const res = await fetch("/api/generate");
      if (!res.ok) throw new Error("Failed to generate address");
      const data = await res.json();
      setAddress(data.address);
      setKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate email");
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-5 max-w-sm">
          <div className="mx-auto size-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-1">Connection Error</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={generate} variant="default" className="min-w-[120px]">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-medium mb-1">Generating your address</h2>
            <p className="text-xs text-muted-foreground">One moment...</p>
          </div>
          <div className="flex justify-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="size-2 rounded-full bg-primary/60 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <Inbox key={key} address={address} onNew={generate} />;
}
