import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Placeholder app icon until the brand kit arrives. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a2163" }}>
        <svg width="132" height="132" viewBox="0 0 32 32">
          <path d="M9.5 9.5 16.5 16l-7 6.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="22.5" cy="16" r="2.6" fill="#a8bcff" />
        </svg>
      </div>
    ),
    size,
  );
}
