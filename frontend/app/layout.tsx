import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipToContent } from "@/components/layout/SkipToContent";
import "./globals.css";

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600"],
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    template: "%s — Aurelion",
    default: "Aurelion — Temporary Email That Vanishes",
  },
  description:
    "Generate disposable email addresses that vanish in 15 minutes. No signup, no spam, no tracking. Perfect for developers, QA testing, and privacy.",
  keywords: [
    "temporary email",
    "disposable email",
    "throwaway email",
    "temp mail",
    "email generator",
    "privacy email",
    "developer tools",
    "QA testing",
  ],
  metadataBase: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined,
  openGraph: {
    type: "website",
    siteName: "Aurelion",
    title: "Aurelion — Temporary Email That Vanishes",
    description:
      "Generate disposable email addresses that vanish in 15 minutes. No signup, no spam, no tracking.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurelion — Temporary Email That Vanishes",
    description:
      "Generate disposable email addresses that vanish in 15 minutes.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0f1f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0d14" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('aurelion-theme') || 'dark';
                var c = document.documentElement.classList;
                c.remove('light','dark');
                if (t === 'system') {
                  c.add(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                } else {
                  c.add(t);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`min-h-dvh flex flex-col ${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
        style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
      >
        <Providers>
          <SkipToContent />
          <Header />
          <main id="main-content" className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
          <Toaster
            theme="dark"
            position="bottom-center"
            richColors
            closeButton
            toastOptions={{
              className: "font-[family-name:var(--font-body)]",
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
