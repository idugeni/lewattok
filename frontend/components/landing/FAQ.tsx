"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Do I need to create an account?",
    a: "No. Open the app and a temporary address is generated automatically. There's no sign-up, no password, and no personal information required.",
  },
  {
    q: "How long do emails last?",
    a: "All emails and the address itself are permanently deleted after the countdown expires. The countdown starts the moment your inbox is created.",
  },
  {
    q: "Can I use it for verification codes?",
    a: "Yes. Aurelion receives emails in real-time (polling every 4 seconds), so verification codes arrive in time for most services. However, some providers block disposable domains.",
  },
  {
    q: "Is there an API?",
    a: "Yes. Aurelion offers a full REST API for creating inboxes and retrieving messages programmatically. Visit the API Docs to get started with a free key.",
  },
  {
    q: "Is my data private?",
    a: "Yes. We don't log IPs, use cookies, or store any personal data. Messages are held in Cloudflare KV with auto-expiry and deleted permanently after the countdown ends.",
  },
  {
    q: "Can I recover deleted messages?",
    a: "No. Once the 15-minute timer expires, all data is permanently purged from the server. There is no backup or recovery mechanism — by design.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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
      <div className="max-w-2xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 space-y-3">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-mint">
            FAQ
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
          >
            Questions & answers
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-xl border bg-card/50 overflow-hidden transition-all duration-400 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                } ${isOpen ? "border-primary/20 bg-card" : "hover:bg-card/80"}`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium leading-snug pr-4">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
