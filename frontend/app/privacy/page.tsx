"use client";

import { useEffect, useState } from "react";
import { Shield, Eye, Database, Globe, Cookie, Mail, Lock, UserCheck } from "lucide-react";

export default function PrivacyPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <section className="flex-1 px-4 sm:px-5 py-12 sm:py-16">
      <div className={`max-w-3xl mx-auto space-y-10 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        {/* Header */}
        <header className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-gradient-to-br from-mint/15 to-mint/5 border border-mint/10 flex items-center justify-center">
              <Shield className="size-5 text-mint" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}>
              Privacy Policy
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Last updated: June 2025
          </p>
        </header>

        {/* Intro */}
        <div className="rounded-2xl border bg-mint/5 border-mint/15 p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-mint" />
            <p className="text-sm font-semibold">Privacy by design</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Aurelion is built with privacy as a core principle. We collect the minimum data necessary to provide the service, and all data is automatically and permanently deleted after 15 minutes.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed">
          <Section icon={Eye} title="1. Information We Collect">
            <p>
              Aurelion does <strong className="text-foreground">not</strong> require account registration. We do not collect names, email addresses, passwords, or any personally identifiable information to use the service.
            </p>
            <p>What we do process temporarily:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">Email content</strong> — Messages received by temporary addresses are stored in Cloudflare KV with a 15-minute TTL</li>
              <li><strong className="text-foreground">API keys</strong> — Generated for programmatic access, stored in Cloudflare KV</li>
            </ul>
          </Section>

          <Section icon={Database} title="2. Data Storage & Retention">
            <p>
              All data is stored in Cloudflare Workers KV, a globally distributed key-value store. Every piece of data — including email addresses, messages, and API keys — has a maximum Time-To-Live (TTL) of 15 minutes. After expiry, data is <strong className="text-foreground">permanently and irreversibly deleted</strong> from all servers.
            </p>
            <p>We do not maintain backups, logs, or archives of user data.</p>
          </Section>

          <Section icon={Cookie} title="3. Cookies & Tracking">
            <p>
              Aurelion does <strong className="text-foreground">not</strong> use cookies, analytics trackers, fingerprinting scripts, or any tracking technology. Your inbox state is stored exclusively in your browser&apos;s localStorage, which you control.
            </p>
          </Section>

          <Section icon={Globe} title="4. Third-Party Services">
            <p>We use the following infrastructure:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">Cloudflare Workers & KV</strong> — Application hosting and data storage (with automatic 15-minute TTL expiry)</li>
            </ul>
            <p>No data is shared with advertising networks, data brokers, or analytics providers.</p>
          </Section>

          <Section icon={Mail} title="5. Email Security">
            <p>
              All email content rendered in the browser is sanitized using DOMPurify to prevent XSS attacks. HTML emails are displayed in sandboxed iframes with restricted permissions.
            </p>
          </Section>

          <Section icon={UserCheck} title="6. Your Rights">
            <p>Since we collect no personal data and all data auto-expires in 15 minutes:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>There is no personal data to request, modify, or delete</li>
              <li>No data portability request is needed — your data is already ephemeral</li>
              <li>Clearing your browser&apos;s localStorage removes all local state</li>
            </ul>
          </Section>

          <Section icon={Shield} title="7. Contact">
            <p>
              For privacy inquiries, contact us at{" "}
              <a href="mailto:privacy@aurelion.web.id" className="text-primary hover:underline">
                privacy@aurelion.web.id
              </a>.
            </p>
          </Section>
        </div>
      </div>
    </section>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight" style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}>
        <Icon className="size-4 text-mint shrink-0" />
        {title}
      </h2>
      <div className="text-muted-foreground pl-[26px] space-y-3">
        {children}
      </div>
    </div>
  );
}
