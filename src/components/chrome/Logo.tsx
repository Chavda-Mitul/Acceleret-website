import { site } from "@/content/site";

/**
 * Placeholder logo until the brand kit arrives (brief §7, due 23 Oct).
 * The mark is the tagline's ">" drawn as a route with a node at the end:
 * the same vocabulary as the diagrams across the site.
 * Swap this component (and src/app/icon.svg) for the real logo.
 */
export function Logo({ tone = "blue", className = "" }: { tone?: "blue" | "white"; className?: string }) {
  return (
    <span className={`logo logo--${tone} ${className}`}>
      <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden focusable={false}>
        <rect width="32" height="32" rx="9" className="logo-tile" />
        <path d="M9.5 9.5 16.5 16l-7 6.5" className="logo-route" />
        <circle cx="22.5" cy="16" r="2.6" className="logo-node" />
      </svg>
      <span className="logo-word">{site.name}</span>
    </span>
  );
}
