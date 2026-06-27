import { MimeParser } from "./mime";

interface EmailMessage {
  id: string;
  message_id: string;
  recipient: string;
  sender: string;
  subject: string;
  body_text: string;
  body_html: string;
  created_at: string;
}

interface Env {
  EMAIL_KV: KVNamespace;
  API_KEY: string;
  DOMAIN: string;
}

interface KeyMeta {
  name: string;
  source?: string;
  created: string;
  expires_at?: string;
  last_used: string | null;
}

function json(data: unknown, status = 200, cors = false): Response {
  const res = Response.json(data, { status });
  if (cors) {
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
  }
  return res;
}

function errorResponse(status: number, message: string, cors = false): Response {
  return json({ error: message }, status, cors);
}

function requireMaster(request: Request, env: Env): boolean {
  const key = request.headers.get("X-API-Key");
  return key !== null && key === env.API_KEY;
}

async function requireAuth(request: Request, env: Env): Promise<boolean> {
  const key = request.headers.get("X-API-Key");
  if (!key) return false;
  if (key === env.API_KEY) return true;
  const raw = await env.EMAIL_KV.get("apikey_" + key);
  if (!raw) return false;
  const meta: KeyMeta = JSON.parse(raw);
  if (meta.expires_at && Date.now() > new Date(meta.expires_at).getTime()) {
    await env.EMAIL_KV.delete("apikey_" + key).catch(() => {});
    return false;
  }
  env.EMAIL_KV.put("apikey_" + key, JSON.stringify({ ...meta, last_used: new Date().toISOString() })).catch(() => {});
  return true;
}

const PUBLIC_KEY_TTL = 2592000; // 30 days

function generateApiKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return "al_" + hex;
}

const ADJECTIVES = [
  "swift", "calm", "bold", "keen", "wise", "warm", "cool", "soft",
  "dark", "pure", "vast", "rare", "deep", "free", "fair", "glad",
];

const NOUNS = [
  "fox", "owl", "elm", "ark", "sun", "moon", "star", "wave",
  "pine", "rune", "flux", "echo", "hive", "core", "node", "zinc",
];

function generateRandomAddress(domain: string): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `${adj}.${noun}${suffix}@${domain}`;
}

export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    const raw = await readRawMessage(message);

    const parser = new MimeParser(raw);
    const parsed = parser.parse();

    const recipient = validateEmail(message.to);
    const sender = validateEmail(message.from);
    const subject = message.headers.get("subject")?.trim() || "(no subject)";

    if (!recipient || !sender) {
      console.error("Invalid recipient or sender", { to: message.to, from: message.from });
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
    messages.push(msg);

    await env.EMAIL_KV.put(recipient, JSON.stringify(messages), {
      expirationTtl: 900,
    });
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
        },
      });
    }

    if (path === "/messages" || path === "/api/messages") {
      return handleGetMessages(url, env);
    }

    if (path === "/api/v1/generate" || path === "/api/v1/inboxes") {
      if (method !== "POST") return errorResponse(405, "Method not allowed", true);
      if (!(await requireAuth(request, env))) return errorResponse(401, "Invalid or missing API key", true);
      const address = generateRandomAddress(env.DOMAIN);
      return json({ address }, 201, true);
    }

    if (path === "/api/v1/messages" || path.startsWith("/api/v1/inboxes/")) {
      if (method !== "GET") return errorResponse(405, "Method not allowed", true);
      if (!(await requireAuth(request, env))) return errorResponse(401, "Invalid or missing API key", true);

      let recipient = url.searchParams.get("recipient");
      if (!recipient && path.startsWith("/api/v1/inboxes/")) {
        const parts = path.split("/");
        recipient = parts[3] ? decodeURIComponent(parts[3]) : null;
      }
      if (!recipient) return errorResponse(400, "Missing recipient", true);

      const since = url.searchParams.get("since");
      const data = await env.EMAIL_KV.get(recipient, "json").catch(() => null);
      const messages: EmailMessage[] = Array.isArray(data) ? data : [];

      if (since) {
        const sinceDate = new Date(since).getTime();
        const filtered = messages.filter((m) => new Date(m.created_at).getTime() > sinceDate);
        return json({ messages: filtered }, 200, true);
      }

      messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return json({ messages: messages.slice(0, 50) }, 200, true);
    }

    // --- Admin: API Key Management ---

    if (path === "/api/v1/admin/keys" && method === "POST") {
      if (!requireMaster(request, env)) return errorResponse(401, "Master key required", true);
      const key = generateApiKey();
      const now = new Date().toISOString();
      const ttl = parseInt(url.searchParams.get("ttl") || "") || null;
      const meta: KeyMeta = { name: "", created: now, last_used: null };
      if (ttl) meta.expires_at = new Date(Date.now() + ttl * 1000).toISOString();
      const kvOpts = ttl ? { expirationTtl: ttl } : undefined;
      await env.EMAIL_KV.put("apikey_" + key, JSON.stringify(meta), kvOpts);
      return json({ key, ...meta }, 201, true);
    }

    if (path === "/api/v1/admin/keys" && method === "GET") {
      if (!requireMaster(request, env)) return errorResponse(401, "Master key required", true);
      const listed = await env.EMAIL_KV.list({ prefix: "apikey_" });
      const keys: { key: string; name: string; created: string; expires_at: string | null; last_used: string | null }[] = [];
      for (const item of listed.keys) {
        const raw = await env.EMAIL_KV.get(item.name).catch(() => null);
        const meta: KeyMeta | null = raw ? JSON.parse(raw) : null;
        const short = item.name.replace("apikey_", "");
        keys.push({ key: short.slice(0, 12) + "...", name: meta?.name ?? "", created: meta?.created ?? "", expires_at: meta?.expires_at ?? null, last_used: meta?.last_used ?? null });
      }
      return json({ keys }, 200, true);
    }

    if (path === "/api/v1/admin/keys" && method === "DELETE") {
      if (!requireMaster(request, env)) return errorResponse(401, "Master key required", true);
      const body = await request.json().catch(() => null) as { key?: string } | null;
      const target = body?.key;
      if (!target) return errorResponse(400, "Missing 'key' in request body", true);
      await env.EMAIL_KV.delete("apikey_" + target);
      return json({ revoked: target }, 200, true);
    }

    // --- Public: Self-service key generation (rate-limited by IP) ---

    if (path === "/api/v1/public/key" && method === "POST") {
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const rlKey = "rl_keygen_" + ip;
      const existing = await env.EMAIL_KV.get(rlKey);
      if (existing) return errorResponse(429, "Rate limited. One key per hour.", true);
      const key = generateApiKey();
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + PUBLIC_KEY_TTL * 1000).toISOString();
      const meta = { name: "", source: "public", created: now, expires_at: expiresAt, last_used: null };
      await env.EMAIL_KV.put("apikey_" + key, JSON.stringify(meta), { expirationTtl: PUBLIC_KEY_TTL });
      await env.EMAIL_KV.put(rlKey, now, { expirationTtl: 3600 });
      return json({ key, ...meta }, 201, true);
    }

    return new Response("Aurelion Email Worker", { status: 200 });
  },
};

async function handleGetMessages(url: URL, env: Env): Promise<Response> {
  const recipient = url.searchParams.get("recipient");
  if (!recipient) {
    return errorResponse(400, "Missing recipient parameter");
  }

  const since = url.searchParams.get("since");

  const data = await env.EMAIL_KV.get(recipient, "json").catch(() => null);
  const messages: EmailMessage[] = Array.isArray(data) ? data : [];

  if (since) {
    const sinceDate = new Date(since).getTime();
    const filtered = messages.filter((m) => new Date(m.created_at).getTime() > sinceDate);
    return Response.json({ messages: filtered });
  }

  messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const limited = messages.slice(0, 50);

  return Response.json({ messages: limited });
}

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

function validateEmail(email: string): string | null {
  const cleaned = email.trim().replace(/^<|>$/g, "");
  if (!cleaned.includes("@") || cleaned.length > 320) return null;
  return cleaned;
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
