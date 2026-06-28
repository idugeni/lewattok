"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { EmailMessage } from "@/lib/types";
import { formatEmailDate } from "@/lib/utils";
import {
  User,
  AtSign,
  Clock,
  FileCode,
  Code,
  ExternalLink,
} from "lucide-react";
import DOMPurify from "dompurify";

interface MessageViewProps {
  message: EmailMessage;
}

export function MessageView({ message }: MessageViewProps) {
  const [showHtml, setShowHtml] = useState(true);

  const sanitizedHtml =
    typeof window !== "undefined" && message.body_html
      ? DOMPurify.sanitize(message.body_html, {
          FORBID_TAGS: ["style", "link", "script", "form", "input", "textarea", "select", "button"],
          FORBID_ATTR: ["onerror", "onclick", "onload", "onfocus", "onblur", "onmouseover", "style"],
          ALLOW_UNKNOWN_PROTOCOLS: false,
          ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i,
        })
      : "";

  const hasHtml = Boolean(message.body_html && message.body_html.trim());

  return (
    <div className="h-full flex flex-col rounded-2xl border bg-card/50 overflow-hidden">
      {/* Header */}
      <div className="border-b p-4 sm:p-5 space-y-3 shrink-0">
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight leading-snug">
          {message.subject || "(no subject)"}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <User className="size-3" />
            <span className="font-medium text-foreground">{message.sender || "Unknown sender"}</span>
          </span>
          {message.recipient && (
            <span className="inline-flex items-center gap-1.5">
              <AtSign className="size-3" />
              {message.recipient}
            </span>
          )}
          {message.created_at && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3" />
              {formatEmailDate(message.created_at)}
            </span>
          )}
        </div>

        {/* View toggle */}
        {hasHtml && message.body_text && (
          <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg w-fit">
            <Button
              variant={showHtml ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowHtml(true)}
              className="h-7 text-xs rounded-md gap-1"
            >
              <FileCode className="size-3" />
              HTML
            </Button>
            <Button
              variant={!showHtml ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowHtml(false)}
              className="h-7 text-xs rounded-md gap-1"
            >
              <Code className="size-3" />
              Text
            </Button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        {showHtml && hasHtml ? (
          <iframe
            srcDoc={sanitizedHtml}
            title="Email content"
            sandbox=""
            referrerPolicy="no-referrer"
            className="w-full h-full min-h-[400px] border-0"
            style={{ background: "var(--background)" }}
          />
        ) : message.body_text ? (
          <pre className="p-5 text-sm leading-relaxed font-[family-name:var(--font-body)] whitespace-pre-wrap break-words text-foreground/90">
            {message.body_text}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full p-8 text-center">
            <p className="text-sm text-muted-foreground">No content available</p>
          </div>
        )}
      </div>
    </div>
  );
}
