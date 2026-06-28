"use client";

import { useState, useEffect, useRef } from "react";
import { CodeBlock } from "@/components/ui/code-block";
import { Button } from "@/components/ui/button";
import { GenerateKeyButton } from "@/components/GenerateKeyButton";
import {
  Key,
  Mail,
  Inbox,
  ArrowRight,
  Clock,
  Shield,
  AlertTriangle,
  BookOpen,
  Zap,
  Terminal,
} from "lucide-react";

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/generate",
    description: "Generate a new API key for programmatic access.",
    icon: Key,
  },
  {
    method: "POST",
    path: "/api/inbox",
    description: "Create a new temporary inbox. Optionally specify a custom username (e.g. yourname@aurelion.web.id). If no username is provided, a random address is generated.",
    icon: Mail,
    requiresAuth: false,
  },
  {
    method: "GET",
    path: "/api/messages",
    description: "Retrieve all messages for a given email address. Does not auto-poll — call this endpoint when you want to check for new emails.",
    icon: Inbox,
    requiresAuth: false,
  },
  {
    method: "DELETE",
    path: "/api/inbox",
    description: "Delete an inbox from the server, freeing up the address and its messages before the auto-expiry.",
    icon: Inbox,
    requiresAuth: false,
  },
  {
    method: "DELETE",
    path: "/api/messages",
    description: "Delete all messages for a given recipient address from the server.",
    icon: Inbox,
    requiresAuth: false,
  },
];

const SIDEBAR_SECTIONS = [
  { id: "getting-started", label: "Getting Started", icon: Zap },
  { id: "authentication", label: "Authentication", icon: Key },
  { id: "endpoints", label: "API Endpoints", icon: Terminal },
  { id: "rate-limits", label: "Rate Limits", icon: Clock },
  { id: "errors", label: "Error Codes", icon: AlertTriangle },
];

export default function DocsPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("getting-started");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    SIDEBAR_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || "aurelion.web.id";
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || `https://api.${domain}`;

  return (
    <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-5 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-20 self-start">
          <nav className="space-y-1" aria-label="Documentation navigation">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3 px-3">
              Documentation
            </p>
            {SIDEBAR_SECTIONS.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  activeSection === id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="size-3.5" />
                {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div
          className={`flex-1 min-w-0 space-y-12 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Header */}
          <header className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-aurora-indigo" />
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
              >
                API Documentation
              </h1>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
              Create temporary inboxes and retrieve messages programmatically.
              Perfect for automated testing, CI pipelines, and privacy-first workflows.
            </p>
          </header>

          {/* Getting Started */}
          <section id="getting-started" className="space-y-5 scroll-mt-24">
            <SectionHeader icon={Zap} title="Getting Started" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Aurelion provides a REST API to create temporary inboxes and read
              messages. Most endpoints require an API key. Generate one below or
              via the <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">POST /api/generate</code> endpoint.
            </p>
            <div className="max-w-md">
              <GenerateKeyButton onKeyGenerated={setApiKey} />
            </div>
            {apiKey && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Set your API key as a header:</p>
                <CodeBlock
                  language="bash"
                  filename="setup.sh"
                  code={`export AURELION_API_KEY="${apiKey}"`}
                />
              </div>
            )}
          </section>

          {/* Authentication */}
          <section id="authentication" className="space-y-5 scroll-mt-24">
            <SectionHeader icon={Key} title="Authentication" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Include your API key in the <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Authorization</code> header
              for endpoints that require authentication. The <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">GET /api/messages</code> endpoint
              is public and does not require a key.
            </p>
            <CodeBlock
              language="bash"
              filename="auth-example.sh"
              code={`curl -X POST ${baseUrl}/api/inbox \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
            />
          </section>

          {/* Endpoints */}
          <section id="endpoints" className="space-y-6 scroll-mt-24">
            <SectionHeader icon={Terminal} title="API Endpoints" />

            {ENDPOINTS.map((endpoint) => (
              <EndpointCard
                key={endpoint.path}
                endpoint={endpoint}
                baseUrl={baseUrl}
                apiKey={apiKey}
              />
            ))}
          </section>

          {/* Rate Limits */}
          <section id="rate-limits" className="space-y-5 scroll-mt-24">
            <SectionHeader icon={Clock} title="Rate Limits" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Inbox creation", value: "10/hour", desc: "Per API key" },
                { label: "Message fetch", value: "60/min", desc: "Per address" },
                { label: "API key generation", value: "5/hour", desc: "Per IP" },
              ].map((limit) => (
                <div
                  key={limit.label}
                  className="rounded-xl border bg-card/50 p-4 space-y-1"
                >
                  <p className="text-2xl font-bold tracking-tight font-mono text-primary">
                    {limit.value}
                  </p>
                  <p className="text-sm font-medium">{limit.label}</p>
                  <p className="text-xs text-muted-foreground">{limit.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you exceed the rate limit, the API will respond with{" "}
              <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">429 Too Many Requests</code>.
              Implement exponential backoff in your client.
            </p>
          </section>

          {/* Errors */}
          <section id="errors" className="space-y-5 scroll-mt-24">
            <SectionHeader icon={AlertTriangle} title="Error Codes" />
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider">Code</th>
                    <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["400", "Bad request — missing or invalid parameters"],
                    ["401", "Unauthorized — missing or invalid API key"],
                    ["404", "Not found — address does not exist or has expired"],
                    ["429", "Rate limited — too many requests, retry later"],
                    ["500", "Internal server error — unexpected failure"],
                  ].map(([code, desc]) => (
                    <tr key={code} className="border-b last:border-0">
                      <td className="p-3">
                        <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{code}</code>
                      </td>
                      <td className="p-3 text-muted-foreground">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <h2
      className="flex items-center gap-2.5 text-xl sm:text-2xl font-bold tracking-tight"
      style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
    >
      <Icon className="size-5 text-aurora-indigo" />
      {title}
    </h2>
  );
}

function EndpointCard({
  endpoint,
  baseUrl,
  apiKey,
}: {
  endpoint: (typeof ENDPOINTS)[number];
  baseUrl: string;
  apiKey: string | null;
}) {
  const Icon = endpoint.icon;
  const [expanded, setExpanded] = useState(false);

  const methodColors: Record<string, string> = {
    GET: "bg-mint/15 text-mint",
    POST: "bg-aurora-indigo/15 text-aurora-indigo",
    PUT: "bg-amber-500/15 text-amber-500",
    DELETE: "bg-destructive/15 text-destructive",
  };

  const exampleCode = endpoint.method === "GET"
    ? `curl -X GET "${baseUrl}${endpoint.path}?address=your-temp@aurelion.web.id"`
    : `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}" \\
  -H "Authorization: Bearer ${apiKey || "YOUR_API_KEY"}" \\
  -H "Content-Type: application/json"`;

  return (
    <div className="rounded-xl border bg-card/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left cursor-pointer hover:bg-muted/20 transition-colors"
        aria-expanded={expanded}
      >
        <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${methodColors[endpoint.method]}`}>
              {endpoint.method}
            </span>
            <code className="text-sm font-mono">{endpoint.path}</code>
            {endpoint.requiresAuth && (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded">
                auth
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{endpoint.description}</p>
        </div>
        <ArrowRight className={`size-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t p-4 space-y-3 bg-muted/10">
          <p className="text-sm text-muted-foreground">{endpoint.description}</p>
          <CodeBlock
            language="bash"
            filename="example.sh"
            code={exampleCode}
          />
        </div>
      )}
    </div>
  );
}
