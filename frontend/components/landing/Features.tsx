"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, Radio, ShieldOff, Clock, Code, Eye } from "lucide-react";

const FEATURES = [
  {
    icon: Mail,
    title: "Instant inbox",
    description: "Open the app and get a working email address immediately. Choose a custom username or generate a random one.",
    accent: "from-aurora-indigo to-aurora-violet",
  },
  {
    icon: Radio,
    title: "Manual refresh",
    description: "Check for new emails with a single click. No continuous polling — saves resources and keeps your inbox lightweight.",
    accent: "from-cyan-400 to-blue-500",
  },
  {
    icon: ShieldOff,
    title: "Zero footprint",
    description: "No account, no cookies, no IP logging. Your temporary inbox exists only in your browser's local storage.",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    icon: Clock,
    title: "Auto-expiry",
    description: "After the countdown expires, everything vanishes permanently. The address, messages, and all data are gone from the server.",
    accent: "from-amber-400 to-orange-500",
  },
  {
    icon: Code,
    title: "Full REST API",
    description: "Create inboxes and retrieve messages programmatically. Perfect for automated testing and CI pipelines.",
    accent: "from-violet-400 to-purple-500",
  },
  {
    icon: Eye,
    title: "HTML rendering",
    description: "Read emails in rich HTML or plain text. All HTML is sanitized with DOMPurify to prevent XSS attacks.",
    accent: "from-rose-400 to-pink-500",
  },
];

export function Features() {
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
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14 sm:mb-18 space-y-3">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-aurora-indigo">
            Features
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
          >
            Everything you need.
            <br />
            <span className="text-muted-foreground/50">Nothing you don&apos;t.</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group relative rounded-2xl border bg-card/50 p-6 sm:p-7 transition-all duration-500 hover:bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={`inline-flex size-10 rounded-xl bg-gradient-to-br ${feature.accent} items-center justify-center mb-4 shadow-md`}>
                  <Icon className="size-5 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
