"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language = "bash", filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }, [code]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="group relative rounded-xl border bg-card/80 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-destructive/50" />
            <span className="size-2.5 rounded-full bg-amber-500/50" />
            <span className="size-2.5 rounded-full bg-mint/50" />
          </div>
          {filename && (
            <span className="text-[11px] font-mono text-muted-foreground">
              {filename}
            </span>
          )}
          <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">
            {language}
          </span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="size-3 text-mint" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3" />
              Copy
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <pre className="p-4 overflow-x-auto custom-scrollbar">
        <code className="text-[13px] leading-relaxed font-mono text-foreground/90">
          {code}
        </code>
      </pre>
    </div>
  );
}
