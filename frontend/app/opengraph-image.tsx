import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Aurelion — Temporary Email That Vanishes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0d14",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Aurora gradient background glow */}
        <div
          style={{
            position: "absolute",
            top: "-30%",
            left: "20%",
            width: "60%",
            height: "120%",
            background:
              "radial-gradient(ellipse at center, rgba(129,140,248,0.15) 0%, rgba(167,139,250,0.08) 40%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "10%",
            width: "40%",
            height: "80%",
            background:
              "radial-gradient(ellipse at center, rgba(167,139,250,0.1) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="aurora" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="50%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#C4B5FD" />
              </linearGradient>
            </defs>
            <path
              d="M12 2L4 20h3.5l2-4.5h8l2 4.5H20L12 2zm-1.8 12L12 7l1.8 7h-3.6z"
              fill="url(#aurora)"
            />
          </svg>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            Aurelion
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "24px",
            color: "#94A3B8",
            marginBottom: "48px",
            display: "flex",
          }}
        >
          Temporary Email That Vanishes
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: "32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "16px",
              color: "#64748B",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                stroke="#34D399"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>No tracking</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "16px",
              color: "#64748B",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#818CF8" strokeWidth="2" />
              <path d="M12 6v6l4 2" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Auto-deletes</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "16px",
              color: "#64748B",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="#F59E0B" strokeWidth="2" />
              <path d="M22 4L12 13 2 4" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>No registration</span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "14px",
            color: "#475569",
            display: "flex",
          }}
        >
          aurelion.web.id
        </div>
      </div>
    ),
    { ...size }
  );
}
