import type { ReactNode } from "react";
import { InView } from "@/components/motion/InView";

/*
 * A small aside with a pencil arrow ("keep scrolling"), set in the body font
 * like all small text. It wipes in, then the arrow draws, when it comes into
 * view. Pencil grey on light backgrounds, sky on deep blue.
 */

type Arrow = "left" | "right" | "down" | "up" | "down-left" | "down-right" | "up-left" | "up-right";

const ARROWS: Record<Arrow, { vb: string; d: string; w: number; h: number }> = {
  right: { vb: "0 0 52 28", w: 44, h: 24, d: "M2 17 C 14 8, 30 8, 46 13 M38 6 L46 13 L38 20" },
  left: { vb: "0 0 52 28", w: 44, h: 24, d: "M50 17 C 38 8, 22 8, 6 13 M14 6 L6 13 L14 20" },
  down: { vb: "0 0 28 44", w: 20, h: 34, d: "M14 2 C 8 14, 18 24, 13 38 M7 31 L13 39 L19 31" },
  up: { vb: "0 0 28 44", w: 20, h: 34, d: "M14 42 C 8 30, 18 20, 13 6 M7 13 L13 5 L19 13" },
  "down-right": { vb: "0 0 48 40", w: 40, h: 34, d: "M4 4 C 6 22, 22 32, 42 32 M34 26 L42 32 L34 37" },
  "down-left": { vb: "0 0 48 40", w: 40, h: 34, d: "M44 4 C 42 22, 26 32, 6 32 M14 26 L6 32 L14 37" },
  "up-right": { vb: "0 0 48 40", w: 40, h: 34, d: "M4 36 C 8 18, 22 8, 42 8 M34 3 L42 8 L35 15" },
  "up-left": { vb: "0 0 48 40", w: 40, h: 34, d: "M44 36 C 40 18, 26 8, 6 8 M14 3 L6 8 L13 15" },
};

export function Note({
  children,
  arrow,
  tone = "pencil",
  size = "md",
  className = "",
  as = "p",
}: {
  children: ReactNode;
  arrow?: Arrow;
  tone?: "pencil" | "ink" | "sky";
  size?: "sm" | "md" | "lg";
  className?: string;
  as?: "p" | "span" | "div";
}) {
  const a = arrow ? ARROWS[arrow] : null;
  return (
    <InView
      as={as}
      threshold={0.6}
      className={`hn hn--${tone} hn--${size} ${className}`}
      data-arrow={arrow}
    >
      <span className="hn__text">{children}</span>
      {a ? (
        <svg className="hn__arrow" viewBox={a.vb} width={a.w} height={a.h} aria-hidden focusable={false}>
          <path d={a.d} pathLength={1} />
        </svg>
      ) : null}
    </InView>
  );
}
