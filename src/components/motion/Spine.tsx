"use client";

import { useRef } from "react";
import { useScrollProgress } from "@/lib/scroll";

/**
 * The route from the hero, continuing down the page margin in one solid
 * blue. It draws as you read (its tip stays a little below the middle of
 * the screen): a CSS scroll timeline where supported, this hook otherwise.
 * Place inside a position: relative section.
 */
export function Spine({ end = false }: { end?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, "tip");
  return (
    <div ref={ref} className={`spine${end ? " spine--end" : ""}`} aria-hidden>
      <span className="spine__line" />
    </div>
  );
}
