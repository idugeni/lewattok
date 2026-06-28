"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getDomain } from "@/lib/email";
import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_PATTERN,
} from "@/lib/constants";

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
    if (lower.includes("..") || lower.includes("--") || lower.includes(".-") || lower.includes("-.")) {
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
    <form onSubmit={handleSubmit} className={`username-input-wrapper ${className}`}>
      <div className={`username-input-container ${focused ? "focused" : ""} ${error ? "has-error" : ""}`}>
        <input
          ref={inputRef}
          type="text"
          value={username}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="yourname"
          disabled={disabled || isLoading}
          className="username-input-field"
          aria-label="Custom username"
          aria-invalid={!!error}
          aria-describedby={error ? "username-error" : undefined}
          maxLength={USERNAME_MAX_LENGTH}
          autoComplete="off"
          spellCheck={false}
        />
        <span className="username-domain-badge">@{domain}</span>
      </div>

      {error && (
        <p className="username-error" id="username-error" role="alert">
          {error}
        </p>
      )}

      {!error && username && (
        <p className="username-preview">
          Your address: <strong>{addressPreview}</strong>
        </p>
      )}

      <div className="username-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={disabled || isLoading || (!!error && !!username)}
        >
          {isLoading ? (
            <span className="loading-text">
              <span className="loading-spinner" />
              Creating...
            </span>
          ) : username ? (
            "Create Inbox"
          ) : (
            "Generate Random"
          )}
        </button>

        {username && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setUsername("");
              setError(null);
              onRandom();
            }}
            disabled={disabled || isLoading}
          >
            Random
          </button>
        )}
      </div>
    </form>
  );
}
