"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { STORAGE_KEY } from "@/lib/constants";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Mail, FileCode, Sun, Moon, Monitor } from "lucide-react";

const NAV_LINKS = [
  { href: "/inbox", label: "Inbox", icon: Mail },
  { href: "/docs", label: "API Docs", icon: FileCode },
] as const;

type Theme = "system" | "light" | "dark";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("aurelion-theme");
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");

  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.add(prefersDark ? "dark" : "light");
  } else {
    root.classList.add(theme);
  }
  localStorage.setItem("aurelion-theme", theme);
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  // Countdown timer: read inbox expiresAt from localStorage
  useEffect(() => {
    const tick = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setRemaining(null);
          return;
        }
        const data = JSON.parse(raw);
        const expiresAt = data?.expiresAt;
        if (!expiresAt || typeof expiresAt !== "number") {
          setRemaining(null);
          return;
        }
        const diff = expiresAt - Date.now();
        setRemaining(diff > 0 ? diff : 0);
      } catch {
        setRemaining(null);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const cycleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  const formatRemaining = useCallback((ms: number): string => {
    if (ms <= 0) return "expired";
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 sm:px-5 h-14 max-w-screen-2xl mx-auto w-full">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="Aurelion home"
        >
          <div className="relative size-8 rounded-xl bg-gradient-to-br from-aurora-indigo to-aurora-violet flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow duration-300">
            <span className="relative z-10">A</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-aurora-violet to-aurora-indigo opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-base font-semibold tracking-tight font-[family-name:var(--font-display)]">
            aurelion
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }
                `}
              >
                <Icon className="size-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* TTL countdown badge */}
          {remaining !== null && remaining > 0 ? (
            <span className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono bg-muted/50 px-2 py-1 rounded-full transition-colors duration-500 ${
              remaining < 120000
                ? "text-red-400"
                : remaining < 300000
                ? "text-amber-400"
                : "text-muted-foreground"
            }`}>
              <span className={`size-1.5 rounded-full animate-pulse ${
                remaining < 120000
                  ? "bg-red-400"
                  : remaining < 300000
                  ? "bg-amber-400"
                  : "bg-mint"
              }`} />
              {formatRemaining(remaining)}
            </span>
          ) : null}

          {/* Theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={cycleTheme}
              aria-label={`Theme: ${theme}. Click to cycle.`}
            >
              <ThemeIcon className="size-4" />
            </Button>
          )}

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden size-8 rounded-lg"
                aria-label="Open navigation menu"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="size-7 rounded-lg bg-gradient-to-br from-aurora-indigo to-aurora-violet flex items-center justify-center text-white font-bold text-xs">
                    A
                  </div>
                  <span className="font-semibold tracking-tight">aurelion</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-3 gap-1" aria-label="Mobile navigation">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${isActive
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }
                      `}
                    >
                      <Icon className="size-4" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-auto p-4 border-t">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-mint animate-pulse" />
                  Messages auto-expire automatically
                </span>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
