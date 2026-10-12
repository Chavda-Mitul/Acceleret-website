import { ImageResponse } from "next/og";
import { LOGO_A, LOGO_BLUE, LOGO_INK, LOGO_MARK } from "@/components/chrome/logoPaths";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** App icon: the logo's "A" with its blue corner mark (same as icon.svg). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffffff" }}>
        <svg width="180" height="180" viewBox="0 0 320 320">
          <path transform="translate(22 14) scale(0.917)" fill={LOGO_INK} d={LOGO_A} />
          <path transform="translate(-377.4 22) scale(0.42)" fill={LOGO_BLUE} d={LOGO_MARK} />
        </svg>
      </div>
    ),
    size,
  );
}
