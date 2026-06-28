"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal, Bug, ShieldCheck } from "lucide-react";

const USE_CASES = [
  {
    icon: Terminal,
    title: "Developers",
    description: "Test email workflows, verify sign-up flows, and debug notification systems without polluting your real inbox. Use the REST API to automate everything in CI.",
    tag: "Testing",
  },
  {
    icon: Bug,
    title: "QA Engineers",
    description: "Generate unique addresses for each test run. Verify email delivery, check HTML rendering, and validate content — all without managing test accounts.",
    tag: "Quality",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-first users",
    description: "Sign up for services, download content, or verify accounts without exposing your real email. Everything auto-deletes — no digital trail left behind.",
    tag: "Privacy",
  },
];

export function UseCases() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative px-4 sm:px-5 py-20 sm:py-28">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14 space-y-3">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-ember">
            Built for
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
          >
            Who uses Aurelion?
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {USE_CASES.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.title}
                className={`group relative rounded-2xl border bg-card/50 p-6 sm:p-7 transition-all duration-500 hover:bg-card hover:border-primary/15 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                    <Icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-md">
                    {uc.tag}
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-2 tracking-tight">
                  {uc.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {uc.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
