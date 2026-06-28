"use client";

import { Mail, RefreshCw } from "lucide-react";
import type { EmailMessage } from "@/lib/types";

interface InboxProps {
  messages: EmailMessage[];
  selectedId?: string;
  onSelect: (message: EmailMessage) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Inbox({ messages, selectedId, onSelect, onRefresh, isRefreshing }: InboxProps) {
  return (
    <div className="rounded-2xl border bg-card/50 flex flex-col h-full max-h-[calc(100dvh-280px)] lg:max-h-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold tracking-tight">Messages</h2>
          {messages.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-primary/15 text-primary rounded-full">
              {messages.length}
            </span>
          )}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Refresh messages"
          >
            <RefreshCw className={`size-3 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-6 text-center space-y-3">
            <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
              <Mail className="size-5 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground/70">
                Click "Refresh" to check for new emails
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {messages.map((message) => {
              const isSelected = selectedId === message.id;
              return (
                <button
                  key={message.id}
                  onClick={() => onSelect(message)}
                  className={`
                    w-full text-left p-3 rounded-xl transition-all duration-150 cursor-pointer
                    ${isSelected
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50 border border-transparent"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`size-8 rounded-lg shrink-0 flex items-center justify-center ${
                      isSelected ? "bg-primary/20" : "bg-muted"
                    }`}>
                      <Mail className={`size-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-tight">
                        {message.subject || "(no subject)"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {message.sender || "Unknown sender"}
                      </p>
                    </div>
                    <time className="text-[10px] font-mono text-muted-foreground shrink-0 pt-0.5">
                      {formatTime(message.created_at)}
                    </time>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(dateString?: string): string {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "";
  }
}
