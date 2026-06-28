"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getDomain } from "@/lib/email";
import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_PATTERN,
} from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Dice5 } from "lucide-react";

interface UsernameInputProps {
  onSubmit: (username: string) => void;
  onRandom: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function UsernameInput({
  onSubmit,
  onRandom,
  isLoading = false,
  disabled = false,
  className = "",
}: UsernameInputProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const domain = getDomain();

  const validate = useCallback((value: string): string | null => {
    if (!value) return null;
    const lower = value.toLowerCase();
    if (lower.length < USERNAME_MIN_LENGTH) {
      return `At least ${USERNAME_MIN_LENGTH} characters`;
    }
    if (lower.length > USERNAME_MAX_LENGTH) {
      return `Max ${USERNAME_MAX_LENGTH} characters`;
    }
    if (!USERNAME_PATTERN.test(lower)) {
      return "Only lowercase letters, numbers, dots, hyphens";
    }
    if (
      lower.includes("..") ||
      lower.includes("--") ||
      lower.includes(".-") ||
      lower.includes("-.")
    ) {
      return "No consecutive dots/hyphens";
    }
    return null;
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, "");
      setUsername(value);
      if (value) {
        setError(validate(value));
      } else {
        setError(null);
      }
    },
    [validate]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = username.trim().toLowerCase();
      if (!trimmed) {
        onRandom();
        return;
      }
      const err = validate(trimmed);
      if (err) {
        setError(err);
        return;
      }
      onSubmit(trimmed);
    },
    [username, validate, onSubmit, onRandom]
  );

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const addressPreview = username
    ? `${username}@${domain}`
    : `yourname@${domain}`;

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      {/* Input row: username + domain badge */}
      <div
        className={`relative flex items-center rounded-xl border bg-card/50 backdrop-blur-sm transition-all duration-200 ${
          focused
            ? "border-primary/50 ring-2 ring-primary/20 shadow-lg shadow-primary/5"
            : "border-border hover:border-primary/30"
        } ${error ? "border-destructive/50 ring-2 ring-destructive/20" : ""}`}
      >
        <Input
          ref={inputRef}
          type="text"
          value={username}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="yourname"
          disabled={disabled || isLoading}
          className="flex-1 border-0 bg-transparent h-12 rounded-xl text-sm font-mono shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="Custom username"
          aria-invalid={!!error}
          aria-describedby={error ? "username-error" : undefined}
          maxLength={USERNAME_MAX_LENGTH}
          autoComplete="off"
          spellCheck={false}
        />
        <Badge
          variant="secondary"
          className="mr-3 shrink-0 font-mono text-xs px-2.5 py-1 bg-muted/50 text-muted-foreground"
        >
          @{domain}
        </Badge>
      </div>

      {/* Error message */}
      {error && (
        <p
          className="text-xs text-destructive font-medium pl-1"
          id="username-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Address preview */}
      {!error && username && (
        <p className="text-xs text-muted-foreground pl-1">
          Your address:{" "}
          <span className="font-mono font-medium text-foreground">
            {addressPreview}
          </span>
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={disabled || isLoading || (!!error && !!username)}
          className="flex-1 h-12 rounded-xl font-semibold text-sm gap-2 bg-gradient-to-r from-primary to-aurora-violet hover:from-primary/90 hover:to-aurora-violet/90 text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-primary/30"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating...
            </>
          ) : username ? (
            "Create Inbox"
          ) : (
            "Generate Random"
          )}
        </Button>

        {username && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setUsername("");
              setError(null);
              onRandom();
            }}
            disabled={disabled || isLoading}
            className="h-12 rounded-xl px-4 gap-1.5 text-sm border-border/50 hover:border-primary/30 hover:bg-accent/50"
          >
            <Dice5 className="size-4" />
            Random
          </Button>
        )}
      </div>
    </form>
  );
}

