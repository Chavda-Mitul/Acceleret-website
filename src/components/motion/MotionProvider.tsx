"use client";

import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { loadGsap, queueRefresh, useMotionMode } from "@/lib/motion";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Site-wide motion: smooth scrolling (Lenis, driven by GSAP's ticker so
 * scroll scenes and scrolling share one clock), magnetic buttons, and
 * re-measuring scroll scenes after navigation. Full motion only; renders nothing.
 */
export function MotionProvider() {
  return (
    <Suspense fallback={null}>
      <Motion />
    </Suspense>
  );
}

function Motion() {
  const mode = useMotionMode();
  const pathname = usePathname();

  // Smooth scrolling for mouse and trackpad. Touch keeps native scrolling.
  useEffect(() => {
    if (mode !== "full" || window.matchMedia("(pointer: coarse)").matches) return;
    let cancelled = false;
    let lenis: Lenis | undefined;
    let tick: ((time: number) => void) | undefined;
    Promise.all([import("lenis"), loadGsap()]).then(([{ default: LenisCtor }, { gsap, ScrollTrigger }]) => {
      if (cancelled) return;
      lenis = new LenisCtor({ lerp: 0.1, anchors: { offset: -88 }, autoRaf: false });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      window.__lenis = lenis;
    });
    return () => {
      cancelled = true;
      if (tick) loadGsap().then(({ gsap }) => gsap.ticker.remove(tick!));
      lenis?.destroy();
      delete window.__lenis;
    };
  }, [mode]);

  // A new page: let smooth scrolling and scroll scenes re-measure.
  useEffect(() => {
    window.__lenis?.resize();
    queueRefresh();
  }, [pathname]);

  // Buttons lean towards the pointer.
  useEffect(() => {
    if (mode !== "full" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let active: HTMLElement | null = null;
    let to: { x: (v: number) => void; y: (v: number) => void } | null = null;
    let gsapRef: Awaited<ReturnType<typeof loadGsap>>["gsap"] | null = null;
    loadGsap().then(({ gsap }) => (gsapRef = gsap));

    const release = () => {
      to?.x(0);
      to?.y(0);
      active = null;
      to = null;
    };
    const onMove = (e: PointerEvent) => {
      if (!gsapRef) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>(".btn, .wa-button, [data-magnetic]");
      if (el !== active) {
        release();
        if (!el || el.getAttribute("aria-disabled") === "true") return;
        active = el;
        to = {
          x: gsapRef.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }),
          y: gsapRef.quickTo(el, "y", { duration: 0.5, ease: "power3.out" }),
        };
      }
      if (!active || !to) return;
      const r = active.getBoundingClientRect();
      to.x(((e.clientX - (r.left + r.width / 2)) / r.width) * 14);
      to.y(((e.clientY - (r.top + r.height / 2)) / r.height) * 10);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", release);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", release);
      release();
    };
  }, [mode]);

  return null;
}
