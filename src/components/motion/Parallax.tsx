"use client";

import { useRef, type ReactNode } from "react";
import { useScene } from "@/lib/motion";

/** Drifts its content against the scroll for a little depth. Full motion only. */
export function Parallax({ children, className = "", amount = 8 }: { children: ReactNode; className?: string; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useScene(ref, ({ gsap, mode, el }) => {
    if (mode === "calm") return;
    gsap.fromTo(
      el,
      { yPercent: amount },
      { yPercent: -amount, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 } },
    );
  });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
