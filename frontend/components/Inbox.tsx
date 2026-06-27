"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Mail,
  Inbox as InboxIcon,
  Copy,
  Check,
  RefreshCw,
  ChevronLeft,
  MoreHorizontal,
  User,
} from "lucide-react";
import type { EmailMessage } from "@/lib/types";
import { MessageView } from "./MessageView";

const POLL_INTERVAL_MS = 4000;
const TTL_MS = 15 * 60 * 1000;

interface InboxProps {
  address: string;
  onNew: () => void;
  createdAt?: Date;
}

export function Inbox({ address, onNew, createdAt }: InboxProps) {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const lastFetchRef = useRef<string>(new Date(0).toISOString());
  const prevCountRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const [ttlRemaining, setTtlRemaining] = useState(100);

  const startTimeRef = useRef(createdAt?.getTime() ?? Date.now());

  useEffect(() => {
    const update = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / TTL_MS) * 100);
      setTtlRemaining(remaining);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = useCallback(
    async (isInitial = false) => {
      try {
        const params = new URLSearchParams({ recipient: address });
        if (!isInitial) params.set("since", lastFetchRef.current);

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
            if (unique.length > 0) {
              unique.forEach((m) => {
                toast("New message", { description: `From ${m.sender}: ${m.subject}` });
              });
            }
            return [...unique, ...prev];
          });
        }

        lastFetchRef.current = new Date().toISOString();
      } catch {
        if (isInitial) {
          toast.error("Failed to load messages", { description: "Please try again." });
        }
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (selectedId) {
        if (e.key === "Escape") {
          e.preventDefault();
          setSelectedId(null);
        } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const idx = messages.findIndex((m) => m.id === selectedId);
          if (idx === -1) return;
          const next = e.key === "ArrowUp" ? idx - 1 : idx + 1;
          if (next >= 0 && next < messages.length) {
            setSelectedId(messages[next].id);
          }
        }
        return;
      }

      if (!messages.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedId(messages[0].id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [messages, selectedId]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Address copied!", { description: address });
  };

  const handleCopySender = async (sender: string) => {
    await navigator.clipboard.writeText(sender);
    toast.success("Sender copied!", { description: sender });
  };

  const handleCopySubject = async (subject: string) => {
    await navigator.clipboard.writeText(subject);
    toast.success("Subject copied!", { description: subject });
  };

  const selectedMessage = messages.find((m) => m.id === selectedId) ?? null;

  const sidebar = (
    <aside className="w-full lg:max-w-sm lg:border-r flex flex-col bg-card/30 max-lg:min-h-0">
      <div className="p-3 sm:p-4 border-b space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
            Your address
          </p>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onNew} variant="ghost" size="sm" className="h-8 sm:h-7 px-2 sm:px-2.5 text-[11px] uppercase tracking-wider gap-1.5">
                <RefreshCw className="size-3.5 sm:size-3" />
                <span className="sm:hidden">New</span>
                <span className="hidden sm:inline">New</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Generate new address</TooltipContent>
          </Tooltip>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-2 px-3 py-2.5 sm:py-2 rounded-xl bg-muted/60 border hover:border-primary/30 transition-all duration-200 group cursor-pointer text-left active:scale-[0.98]"
            >
              <span className="flex-1 font-mono text-sm truncate text-primary">
                {address}
              </span>
              <span className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
                {copied ? <Check className="size-4 sm:size-3.5 text-emerald-500" /> : <Copy className="size-4 sm:size-3.5" />}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent>{copied ? "Copied!" : "Click to copy"}</TooltipContent>
        </Tooltip>

        <div className="space-y-2">
          <Progress value={ttlRemaining} className="h-1" />
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className={`size-1.5 rounded-full ${ttlRemaining > 20 ? "bg-emerald-500/70" : "bg-red-500/70 animate-pulse"}`} />
              {ttlRemaining > 0 ? "Expires in 15m" : "Expired"}
            </span>
            <span className="text-border">·</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono">
              {messages.length} msg{messages.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 max-lg:max-h-[60dvh]">
        {isLoading ? (
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 sm:size-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 sm:h-3.5 w-3/5" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
                {i < 3 && <Separator className="mt-3" />}
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-48 sm:h-64 text-muted-foreground gap-4 px-6">
            <div className="size-12 sm:size-14 rounded-2xl bg-muted flex items-center justify-center">
              <InboxIcon className="size-5 sm:size-6 text-muted-foreground/60" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Waiting for mail</p>
              <p className="text-xs text-muted-foreground/70 mt-1">New messages appear automatically</p>
            </div>
          </div>
        ) : (
          <div ref={listRef}>
            {messages.map((msg, i) => (
              <div key={msg.id} style={{ animation: `fade-in 0.3s ease-out ${i * 30}ms both` }}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={() => setSelectedId(msg.id)}
                      className={`w-full text-left px-3 sm:px-4 py-3 sm:py-3.5 border-b transition-all duration-200 cursor-pointer group active:bg-muted/20 ${
                        selectedId === msg.id
                          ? "bg-primary/[0.04] border-l-[3px] border-l-primary"
                          : "border-l-[3px] border-l-transparent hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="size-7 sm:size-8 shrink-0 mt-0.5">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-[11px] sm:text-xs font-semibold">
                            {msg.sender.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
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
                        <MoreHorizontal className="size-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => setSelectedId(msg.id)}>
                      <Mail className="size-4" />
                      Open message
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleCopySender(msg.sender)}>
                      <User className="size-4" />
                      Copy sender
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopySubject(msg.subject)}>
                      <Copy className="size-4" />
                      Copy subject
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      const text = `${msg.sender}\n${msg.subject}\n${msg.body_text || ""}`;
                      await navigator.clipboard.writeText(text);
                      toast.success("Content copied!");
                    }}>
                      <Copy className="size-4" />
                      Copy full content
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );

  if (selectedMessage) {
    return (
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:flex max-lg:hidden">{sidebar}</div>
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
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
      {sidebar}
      <section className="hidden lg:flex flex-1 items-center justify-center">
        <div className="text-center text-muted-foreground space-y-4 px-6">
          <div className="mx-auto size-14 sm:size-16 rounded-3xl bg-muted/50 flex items-center justify-center">
            <Mail className="size-6 sm:size-7 text-muted-foreground/40" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {messages.length > 0 ? "Select a message to read" : "No messages yet"}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Your inbox is automatically monitored
            </p>
            <p className="text-[10px] text-muted-foreground/40 mt-2 font-mono">
              ↑↓ navigate · Enter open · Esc close
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MobileMessageBar({ address, onBack }: { address: string; onBack: () => void }) {
  return (
    <div className="flex lg:hidden items-center gap-2 px-3 py-2 bg-background/95 backdrop-blur-xl border-b sticky top-14 z-40">
      <Button variant="ghost" size="icon" className="size-8 shrink-0 rounded-full" onClick={onBack}>
        <ChevronLeft className="size-4" />
      </Button>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="size-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <Mail className="size-3 text-primary" />
        </div>
        <span className="text-xs text-muted-foreground font-mono truncate">{address}</span>
      </div>
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
