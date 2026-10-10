"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { stages, type StageId } from "@/content/process";

/**
 * The process drawing for one stage block on /how-we-work. It shows the
 * previous stage until it scrolls into view, then moves on to its own — so
 * each block demonstrates the step from what came before.
 */
export function StageDrawing({ stage, children }: { stage: StageId; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const index = stages.findIndex((s) => s.id === stage);
  const from: StageId | "blank" = index > 0 ? stages[index - 1].id : "blank";
  const [shown, setShown] = useState<StageId | "blank">(from);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // With reduced motion the change is instant (CSS), so the same trigger works for everyone.
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(stage);
          io.disconnect();
        }
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [stage]);

  return (
    <div ref={ref} className="stage-drawing" data-stage={shown}>
      {children}
    </div>
  );
}
