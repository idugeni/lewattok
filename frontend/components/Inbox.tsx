"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Inbox as InboxIcon,
  Copy,
  Check,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";
import type { EmailMessage } from "@/lib/types";
import { MessageView } from "./MessageView";

const POLL_INTERVAL_MS = 4000;

interface InboxProps {
  address: string;
  onNew: () => void;
}

export function Inbox({ address, onNew }: InboxProps) {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const lastFetchRef = useRef<string>(new Date(0).toISOString());
  const prevCountRef = useRef(0);

  const fetchMessages = useCallback(
    async (isInitial = false) => {
      try {
        const params = new URLSearchParams({ recipient: address });
        if (!isInitial) {
          params.set("since", lastFetchRef.current);
        }

        const response = await fetch(`/api/messages?${params}`);
        if (!response.ok) throw new Error("Failed to fetch");

        const { messages: incoming }: { messages: EmailMessage[] } = await response.json();

        if (isInitial) {
          setMessages(incoming);
          prevCountRef.current = incoming.length;
        } else if (incoming.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const unique = incoming.filter((m) => !existingIds.has(m.id));
            return [...unique, ...prev];
          });
        }

        lastFetchRef.current = new Date().toISOString();
      } catch {
        // Silently ignore fetch errors during polling
      } finally {
        setIsLoading(false);
      }
    },
    [address]
  );

  useEffect(() => {
    fetchMessages(true);
    const interval = setInterval(() => fetchMessages(false), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedMessage = messages.find((m) => m.id === selectedId) ?? null;

  const sidebar = (
    <aside className="w-full lg:max-w-sm border-r flex flex-col bg-card/30">
      <div className="p-4 border-b space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
            Your address
          </p>
          <Button onClick={onNew} variant="ghost" size="sm" className="h-7 px-2 text-[11px] uppercase tracking-wider gap-1.5">
            <RefreshCw className="size-3" />
            New
          </Button>
        </div>

        <button
          onClick={handleCopy}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/60 border hover:border-primary/30 transition-all duration-200 group cursor-pointer text-left"
        >
          <span className="flex-1 font-mono text-sm truncate text-primary">
            {address}
          </span>
          <span className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          </span>
        </button>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-amber-500/70" />
            Expires in 15m
          </span>
          <span className="text-border">·</span>
          <span>{messages.length} message{messages.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/5" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
                {i < 3 && <Separator className="mt-3" />}
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4 px-6">
            <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
              <InboxIcon className="size-6 text-muted-foreground/60" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Waiting for mail</p>
              <p className="text-xs text-muted-foreground/70 mt-1">New messages appear automatically</p>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((msg, i) => (
              <div key={msg.id} style={{ animation: `fade-in 0.3s ease-out ${i * 30}ms both` }}>
                <button
                  onClick={() => setSelectedId(msg.id)}
                  className={`w-full text-left px-4 py-3.5 border-b transition-all duration-200 cursor-pointer group ${
                    selectedId === msg.id
                      ? "bg-primary/[0.04] border-l-[3px] border-l-primary"
                      : "border-l-[3px] border-l-transparent hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">
                        {msg.sender.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-sm font-medium truncate">
                          {msg.sender}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate leading-snug">
                        {msg.subject}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      {selectedMessage ? (
        <>
          <div className="hidden lg:flex">{sidebar}</div>
          <MobileMessageBar
            address={address}
            onBack={() => setSelectedId(null)}
          />
          <section className="flex-1 overflow-y-auto bg-card/20">
            <MessageView
              message={selectedMessage}
              onClose={() => setSelectedId(null)}
            />
          </section>
        </>
      ) : (
        <>
          {sidebar}
          <section className="hidden lg:flex flex-1 items-center justify-center">
            <div className="text-center text-muted-foreground space-y-4">
              <div className="mx-auto size-16 rounded-3xl bg-muted/50 flex items-center justify-center">
                <Mail className="size-7 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {messages.length > 0 ? "Select a message to read" : "No messages yet"}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Your inbox is automatically monitored
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function MobileMessageBar({ address, onBack }: { address: string; onBack: () => void }) {
  return (
    <div className="lg:hidden fixed top-14 left-0 right-0 z-40 h-12 bg-background/90 backdrop-blur-xl border-b flex items-center px-3 gap-3">
      <Button variant="ghost" size="icon" className="size-8" onClick={onBack}>
        <ChevronLeft className="size-4" />
      </Button>
      <span className="text-xs text-muted-foreground font-mono truncate">{address}</span>
    </div>
  );
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
