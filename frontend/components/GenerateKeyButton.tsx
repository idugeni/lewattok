"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Key, Copy, Check, Loader2, AlertCircle } from "lucide-react";

export function GenerateKeyButton() {
  const [key, setKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setKey(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_WORKER_URL}/api/v1/public/key`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate key");
      setKey(data.key);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.error("Failed to generate key", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!key) return;
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("API key copied!", { description: "You won't be able to see it again." });
  };

  if (key) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-500">Key generated</span>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 rounded-lg bg-background border font-mono text-sm break-all">
            {key}
          </code>
          <Button size="sm" variant="outline" className="shrink-0 h-9" onClick={copy}>
            {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Copy this key now. You won&apos;t be able to see it again.
        </p>
        <Button size="sm" variant="ghost" className="text-xs" onClick={() => { setKey(null); setError(null); }}>
          Generate another
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <Button onClick={generate} disabled={loading} className="gap-2">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Key className="size-4" />}
        {loading ? "Generating..." : "Get your API key"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Rate-limited to one key per IP per hour.
      </p>
    </div>
  );
}
