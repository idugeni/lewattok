import Link from "next/link";
import { Shield, Zap, Clock } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { label: "Inbox", href: "/inbox" },
    { label: "API Docs", href: "/docs" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-5">
        {/* Main footer */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 py-10 sm:py-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5" aria-label="Aurelion home">
              <div className="size-7 rounded-lg bg-gradient-to-br from-aurora-indigo to-aurora-violet flex items-center justify-center text-white font-bold text-xs shadow-md shadow-primary/15">
                A
              </div>
              <span className="text-sm font-semibold tracking-tight">aurelion</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-48">
              Disposable email that vanishes in 15 minutes. No signup, no tracking, no spam.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {title}
              </h3>
              <ul className="space-y-2" role="list">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust signals */}
        <div className="border-t py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="size-3 text-mint" />
              XSS Protected
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3 text-aurora-indigo" />
              Auto-expiry
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="size-3 text-ember" />
              No signup
            </span>
          </div>
          <p className="font-mono text-[11px]">
            &copy; {new Date().getFullYear()} Aurelion. Powered by Cloudflare.
          </p>
        </div>
      </div>
    </footer>
  );
}
