import {
  LOGO_CHEVRONS,
  LOGO_FULL_H,
  LOGO_H,
  LOGO_MARK,
  LOGO_TAGLINE,
  LOGO_W,
  LOGO_WORD,
} from "./logoPaths";

/**
 * The Acceleret logo: the wordmark with its blue corner mark and, where
 * there's room (`tagline`), "Build > Automate > Accelerate" underneath.
 * `white` is for deep-blue backgrounds. Always sits inside a link or next to
 * text that names the site, so it's hidden from screen readers.
 */
export function Logo({
  tone = "blue",
  tagline = false,
  className = "",
}: {
  tone?: "blue" | "white";
  tagline?: boolean;
  className?: string;
}) {
  return (
    <svg
      className={`logo logo--${tone}${tagline ? " logo--full" : ""} ${className}`}
      viewBox={`0 0 ${LOGO_W} ${tagline ? LOGO_FULL_H : LOGO_H}`}
      aria-hidden
      focusable={false}
    >
      <path d={LOGO_WORD} className="logo-word" />
      <path d={LOGO_MARK} className="logo-mark" />
      {tagline ? (
        <>
          <path d={LOGO_TAGLINE} className="logo-tagline" />
          <path d={LOGO_CHEVRONS} className="logo-chev" />
        </>
      ) : null}
    </svg>
  );
}
