"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { processUnderline, stages, type StageId } from "@/content/process";
import { InView } from "@/components/motion/InView";
import { Spine } from "@/components/motion/Spine";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { useScrollProgress } from "@/lib/scroll";

/**
 * Home section 4: Embed · Map · Build · Run as one drawing that evolves while
 * the section is pinned. Scrolling moves through the stages at your pace; the
 * step buttons jump straight to one. Small screens show the four states stacked.
 *
 * The drawings are rendered on the server and passed in; this component only
 * moves data-stage, so nothing heavy re-renders while you scroll.
 */
export function ProcessHome({ drawing, stack }: { drawing: ReactNode; stack: Record<StageId, ReactNode> }) {
  const ref = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const [stage, setStage] = useState<StageId>("embed");

  // Progress goes straight to CSS; React only re-renders when the stage changes.
  useScrollProgress(ref, "sticky", (p) => {
    const i = Math.min(stages.length - 1, Math.floor(p * stages.length * 0.999));
    setStage(stages[i].id);
    stepsRef.current?.style.setProperty("--progress", p.toFixed(4));
  });

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + travel * ((i + 0.5) / stages.length), behavior: "smooth" });
  };

  const activeIndex = stages.findIndex((s) => s.id === stage);

  return (
    <section ref={ref} className="process-home" aria-labelledby="process-title">
      <Spine />
      <div className="process-home__sticky">
        <div className="wrap process-home__inner">
          <header className="process-home__head">
            <SplitHeading id="process-title" className="t-h2" sketch>
              How we work
            </SplitHeading>
            <p className="t-lead process-home__under">{processUnderline}</p>
            <Link href="/how-we-work" className="link process-home__link">
              See how we work
            </Link>
          </header>

          <div className="process-home__drawing" data-stage={stage}>
            {drawing}
          </div>

          <ol className="process-home__steps" ref={stepsRef}>
            {stages.map((s, i) => (
              <li key={s.id} data-state={i < activeIndex ? "done" : i === activeIndex ? "active" : "next"}>
                <button type="button" onClick={() => jump(i)} aria-current={i === activeIndex ? "step" : undefined}>
                  <span className="process-home__num">{s.number}</span>
                  <span className="process-home__name">{s.name}</span>
                  <span className="process-home__line">{s.line}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* small screens: the four states, one after another */}
      <ol className="wrap process-home__stack">
        {stages.map((s) => (
          <li key={s.id}>
            <InView className="process-home__stack-drawing" threshold={0.35}>
              {stack[s.id]}
            </InView>
            <p className="process-home__stack-name">
              <span className="process-home__num">{s.number}</span> {s.name}
            </p>
            <p className="process-home__stack-line">{s.line}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
