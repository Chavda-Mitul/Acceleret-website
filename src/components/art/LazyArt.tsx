"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Sketch } from "@/lib/sketch";
import { ArtSvg } from "./ArtSvg";

type Drawing = { sketch: Sketch; width: number; height: number };

const drawings = {
  street: () => import("./street").then((m) => ({ sketch: m.drawStreet(), width: m.STREET_W, height: m.STREET_H })),
} satisfies Record<string, () => Promise<Drawing>>;

/**
 * Keeps a drawing out of the page's HTML: the space is reserved, the drawing
 * code loads as you scroll near it, and it draws itself in once in view.
 */
export function LazyArt({
  kind,
  ratio,
  label,
  className = "",
}: {
  kind: keyof typeof drawings;
  /** Width / height of the drawing, so the space is held before it loads. */
  ratio: string;
  /** What the drawing shows, for screen readers. */
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        drawings[kind]().then((d) => {
          if (!cancelled) setDrawing(d);
        });
      },
      { rootMargin: "900px 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [kind]);

  // Only after the drawing exists, so its lines start undrawn and draw in.
  useEffect(() => {
    const el = ref.current;
    if (!el || !drawing) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        requestAnimationFrame(() => setInView(true));
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [drawing]);

  return (
    <figure
      ref={ref}
      className={`art ${className}`}
      data-inview={inView ? "true" : "false"}
      style={{ "--ratio": ratio } as CSSProperties}
    >
      {drawing ? <ArtSvg {...drawing} /> : <div className="art__space" aria-hidden />}
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  );
}
