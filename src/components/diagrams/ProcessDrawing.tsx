import type { CSSProperties } from "react";
import type { StageId } from "@/content/process";
import { seeded, sketchCurve, sketchRect } from "@/lib/geometry";
import { Engineer } from "./Engineer";

/*
 * One workflow, drawn four times over: Embed (pencil field notes) → Map
 * (a clean one-page map with agreed scope) → Build (the boxes become working
 * screens, week by week) → Run (live, maintained, extended).
 * The stage comes from data-stage on the <svg> or on any ancestor; the
 * transitions in home.css carry it from one stage to the next.
 */

type Layout = "wide" | "compact";
type Box = { x: number; y: number };

const L = {
  wide: {
    vb: [960, 470] as const,
    w: 170,
    h: 100,
    boxes: [
      { x: 50, y: 170 },
      { x: 290, y: 170 },
      { x: 530, y: 170 },
      { x: 770, y: 170 },
    ] as Box[],
    links: ["M220 220 H290", "M460 220 H530", "M700 220 H770"],
    token: "M135 220 H855",
    ext: { x: 530, y: 368, link: "M615 270 V368" },
    title: { x: 50, y: 70 },
    pills: { x: 910, y: 56 },
  },
  compact: {
    vb: [480, 600] as const,
    w: 180,
    h: 100,
    boxes: [
      { x: 24, y: 120 },
      { x: 276, y: 120 },
      { x: 276, y: 340 },
      { x: 24, y: 340 },
    ] as Box[],
    links: ["M204 170 H276", "M366 220 V340", "M276 390 H204"],
    token: "M114 170 H366 V390 H114",
    ext: { x: 276, y: 512, link: "M366 440 V512" },
    title: { x: 24, y: 52 },
    pills: { x: 456, y: 82 },
  },
};

const labels = ["Enquiry", "Quote", "Order", "Invoice"];
const notes = ["comes in on 3 groups", "typed up twice", "approved by voice note", "made at month end"];
const tags: { label: string; tone: "auto" | "simple" | "leave" }[] = [
  { label: "Automate", tone: "auto" },
  { label: "Simplify", tone: "simple" },
  { label: "Automate", tone: "auto" },
  { label: "Leave alone", tone: "leave" },
];
const titles: Record<StageId, string> = {
  embed: "Day 1 · sitting with sales and dispatch",
  map: "One-page map",
  build: "Working software, week by week",
  run: "Live, and looked after",
};

export function ProcessDrawing({
  stage,
  layout = "wide",
  className = "",
  engineer = false,
}: {
  /**
   * Which stage to draw. Leave it out when an ancestor sets data-stage (a
   * client wrapper that moves between stages without re-rendering the SVG).
   * "blank" draws nothing, so the first stage can draw itself in.
   */
  stage?: StageId | "blank";
  layout?: Layout;
  className?: string;
  /** Wide layout only: the engineer acting out each stage, in the margin left of the drawing. */
  engineer?: boolean;
}) {
  const g = L[layout];
  const [vw, vh] = g.vb;
  const margin = engineer && layout === "wide" ? 410 : 0;
  const rnd = seeded(layout === "wide" ? 4411 : 7723);
  const c = (b: Box) => ({ x: b.x + g.w / 2, y: b.y + g.h / 2 });

  // pencil connectors between neighbouring boxes, plus one "asked again" loop back
  const sketchLinks = g.boxes.slice(0, -1).map((b, i) => {
    const a = c(b);
    const z = c(g.boxes[i + 1]);
    return sketchCurve(a, z, rnd, 0.12);
  });
  const back = (() => {
    const a = c(g.boxes[1]);
    const z = c(g.boxes[0]);
    const lift = layout === "wide" ? -86 : -78;
    return `M${a.x - 20},${a.y - g.h / 2 - 6} C${a.x - 40},${a.y + lift} ${z.x + 40},${z.y + lift} ${z.x + 18},${z.y - g.h / 2 - 8}`;
  })();

  return (
    <svg
      className={`pd pd--${layout} ${className}`}
      viewBox={`${-margin} 0 ${vw + margin} ${vh}`}
      data-stage={stage}
      aria-hidden
      focusable={false}
    >
      {/* notebook paper: Embed only */}
      <g className="pd-paper">
        {Array.from({ length: Math.floor(vh / 30) + 12 }, (_, i) => (
          <line key={i} x1={-1200} x2={vw + 1200} y1={24 + (i - 6) * 30} y2={24 + (i - 6) * 30} />
        ))}
        <line className="pd-paper__margin" x1={layout === "wide" ? 26 : 12} x2={layout === "wide" ? 26 : 12} y1={0} y2={vh} />
      </g>

      {/* crop marks around the map: Map onwards */}
      <g className="pd-frame">
        {[
          [10, 10, 1, 1],
          [vw - 10, 10, -1, 1],
          [10, vh - 10, 1, -1],
          [vw - 10, vh - 10, -1, -1],
        ].map(([x, y, sx, sy], i) => (
          <path key={i} d={`M${x} ${y + 18 * sy} V${y} H${x + 18 * sx}`} />
        ))}
      </g>

      {/* stage titles */}
      {(Object.keys(titles) as StageId[]).map((s) => (
        <text
          key={s}
          x={g.title.x}
          y={g.title.y}
          className={`pd-title pd-title--${s}${s === "embed" ? " pd-hand" : ""}`}
        >
          {titles[s]}
        </text>
      ))}

      {/* ---------------- Embed: pencil */}
      <g className="pd-sketch">
        {g.boxes.map((b, i) => (
          <path key={`r${i}`} d={sketchRect(b.x, b.y, g.w, g.h, rnd)} pathLength={1} style={{ "--k": i } as CSSProperties} />
        ))}
        {sketchLinks.map((d, i) => (
          <path key={`l${i}`} d={d} pathLength={1} style={{ "--k": i + 4 } as CSSProperties} />
        ))}
        <path d={back} pathLength={1} style={{ "--k": 8 } as CSSProperties} className="pd-sketch__back" />
        {g.boxes.map((b, i) => (
          <text key={`t${i}`} x={c(b).x} y={c(b).y + 7} textAnchor="middle" className="pd-hand pd-hand--label">
            {labels[i].toLowerCase()}
          </text>
        ))}
        {g.boxes.map((b, i) => (
          <text
            key={`n${i}`}
            x={c(b).x}
            y={layout === "wide" ? (i % 2 ? b.y + g.h + 38 : b.y - 18) : b.y + g.h + 34}
            textAnchor="middle"
            className="pd-hand pd-hand--note"
            transform={`rotate(${i % 2 ? 2 : -2.5} ${c(b).x} ${b.y})`}
          >
            {notes[i]}
          </text>
        ))}
        <text
          x={(c(g.boxes[0]).x + c(g.boxes[1]).x) / 2}
          y={c(g.boxes[0]).y - g.h / 2 - (layout === "wide" ? 64 : 56)}
          textAnchor="middle"
          className="pd-hand pd-hand--note"
        >
          asked again
        </text>
      </g>

      {/* ---------------- Map → Run: the clean drawing */}
      <g className="pd-links">
        {g.links.map((d, i) => (
          <path key={i} d={d} pathLength={1} style={{ "--k": i } as CSSProperties} />
        ))}
      </g>

      <path className="pd-ext-link" d={g.ext.link} pathLength={1} />
      <g className="pd-ext">
        <rect x={g.ext.x} y={g.ext.y} width={g.w} height={layout === "wide" ? 62 : 64} rx={12} />
        <text x={g.ext.x + g.w / 2} y={g.ext.y + 37} textAnchor="middle">
          + Customer portal
        </text>
      </g>

      <circle className="pd-token" r={7}>
        <animateMotion
          dur="3.6s"
          repeatCount="indefinite"
          path={g.token}
          calcMode="spline"
          keyPoints="0;1"
          keyTimes="0;1"
          keySplines="0.65 0 0.35 1"
        />
      </circle>

      {g.boxes.map((b, i) => (
        <g key={`b${i}`} className="pd-box" style={{ "--k": i } as CSSProperties}>
          <rect x={b.x} y={b.y} width={g.w} height={g.h} rx={14} className="pd-box__frame" />
          <text x={c(b).x} y={c(b).y + 7} textAnchor="middle" className="pd-box__label">
            {labels[i]}
          </text>
          {/* Build: the box becomes a screen */}
          <g className="pd-ui">
            <rect x={b.x} y={b.y} width={g.w} height={24} rx={14} className="pd-ui__bar" />
            <rect x={b.x} y={b.y + 12} width={g.w} height={12} className="pd-ui__bar" />
            <text x={b.x + 14} y={b.y + 17} className="pd-ui__name">
              {labels[i]}
            </text>
            <rect x={b.x + 14} y={b.y + 38} width={g.w - 60} height={8} rx={4} className="pd-ui__field" />
            <rect x={b.x + 14} y={b.y + 54} width={g.w - 90} height={8} rx={4} className="pd-ui__field" />
            <rect x={b.x + 14} y={b.y + 72} width={56} height={16} rx={8} className="pd-ui__btn" />
          </g>
          {/* Map: the agreed scope */}
          <g className={`pd-tag pd-tag--${tags[i].tone}`}>
            <rect x={c(b).x - 46} y={b.y + g.h + 14} width={92} height={24} rx={12} />
            <text x={c(b).x} y={b.y + g.h + 30.5} textAnchor="middle">
              {tags[i].label}
            </text>
          </g>
          {/* Build: one week at a time */}
          <g className="pd-week">
            <circle cx={c(b).x - 30} cy={b.y + g.h + 26} r={5} />
            <text x={c(b).x - 18} y={b.y + g.h + 31}>
              Week {i + 1}
            </text>
          </g>
        </g>
      ))}

      {/* Run: kept up as the business changes */}
      <g className="pd-pills">
        {["Maintained", "Supported", "Extended"].map((p, i) => {
          const w = 104;
          const x = layout === "wide" ? g.pills.x - (3 - i) * (w + 8) + 8 : g.pills.x - (3 - i) * (w + 8) + 8;
          return (
            <g key={p} style={{ "--k": i } as CSSProperties}>
              <rect x={x} y={g.pills.y - 18} width={w} height={26} rx={13} />
              <circle cx={x + 16} cy={g.pills.y - 5} r={4} />
              <text x={x + 27} y={g.pills.y}>
                {p}
              </text>
            </g>
          );
        })}
      </g>

      {margin ? <Engineer /> : null}
    </svg>
  );
}
