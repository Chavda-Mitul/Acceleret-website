"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { seeded, sketchRoundRect } from "@/lib/geometry";

/**
 * Sketch first, then build, for a box: a pencil outline is drawn around it
 * by hand, then the finished box inks in over the sketch and the pencil
 * fades away. Wraps one box (a card, a panel, a form).
 */
export function SketchFrame({
  children,
  className = "",
  radius = 26,
  seed = 3,
  delay = 0,
  priority = false,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
  seed?: number;
  /** Seconds to wait after coming into view (stagger sibling frames). */
  delay?: number;
  /**
   * On screen at load: the box shows on first paint (it is the page's
   * largest paint) and the pencil outline is traced around it afterwards.
   */
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setSize((s) => (s && Math.abs(s.w - width) < 2 && Math.abs(s.h - height) < 2 ? s : { w: width, h: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.dataset.inview === "true") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.inview = "true";
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pad = 10;
  const rnd = seeded(seed + Math.round(size?.w ?? 0));
  const paths = size
    ? [sketchRoundRect(size.w + pad * 2, size.h + pad * 2, radius + 4, rnd, 6), sketchRoundRect(size.w + pad * 2, size.h + pad * 2, radius + 4, rnd, 8)]
    : [];

  return (
    <div ref={ref} className={`sf${priority ? " sf--priority" : ""} ${className}`} data-inview="false" style={{ "--sf-delay": `${delay}s` } as React.CSSProperties}>
      {size ? (
        <svg className="sf__svg" viewBox={`0 0 ${size.w + pad * 2} ${size.h + pad * 2}`} aria-hidden focusable={false}>
          {paths.map((d, i) => (
            <path key={i} d={d} pathLength={1} />
          ))}
        </svg>
      ) : null}
      {children}
    </div>
  );
}
