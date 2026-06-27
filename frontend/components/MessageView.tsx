"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, User, Clock, FileText, Monitor } from "lucide-react";
import type { EmailMessage } from "@/lib/types";

interface MessageViewProps {
  message: EmailMessage;
  onClose: () => void;
}

export function MessageView({ message, onClose }: MessageViewProps) {
  const [viewMode, setViewMode] = useState<"html" | "text">(
    message.body_html ? "html" : "text"
  );

  return (
    <div className="h-full flex flex-col animate-[fade-in_0.2s_ease-out]">
      <div className="border-b px-5 py-4 flex items-start justify-between gap-4 shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="size-9 rounded-full bg-gradient-to-br from-primary/25 to-primary/5 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-primary">
                {message.sender.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold truncate leading-tight">
                {message.subject}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground ml-11">
            <span className="inline-flex items-center gap-1">
              <User className="size-3" />
              <span className="text-foreground/80">{message.sender}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="text-muted-foreground/50">to</span>
              <span className="text-foreground/60">{message.recipient}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              <span className="font-mono">
                {new Date(message.created_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </span>
          </div>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 rounded-full"
          aria-label="Close"
        >
          <X className="size-4" />
        </Button>
      </div>

      {message.body_html && (
        <div className="border-b px-5 py-2 flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-muted-foreground font-medium mr-1">View</span>
          <Button
            onClick={() => setViewMode("html")}
            variant={viewMode === "html" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <Monitor className="size-3" />
            HTML
          </Button>
          <Button
            onClick={() => setViewMode("text")}
            variant={viewMode === "text" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <FileText className="size-3" />
            Text
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5 lg:p-8">
        {viewMode === "html" && message.body_html ? (
          <div
            className="prose prose-invert prose-sm max-w-none [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-primary/30 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-border [&_blockquote]:border-l-primary [&_blockquote]:text-muted-foreground [&_code]:text-primary [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-card [&_pre]:border [&_pre]:border-border [&_hr]:border-border [&_table]:border [&_table]:border-border [&_th]:border [&_th]:border-border [&_td]:border [&_td]:border-border"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(message.body_html) }}
          />
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-sm text-muted-foreground/90 leading-[1.7]">
            {message.body_text || (
              <span className="text-muted-foreground/50 italic">(empty)</span>
            )}
          </pre>
        )}
      </div>
    </div>
  );
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/on\w+=\w+/gi, "")
    .replace(/<base\b[^>]*>/gi, "")
    .replace(/<link\b[^>]*>/gi, "")
    .replace(/<meta\b[^>]*>/gi, "");
}
