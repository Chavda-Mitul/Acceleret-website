import type { CSSProperties, ReactNode } from "react";
import { Sketch } from "@/lib/sketch";

/*
 * The hero's drawings: six kinds of software a business runs on, and one
 * still to come. Each is drawn twice on the same geometry — by hand in pencil
 * (lib/sketch, seeded so server and client agree), then built: crisp panels
 * with blue where the system does the work. Illustrative, not product shots.
 */

export type HeroObject = {
  id: string;
  /** One word, under the drawing once it's built. */
  label: string;
  w: number;
  h: number;
  /** Pencil strokes: the outline, then the lighter detail. */
  ink: string;
  line: string;
  built: ReactNode;
  /** Stays a pencil sketch: the one we haven't built yet. */
  open?: boolean;
};

function pencil(seed: number, draw: (s: Sketch) => void) {
  const s = new Sketch(seed);
  draw(s);
  return { ink: s.layers.ink.join(""), line: [...s.layers.line, ...s.layers.hatch].join("") };
}

/* ------------------------------------------------------------------ phone: an app */

const phoneRows = [42, 60, 78];
const phone: HeroObject = {
  id: "app",
  label: "Apps",
  w: 78,
  h: 136,
  ...pencil(11, (s) => {
    s.rect(3, 3, 72, 130, "ink", { twice: true });
    s.rect(9, 15, 60, 104, "line");
    s.line([31, 9.5], [47, 9.5], "ink");
    s.hatchRect(9, 15, 60, 18, { gap: 4.2 });
    for (const y of phoneRows) {
      s.ellipse(19, y + 4, 5, 5, "line");
      s.line([28, y + 2], [60, y + 2], "line");
    }
    s.rect(17, 99, 44, 12, "ink");
  }),
  built: (
    <>
      <rect x={3} y={3} width={72} height={130} rx={13} className="hb-frame" />
      <rect x={9} y={15} width={60} height={104} rx={4} className="hb-soft" />
      <path d="M9 19 Q9 15 13 15 H65 Q69 15 69 19 V33 H9 Z" className="hb-blue" />
      <rect x={31} y={8} width={16} height={3} rx={1.5} className="hb-dark" />
      {phoneRows.map((y, i) => (
        <g key={y} className="hb-row" style={{ "--r": i } as CSSProperties}>
          <circle cx={19} cy={y + 4} r={5} className="hb-sky" />
          <rect x={28} y={y} width={32} height={3.5} rx={1.75} className="hb-bar" />
          <rect x={28} y={y + 6} width={20} height={3} rx={1.5} className="hb-bar hb-bar--soft" />
        </g>
      ))}
      <rect x={17} y={99} width={44} height={12} rx={6} className="hb-blue hb-press" />
      <rect x={30} y={125} width={18} height={2.5} rx={1.25} className="hb-dark" />
    </>
  ),
};

/* ------------------------------------------------------------------ laptop: the numbers */

const bars = [20, 34, 26, 44, 38];
const laptop: HeroObject = {
  id: "dashboards",
  label: "Dashboards",
  w: 196,
  h: 128,
  ...pencil(23, (s) => {
    s.rect(16, 3, 164, 104, "ink", { twice: true });
    s.poly(
      [
        [4, 110],
        [192, 110],
        [184, 124],
        [12, 124],
      ],
      "ink",
      true,
    );
    s.line([32, 21], [66, 21], "line");
    s.rect(32, 27, 22, 8, "line");
    bars.forEach((h, i) => s.rect(32 + i * 14, 90 - h, 9, h, "line"));
    s.hatchRect(88, 90 - bars[4], 9, bars[4], { gap: 3.4 });
    s.line([28, 90], [104, 90], "line");
    s.ellipse(142, 58, 19, 19, "ink");
    s.ellipse(142, 58, 10, 10, "line");
  }),
  built: (
    <>
      <rect x={16} y={3} width={164} height={104} rx={8} className="hb-frame" />
      <rect x={24} y={11} width={148} height={88} rx={3} className="hb-soft" />
      <path d="M4 110 H192 L186 122 Q185 124 182 124 H14 Q11 124 10 122 Z" className="hb-frame" />
      <rect x={32} y={19} width={34} height={4} rx={2} className="hb-bar" />
      <rect x={32} y={27} width={22} height={8} rx={2} className="hb-blue" />
      {bars.map((h, i) => (
        <rect
          key={i}
          x={32 + i * 14}
          y={90 - h}
          width={9}
          height={h}
          rx={2}
          className={i >= 3 ? "hb-blue hb-grow" : "hb-sky hb-grow"}
          style={{ "--b": i } as CSSProperties}
        />
      ))}
      <circle cx={142} cy={58} r={14.5} className="hb-ring" />
      <circle cx={142} cy={58} r={14.5} pathLength={100} className="hb-ring hb-ring--blue" />
      <rect x={124} y={86} width={36} height={3.5} rx={1.75} className="hb-bar hb-bar--soft" />
    </>
  ),
};

/* ------------------------------------------------------------------ board: the pipeline (CRM) */

const cols = [10, 64, 118];
const cards: [number, number][] = [
  [0, 28],
  [0, 50],
  [0, 72],
  [1, 28],
  [1, 50],
  [2, 28],
];
const board: HeroObject = {
  id: "crm",
  label: "CRM",
  w: 176,
  h: 116,
  ...pencil(37, (s) => {
    s.rect(2, 2, 172, 112, "ink", { twice: true });
    s.line([61, 12], [61, 106], "line");
    s.line([115, 12], [115, 106], "line");
    for (const x of cols) s.line([x + 2, 14], [x + 34, 14], "line");
    for (const [c, y] of cards) s.rect(cols[c] + 2, y, 44, 17, "line");
    s.rect(cols[1] + 2, 72, 44, 17, "ink");
    s.hatchRect(cols[1] + 2, 72, 44, 17, { gap: 3.6 });
  }),
  built: (
    <>
      <rect x={2} y={2} width={172} height={112} rx={10} className="hb-frame" />
      {cols.map((x) => (
        <g key={x}>
          <rect x={x} y={22} width={48} height={84} rx={5} className="hb-soft" />
          <rect x={x + 2} y={12} width={28} height={4} rx={2} className="hb-bar" />
        </g>
      ))}
      {cards.map(([c, y], i) => (
        <g key={i}>
          <rect x={cols[c] + 2} y={y} width={44} height={17} rx={3} className="hb-card" />
          <rect x={cols[c] + 7} y={y + 5} width={24} height={3} rx={1.5} className="hb-bar" />
          <rect x={cols[c] + 7} y={y + 10} width={14} height={2.5} rx={1.25} className="hb-bar hb-bar--soft" />
        </g>
      ))}
      {/* the deal that moves on by itself */}
      <g className="hb-move">
        <rect x={cols[1] + 2} y={72} width={44} height={17} rx={3} className="hb-blue" />
        <rect x={cols[1] + 7} y={77} width={24} height={3} rx={1.5} className="hb-white" />
      </g>
    </>
  ),
};

/* ------------------------------------------------------------------ chat: the automatic reply */

const chat: HeroObject = {
  id: "automation",
  label: "Automation",
  w: 156,
  h: 108,
  ...pencil(41, (s) => {
    s.rect(4, 6, 100, 30, "ink");
    s.line([14, 36], [8, 44], "ink");
    s.line([16, 16], [76, 16], "line");
    s.line([16, 25], [56, 25], "line");
    s.rect(48, 44, 104, 30, "ink", { twice: true });
    s.line([142, 74], [149, 81], "ink");
    s.line([60, 54], [116, 54], "line");
    s.line([60, 63], [94, 63], "line");
    s.rect(4, 82, 44, 22, "line");
    for (const x of [16, 26, 36]) s.ellipse(x, 93, 2.4, 2.4, "line");
  }),
  built: (
    <>
      <path d="M18 6 H90 Q104 6 104 21 Q104 36 90 36 H20 L9 44 L12 34 Q4 30 4 21 Q4 6 18 6 Z" className="hb-soft hb-soft--line" />
      <rect x={16} y={15} width={60} height={4} rx={2} className="hb-bar" />
      <rect x={16} y={23} width={40} height={4} rx={2} className="hb-bar hb-bar--soft" />
      <g className="hb-pop">
        <path d="M62 44 H138 Q152 44 152 59 Q152 70 146 73 L150 81 L139 74 H62 Q48 74 48 59 Q48 44 62 44 Z" className="hb-blue" />
        <rect x={60} y={53} width={56} height={4} rx={2} className="hb-white" />
        <rect x={60} y={61} width={34} height={4} rx={2} className="hb-white hb-white--soft" />
        <path d="M122 62 l3 3 l6 -7 M128 62 l3 3 l6 -7" className="hb-tick" />
      </g>
      <rect x={4} y={82} width={44} height={22} rx={11} className="hb-soft hb-soft--line" />
      {[16, 26, 36].map((x, i) => (
        <circle key={x} cx={x} cy={93} r={2.6} className="hb-typing" style={{ animationDelay: `${i * 0.18}s` }} />
      ))}
    </>
  ),
};

/* ------------------------------------------------------------------ document: AI reads it */

const docLines: [number, number][] = [
  [36, 70],
  [46, 58],
  [56, 66],
  [96, 72],
  [106, 52],
  [116, 64],
];
const doc: HeroObject = {
  id: "ai",
  label: "AI",
  w: 110,
  h: 136,
  ...pencil(53, (s) => {
    s.poly(
      [
        [6, 4],
        [82, 4],
        [104, 26],
        [104, 132],
        [6, 132],
      ],
      "ink",
      true,
      { twice: true },
    );
    s.poly(
      [
        [82, 4],
        [82, 26],
        [104, 26],
      ],
      "line",
    );
    for (const [y, w] of docLines) s.line([16, y], [16 + w, y], "line");
    s.rect(13, 70, 80, 16, "ink");
    s.hatchRect(13, 70, 80, 16, { gap: 3.8 });
  }),
  built: (
    <>
      <path d="M6 8 Q6 4 10 4 H82 L104 26 V128 Q104 132 100 132 H10 Q6 132 6 128 Z" className="hb-frame" />
      <path d="M82 4 V22 Q82 26 86 26 H104" className="hb-fold" />
      {docLines.map(([y, w]) => (
        <rect key={y} x={16} y={y - 2} width={w} height={4} rx={2} className="hb-bar hb-bar--soft" />
      ))}
      <rect x={13} y={70} width={80} height={16} rx={3} className="hb-field" />
      <rect x={19} y={76} width={44} height={4} rx={2} className="hb-blue" />
      <g className="hb-scan">
        <rect x={8} y={-10} width={94} height={12} className="hb-scan__glow" />
        <rect x={8} y={1} width={94} height={1.6} rx={0.8} className="hb-blue" />
      </g>
      <path d="M96 104 Q97 113 106 114 Q97 115 96 124 Q95 115 86 114 Q95 113 96 104 Z" className="hb-blue hb-spark" />
    </>
  ),
};

/* ------------------------------------------------------------------ two systems, kept in sync */

const sync: HeroObject = {
  id: "integrations",
  label: "Integrations",
  w: 184,
  h: 96,
  ...pencil(67, (s) => {
    s.ellipse(34, 20, 26, 9, "ink");
    s.line([8, 20], [8, 76], "ink");
    s.line([60, 20], [60, 76], "ink");
    s.ellipse(34, 76, 26, 9, "ink", { from: 0, to: Math.PI });
    s.ellipse(34, 39, 26, 9, "line", { from: 0, to: Math.PI });
    s.ellipse(34, 58, 26, 9, "line", { from: 0, to: Math.PI });
    s.rect(124, 12, 56, 72, "ink", { twice: true });
    for (const y of [28, 40, 52]) s.line([132, y], [170, y], "line");
    s.curve(
      [
        [70, 36],
        [92, 22],
        [116, 32],
      ],
      "line",
    );
    s.curve(
      [
        [116, 62],
        [92, 76],
        [70, 66],
      ],
      "line",
    );
  }),
  built: (
    <>
      <path d="M8 20 V76 A26 9 0 0 0 60 76 V20" className="hb-frame" />
      <ellipse cx={34} cy={20} rx={26} ry={9} className="hb-frame hb-frame--soft" />
      <path d="M8 39 A26 9 0 0 0 60 39 M8 58 A26 9 0 0 0 60 58" className="hb-rule" />
      <rect x={124} y={12} width={56} height={72} rx={6} className="hb-frame" />
      {[28, 40, 52].map((y) => (
        <rect key={y} x={132} y={y - 2} width={38} height={4} rx={2} className="hb-bar hb-bar--soft" />
      ))}
      <rect x={132} y={66} width={26} height={6} rx={2} className="hb-blue" />
      <path d="M70 36 C88 22 104 22 116 32" className="hb-flow" />
      <path d="M109 25 L117 33 L106 35" className="hb-arrow" />
      <path d="M116 62 C100 76 84 76 70 66" className="hb-flow" />
      <path d="M77 73 L69 65 L80 63" className="hb-arrow" />
    </>
  ),
};

/* ------------------------------------------------------------------ the next one: yours */

function dashedRect(s: Sketch, x: number, y: number, w: number, h: number) {
  const corners: [number, number][] = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
  corners.forEach((a, i) => {
    const b = corners[(i + 1) % 4];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(2, Math.round(len / 15));
    for (let k = 0; k < n; k++) {
      const t0 = k / n;
      const t1 = t0 + 0.62 / n;
      s.line([a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0], [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1], "ink", {
        over: 0.4,
        bow: 0.5,
      });
    }
  });
}

const yours: HeroObject = {
  id: "yours",
  label: "yours next",
  w: 136,
  h: 96,
  open: true,
  ...pencil(79, (s) => {
    dashedRect(s, 4, 4, 128, 88);
    s.line([112, 16], [120, 10], "line");
    s.line([116, 22], [126, 20], "line");
  }),
  built: null,
};

export const heroObjects: HeroObject[] = [phone, laptop, board, chat, doc, sync, yours];
