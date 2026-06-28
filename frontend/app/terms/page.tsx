"use client";

import { useEffect, useState } from "react";
import { Shield, FileText, Mail, Clock, Database, Globe, UserX, AlertTriangle } from "lucide-react";

export default function TermsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <section className="flex-1 px-4 sm:px-5 py-12 sm:py-16">
      <div className={`max-w-3xl mx-auto space-y-10 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        {/* Header */}
        <header className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-gradient-to-br from-aurora-indigo/15 to-aurora-violet/15 border border-aurora-indigo/10 flex items-center justify-center">
              <FileText className="size-5 text-aurora-indigo" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}>
              Terms of Service
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Last updated: June 2025
          </p>
        </header>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed">
          <Section icon={Shield} title="1. Acceptance of Terms">
            <p>
              By accessing or using Aurelion (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. The Service is provided &quot;as is&quot; without warranties of any kind.
            </p>
          </Section>

          <Section icon={Mail} title="2. Description of Service">
            <p>
              Aurelion provides temporary, disposable email addresses that automatically expire after 15 minutes. The Service is free to use and does not require account registration. Email addresses are randomly generated and are not intended for permanent communication.
            </p>
          </Section>

          <Section icon={AlertTriangle} title="3. Acceptable Use">
            <p>You agree NOT to use the Service to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
              <li>Violate any applicable laws or regulations</li>
              <li>Send spam, phishing emails, or malicious content</li>
              <li>Impersonate individuals or organizations</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Attempt to access other users&apos; temporary inboxes</li>
              <li>Use automated tools to abuse rate limits or exhaust resources</li>
              <li>Use the Service for illegal activities of any kind</li>
            </ul>
          </Section>

          <Section icon={Clock} title="4. Data Retention & Expiry">
            <p>
              All email addresses and associated messages are automatically and permanently deleted after 15 minutes. We do not maintain backups, archives, or recovery mechanisms for expired data. Once data is deleted, it cannot be recovered under any circumstances.
            </p>
          </Section>

          <Section icon={Database} title="5. API Usage">
            <p>
              Programmatic access via the REST API is subject to rate limits. API keys are provided free of charge but may be revoked if abused. You are responsible for securing your API keys. We reserve the right to modify rate limits or discontinue API access at any time.
            </p>
          </Section>

          <Section icon={UserX} title="6. Limitation of Liability">
            <p>
              Aurelion and its operators shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from the use or inability to use the Service. This includes but is not limited to loss of data, missed communications, or reliance on temporary email delivery.
            </p>
          </Section>

          <Section icon={Globe} title="7. Modifications">
            <p>
              We reserve the right to modify or discontinue the Service at any time without prior notice. These Terms may be updated periodically. Continued use of the Service after changes constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section icon={Shield} title="8. Contact">
            <p>
              For questions about these Terms, contact us at{" "}
              <a href="mailto:legal@aurelion.web.id" className="text-primary hover:underline">
                legal@aurelion.web.id
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
        <Icon className="size-4 text-aurora-indigo shrink-0" />
        {title}
      </h2>
      <div className="text-muted-foreground pl-[26px] space-y-3">
        {children}
      </div>
    </div>
  );
}
