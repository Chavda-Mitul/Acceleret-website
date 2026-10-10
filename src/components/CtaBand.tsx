import Link from "next/link";
import type { CSSProperties } from "react";
import { site } from "@/content/site";
import { roundedPath } from "@/lib/geometry";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { CtaFlood } from "@/components/motion/CtaFlood";
import { SketchSolid } from "@/components/motion/SketchSolid";
import { Note } from "@/components/Note";

/* The finale's drawing: the hero's seven steps again, now fully connected,
   in light lines on deep blue. Static coordinates, drawn once in view. */
const steps = [
  { x: 40, y: 40, l: "Enquiry" },
  { x: 230, y: 40, l: "Quote" },
  { x: 400, y: 120, l: "Approval" },
  { x: 190, y: 160, l: "Order" },
  { x: 40, y: 250, l: "Dispatch" },
  { x: 250, y: 280, l: "Invoice" },
  { x: 410, y: 340, l: "Payment" },
];
const chipW = (l: string) => l.length * 9 + 36;
const mid = (i: number) => ({ x: steps[i].x + chipW(steps[i].l) / 2, y: steps[i].y + 18 });
// Through every step's centre, in order; the chips sit on top of the line.
const route = roundedPath(
  [
    { x: -60, y: mid(0).y },
    mid(0),
    mid(1),
    { x: mid(2).x, y: mid(1).y },
    mid(2),
    { x: mid(2).x, y: mid(3).y },
    mid(3),
    { x: mid(4).x, y: mid(3).y },
    mid(4),
    { x: mid(4).x, y: mid(5).y },
    mid(5),
    { x: mid(6).x, y: mid(5).y },
    mid(6),
    { x: mid(6).x, y: 440 },
  ],
  22,
);

export function CtaBand({
  heading = site.ctaBand.heading,
  sub = site.ctaBand.sub,
}: {
  heading?: string;
  sub?: string;
}) {
  return (
    <section className="cta-band" aria-labelledby="cta-title">
      <CtaFlood />
      <SketchSolid className="cta-band__art" threshold={0.2} seed={21}>
        <svg viewBox="-60 0 590 440" focusable={false}>
          <path
            d={route}
            pathLength={1}
            className="cta-band__route draw"
            style={{ "--draw-dur": "2.4s" } as CSSProperties}
          />
          {steps.map((s, i) => (
            <g
              key={s.l}
              className="cta-band__node rise"
              style={{ "--rise-delay": `${0.2 + i * 0.12}s` } as CSSProperties}
            >
              <rect x={s.x} y={s.y} width={chipW(s.l)} height={36} rx={11} />
              <circle cx={s.x + 16} cy={s.y + 18} r={4} />
              <text x={s.x + 28} y={s.y + 23}>
                {s.l}
              </text>
            </g>
          ))}
        </svg>
      </SketchSolid>
      <div className="wrap cta-band__inner">
        <SplitHeading id="cta-title" className="t-h1 cta-band__title" sketch="sky">
          {heading}
        </SplitHeading>
        <p className="cta-band__sub">{sub}</p>
        <div className="cta-band__actions">
          <span className="cta-band__arrive" aria-hidden />
          <Link href={site.primaryCta.href} className="btn btn-inverse">
            {site.ctaBand.button}
            <span className="btn-node" aria-hidden />
          </Link>
          <Note arrow="left" tone="sky" size="sm" className="cta-band__note">
            thirty minutes, that&apos;s all
          </Note>
        </div>
      </div>
    </section>
  );
}
