"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { seeded, sketchRect, wobbleAlong } from "@/lib/geometry";
import { SEEN_ABOVE } from "@/lib/motion";

const NS = "http://www.w3.org/2000/svg";

/**
 * Sketch first, then build: wraps an SVG diagram and gives it a pencil
 * layer generated from its own shapes (every box redrawn by hand, every
 * route traced with a wobble). In view, the pencil draws first, the crisp
 * diagram inks in over it, and the sketch stays behind as a faint ghost.
 */
export function SketchSolid({
  children,
  className = "",
  seed = 7,
  as = "div",
  threshold = 0.35,
}: {
  children: ReactNode;
  className?: string;
  seed?: number;
  as?: ElementType;
  threshold?: number;
}) {
  const Tag = as;
  const ref = useRef<HTMLElement>(null);

  // Build the pencil layer from the diagram's own geometry.
  useEffect(() => {
    const svg = ref.current?.querySelector("svg");
    if (!svg || svg.querySelector(":scope > .sk")) return;
    const rnd = seeded(seed);
    const layer = document.createElementNS(NS, "g");
    layer.setAttribute("class", "sk");
    layer.setAttribute("aria-hidden", "true");
    let k = 0;
    const add = (d: string) => {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("pathLength", "1");
      p.style.setProperty("--k", String(Math.min(k++, 18)));
      layer.appendChild(p);
    };
    svg.querySelectorAll<SVGRectElement>("rect").forEach((r) => {
      const w = Number(r.getAttribute("width"));
      const h = Number(r.getAttribute("height"));
      if (!(w >= 14 && h >= 14)) return;
      add(sketchRect(Number(r.getAttribute("x") ?? 0), Number(r.getAttribute("y") ?? 0), w, h, rnd));
    });
    svg.querySelectorAll<SVGPathElement>("path").forEach((p) => {
      if (p.getTotalLength() < 24) return;
      add(wobbleAlong(p, rnd));
    });
    svg.insertBefore(layer, svg.firstChild);
    return () => layer.remove();
  }, [seed]);

  // Start when it comes into view (once).
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
      { threshold, rootMargin: `${SEEN_ABOVE} 0px -6% 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <Tag ref={ref} className={`sketch-solid ${className}`} data-inview="false">
      {children}
    </Tag>
  );
}
