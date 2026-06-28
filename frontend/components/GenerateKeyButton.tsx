"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Key, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface GenerateKeyButtonProps {
  onKeyGenerated?: (apiKey: string) => void;
}

export function GenerateKeyButton({ onKeyGenerated }: GenerateKeyButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate key");
      const data = await res.json();
      setApiKey(data.apiKey);
      onKeyGenerated?.(data.apiKey);
      toast.success("API key generated");
    } catch {
      toast.error("Failed to generate API key");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast.success("API key copied");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (apiKey) {
    return (
      <div className="w-full space-y-2">
        <Separator className="mb-4" />
        <div className="flex items-center gap-2 p-3 rounded-xl border border-border/50 bg-muted/30 backdrop-blur-sm">
          <Key className="size-4 text-muted-foreground shrink-0" />
          <code className="flex-1 text-xs font-mono truncate text-foreground">
            {apiKey}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyKey}
            className="h-7 text-xs shrink-0 gap-1"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground text-center">
          Save this key — it won&apos;t be shown again
        </p>
      </div>
    );
  }

  return (
    <>
      <Separator className="mb-4" />
      <Button
        variant="outline"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full h-11 rounded-xl gap-2 text-sm font-medium border-border/50 hover:border-primary/30 hover:bg-accent/50"
      >
        {isGenerating ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Key className="size-4" />
        )}
        Generate API key
      </Button>
      <Badge
        variant="outline"
        className="w-full justify-center mt-2 border-0 bg-transparent text-[11px] text-muted-foreground"
      >
        Optional — for programmatic email access
      </Badge>
    </>
  );
}
