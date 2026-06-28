import { MimeParser } from "./mime";
import type { EmailMessage, InboxInfo } from "../../shared/types";

interface Env {
  EMAIL_KV: KVNamespace;
  API_KEY: string;
  DOMAIN: string;
  ALLOWED_ORIGINS?: string;
}

interface KeyMeta {
  name: string;
  source?: string;
  created: string;
  expires_at?: string;
  last_used: string | null;
  last_used_ts?: number;
}

const INBOX_TTL = 900; // 15 minutes
const USERNAME_MIN = 3;
const USERNAME_MAX = 30;
const USERNAME_RE = /^[a-z0-9][a-z0-9.\-]*[a-z0-9]$/;

// Max sizes
const MAX_EMAIL_SIZE = 512 * 1024; // 512KB per email body
const MAX_RECIPIENT_LEN = 254;
const MAX_MESSAGE_COUNT = 50;
const MIME_MAX_DEPTH = 3;
const LAST_USED_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes

// Default allowed origins
const DEFAULT_ORIGINS = "https://aurelion.web.id,https://aurelion.vercel.app";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAllowedOrigins(env: Env): string[] {
  const raw = env.ALLOWED_ORIGINS || DEFAULT_ORIGINS;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function getCorsOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  const allowed = getAllowedOrigins(env);
  return allowed.includes(origin) ? origin : null;
}

function securityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-DNS-Prefetch-Control": "off",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}

function json(data: unknown, status = 200, corsOrigin: string | null = null, extraHeaders?: Record<string, string>): Response {
  const res = Response.json(data, { status });
  const headers = securityHeaders();
  if (corsOrigin) {
    headers["Access-Control-Allow-Origin"] = corsOrigin;
    headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type, X-API-Key";
    headers["Access-Control-Max-Age"] = "86400";
    headers["Vary"] = "Origin";
  }
  if (extraHeaders) {
    Object.assign(headers, extraHeaders);
  }
  for (const [k, v] of Object.entries(headers)) {
    res.headers.set(k, v);
  }
  return res;
}

function errorResponse(status: number, message: string, corsOrigin: string | null = null): Response {
  return json({ error: message }, status, corsOrigin);
}

// ─── Timing-Safe Comparison ──────────────────────────────────────────────────

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do comparison to avoid length-based timing leak
    let result = a.length ^ b.length;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ 0;
    }
    return result === 0;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function requireMaster(request: Request, env: Env): boolean {
  const key = request.headers.get("X-API-Key");
  if (!key || !env.API_KEY) return false;
  return timingSafeEqual(key, env.API_KEY);
}

async function requireAuth(request: Request, env: Env): Promise<boolean> {
  const key = request.headers.get("X-API-Key");
  if (!key) return false;
  if (env.API_KEY && timingSafeEqual(key, env.API_KEY)) return true;
  const raw = await env.EMAIL_KV.get("apikey_" + key);
  if (!raw) return false;
  let meta: KeyMeta;
  try {
    meta = JSON.parse(raw);
  } catch {
    return false;
  }
  if (meta.expires_at && Date.now() > new Date(meta.expires_at).getTime()) {
    await env.EMAIL_KV.delete("apikey_" + key).catch(() => {});
    return false;
  }
  // Throttle last_used writes: only update every 5 minutes
  const now = Date.now();
  if (!meta.last_used_ts || now - meta.last_used_ts > LAST_USED_THROTTLE_MS) {
    meta.last_used = new Date(now).toISOString();
    meta.last_used_ts = now;
    env.EMAIL_KV.put("apikey_" + key, JSON.stringify(meta), { expirationTtl: PUBLIC_KEY_TTL }).catch(() => {});
  }
  return true;
}

const PUBLIC_KEY_TTL = 2592000; // 30 days

function generateApiKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return "al_" + hex;
}

// ─── Cryptographically Secure Address Generation ─────────────────────────────

function generateRandomAddress(domain: string): string {
  // 8 random bytes = 64-bit entropy, encoded as 16 hex chars
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `tmp${hex}@${domain}`;
}

// ─── Custom Username Validation ──────────────────────────────────────────────

function validateCustomUsername(username: string): string | null {
  const lower = username.toLowerCase();
  if (lower.length < USERNAME_MIN) return `Username must be at least ${USERNAME_MIN} characters`;
  if (lower.length > USERNAME_MAX) return `Username must be at most ${USERNAME_MAX} characters`;
  if (!USERNAME_RE.test(lower)) return "Only lowercase letters, numbers, dots, and hyphens allowed. Must start and end with a letter or number.";
  if (lower.includes("..") || lower.includes("--") || lower.includes(".-") || lower.includes("-.")) {
    return "No consecutive dots or hyphens allowed";
  }
  return null;
}

// ─── Input Validation ────────────────────────────────────────────────────────

function validateRecipient(recipient: string): string | null {
  if (!recipient || typeof recipient !== "string") return "Missing recipient";
  if (recipient.length > MAX_RECIPIENT_LEN) return "Recipient too long";
  if (!recipient.includes("@")) return "Invalid recipient format";
  // Basic sanitization: trim, no control characters
  const cleaned = recipient.trim();
  if (cleaned.length === 0) return "Empty recipient";
  if (/[\x00-\x1f\x7f]/.test(cleaned)) return "Invalid characters in recipient";
  return null;
}

// ─── Sliding Window Rate Limiter ─────────────────────────────────────────────

interface RateLimitConfig {
  limit: number;
  windowSec: number;
}

async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
  const now = Math.floor(Date.now() / 1000);
  const currentWindow = Math.floor(now / config.windowSec);
  const previousWindow = currentWindow - 1;

  const currentKey = `rl_${key}_${currentWindow}`;
  const previousKey = `rl_${key}_${previousWindow}`;

  // Read both windows
  const [currentRaw, previousRaw] = await Promise.all([
    kv.get(currentKey),
    kv.get(previousKey),
  ]);

  const currentCount = currentRaw ? parseInt(currentRaw, 10) : 0;
  const previousCount = previousRaw ? parseInt(previousRaw, 10) : 0;

  // Sliding window: weighted sum of previous + current
  const elapsedInWindow = now - (currentWindow * config.windowSec);
  const weight = 1 - (elapsedInWindow / config.windowSec);
  const effectiveCount = Math.floor(previousCount * weight) + currentCount;

  if (effectiveCount >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: config.windowSec - elapsedInWindow,
    };
  }

  // Increment current window
  await kv.put(currentKey, String(currentCount + 1), { expirationTtl: config.windowSec * 3 });

  return {
    allowed: true,
    remaining: config.limit - effectiveCount - 1,
    retryAfter: 0,
  };
}

// Rate limit presets
const RL_GLOBAL: RateLimitConfig = { limit: 100, windowSec: 60 };
const RL_INBOX_CREATE: RateLimitConfig = { limit: 5, windowSec: 600 }; // 5 per 10 min
const RL_FETCH: RateLimitConfig = { limit: 30, windowSec: 60 };
const RL_DELETE: RateLimitConfig = { limit: 10, windowSec: 60 };

function rateLimitHeaders(remaining: number, limit: number, retryAfter: number): Record<string, string> {
  const h: Record<string, string> = {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
  };
  if (retryAfter > 0) {
    h["Retry-After"] = String(retryAfter);
  }
  return h;
}

async function enforceRateLimit(
  kv: KVNamespace,
  ip: string,
  action: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const rlKey = `${ip}_${action}`;
  const result = await checkRateLimit(kv, rlKey, config);
  const headers = rateLimitHeaders(result.remaining, config.limit, result.retryAfter);
  return { allowed: result.allowed, headers };
}

// ─── Worker Entry ────────────────────────────────────────────────────────────

export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    const raw = await readRawMessage(message);

    // Limit total email size
    if (raw.length > 2 * 1024 * 1024) {
      console.warn("Email too large, discarding");
      return;
    }

    const parser = new MimeParser(raw, MIME_MAX_DEPTH);
    const parsed = parser.parse();

    // Truncate oversized bodies
    if (parsed.text.length > MAX_EMAIL_SIZE) {
      parsed.text = parsed.text.slice(0, MAX_EMAIL_SIZE) + "\n[truncated]";
    }
    if (parsed.html.length > MAX_EMAIL_SIZE) {
      parsed.html = parsed.html.slice(0, MAX_EMAIL_SIZE) + "<p>[truncated]</p>";
    }

    const recipient = validateEmail(message.to, env.DOMAIN);
    const sender = validateEmail(message.from, null);
    const subject = message.headers.get("subject")?.trim() || "(no subject)";

    if (!recipient || !sender) {
      return;
    }

    const msg: EmailMessage = {
      id: crypto.randomUUID(),
      message_id: crypto.randomUUID(),
      recipient,
      sender,
      subject: decodeMimeWords(subject),
      body_text: parsed.text,
      body_html: parsed.html,
      created_at: new Date().toISOString(),
    };

    const existing = await env.EMAIL_KV.get(recipient, "json").catch(() => null);
    const messages: EmailMessage[] = Array.isArray(existing) ? existing : [];

    const existingIds = new Set(messages.map((m) => m.message_id));
    if (!existingIds.has(msg.message_id)) {
      // Limit total messages per inbox
      if (messages.length >= MAX_MESSAGE_COUNT) {
        messages.shift(); // Remove oldest
      }
      messages.push(msg);
    }

    await env.EMAIL_KV.put(recipient, JSON.stringify(messages), {
      expirationTtl: INBOX_TTL,
    });

    // Invalidate cache for this recipient
    // (Cache API is not available in email handler, but TTL handles it)
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const corsOrigin = getCorsOrigin(request, env);

    // ─── OPTIONS (Preflight) ─────────────────────────────────────────────
    if (method === "OPTIONS") {
      if (!corsOrigin) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
          "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin",
          ...securityHeaders(),
        },
      });
    }

    // ─── CORS Check for Non-GET Methods ──────────────────────────────────
    // GET requests from browser need CORS for fetch(), so we allow them
    // But only if origin matches
    if (method !== "GET" && !corsOrigin && request.headers.get("Origin")) {
      return errorResponse(403, "Forbidden: origin not allowed", null);
    }

    // ─── Global Rate Limit ───────────────────────────────────────────────
    const globalRL = await enforceRateLimit(env.EMAIL_KV, ip, "global", RL_GLOBAL);
    if (!globalRL.allowed) {
      return json(
        { error: "Rate limit exceeded. Too many requests." },
        429,
        corsOrigin,
        globalRL.headers
      );
    }

    // ─── Legacy Endpoints (used by web UI) ───────────────────────────────

    // GET /messages or /api/messages
    if ((path === "/messages" || path === "/api/messages") && method === "GET") {
      const fetchRL = await enforceRateLimit(env.EMAIL_KV, ip, "fetch", RL_FETCH);
      if (!fetchRL.allowed) {
        return json({ error: "Rate limit exceeded" }, 429, corsOrigin, fetchRL.headers);
      }
      return handleGetMessages(url, env, corsOrigin, fetchRL.headers);
    }

    // DELETE /messages or /api/messages
    if ((path === "/messages" || path === "/api/messages") && method === "DELETE") {
      const deleteRL = await enforceRateLimit(env.EMAIL_KV, ip, "delete", RL_DELETE);
      if (!deleteRL.allowed) {
        return json({ error: "Rate limit exceeded" }, 429, corsOrigin, deleteRL.headers);
      }
      return handleDeleteInbox(url, env, corsOrigin, deleteRL.headers);
    }

    // POST /api/inbox — create inbox
    if (path === "/api/inbox" && method === "POST") {
      const createRL = await enforceRateLimit(env.EMAIL_KV, ip, "create", RL_INBOX_CREATE);
      if (!createRL.allowed) {
        return json({ error: "Rate limit exceeded. Max 5 inboxes per 10 minutes." }, 429, corsOrigin, createRL.headers);
      }
      return handleCreateInbox(request, env, corsOrigin, createRL.headers);
    }

    // DELETE /api/inbox
    if (path === "/api/inbox" && method === "DELETE") {
      const deleteRL = await enforceRateLimit(env.EMAIL_KV, ip, "delete", RL_DELETE);
      if (!deleteRL.allowed) {
        return json({ error: "Rate limit exceeded" }, 429, corsOrigin, deleteRL.headers);
      }
      return handleDeleteInbox(url, env, corsOrigin, deleteRL.headers);
    }

    // ─── V1 API Endpoints ────────────────────────────────────────────────

    // POST /api/v1/inboxes or /api/v1/generate
    if ((path === "/api/v1/generate" || path === "/api/v1/inboxes") && method === "POST") {
      if (!(await requireAuth(request, env))) return errorResponse(401, "Invalid or missing API key", corsOrigin);
      const createRL = await enforceRateLimit(env.EMAIL_KV, ip, "create", RL_INBOX_CREATE);
      if (!createRL.allowed) {
        return json({ error: "Rate limit exceeded" }, 429, corsOrigin, createRL.headers);
      }
      return handleCreateInbox(request, env, corsOrigin, createRL.headers);
    }

    // DELETE /api/v1/inboxes/{email}
    if (path.startsWith("/api/v1/inboxes/") && method === "DELETE") {
      if (!(await requireAuth(request, env))) return errorResponse(401, "Invalid or missing API key", corsOrigin);
      const deleteRL = await enforceRateLimit(env.EMAIL_KV, ip, "delete", RL_DELETE);
      if (!deleteRL.allowed) {
        return json({ error: "Rate limit exceeded" }, 429, corsOrigin, deleteRL.headers);
      }
      const parts = path.split("/");
      const email = parts[3] ? decodeURIComponent(parts[3]) : null;
      if (!email) return errorResponse(400, "Missing inbox address", corsOrigin);
      const err = validateRecipient(email);
      if (err) return errorResponse(400, err, corsOrigin);
      await env.EMAIL_KV.delete(email);
      return json({ deleted: email }, 200, corsOrigin, deleteRL.headers);
    }

    // GET /api/v1/messages or /api/v1/inboxes/{email}/messages
    if ((path === "/api/v1/messages" || path.startsWith("/api/v1/inboxes/")) && method === "GET") {
      if (!(await requireAuth(request, env))) return errorResponse(401, "Invalid or missing API key", corsOrigin);
      const fetchRL = await enforceRateLimit(env.EMAIL_KV, ip, "fetch", RL_FETCH);
      if (!fetchRL.allowed) {
        return json({ error: "Rate limit exceeded" }, 429, corsOrigin, fetchRL.headers);
      }

      let recipient = url.searchParams.get("recipient");
      if (!recipient && path.startsWith("/api/v1/inboxes/")) {
        const parts = path.split("/");
        recipient = parts[3] ? decodeURIComponent(parts[3]) : null;
      }
      if (!recipient) return errorResponse(400, "Missing recipient", corsOrigin);
      const err = validateRecipient(recipient);
      if (err) return errorResponse(400, err, corsOrigin);

      const since = url.searchParams.get("since");
      const data = await env.EMAIL_KV.get(recipient, "json").catch(() => null);
      const messages: EmailMessage[] = Array.isArray(data) ? data : [];

      if (since) {
        const sinceDate = new Date(since).getTime();
        if (isNaN(sinceDate)) return errorResponse(400, "Invalid 'since' parameter", corsOrigin);
        const filtered = messages.filter((m) => new Date(m.created_at).getTime() > sinceDate);
        return json({ messages: filtered }, 200, corsOrigin, fetchRL.headers);
      }

      messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return json({ messages: messages.slice(0, MAX_MESSAGE_COUNT) }, 200, corsOrigin, fetchRL.headers);
    }

    // ─── Admin: API Key Management ───────────────────────────────────────

    if (path === "/api/v1/admin/keys" && method === "POST") {
      if (!requireMaster(request, env)) return errorResponse(401, "Unauthorized", corsOrigin);
      const adminRL = await enforceRateLimit(env.EMAIL_KV, ip, "admin", { limit: 10, windowSec: 60 });
      if (!adminRL.allowed) {
        return json({ error: "Rate limit exceeded" }, 429, corsOrigin, adminRL.headers);
      }
      const key = generateApiKey();
      const now = new Date().toISOString();
      const ttl = parseInt(url.searchParams.get("ttl") || "") || null;
      const meta: KeyMeta = { name: "", created: now, last_used: null };
      if (ttl) meta.expires_at = new Date(Date.now() + ttl * 1000).toISOString();
      const kvOpts = ttl ? { expirationTtl: ttl } : undefined;
      await env.EMAIL_KV.put("apikey_" + key, JSON.stringify(meta), kvOpts);
      return json({ key, ...meta }, 201, corsOrigin);
    }

    if (path === "/api/v1/admin/keys" && method === "GET") {
      if (!requireMaster(request, env)) return errorResponse(401, "Unauthorized", corsOrigin);
      const listed = await env.EMAIL_KV.list({ prefix: "apikey_" });
      const keys: { key: string; name: string; created: string; expires_at: string | null; last_used: string | null }[] = [];
      for (const item of listed.keys) {
        const raw = await env.EMAIL_KV.get(item.name).catch(() => null);
        let meta: KeyMeta | null = null;
        try {
          meta = raw ? JSON.parse(raw) : null;
        } catch {
          meta = null;
        }
        const short = item.name.replace("apikey_", "");
        keys.push({
          key: short.slice(0, 12) + "...",
          name: meta?.name ?? "",
          created: meta?.created ?? "",
          expires_at: meta?.expires_at ?? null,
          last_used: meta?.last_used ?? null,
        });
      }
      return json({ keys }, 200, corsOrigin);
    }

    if (path === "/api/v1/admin/keys" && method === "DELETE") {
      if (!requireMaster(request, env)) return errorResponse(401, "Unauthorized", corsOrigin);
      const body = await request.json().catch(() => null) as { key?: string } | null;
      const target = body?.key;
      if (!target || typeof target !== "string") return errorResponse(400, "Missing 'key' in request body", corsOrigin);
      // Validate key format to prevent injection
      if (!/^al_[a-f0-9]{48}$/.test(target)) return errorResponse(400, "Invalid key format", corsOrigin);
      await env.EMAIL_KV.delete("apikey_" + target);
      return json({ revoked: target }, 200, corsOrigin);
    }

    // ─── Public: Self-service key generation ─────────────────────────────

    if (path === "/api/v1/public/key" && method === "POST") {
      const keygenRL = await enforceRateLimit(env.EMAIL_KV, ip, "keygen", { limit: 1, windowSec: 3600 });
      if (!keygenRL.allowed) {
        return json({ error: "Rate limited. One key per hour." }, 429, corsOrigin, keygenRL.headers);
      }
      const key = generateApiKey();
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + PUBLIC_KEY_TTL * 1000).toISOString();
      const meta = { name: "", source: "public", created: now, expires_at: expiresAt, last_used: null };
      await env.EMAIL_KV.put("apikey_" + key, JSON.stringify(meta), { expirationTtl: PUBLIC_KEY_TTL });
      return json({ key, ...meta }, 201, corsOrigin, keygenRL.headers);
    }

    // ─── Health / Fallback ───────────────────────────────────────────────

    return json({ status: "ok", version: "2.0.0" }, 200, corsOrigin);
  },
};

// ─── Inbox Creation ──────────────────────────────────────────────────────────

async function handleCreateInbox(
  request: Request,
  env: Env,
  corsOrigin: string | null,
  rateLimitHeaders: Record<string, string>
): Promise<Response> {
  let username: string | undefined;

  try {
    const body = await request.json().catch(() => null) as { username?: string } | null;
    if (body?.username && typeof body.username === "string") {
      username = body.username.toLowerCase().trim();
    }
  } catch {
    // No body or invalid JSON — generate random
  }

  let address: string;

  if (username) {
    const err = validateCustomUsername(username);
    if (err) {
      return json({ error: err }, 400, corsOrigin, rateLimitHeaders);
    }
    address = `${username}@${env.DOMAIN}`;

    // Check if address already exists and is still valid
    const existing = await env.EMAIL_KV.get(address, "json").catch(() => null);
    if (existing) {
      return json({ error: "Username already taken. Try a different one." }, 409, corsOrigin, rateLimitHeaders);
    }
  } else {
    // Generate random with crypto.getRandomValues — no collision check needed at 64-bit entropy
    address = generateRandomAddress(env.DOMAIN);
  }

  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + INBOX_TTL * 1000).toISOString();

  // Initialize empty inbox in KV with TTL
  await env.EMAIL_KV.put(address, JSON.stringify([]), { expirationTtl: INBOX_TTL });

  const info: InboxInfo = { address, created_at: now, expires_at: expiresAt };
  return json(info, 201, corsOrigin, rateLimitHeaders);
}

// ─── Inbox Deletion ──────────────────────────────────────────────────────────

async function handleDeleteInbox(
  url: URL,
  env: Env,
  corsOrigin: string | null,
  rateLimitHeaders: Record<string, string>
): Promise<Response> {
  const recipient = url.searchParams.get("recipient");
  if (!recipient) {
    return json({ error: "Missing recipient parameter" }, 400, corsOrigin, rateLimitHeaders);
  }
  const err = validateRecipient(recipient);
  if (err) {
    return json({ error: err }, 400, corsOrigin, rateLimitHeaders);
  }

  await env.EMAIL_KV.delete(recipient);
  return json({ deleted: recipient }, 200, corsOrigin, rateLimitHeaders);
}

// ─── Get Messages (with Cache API) ──────────────────────────────────────────

async function handleGetMessages(
  url: URL,
  env: Env,
  corsOrigin: string | null,
  rateLimitHeaders: Record<string, string>
): Promise<Response> {
  const recipient = url.searchParams.get("recipient");
  if (!recipient) {
    return json({ error: "Missing recipient parameter" }, 400, corsOrigin, rateLimitHeaders);
  }
  const err = validateRecipient(recipient);
  if (err) {
    return json({ error: err }, 400, corsOrigin, rateLimitHeaders);
  }

  const since = url.searchParams.get("since");

  const data = await env.EMAIL_KV.get(recipient, "json").catch(() => null);
  const messages: EmailMessage[] = Array.isArray(data) ? data : [];

  let result: EmailMessage[];

  if (since) {
    const sinceDate = new Date(since).getTime();
    if (isNaN(sinceDate)) {
      return json({ error: "Invalid 'since' parameter" }, 400, corsOrigin, rateLimitHeaders);
    }
    result = messages.filter((m) => new Date(m.created_at).getTime() > sinceDate);
  } else {
    messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    result = messages.slice(0, MAX_MESSAGE_COUNT);
  }

  const body = JSON.stringify({ messages: result });
  const etag = `"${await sha256(body)}"`;

  const headers: Record<string, string> = {
    "Cache-Control": "private, max-age=5, stale-while-revalidate=3",
    "ETag": etag,
    ...rateLimitHeaders,
  };

  // Conditional request: If-None-Match
  // Note: We can't use the Cache API directly in email handler context,
  // but ETag + Cache-Control provides browser-side caching

  const res = Response.json({ messages: result }, { status: 200, headers: { ...securityHeaders(), ...headers } });
  if (corsOrigin) {
    res.headers.set("Access-Control-Allow-Origin", corsOrigin);
    res.headers.set("Vary", "Origin");
  }
  return res;
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

// ─── Email Validation ────────────────────────────────────────────────────────

function validateEmail(email: string, requiredDomain: string | null): string | null {
  const cleaned = email.trim().replace(/^<|>$/g, "");
  if (!cleaned || cleaned.length > 320) return null;
  if (!cleaned.includes("@")) return null;
  // No control characters
  if (/[\x00-\x1f\x7f]/.test(cleaned)) return null;
  const parts = cleaned.split("@");
  if (parts.length !== 2) return null;
  const [local, domain] = parts;
  if (local.length === 0 || local.length > 64) return null;
  if (domain.length === 0 || domain.length > 255) return null;
  // If requiredDomain is set, recipient must be on that domain
  if (requiredDomain && domain.toLowerCase() !== requiredDomain.toLowerCase()) return null;
  return cleaned;
}

// ─── MIME Decoding Helpers ───────────────────────────────────────────────────

async function readRawMessage(message: ForwardableEmailMessage): Promise<string> {
  const reader = message.raw.getReader();
  const chunks: Uint8Array[] = [];
  let done = false;
  while (!done) {
    const result = await reader.read();
    done = result.done;
    if (result.value) chunks.push(result.value);
  }
  const totalLength = chunks.reduce((acc, arr) => acc + arr.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of chunks) {
    merged.set(arr, offset);
    offset += arr.length;
  }
  return new TextDecoder().decode(merged);
}

function decodeMimeWords(text: string): string {
  return text.replace(
    /=\?([^?]+)\?([BbQq])\?([^?]+)\?=/g,
    (_, charset: string, encoding: string, encoded: string) => {
      try {
        if (encoding.toUpperCase() === "B") {
          const binary = atob(encoded.replace(/\s/g, ""));
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          return new TextDecoder(charset.toLowerCase()).decode(bytes);
        }
        return decodeQEncoding(encoded);
      } catch {
        return encoded;
      }
    }
  );
}

function decodeQEncoding(encoded: string): string {
  let result = "";
  let i = 0;
  while (i < encoded.length) {
    if (encoded[i] === "=" && i + 2 < encoded.length) {
      const hex = encoded.slice(i + 1, i + 3);
      if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
        result += String.fromCharCode(parseInt(hex, 16));
        i += 3;
        continue;
      }
    }
    if (encoded[i] === "_") {
      result += " ";
    } else {
      result += encoded[i];
    }
    i++;
  }
  return result;
}
