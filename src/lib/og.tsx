import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/**
 * Open Graph image for a page (brief §6): the page's line in large type,
 * with the site's route running around it and ending at a node.
 * Brand kit pending — swap colours/logo here when it arrives.
 */
export function ogImage(title: string, kicker = "acceleret.com") {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "64px 72px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* the route: across the top, down the right, back along the bottom */}
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
          <path
            d="M0 150 H1040 Q1080 150 1080 190 V470 Q1080 510 1040 510 H600"
            fill="none"
            stroke="#2350ff"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="600" cy="510" r="13" fill="#2350ff" />
          <circle cx="600" cy="510" r="24" fill="#2350ff" opacity="0.16" />
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#0a2163",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 32 32">
              <path d="M9.5 9.5 16.5 16l-7 6.5" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="22.5" cy="16" r="2.8" fill="#a8bcff" />
            </svg>
          </div>
          <div style={{ fontSize: 38, fontWeight: 700, color: "#0a2163", letterSpacing: -1 }}>Acceleret</div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 48 ? 64 : 76,
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: -2.5,
            color: "#0c1322",
            maxWidth: 900,
            marginTop: 40,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#465066" }}>{kicker}</div>
      </div>
    ),
    ogSize,
  );
}
