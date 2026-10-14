"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { useScene } from "@/lib/motion";

/**
 * Wipes its content into view from below when it enters the screen (calm
 * motion: fades). `stagger` reveals direct children one after another.
 */
export function Reveal({
  as = "div",
  className = "",
  children,
  stagger = false,
  style,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  stagger?: boolean;
  style?: CSSProperties;
}) {
  const Tag = as;
  const ref = useRef<HTMLElement>(null);

  useScene(ref, ({ gsap, ScrollTrigger, mode, el, returning }) => {
    if (returning) return; // already revealed before the visitor left the page
    const targets = stagger ? Array.from(el.children) : [el];
    const hidden = mode === "full" ? { clipPath: "inset(18% 0% 82% 0% round 24px)", y: 60 } : { opacity: 0 };
    const shown = mode === "full" ? { clipPath: "inset(0% 0% 0% 0% round 24px)", y: 0 } : { opacity: 1 };
    gsap.set(targets, hidden);
    // Each child starts when it reaches the screen; children arriving together stagger.
    ScrollTrigger.batch(targets, {
      start: "top 86%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          ...shown,
          duration: mode === "full" ? 1.3 : 0.9,
          ease: "expo.out",
          stagger: 0.14,
          clearProps: "clipPath,transform,opacity",
        }),
    });
  });

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
