"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, Inbox, Timer } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Mail,
    title: "Generate",
    description: "Click once to create a random disposable email address. It works instantly — no account needed.",
    accent: "aurora-indigo",
  },
  {
    number: "02",
    icon: Inbox,
    title: "Receive",
    description: "Use the address anywhere. Emails arrive in real-time and appear automatically in your inbox.",
    accent: "aurora-violet",
  },
  {
    number: "03",
    icon: Timer,
    title: "Vanish",
    description: "After 15 minutes, the address and all messages are permanently deleted from the server. No recovery.",
    accent: "ember",
  },
];

export function HowItWorks() {
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
    <section ref={ref} className="relative px-4 sm:px-5 py-20 sm:py-28 bg-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14 sm:mb-18 space-y-3">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-aurora-violet">
            How it works
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
          >
            Three steps. Zero commitment.
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
          {/* Connecting line (desktop) */}
          <div
            className={`hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-aurora-indigo/30 via-aurora-violet/30 to-ember/30 transition-all duration-1000 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`relative text-center space-y-4 transition-all duration-600 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Step number */}
                <div className="relative mx-auto w-fit">
                  <div className={`size-16 rounded-2xl bg-${step.accent}/10 flex items-center justify-center border border-${step.accent}/20`}>
                    <Icon className={`size-7 text-${step.accent}`} />
                  </div>
                  <span className={`absolute -top-2 -right-2 size-6 rounded-full bg-${step.accent} text-white text-[10px] font-bold flex items-center justify-center`}>
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-64 mx-auto">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
