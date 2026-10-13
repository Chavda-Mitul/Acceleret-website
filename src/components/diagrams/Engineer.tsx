"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { onDoodle } from "@/lib/doodle";
import { seeded, sketchRect } from "@/lib/geometry";
import { progressFor, subscribeScroll } from "@/lib/scroll";

/*
 * The engineer in the margin of the How we work drawing: a stick figure at a
 * desk whose every move is scrubbed by the scroll through the pinned section.
 * Embed: sits facing the team, taking notes. → rises and walks over →
 * Map: points at the map. → walks back, sits, turns to the screen →
 * Build: types, headphones on. → reaches for the coffee, turns round →
 * Run: leans back with it while the system ticks over.
 * Scroll back and it all plays backwards. Only once the page is still do the
 * small loops start (scribbling, tapping, typing, sipping).
 *
 * The eyes follow the pointer; a click on the desk is a hop and a burst of
 * code; draw with the pencil while they're on screen and they turn to the
 * computer and type it up, the doodle appearing on the monitor as you draw.
 * Drawn in the ProcessDrawing's coordinates left of its frame (x < 0).
 */

const GROUND = 432;
/** Drawn at this size, grown from the bottom-right corner of its desk scene. */
const SIZE = 1.35;
/** The monitor's inside, where a doodle is copied to. */
const SCREEN = { x: -276, y: 277, w: 80, h: 52 };
/** How long they keep typing after the pencil lifts. */
const TYPE_ON_MS = 1600;

/* ------------------------------------------------------------------ poses */

type Pose = {
  hx: number; // hip position
  hy: number;
  face: number; // 1 faces the drawing, -1 the screen
  lean: number; // degrees; + leans the torso forward
  head: number;
  a1: number; // front arm: shoulder, elbow (− swings forward)
  a2: number;
  b1: number; // back arm
  b2: number;
  l1: number; // front leg: hip, knee
  l2: number;
  k1: number; // back leg
  k2: number;
  book: number; // what's showing, 0–1
  pencil: number;
  mug: number; // in hand
  deskMug: number;
  phones: number;
};

const SEATED = { hx: -125, hy: 388, l1: -86, l2: 86, k1: -82, k2: 84 };
const NONE = { book: 0, pencil: 0, mug: 0, deskMug: 1, phones: 0 };

const EMBED: Pose = { ...SEATED, ...NONE, face: 1, lean: 6, head: 12, a1: -40, a2: -75, b1: -30, b2: -60, book: 1, pencil: 1 };
const RISE: Pose = {
  ...NONE,
  hx: -116,
  hy: 374,
  face: 1,
  lean: 30,
  head: 2,
  a1: -25,
  a2: -50,
  b1: -20,
  b2: -55,
  l1: -55,
  l2: 55,
  k1: -50,
  k2: 50,
  book: 1,
  pencil: 0.4,
};
const STEP: Pose = {
  ...NONE,
  hx: -104,
  hy: 358,
  face: 1,
  lean: 6,
  head: -4,
  a1: -80,
  a2: -20,
  b1: 10,
  b2: -30,
  l1: -20,
  l2: 8,
  k1: 16,
  k2: 4,
  book: 1,
};
const MAP: Pose = {
  ...NONE,
  hx: -92,
  hy: 358,
  face: 1,
  lean: 2,
  head: -12,
  a1: -140,
  a2: 5,
  b1: 8,
  b2: -30,
  l1: -8,
  l2: 6,
  k1: 8,
  k2: 0,
  book: 1,
};
const WALK_BACK: Pose = {
  ...NONE,
  hx: -108,
  hy: 359,
  face: -1,
  lean: 4,
  head: 0,
  a1: -10,
  a2: -20,
  b1: 12,
  b2: -20,
  l1: -18,
  l2: 10,
  k1: 16,
  k2: 2,
};
const SIT_DOWN: Pose = {
  ...NONE,
  hx: -122,
  hy: 376,
  face: -1,
  lean: 26,
  head: 4,
  a1: -40,
  a2: -40,
  b1: -35,
  b2: -45,
  l1: -55,
  l2: 55,
  k1: -50,
  k2: 50,
  phones: 0.5,
};
const BUILD: Pose = { ...SEATED, ...NONE, face: -1, lean: 16, head: 6, a1: -80, a2: -56, b1: -70, b2: -54, phones: 1 };
const REACH: Pose = { ...BUILD, head: 14, a1: -74, a2: -76 };
const GRAB: Pose = { ...BUILD, head: 4, a1: -60, a2: -86, mug: 1, deskMug: 0 };
const RUN: Pose = {
  ...SEATED,
  ...NONE,
  face: 1,
  lean: -10,
  head: -6,
  a1: -10,
  a2: -125,
  b1: 140,
  b2: 94,
  l1: -70,
  l2: 50,
  mug: 1,
  deskMug: 0,
};

/** Where each pose falls in the section's scroll (0–1); the stages change at ¼, ½, ¾. */
const TIMELINE: [number, Pose][] = [
  [0, EMBED],
  [0.17, EMBED],
  [0.205, RISE],
  [0.245, STEP],
  [0.29, MAP],
  [0.42, MAP],
  [0.45, WALK_BACK],
  [0.485, SIT_DOWN],
  [0.53, BUILD],
  [0.67, BUILD],
  [0.7, REACH],
  [0.715, GRAB],
  [0.79, RUN],
  [1, RUN],
];
/** Between these the figure is mid-move: no idle loops. */
const MOVES: [number, number][] = [
  [0.17, 0.29],
  [0.42, 0.53],
  [0.67, 0.79],
];
const STAGES = ["embed", "map", "build", "run"] as const;
const ANGLES = ["lean", "head", "a1", "a2", "b1", "b2", "l1", "l2", "k1", "k2"] as const;
const AMOUNTS = ["book", "pencil", "mug", "deskMug", "phones"] as const;

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function mix(a: Pose, b: Pose, t: number): Pose {
  const out = {} as Pose;
  for (const k of Object.keys(a) as (keyof Pose)[]) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

function poseAt(p: number): Pose {
  let i = 1;
  while (i < TIMELINE.length - 1 && TIMELINE[i][0] < p) i++;
  const [p0, a] = TIMELINE[i - 1];
  const [p1, b] = TIMELINE[i];
  return mix(a, b, ease(clamp((p - p0) / Math.max(1e-6, p1 - p0))));
}

/* ------------------------------------------------------------------ drawing */

/** A limb: rotates at its joint, `len` long, with whatever hangs off its end. */
function Limb({ cls, len, children }: { cls: string; len: number; children?: ReactNode }) {
  return (
    <g className={cls}>
      <line x1={0} y1={0} x2={0} y2={len} />
      {children ? <g transform={`translate(0 ${len})`}>{children}</g> : null}
    </g>
  );
}

// Seeded, so the server and the browser draw the same pencil wobble.
const rnd = seeded(5150);
const f = (n: number) => n.toFixed(1);
/** A pencil line between two points, slightly bowed. */
const pencil = (x1: number, y1: number, x2: number, y2: number) =>
  `M${x1} ${y1} Q${f((x1 + x2) / 2 + (rnd() - 0.5) * 2.4)} ${f((y1 + y2) / 2 + (rnd() - 0.5) * 2.4)} ${x2} ${y2}`;

const PROPS = {
  ground: `M-300 ${GROUND} H-14`,
  desk: [sketchRect(-296, 344, 148, 6, rnd), pencil(-288, 350, -288, GROUND), pencil(-166, 350, -166, GROUND)].join(" "),
  monitor: sketchRect(-280, 272, 88, 62, rnd),
  stand: [pencil(-236, 334, -236, 341), pencil(-252, 343, -220, 343)].join(" "),
  keys: sketchRect(-204, 339, 28, 4, rnd),
  stool: [sketchRect(-146, 389, 42, 5, rnd), pencil(-125, 394, -125, 418), pencil(-146, 421, -104, 421)].join(" "),
};

const floats = ["</>", "{ }", ";", "=>"];
const burst: [string, number, number][] = [
  ["{ }", -46, -34],
  ["</>", 4, -58],
  [";", 44, -40],
  ["( )", 58, -6],
  ["=>", -58, 2],
  ["#", 26, -70],
];
const SHOE = "M-1 0 h8 q3 0 3 -2.5";

export function Engineer() {
  const ref = useRef<SVGGElement>(null);
  const lastDraw = useRef(0);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const head = root.querySelector<SVGGElement>(".eng-headlocal");
    const pupil = root.querySelector<SVGCircleElement>(".eng-pupil");
    const view = root.querySelector<SVGGElement>(".eng-copy__view");
    const line = root.querySelector<SVGPathElement>(".eng-copy__line");
    const tip = root.querySelector<SVGCircleElement>(".eng-copy__tip");
    const screens = Array.from(root.querySelectorAll<SVGGElement>(".eng-scr"));
    const section = root.closest<HTMLElement>(".process-home");
    if (!head || !pupil || !view || !line || !tip) return;

    let visible = false;
    let frame = 0;
    let target = 0.125; // the section's scroll progress
    let shown = -1; // the progress drawn; eases after target like a scrub
    let movedAt = 0;
    let copy = 0; // 0 → 1: turned to the screen to copy a doodle
    let copyTo = 0;
    let idle: string | undefined;

    /* ---------------------------------------------------- the scrubbed pose */
    const apply = (p: number) => {
      const pose = mix(poseAt(p), BUILD, ease(copy));
      if (copy > 0) {
        pose.book *= 1 - copy;
        pose.pencil *= 1 - copy;
        pose.mug *= 1 - copy;
        pose.deskMug = Math.max(pose.deskMug, copy);
      }
      // turning round never goes paper-thin: it flips through a narrow profile
      const face = (pose.face < 0 ? -1 : 1) * (0.35 + 0.65 * Math.abs(pose.face));
      const s = root.style;
      s.setProperty("--hx", `${pose.hx.toFixed(2)}px`);
      s.setProperty("--hy", `${pose.hy.toFixed(2)}px`);
      s.setProperty("--face", face.toFixed(3));
      for (const k of ANGLES) s.setProperty(`--${k}`, `${pose[k].toFixed(2)}deg`);
      for (const k of AMOUNTS) s.setProperty(`--${k}`, pose[k].toFixed(3));
      // each screen holds its stage and cross-fades at the change
      const x = p * 4;
      screens.forEach((el, i) => {
        const o = clamp((x - i + 0.08) / 0.16) * clamp((i + 1 - x + 0.08) / 0.16);
        el.style.setProperty("--o", o.toFixed(3));
      });
    };

    const tick = (now: number) => {
      frame = 0;
      shown = shown < 0 ? target : shown + (target - shown) * 0.2;
      if (Math.abs(target - shown) < 0.0004) shown = target;
      if (copy !== copyTo) copy = copyTo > copy ? Math.min(copyTo, copy + 1 / 27) : Math.max(copyTo, copy - 1 / 27);
      apply(shown);

      const settled = shown === target && copy === copyTo;
      const still = settled && now - movedAt > 180;
      const moving = MOVES.some(([a, b]) => shown > a && shown < b);
      const next = root.classList.contains("is-copying")
        ? "build"
        : still && !moving
          ? STAGES[Math.min(3, Math.floor(shown * 4 * 0.999))]
          : undefined;
      if (next !== idle) {
        idle = next;
        if (idle) root.dataset.idle = idle;
        else delete root.dataset.idle;
      }
      // keep going until it's settled and the idle loop (if any) has taken over
      if (!still) frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const stopScroll = section
      ? subscribeScroll(section, (rect, vh) => {
          const p = progressFor("sticky", rect, vh);
          if (Math.abs(p - target) > 0.0001) movedAt = performance.now();
          target = p;
          wake();
        })
      : () => {};
    wake();

    /* ---------------------------------------------------- the eyes */
    let px = 0;
    let py = 0;
    let looking = 0;
    const look = () => {
      looking = 0;
      const m = head.getScreenCTM();
      if (!m) return;
      const p = new DOMPoint(px, py).matrixTransform(m.inverse());
      const dx = p.x - 5;
      const dy = p.y + 15;
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1.9, d / 40) / d;
      pupil.setAttribute("transform", `translate(${(dx * k).toFixed(2)} ${(dy * k).toFixed(2)})`);
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (visible && !looking) looking = requestAnimationFrame(look);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    /* ---------------------------------------------------- the doodle, typed up */
    let copyFrame = 0;
    let done = 0;
    let latest: readonly (readonly { x: number; y: number }[])[] = [];
    const draw = () => {
      copyFrame = 0;
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      let d = "";
      for (const pts of latest) {
        pts.forEach((p, i) => {
          // every other point is plenty at this size; always keep the ends
          if (i % 2 && i !== pts.length - 1) return;
          d += `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        });
      }
      if (!d) return;
      const s = Math.min(1, SCREEN.w / Math.max(1, maxX - minX), SCREEN.h / Math.max(1, maxY - minY));
      const cx = SCREEN.x + SCREEN.w / 2 - ((minX + maxX) / 2) * s;
      const cy = SCREEN.y + SCREEN.h / 2 - ((minY + maxY) / 2) * s;
      view.setAttribute("transform", `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(${s.toFixed(4)})`);
      line.setAttribute("d", d);
      const pts = latest[latest.length - 1];
      const end = pts?.[pts.length - 1];
      if (end) {
        tip.setAttribute("cx", end.x.toFixed(1));
        tip.setAttribute("cy", end.y.toFixed(1));
        tip.setAttribute("r", (2.2 / s).toFixed(2));
      }
    };
    const stopDoodle = onDoodle((change, strokes) => {
      if (change === "clear") {
        window.clearTimeout(done);
        root.classList.remove("is-copying", "has-copy");
        line.setAttribute("d", "");
        copyTo = 0;
        wake();
        return;
      }
      // only what's drawn while they can see it
      if (!visible && !root.classList.contains("is-copying")) return;
      latest = strokes;
      if (!copyFrame) copyFrame = requestAnimationFrame(draw);
      window.clearTimeout(done);
      if (change === "draw") {
        lastDraw.current = performance.now();
        root.classList.add("is-copying", "has-copy");
        copyTo = 1;
      } else {
        done = window.setTimeout(() => {
          root.classList.remove("is-copying");
          copyTo = 0;
          wake();
        }, TYPE_ON_MS);
      }
      wake();
    });

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(root);
    return () => {
      stopScroll();
      stopDoodle();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(looking);
      cancelAnimationFrame(copyFrame);
      window.clearTimeout(done);
    };
  }, []);

  const hop = () => {
    const root = ref.current;
    // a drag across the desk draws; only a plain click hops
    if (!root || performance.now() - lastDraw.current < 300) return;
    root.classList.remove("is-hop");
    void root.getBoundingClientRect(); // restart the animation
    root.classList.add("is-hop");
  };

  return (
    <g
      ref={ref}
      className="eng"
      transform={`translate(-14 440) scale(${SIZE}) translate(14 -440)`}
      onAnimationEnd={(e) => e.animationName === "eng-hop" && ref.current?.classList.remove("is-hop")}>
      {/* the desk, the screen, the stool */}
      <g className="eng-props">
        <path d={PROPS.ground} className="eng-ground" />
        <rect x={-280} y={272} width={88} height={62} rx={4} className="eng-screen" />
        <path d={PROPS.monitor} />
        <path d={PROPS.stand} />
        <path d={PROPS.desk} />
        <path d={PROPS.keys} className="eng-keys" />
        <path d={PROPS.stool} />
        {[-144, -125, -106].map((x) => (
          <circle key={x} cx={x} cy={427} r={3.4} className="eng-wheel" />
        ))}
      </g>

      {/* the coffee, until it's picked up */}
      <g className="eng-deskmug">
        <path d="M-164 343 v-9 h11 v9 q0 2 -2 2 h-7 q-2 0 -2 -2 z M-153 336 q4 0 4 3 t-4 3" />
        <path className="eng-steam" d="M-160 329 q-2 -3 0 -6 t0 -6 M-156 329 q-2 -3 0 -6 t0 -6" />
      </g>

      {/* what's on the screen at each stage */}
      <g className="eng-scr eng-scr--embed">
        <path d="M-270 282 l12 0 M-270 288 l7 0" />
      </g>
      <g className="eng-scr eng-scr--map">
        <rect x={-270} y={282} width={18} height={12} rx={2} />
        <rect x={-244} y={282} width={18} height={12} rx={2} />
        <rect x={-218} y={282} width={18} height={12} rx={2} />
        <rect x={-244} y={310} width={18} height={12} rx={2} />
        <path d="M-252 288 H-244 M-226 288 H-218 M-235 294 V310" />
      </g>
      <g className="eng-scr eng-scr--build">
        {[
          [-272, 282, 30, "k"],
          [-264, 290, 44, "f"],
          [-264, 298, 26, "s"],
          [-256, 306, 36, "f"],
          [-264, 314, 18, "s"],
          [-272, 322, 12, "k"],
        ].map(([x, y, w, tone], i) => (
          <rect
            key={i}
            x={x as number}
            y={y as number}
            width={w as number}
            height={3.6}
            rx={1.8}
            className={`eng-code eng-code--${tone}`}
            style={{ "--i": i } as CSSProperties}
          />
        ))}
        <rect x={-257} y={320} width={2} height={7} className="eng-caret" />
      </g>
      <g className="eng-scr eng-scr--run">
        <path d="M-274 304 H-254 l5 -12 l7 24 l6 -18 l4 6 H-198" className="eng-pulse" pathLength={1} />
        <circle cx={-208} cy={284} r={4} className="eng-live" />
      </g>

      {/* the visitor's doodle, copied to the screen */}
      <g className="eng-copy">
        <g className="eng-copy__view">
          <path className="eng-copy__line" />
          <circle className="eng-copy__tip" r={2} />
        </g>
      </g>

      {/* code drifting up off the screen while building */}
      <g className="eng-floats">
        {floats.map((t, i) => (
          <text key={t} x={-270 + i * 22} y={266} style={{ "--i": i } as CSSProperties}>
            {t}
          </text>
        ))}
      </g>

      {/* the engineer, back to front: far leg, far arm, near leg, body, near arm */}
      <g className="eng-hop">
        <g className="eng-hip">
          <Limb cls="eng-j eng-legB" len={32}>
            <Limb cls="eng-j eng-kneeB" len={42}>
              <path d={SHOE} className="eng-shoe" />
            </Limb>
          </Limb>
          <g className="eng-j eng-torso">
            <g transform="translate(0 -48)">
              <Limb cls="eng-j eng-armB" len={24}>
                <Limb cls="eng-j eng-elbB" len={22}>
                  <circle r={2.4} className="eng-hand" />
                  {/* notebook */}
                  <g className="eng-prop eng-prop--book">
                    <rect x={-3} y={-13} width={15} height={21} rx={1.5} />
                    <path d="M1 -8 h7 M1 -4 h5 M1 0 h7" />
                  </g>
                </Limb>
              </Limb>
            </g>
          </g>
          <Limb cls="eng-j eng-legA" len={32}>
            <Limb cls="eng-j eng-kneeA" len={42}>
              <path d={SHOE} className="eng-shoe" />
            </Limb>
          </Limb>
          <g className="eng-j eng-torso">
            <path d="M0 0 Q1.5 -27 0 -54" />
            <g transform="translate(0 -54)">
              <g className="eng-j eng-head">
                <g className="eng-headlocal">
                  <circle cx={0} cy={-13} r={12} className="eng-skull" />
                  <path d="M-7 -23 q-3 -7 3 -9 M-1 -25 q1 -6 6 -4" className="eng-hair" />
                  <circle cx={5} cy={-15} r={4.6} className="eng-glasses" />
                  <path d="M0.4 -15.5 L-8 -14" className="eng-glasses" />
                  <circle cx={5} cy={-15} r={1.7} className="eng-pupil" />
                  <path d="M3.5 -7.5 q3.5 2.6 7 -0.6" className="eng-mouth" />
                  {/* headphones while building */}
                  <g className="eng-phones">
                    <path d="M-6 -16 Q-6 -29 3 -26" />
                    <rect x={-8.5} y={-18} width={4.5} height={8} rx={2.2} />
                  </g>
                </g>
              </g>
            </g>
            <g transform="translate(0 -48)">
              <Limb cls="eng-j eng-armA" len={24}>
                <Limb cls="eng-j eng-elbA" len={22}>
                  <circle r={2.4} className="eng-hand" />
                  {/* pencil */}
                  <path className="eng-prop eng-prop--pencil" d="M0 0 L-13 3 M-13 3 l-2.5 1.2" />
                  {/* coffee */}
                  <g className="eng-prop eng-prop--mug">
                    <path d="M-6 -2 h12 v11 q0 3 -3 3 h-6 q-3 0 -3 -3 z M6 1 q5 0 5 4 t-5 4" />
                    <path className="eng-steam" d="M-2 -6 q-3 -4 0 -8 t0 -8 M3 -6 q-3 -4 0 -8 t0 -8" />
                  </g>
                </Limb>
              </Limb>
            </g>
          </g>
        </g>
      </g>

      {/* the hop: a burst of code */}
      <g className="eng-burst" transform="translate(-112 296)">
        {burst.map(([t, dx, dy], i) => (
          <text key={i} style={{ "--dx": `${dx}px`, "--dy": `${dy}px` } as CSSProperties} textAnchor="middle">
            {t}
          </text>
        ))}
      </g>

      <rect x={-300} y={250} width={288} height={190} className="eng-hit" onClick={hop} />
    </g>
  );
}
