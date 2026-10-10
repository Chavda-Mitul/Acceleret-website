"use client";

import { Fragment, useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { useScene } from "@/lib/motion";

/**
 * A heading that arrives in one of two ways.
 *
 * `sketch`: handwritten. The heading is set in the handwriting face and each
 * word writes itself in, left to right, like a pen moving across the page —
 * on arrival (`onLoad`) or when it comes into view. It stays handwritten.
 * This runs in CSS, so it starts with the first paint and needs no scripts.
 *
 * Otherwise the lines rise out of their own masks as they come into view.
 * Calm motion keeps the writing (a reveal, not movement).
 */
export function SplitHeading({
  as = "h2",
  id,
  className = "",
  children,
  onLoad = false,
  sketch = false,
  srPrefix,
}: {
  as?: ElementType;
  id?: string;
  className?: string;
  children: ReactNode;
  onLoad?: boolean;
  /** Accepted for older call sites; handwritten headings always write in when they come into view. */
  inView?: boolean;
  sketch?: boolean | "sky";
  /** Words read out before the heading by screen readers only (e.g. "Stage 1:"). */
  srPrefix?: string;
}) {
  const Tag = as;
  const ref = useRef<HTMLElement>(null);
  const words = sketch && typeof children === "string" ? children.split(" ") : null;

  // Handwritten, on view: start writing when it comes into sight (once).
  useEffect(() => {
    const el = ref.current;
    if (!el || !words || onLoad || el.classList.contains("is-inview")) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-inview");
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [words, onLoad]);

  useScene(ref, ({ gsap, SplitText, mode, el }) => {
    if (words) return; // handwritten headings run in CSS

    /* ---------------- lines rise */
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit(self) {
        el.classList.add("is-split");
        return gsap.from(self.lines, {
          ...(mode === "full" ? { yPercent: 108, rotate: 1.5 } : { opacity: 0 }),
          duration: mode === "full" ? 1.15 : 0.9,
          ease: "expo.out",
          stagger: 0.085,
          delay: onLoad ? 0.05 : 0,
          scrollTrigger: onLoad ? undefined : { trigger: el, start: "top 86%", once: true },
        });
      },
    });
  });

  const skin = sketch === "sky" ? " split--sky" : "";
  return (
    <Tag
      ref={ref}
      id={id}
      className={`split${onLoad && !words ? " split--load" : ""}${words ? ` split--hand${skin}` : ""} ${className}`}
      data-write={words ? (onLoad ? "load" : "view") : undefined}
    >
      {srPrefix ? <span className="sr-only">{srPrefix} </span> : null}
      {words
        ? words.map((w, i) => (
            <Fragment key={i}>
              <span className="sw" style={{ "--i": i } as CSSProperties}>
                {w}
              </span>
              {i < words.length - 1 ? " " : null}
            </Fragment>
          ))
        : children}
    </Tag>
  );
}
