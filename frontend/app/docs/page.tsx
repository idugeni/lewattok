import type { Metadata } from "next";
import { BookOpen, Key, Mail, Inbox, Shield, Code, Terminal, Globe, Plus, Trash2, List, Settings } from "lucide-react";
import { GenerateKeyButton } from "@/components/GenerateKeyButton";

export const metadata: Metadata = {
  title: "API Documentation",
  description:
    "Programmatically generate disposable email addresses and retrieve incoming messages. API reference for inbox creation, message retrieval, and key management.",
  openGraph: {
    title: "API Documentation — Aurelion",
    description:
      "Programmatically generate disposable email addresses and retrieve incoming messages.",
  },
};

const BASE_URL = process.env.NEXT_PUBLIC_WORKER_URL!;

export default function DocsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16">
        <header className="space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] sm:text-xs font-medium">
            <BookOpen className="size-3 sm:size-3.5" />
            API Documentation
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Aurelion API</h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Programmatically generate disposable email addresses and retrieve incoming messages.
            Perfect for testing, automation, and privacy-focused workflows.
          </p>
        </header>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Key className="size-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Authentication</h2>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              All API requests require an API key passed via the <code className="code-inline">X-API-Key</code> header.
              Include it in every request to authenticated endpoints.
            </p>
            <div className="bg-muted/50 rounded-xl border p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <Terminal className="size-3" />
                Example
              </div>
              <pre className="text-sm overflow-x-auto">
                <span className="text-muted-foreground"># Replace with your key</span>
                <br />
                X-API-Key: <span className="text-emerald-500">al_a805d555d3b875d4a88605219bae4a6261babddebfc1f8c9</span>
              </pre>
            </div>
            <div className="bg-muted/50 rounded-xl border p-4 text-sm space-y-2">
              <p className="font-medium text-foreground">Key Format</p>
              <p>Keys follow the pattern <code className="code-inline">al_</code> followed by 48 hexadecimal characters (24 random bytes).</p>
            </div>
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Key className="size-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Get a free API key</p>
              </div>
              <GenerateKeyButton />
            </div>
          </div>
        </section>

        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="size-4 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold">Base URL</h2>
          </div>
          <div className="bg-muted/50 rounded-xl border p-3 sm:p-4 overflow-x-auto">
            <pre className="text-xs sm:text-sm text-primary font-mono whitespace-nowrap">{BASE_URL}</pre>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="size-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Generate an Inbox</h2>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Create a new disposable email address. The address is randomly generated and
              ready to receive messages immediately.
            </p>
            <div className="bg-muted/50 rounded-xl border divide-y">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 text-xs font-mono font-bold">POST</span>
                  <code className="code-inline">/api/v1/inboxes</code>
                </div>
                <span className="text-xs text-muted-foreground font-mono">201 Created</span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-2">Request</p>
                  <pre className="text-sm">
                    <span className="text-muted-foreground">curl -X POST {BASE_URL}/api/v1/inboxes \</span>
                    <br />
                    <span className="text-muted-foreground">  -H &quot;X-API-Key: your_api_key_here&quot;</span>
                  </pre>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-2">Response</p>
                  <pre className="text-sm">
                    {`{`}
                    <br />
                    <span className="ml-4">&quot;address&quot;: &quot;bold.wave4404@aurelion.web.id&quot;</span>
                    <br />
                    {`}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Inbox className="size-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Retrieve Messages</h2>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Fetch all messages for a specific inbox. Messages expire 15 minutes after receipt.
            </p>
            <div className="bg-muted/50 rounded-xl border divide-y">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-500 text-xs font-mono font-bold">GET</span>
                  <code className="code-inline">/api/v1/inboxes/:email/messages</code>
                </div>
                <span className="text-xs text-muted-foreground font-mono">200 OK</span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-2">Request</p>
                  <pre className="text-sm">
                    <span className="text-muted-foreground">curl {BASE_URL}/api/v1/inboxes/bold.wave4404@aurelion.web.id/messages \</span>
                    <br />
                    <span className="text-muted-foreground">  -H &quot;X-API-Key: your_api_key_here&quot;</span>
                  </pre>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-2">Response</p>
                  <pre className="text-sm">
                    {`{`}
                    <br />
                    <span className="ml-4">&quot;messages&quot;: [</span>
                    <br />
                    <span className="ml-8">{`{`}</span>
                    <br />
                    <span className="ml-12">&quot;id&quot;: &quot;uuid&quot;,</span>
                    <br />
                    <span className="ml-12">&quot;message_id&quot;: &quot;uuid&quot;,</span>
                    <br />
                    <span className="ml-12">&quot;recipient&quot;: &quot;bold.wave4404@aurelion.web.id&quot;,</span>
                    <br />
                    <span className="ml-12">&quot;sender&quot;: &quot;sender@example.com&quot;,</span>
                    <br />
                    <span className="ml-12">&quot;subject&quot;: &quot;Hello!&quot;,</span>
                    <br />
                    <span className="ml-12">&quot;body_text&quot;: &quot;...&quot;,</span>
                    <br />
                    <span className="ml-12">&quot;body_html&quot;: &quot;&lt;html&gt;...&lt;/html&gt;&quot;,</span>
                    <br />
                    <span className="ml-12">&quot;created_at&quot;: &quot;2026-01-01T00:00:00.000Z&quot;</span>
                    <br />
                    <span className="ml-8">{`}`}</span>
                    <br />
                    <span className="ml-4">]</span>
                    <br />
                    {`}`}
                  </pre>
                </div>
              </div>
            </div>
            <div className="bg-muted/50 rounded-xl border divide-y">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-500 text-xs font-mono font-bold">GET</span>
                  <code className="code-inline">/api/v1/messages?recipient=...</code>
                </div>
                <span className="text-xs text-muted-foreground font-mono">200 OK</span>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground">Alternative query-parameter style.</p>
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-2">Request</p>
                  <pre className="text-sm">
                    <span className="text-muted-foreground">curl &quot;{BASE_URL}/api/v1/messages?recipient=bold.wave4404@aurelion.web.id&amp;since=2026-01-01T00:00:00.000Z&quot; \</span>
                    <br />
                    <span className="text-muted-foreground">  -H &quot;X-API-Key: your_api_key_here&quot;</span>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code className="size-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Quick Start (JavaScript)</h2>
          </div>
          <div className="bg-muted/50 rounded-xl border p-4">
            <pre className="text-sm overflow-x-auto leading-relaxed">{`const BASE = "${BASE_URL}";

// Create inbox
const create = await fetch(BASE + "/api/v1/inboxes", {
  method: "POST",
  headers: { "X-API-Key": "your_api_key_here" }
});
const data = await create.json();
// data.address -> "bold.wave4404@aurelion.web.id"

// Get messages
const res = await fetch(BASE + "/api/v1/messages?recipient=" + data.address, {
  headers: { "X-API-Key": "your_api_key_here" }
});
const inbox = await res.json();
// inbox.messages -> [...]`}</pre>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="size-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">API Key Management</h2>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Administrators can generate, list, and revoke API keys using the master API key.
              Keys are stored in KV and validated on every request.
            </p>

            <div className="bg-muted/50 rounded-xl border divide-y">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="size-3.5 text-emerald-500" />
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 text-xs font-mono font-bold">POST</span>
                  <code className="code-inline">/api/v1/admin/keys</code>
                </div>
                <span className="text-xs text-muted-foreground font-mono">201 Created</span>
              </div>
              <div className="p-4 space-y-3">
                <p>Generate a new API key. Returns the full key (only shown once at creation).</p>
                <pre className="text-sm">
                  <span className="text-muted-foreground">curl -X POST {BASE_URL}/api/v1/admin/keys \</span>
                  <br />
                  <span className="text-muted-foreground">  -H &quot;X-API-Key: your_master_key&quot;</span>
                </pre>
                <pre className="text-sm">{`{`}
                  <br />
                  <span className="ml-4">&quot;key&quot;: &quot;al_a805d555d3b875d4a88605219bae4a6261babddebfc1f8c9&quot;,</span>
                  <br />
                  <span className="ml-4">&quot;name&quot;: &quot;&quot;,</span>
                  <br />
                  <span className="ml-4">&quot;created&quot;: &quot;2026-06-27T20:00:18.000Z&quot;,</span>
                  <br />
                  <span className="ml-4">&quot;last_used&quot;: null</span>
                  <br />
                  {`}`}
                </pre>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl border divide-y">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <List className="size-3.5 text-sky-500" />
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-500 text-xs font-mono font-bold">GET</span>
                  <code className="code-inline">/api/v1/admin/keys</code>
                </div>
                <span className="text-xs text-muted-foreground font-mono">200 OK</span>
              </div>
              <div className="p-4 space-y-3">
                <p>List all API keys. Full keys are truncated for security.</p>
                <pre className="text-sm">{`{`}
                  <br />
                  <span className="ml-4">&quot;keys&quot;: [</span>
                  <br />
                  <span className="ml-8">{`{`}</span>
                  <br />
                  <span className="ml-12">&quot;key&quot;: &quot;al_a805...&quot;,</span>
                  <br />
                  <span className="ml-12">&quot;name&quot;: &quot;&quot;,</span>
                  <br />
                  <span className="ml-12">&quot;created&quot;: &quot;2026-06-27T20:00:18.000Z&quot;,</span>
                  <br />
                  <span className="ml-12">&quot;last_used&quot;: &quot;2026-06-27T20:01:00.000Z&quot;</span>
                  <br />
                  <span className="ml-8">{`}`}</span>
                  <br />
                  <span className="ml-4">]</span>
                  <br />
                  {`}`}
                </pre>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl border divide-y">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trash2 className="size-3.5 text-red-500" />
                  <span className="px-2 py-0.5 rounded-md bg-red-500/15 text-red-500 text-xs font-mono font-bold">DELETE</span>
                  <code className="code-inline">/api/v1/admin/keys</code>
                </div>
                <span className="text-xs text-muted-foreground font-mono">200 OK</span>
              </div>
              <div className="p-4 space-y-3">
                <p>Revoke an API key. Include the full key in the request body.</p>
                <pre className="text-sm">
                  <span className="text-muted-foreground">curl -X DELETE {BASE_URL}/api/v1/admin/keys \</span>
                  <br />
                  <span className="text-muted-foreground">  -H &quot;X-API-Key: your_master_key&quot; \</span>
                  <br />
                  <span className="text-muted-foreground">  -H &quot;Content-Type: application/json&quot; \</span>
                  <br />
                  <span className="text-muted-foreground">  -d &apos;{`{`}&quot;key&quot;: &quot;al_a805...&quot;{`}`}&apos;</span>
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="size-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Rate Limits</h2>
          </div>
          <div className="bg-muted/50 rounded-xl border p-4 text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>Current rate limits per API key:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>60 requests per minute</strong> across all authenticated endpoints</li>
              <li><strong>1 key per hour</strong> for self-service key generation (per IP)</li>
            </ul>
            <p className="text-xs text-muted-foreground/70 mt-3">
              Exceeding these limits returns <code className="code-inline">429 Too Many Requests</code>.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code className="size-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Errors</h2>
          </div>
          <div className="bg-muted/50 rounded-xl border p-4 text-sm text-muted-foreground space-y-3">
            <p>All errors return a JSON body:</p>
            <pre className="text-sm">
              {`{`}
              <br />
              <span className="ml-4">&quot;error&quot;: &quot;Invalid or missing API key&quot;</span>
              <br />
              {`}`}
            </pre>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 pr-4 font-medium">Code</th>
                    <th className="text-left py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2 pr-4 font-mono">400</td>
                    <td className="py-2">Bad request — missing or invalid parameters</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">401</td>
                    <td className="py-2">Invalid or missing API key</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">405</td>
                    <td className="py-2">Method not allowed for this endpoint</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">429</td>
                    <td className="py-2">Rate limit exceeded</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">500</td>
                    <td className="py-2">Internal server error</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
