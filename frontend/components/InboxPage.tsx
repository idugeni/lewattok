"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Inbox } from "@/components/Inbox";
import { MessageView } from "@/components/MessageView";
import { GenerateKeyButton } from "@/components/GenerateKeyButton";
import UsernameInput from "@/components/UsernameInput";
import type { EmailMessage } from "@/lib/types";
import { STORAGE_KEY, TTL_MS } from "@/lib/constants";
import { generateAddress, buildAddress, getDomain } from "@/lib/email";
import {
  Copy,
  RefreshCw,
  Clock,
  Shield,
  ArrowLeft,
  Trash2,
  Inbox as InboxIcon,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

interface StoredInbox {
  address: string;
  createdAt: number;
  expiresAt: number;
  apiToken?: string;
}

export function InboxPage() {
  const [inbox, setInbox] = useState<StoredInbox | null>(null);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [mounted, setMounted] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: StoredInbox = JSON.parse(stored);
        if (Date.now() < data.expiresAt) {
          setInbox(data);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!inbox) return;
    const interval = setInterval(() => {
      const remaining = inbox.expiresAt - Date.now();
      if (remaining <= 0) {
        setCountdown("Expired");
        clearInterval(interval);
        toast.warning("Inbox has expired", { description: "Create a new one to continue receiving emails" });
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setCountdown(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [inbox]);

  // Fetch messages once when inbox is loaded (manual refresh only after)
  const fetchMessages = useCallback(async (showToast = false) => {
    if (!inbox) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/messages?recipient=${encodeURIComponent(inbox.address)}`);
      if (!res.ok) return;
      const data = await res.json();
      const newMessages: EmailMessage[] = (data.messages ?? []).map(
        (m: EmailMessage) => ({ ...m, isNew: true })
      );
      setMessages((prev) => {
        if (showToast) {
          const existingIds = new Set(prev.map((p) => p.id));
          const fresh = newMessages.filter((m) => !existingIds.has(m.id));
          if (fresh.length > 0) {
            toast.success(`${fresh.length} new message${fresh.length > 1 ? "s" : ""} received`);
          } else if (showToast) {
            toast.info("No new messages");
          }
        }
        return newMessages;
      });
      setLastFetched(new Date());
    } catch {
      if (showToast) {
        toast.error("Failed to refresh messages");
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [inbox]);

  // Auto-fetch once when inbox is set
  useEffect(() => {
    if (!inbox) return;
    fetchMessages(false);
  }, [inbox, fetchMessages]);

  // Create inbox (random or custom)
  const handleCreateInbox = useCallback(async (username?: string) => {
    setIsLoading(true);
    try {
      const domain = getDomain();
      let address: string;
      if (username) {
        address = buildAddress(username, domain);
      } else {
        address = generateAddress(domain);
      }
      const now = Date.now();
      const newInbox: StoredInbox = {
        address,
        createdAt: now,
        expiresAt: now + TTL_MS,
      };

      // Try to create on worker side too
      try {
        await fetch("/api/inbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username || undefined }),
        });
      } catch {
        // Worker not available, continue with local
      }

      setInbox(newInbox);
      setMessages([]);
      setSelectedMessage(null);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newInbox));
      toast.success(username ? `Inbox ${address} created` : "New inbox created");
    } catch {
      toast.error("Failed to create inbox");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Copy address
  const copyAddress = useCallback(() => {
    if (!inbox) return;
    navigator.clipboard.writeText(inbox.address);
    toast.success("Address copied to clipboard");
  }, [inbox]);

  // Delete inbox from KV
  const deleteInbox = useCallback(async () => {
    if (!inbox) return;
    try {
      await fetch(`/api/messages?recipient=${encodeURIComponent(inbox.address)}`, {
        method: "DELETE",
      });
    } catch {
      // Ignore worker errors
    }
    localStorage.removeItem(STORAGE_KEY);
    setInbox(null);
    setMessages([]);
    setSelectedMessage(null);
    setCountdown("");
    setLastFetched(null);
    toast.success("Inbox deleted");
  }, [inbox]);

  // Reset inbox (New button)
  const resetInbox = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setInbox(null);
    setMessages([]);
    setSelectedMessage(null);
    setCountdown("");
    setLastFetched(null);
    toast.info("Ready for a new inbox");
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="size-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  // Empty state - no inbox yet
  if (!inbox) {
    return (
      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Icon */}
          <div className="mx-auto size-20 rounded-3xl bg-gradient-to-br from-aurora-indigo/15 to-aurora-violet/15 border border-aurora-indigo/10 flex items-center justify-center">
            <InboxIcon className="size-9 text-aurora-indigo" />
          </div>

          <div className="space-y-2">
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
            >
              Your temporary inbox
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Choose a custom username or generate a random disposable email address. Auto-deletes after the countdown.
            </p>
          </div>

          <UsernameInput
            onSubmit={(username) => handleCreateInbox(username)}
            onRandom={() => handleCreateInbox()}
            isLoading={isLoading}
          />

          <GenerateKeyButton />

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="size-3 text-mint" />
              No tracking
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3 text-aurora-indigo" />
              Auto-deletes
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="size-3 text-ember" />
              No registration
            </span>
          </div>
        </div>
      </section>
    );
  }

  // Inbox active
  return (
    <section className="flex-1 flex flex-col max-w-screen-2xl mx-auto w-full px-4 sm:px-5 py-6 gap-5">
      {/* Address bar */}
      <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-4 sm:p-5 space-y-4">
        {/* Top row: address + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                Your temporary address
              </span>
              {countdown && (
                <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  countdown === "Expired"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                }`}>
                  <Clock className="size-3" />
                  {countdown}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <code className="text-base sm:text-lg font-mono font-semibold tracking-tight text-foreground truncate">
                {inbox.address}
              </code>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="gap-1.5 h-9 rounded-lg text-xs font-medium"
            >
              <Copy className="size-3.5" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMessages(true)}
              disabled={isRefreshing}
              className="gap-1.5 h-9 rounded-lg text-xs font-medium"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteInbox}
              className="gap-1.5 h-9 rounded-lg text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetInbox}
              className="gap-1.5 h-9 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="size-3.5" />
              New
            </Button>
          </div>
        </div>

        {/* Last fetch timestamp */}
        {lastFetched && (
          <p className="text-[11px] text-muted-foreground font-mono">
            Last checked: {lastFetched.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
          </p>
        )}

        {/* Expiry bar */}
        {inbox && (
          <ExpiryBar expiresAt={inbox.expiresAt} />
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0">
        {/* Message list */}
        <div className="lg:w-96 shrink-0">
          <Inbox
            messages={messages}
            selectedId={selectedMessage?.id}
            onSelect={setSelectedMessage}
            onRefresh={() => fetchMessages(true)}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* Message viewer */}
        <div className="flex-1 min-h-0">
          {selectedMessage ? (
            <div className="relative h-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMessage(null)}
                className="lg:hidden absolute top-3 left-3 z-10 gap-1.5 text-xs"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              <MessageView message={selectedMessage} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center rounded-2xl border border-dashed bg-card/30">
              <div className="text-center space-y-2 p-8">
                <Mail className="mx-auto size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Select a message to read
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Click "Refresh" to check for new messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ExpiryBar({ expiresAt }: { expiresAt: number }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const update = () => {
      const remaining = expiresAt - Date.now();
      const total = TTL_MS;
      const pct = Math.max(0, Math.min(100, (remaining / total) * 100));
      setProgress(pct);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="relative h-1 rounded-full bg-muted overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-aurora-indigo to-aurora-violet transition-all duration-1000 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
