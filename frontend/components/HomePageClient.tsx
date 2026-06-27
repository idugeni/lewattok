"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Inbox } from "@/components/Inbox";
import { AlertCircle } from "lucide-react";

export function HomePageClient() {
  const [address, setAddress] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<Date | undefined>();
  const [confirmNew, setConfirmNew] = useState(false);

  useEffect(() => {
    generate();
  }, []);

  const generate = async (isUserInitiated = false) => {
    try {
      setAddress(null);
      setError(null);
      const res = await fetch("/api/generate");
      if (!res.ok) throw new Error("Failed to generate address");
      const data = await res.json();
      setAddress(data.address);
      setKey((k) => k + 1);
      setCreatedAt(new Date());
      if (isUserInitiated) {
        toast.success("New address generated!", { description: data.address });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate email";
      setError(msg);
      toast.error("Failed to generate address", { description: msg });
    }
  };

  const handleNew = () => {
    setConfirmNew(true);
  };

  const confirmGenerate = () => {
    setConfirmNew(false);
    generate(true);
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-5 max-w-sm">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => generate()} variant="default" className="min-w-[120px]">
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

  return (
    <>
      <Inbox key={key} address={address} onNew={handleNew} createdAt={createdAt} />
      <Dialog open={confirmNew} onOpenChange={setConfirmNew}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate new address?</DialogTitle>
            <DialogDescription>
              Your current inbox and all messages will be lost. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmNew(false)}>
              Cancel
            </Button>
            <Button onClick={confirmGenerate}>
              Generate new
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
