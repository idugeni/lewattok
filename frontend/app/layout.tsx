import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aurelion — Temporary Email",
  description: "Disposable email that vanishes in 15 minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh flex flex-col">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 h-14 max-w-screen-2xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20">
                A
              </div>
              <span className="text-base font-semibold tracking-tight">aurelion</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="/docs" className="hidden sm:inline text-xs text-muted-foreground font-mono tracking-tight hover:text-foreground transition-colors">
                API
              </a>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                15m ttl
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
