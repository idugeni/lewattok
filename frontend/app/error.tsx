"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {}, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-5 max-w-sm">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {error.message || "An unexpected error occurred."}
          </AlertDescription>
        </Alert>
        <Button onClick={reset} variant="default" className="min-w-[120px]">
          Try again
        </Button>
      </div>
    </div>
  );
}
