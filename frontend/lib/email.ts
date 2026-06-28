import {
  ADJECTIVES,
  NOUNS,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_PATTERN,
} from "@/lib/constants";

export function getDomain(): string {
  return process.env.NEXT_PUBLIC_APP_DOMAIN || "aurelion.web.id";
}

export function generateRandomAddress(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `${adj}.${noun}${suffix}@${getDomain()}`;
}

/** Alias for generateRandomAddress (used by refactored components) */
export function generateAddress(domain?: string): string {
  if (domain) return generateRandomAddress().replace(getDomain(), domain);
  return generateRandomAddress();
}

/**
 * Build a custom address from a username.
 * Username must be lowercase alphanumeric with dots/hyphens, 3-30 chars.
 */
export function buildAddress(username: string, domain?: string): string {
  return `${username}@${domain || getDomain()}`;
}

/**
 * Validate a custom username.
 * Returns `null` if valid, or an error message string if invalid.
 */
export function validateUsername(username: string): string | null {
  const lower = username.toLowerCase();
  if (lower.length < USERNAME_MIN_LENGTH) {
    return `Username must be at least ${USERNAME_MIN_LENGTH} characters`;
  }
  if (lower.length > USERNAME_MAX_LENGTH) {
    return `Username must be at most ${USERNAME_MAX_LENGTH} characters`;
  }
  if (!USERNAME_PATTERN.test(lower)) {
    return "Only lowercase letters, numbers, dots, and hyphens allowed. Must start and end with a letter or number.";
  }
  if (lower.includes("..") || lower.includes("--") || lower.includes(".-") || lower.includes("-.")) {
    return "No consecutive dots or hyphens allowed";
  }
  return null;
}
