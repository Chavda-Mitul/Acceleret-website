"use client";

import { useRef } from "react";
import { useScrollProgress } from "@/lib/scroll";

/**
 * The route from the hero, continuing down the page margin. It draws as you
 * read (its tip stays a little below the middle of the screen). `tone`
 * switches it to pencil where the enquiry is lost in WhatsApp, Excel and
 * memory. Place inside a position: relative section.
 */
export function Spine({ tone = "route", end = false }: { tone?: "route" | "pencil" | "light"; end?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, "tip");
  return (
    <div ref={ref} className={`spine spine--${tone}${end ? " spine--end" : ""}`} aria-hidden>
      <span className="spine__line" />
    </div>
  );
}
