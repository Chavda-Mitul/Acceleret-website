"use client";

import { useRef } from "react";
import { useScene } from "@/lib/motion";

/**
 * The finale: as the closing band scrolls in, deep blue spreads out from a
 * single node until it fills the screen. Full motion only; renders nothing.
 */
export function CtaFlood() {
  const ref = useRef<HTMLSpanElement>(null);
  useScene(ref, ({ gsap, mode, el }) => {
    const band = el.closest<HTMLElement>(".cta-band");
    if (!band || mode === "calm") return;
    gsap.fromTo(
      band,
      { clipPath: "circle(4% at 50% 55%)" },
      {
        clipPath: "circle(150% at 50% 55%)",
        ease: "power2.in",
        scrollTrigger: { trigger: band, start: "top 92%", end: "top 8%", scrub: 0.5 },
      },
    );
    gsap.from(band.querySelectorAll(".cta-band__sub, .cta-band__actions"), {
      opacity: 0,
      y: 30,
      stagger: 0.12,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: { trigger: band, start: "top 30%", once: true },
    });
  });
  return <span ref={ref} hidden />;
}
