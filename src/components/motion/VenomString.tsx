"use client";

import { useEffect, useRef } from "react";
import { useMotionMode } from "@/lib/motion";

type Body = { x: number; y: number; vx: number; vy: number };
type Point = { x: number; y: number };

/* How many strands reach for the pointer, and how many spikes bristle round them. */
const STRINGS = 24;
const SPIKES = 14;
/* Over another of these, the strands leave the pointer alone. */
const CONTROLS = "a, button, input, select, textarea, label, summary, [role='button']";

const body = (x = 0, y = 0): Body => ({ x, y, vx: 0, vy: 0 });
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/* Fixed "random" numbers, so each strand keeps its character from visit to visit. */
const rand = (i: number, k: number) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

/* Each strand's character. Sizes are for a 52px-tall button and scale with it.
   `off` is where it grows on the stretch of edge facing the pointer, -1..1. */
const TENDRILS = [
  ...Array.from({ length: STRINGS }, (_, i) => {
    const off = clamp((i / (STRINGS - 1)) * 2 - 1 + (rand(i, 1) - 0.5) * 0.12, -1, 1);
    const centre = 1 - Math.abs(off);
    return {
      off,
      centre,
      // the middle ones catch the pointer from furthest away; the outermost only rise
      grab: centre < 0.12 ? 0 : 0.4 + 0.6 * centre ** 0.6 * (0.75 + 0.25 * rand(i, 2)),
      // pulled away, they let go one by one
      snap: 1.15 + 0.45 * rand(i, 3),
      spike: (10 + 26 * rand(i, 4)) * (0.6 + 0.4 * centre),
      // how upright it stands while rising, rather than leaning to the pointer
      stand: 0.35,
      base: 2.5 + 5.5 * centre,
      neck: 0.7 + 1.1 * centre,
      k: 300 + 260 * rand(i, 5),
      c: 18 + 12 * rand(i, 6),
      bend: 110 + 80 * rand(i, 7),
      angle: rand(i, 8) * Math.PI * 2,
      phase: rand(i, 9) * Math.PI * 2,
    };
  }),
  // the spikes: short, sharp cones on a wider stretch of edge, standing up towards the pointer
  ...Array.from({ length: SPIKES }, (_, j) => {
    const i = STRINGS + j;
    const off = (((j + 0.5) / SPIKES) * 2 - 1) * 1.45 + (rand(i, 1) - 0.5) * 0.08;
    const centre = 1 - Math.abs(off) / 1.45;
    return {
      off,
      centre,
      grab: 0,
      snap: 1,
      spike: (16 + 22 * rand(i, 4)) * (0.45 + 0.55 * centre),
      stand: 0.55,
      base: (4 + 3 * rand(i, 2)) * (0.7 + 0.3 * centre),
      neck: 0.6,
      k: 380 + 200 * rand(i, 5),
      c: 20 + 8 * rand(i, 6),
      bend: 160 + 60 * rand(i, 7),
      angle: 0,
      phase: rand(i, 9) * Math.PI * 2,
    };
  }),
];
const COUNT = TENDRILS.length;

function spring(b: Body, tx: number, ty: number, k: number, c: number, dt: number) {
  b.vx += ((tx - b.x) * k - b.vx * c) * dt;
  b.vy += ((ty - b.y) * k - b.vy * c) * dt;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
}

/* A point `s` px clockwise round the pill's outline from the start of its top edge, with the outward normal. */
function outline(s: number, w: number, h: number) {
  const r = h / 2;
  const flat = Math.max(0, w - h);
  const arc = Math.PI * r;
  const per = 2 * flat + 2 * arc;
  s = ((s % per) + per) % per;
  if (s < flat) return { x: r + s, y: 0, nx: 0, ny: -1 };
  s -= flat;
  if (s < arc) {
    const a = -Math.PI / 2 + s / r;
    return { x: w - r + r * Math.cos(a), y: r + r * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) };
  }
  s -= arc;
  if (s < flat) return { x: w - r - s, y: h, nx: 0, ny: 1 };
  s -= flat;
  const a = Math.PI / 2 + s / r;
  return { x: r + r * Math.cos(a), y: r + r * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) };
}

/* How far round the outline (as `outline` counts) the point nearest (px, py) is. */
function along(px: number, py: number, w: number, h: number) {
  const r = h / 2;
  const flat = Math.max(0, w - h);
  const arc = Math.PI * r;
  if (px > r && px < w - r) return py < r ? px - r : flat + arc + (w - r - px);
  if (px >= w - r) return flat + (Math.atan2(py - r, px - (w - r)) + Math.PI / 2) * r;
  const a = (Math.atan2(py - r, px - r) + 2 * Math.PI) % (2 * Math.PI);
  return 2 * flat + arc + (a - Math.PI / 2) * r;
}

/**
 * A strand along a curve from `a` through `m` to `t`: `base` wide where it
 * leaves the button, narrowing over `flare` px to `neck`, then swelling to
 * `tip` where it sticks, or drawn to a point when `tip` is 0.
 */
function strandPath(a: Point, m: Point, t: Point, base: number, neck: number, flare: number, tip: number) {
  const n = clamp(Math.ceil(Math.hypot(t.x - a.x, t.y - a.y) / 7), 6, 22);
  const left: string[] = [];
  const right: string[] = [];
  let travelled = 0;
  let px = a.x;
  let py = a.y;
  for (let i = 0; i <= n; i++) {
    // samples bunch up near the button, where the width changes fastest
    const s = (i / n) ** 1.5;
    const u = 1 - s;
    const x = u * u * a.x + 2 * u * s * m.x + s * s * t.x;
    const y = u * u * a.y + 2 * u * s * m.y + s * s * t.y;
    const dx = 2 * u * (m.x - a.x) + 2 * s * (t.x - m.x);
    const dy = 2 * u * (m.y - a.y) + 2 * s * (t.y - m.y);
    const len = Math.hypot(dx, dy) || 1;
    travelled += Math.hypot(x - px, y - py);
    px = x;
    py = y;
    const f = Math.max(0, 1 - travelled / flare);
    const w0 = neck + (base - neck) * f * f;
    const end = s > 0.75 ? ((s - 0.75) / 0.25) ** 2 : 0;
    const w = tip > neck ? Math.max(w0, neck + (tip - neck) * end) : w0 + (tip - w0) * end;
    const nx = (-dy / len) * w;
    const ny = (dx / len) * w;
    left.push(`${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)}`);
    right.push(`${(x - nx).toFixed(1)} ${(y - ny).toFixed(1)}`);
  }
  return `M${left.join("L")}L${right.reverse().join("L")}Z`;
}

/* The fluid heaping up under the strands: a smooth mound on the stretch of edge around `s0`. */
function moundPath(s0: number, spread: number, height: number, w: number, h: number) {
  const out: string[] = [];
  const back: string[] = [];
  const steps = Math.max(8, Math.ceil((spread * 2) / 5));
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 2 - 1;
    const p = outline(s0 + x * spread, w, h);
    const lift = height * (1 - x * x) ** 2;
    out.push(`${(p.x + p.nx * lift).toFixed(1)} ${(p.y + p.ny * lift).toFixed(1)}`);
    back.push(`${(p.x - p.nx * 4).toFixed(1)} ${(p.y - p.ny * 4).toFixed(1)}`);
  }
  return `M${out.join("L")}L${back.reverse().join("L")}Z`;
}

function dot(c: Point, r: number) {
  const d = r.toFixed(1);
  return `M${(c.x + r).toFixed(1)} ${c.y.toFixed(1)}a${d} ${d} 0 1 0 ${(-2 * r).toFixed(1)} 0a${d} ${d} 0 1 0 ${(2 * r).toFixed(1)} 0Z`;
}

/**
 * The venom string, grown into something like ferrofluid: when the pointer
 * comes within `reach` px of the button, the edge facing it heaps up and
 * bristles with spikes, and strands of the button's own colour shoot out and
 * stick to the pointer, gathering in a blob there. The button strains towards
 * it. Pulled away, the strands thin and snap one by one, and the button
 * springs back. They let go on any other link or button, and on the button
 * itself it gives way to the usual lean.
 * Drawn inside the button, under its label (see base.css).
 * Full motion, mouse and trackpad only; the button leans here instead of in MotionProvider.
 */
export function VenomString({ reach = 240 }: { reach?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const mode = useMotionMode();

  useEffect(() => {
    const svg = ref.current;
    const btn = svg?.parentElement;
    if (!svg || !btn || mode !== "full" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const all = Array.from(svg.querySelectorAll("path"));
    const mound = all[0];
    const blob = all[COUNT + 1];
    const strands = TENDRILS.map((t, i) => ({
      ...t,
      path: all[i + 1],
      tip: body(),
      mid: body(),
      // where it grows this frame, and how squarely that bit of edge faces the pointer (1) or away (-1)
      at: outline(0, 1, 1),
      facing: 0,
      stuck: false,
      shown: false,
    }));
    const lean = body();
    const pointer = { x: 0, y: 0, in: false, elsewhere: false };
    // The stretch of edge the strands grow from, and the way to the pointer; held while they spring back.
    const hold = { s: 0, dx: 0, dy: -1 };
    let near = 0; // 1 with the pointer at the button's edge, 0 at the limit of its reach
    let heap = 0; // the mound's height
    let size = 0; // the blob's radius
    let raf = 0;
    let last = 0;
    btn.dataset.venom = "";

    const measure = () => {
      const r = btn.getBoundingClientRect();
      // the button's resting box: the rect includes the lean
      const rad = r.height / 2;
      const px = pointer.x - (r.left - lean.x);
      const py = pointer.y - (r.top - lean.y);
      // nearest point on the pill's centre line, then out to its edge
      const cx = clamp(px, rad, r.width - rad);
      const d = Math.hypot(px - cx, py - rad);
      return { w: r.width, h: r.height, rad, px, py, cx, d, edge: d - rad };
    };

    const clear = () => {
      all.forEach((p) => p.removeAttribute("d"));
      strands.forEach((s) => {
        s.stuck = false;
        s.shown = false;
      });
      near = heap = size = 0;
      Object.assign(lean, body());
      btn.style.removeProperty("--mx");
      btn.style.removeProperty("--my");
    };

    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      const g = measure();
      // not laid out (the header's button on small screens)
      if (!g.w) {
        clear();
        raf = 0;
        return;
      }
      const scale = g.rad / 26;
      // beside the button and not on another control: the strands may reach for the pointer
      const free = pointer.in && !pointer.elsewhere && g.edge >= 0;
      if (free && g.d > 0) {
        hold.s = along(g.px, g.py, g.w, g.h);
        hold.dx = (g.px - g.cx) / g.d;
        hold.dy = (g.py - g.rad) / g.d;
      }
      near += ((free ? clamp(1 - g.edge / reach, 0, 1) : 0) - near) * Math.min(1, dt * 10);
      const spread = g.rad * (2 + 1.2 * near);

      let stuck = 0;
      for (const s of strands) {
        s.at = outline(hold.s + s.off * spread, g.w, g.h);
        const fx = g.px - s.at.x;
        const fy = g.py - s.at.y;
        s.facing = (s.at.nx * fx + s.at.ny * fy) / (Math.hypot(fx, fy) || 1);
        // only the edge facing the pointer reaches for it
        if (!free || !s.grab) s.stuck = false;
        else if (!s.stuck && g.edge < reach * s.grab && s.facing > 0) s.stuck = true;
        else if (s.stuck && g.edge > reach * s.snap) s.stuck = false;
        if (s.stuck) stuck++;
      }

      // On the button: the usual lean. Held: strain towards the pointer, harder the further
      // it is and the more strands hold on.
      let lx = 0;
      let ly = 0;
      if (pointer.in && g.edge < 0) {
        lx = ((g.px - g.w / 2) / g.w) * 14;
        ly = ((g.py - g.h / 2) / g.h) * 10;
      } else if (stuck) {
        const pull = Math.min(16, 3 + g.edge * 0.06) * Math.min(1, stuck / 8);
        lx = hold.dx * pull;
        ly = hold.dy * pull;
      }
      // looser when let go, so the snap recoils
      spring(lean, lx, ly, 170, g.edge < 0 || stuck ? 18 : 11, dt);
      btn.style.setProperty("--mx", lean.x.toFixed(2));
      btn.style.setProperty("--my", lean.y.toFixed(2));
      let busy = Math.hypot(lean.x - lx, lean.y - ly) > 0.05 || Math.hypot(lean.vx, lean.vy) > 0.5;

      // the fluid gathers on the pointer, and heaps up on the edge under the strands
      size += ((stuck ? Math.min(9, 2.5 + 0.4 * stuck) * scale : 0) - size) * Math.min(1, dt * 12);
      heap += ((stuck || near > 0.01 ? (3 + 9 * near) * scale : 0) - heap) * Math.min(1, dt * 8);
      // the pointer, in the button's own (leaning) frame
      const cur = { x: g.px - lean.x, y: g.py - lean.y };
      const t = now / 1000;

      for (const s of strands) {
        const o = s.at;
        // anchored just inside the edge, so the strand seems to pull out of the button
        const a = { x: o.x - o.nx * 3 * scale, y: o.y - o.ny * 3 * scale };
        const rising = !s.stuck && near > 0.01 && s.facing > 0;
        let tx = a.x;
        let ty = a.y;
        if (s.stuck) {
          // into the blob on the pointer
          tx = cur.x + Math.cos(s.angle) * size * 0.5;
          ty = cur.y + Math.sin(s.angle) * size * 0.5;
        } else if (rising) {
          // a spike: up out of the edge, leaning towards the pointer, quivering
          const d = Math.hypot(cur.x - a.x, cur.y - a.y) || 1;
          let ux = ((cur.x - a.x) / d) * (1 - s.stand) + o.nx * s.stand;
          let uy = ((cur.y - a.y) / d) * (1 - s.stand) + o.ny * s.stand;
          const ul = Math.hypot(ux, uy) || 1;
          ux /= ul;
          uy /= ul;
          const rise = Math.min(d * 0.8, s.spike * scale * near ** 0.8) * clamp(s.facing * 1.5, 0, 1);
          const quiver = Math.sin(t * 9 + s.phase) * 1.5 * scale;
          tx = a.x + ux * rise - uy * quiver;
          ty = a.y + uy * rise + ux * quiver;
        }
        const reaching = s.stuck || rising;
        if (!s.shown) {
          if (!reaching) continue;
          s.tip = body(a.x, a.y);
          s.mid = body(a.x, a.y);
          s.shown = true;
        }
        spring(s.tip, tx, ty, reaching ? s.k : 300, reaching ? s.c : 15, dt);
        const len = Math.hypot(s.tip.x - a.x, s.tip.y - a.y);
        if (!reaching && len < 1 && Math.hypot(s.tip.vx, s.tip.vy) < 5) {
          s.shown = false;
          s.path.removeAttribute("d");
          continue;
        }
        // The middle: out of the edge first, then round to the tip, like a field line.
        // It lags, so the strand bends as it moves.
        const lift = Math.min(len * 0.5, 60 * scale);
        spring(
          s.mid,
          ((a.x + s.tip.x) / 2) * 0.55 + (a.x + o.nx * lift) * 0.45,
          ((a.y + s.tip.y) / 2) * 0.55 + (a.y + o.ny * lift) * 0.45,
          s.bend,
          10,
          dt,
        );
        busy = true;
        const neck = Math.max(0.45, s.neck * scale * (1 - 0.55 * Math.min(1, len / (reach * s.snap))));
        s.path.setAttribute(
          "d",
          strandPath(a, s.mid, s.tip, s.base * scale, neck, (18 + 10 * s.centre) * scale, s.stuck ? size * 0.7 : 0),
        );
      }

      if (heap > 0.2) {
        mound.setAttribute("d", moundPath(hold.s, spread * 1.6, heap, g.w, g.h));
        busy = true;
      } else mound.removeAttribute("d");
      if (size > 0.3) {
        blob.setAttribute("d", dot(cur, size));
        busy = true;
      } else blob.removeAttribute("d");

      raf = busy ? requestAnimationFrame(frame) : 0;
    };

    const wake = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.in = true;
      const over = (e.target as Element | null)?.closest(CONTROLS);
      pointer.elsewhere = !!over && over !== btn;
      if (raf) return;
      const g = measure();
      if (g.w && g.edge < reach) wake();
    };
    const onLeave = () => {
      pointer.in = false;
      wake();
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      delete btn.dataset.venom;
      clear();
    };
  }, [mode, reach]);

  return (
    <svg ref={ref} className="venom" aria-hidden focusable={false}>
      {/* the mound, the strands, then the blob on the pointer */}
      {Array.from({ length: COUNT + 2 }, (_, i) => (
        <path key={i} />
      ))}
    </svg>
  );
}
