"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/*
 * Draw on the site: press anywhere that isn't a link, button or form field and
 * the hand-drawn arrow turns into a pencil; drag to draw. The doodle sits on the
 * page, travels with it when you scroll, and rubs itself out once you've
 * scrolled on (Esc clears it too).
 * Mouse and pen only: on touch screens a drag has to keep scrolling the page.
 * Hold Alt while dragging to select text instead.
 */

type Point = { x: number; y: number; w: number };
type Stroke = { points: Point[]; chalk: boolean };
type Press = { x: number; y: number; chalk: boolean };

/** A press that starts on one of these keeps its usual behaviour. */
const KEEP =
  'a[href], button, input, textarea, select, label, summary, [role="button"], [contenteditable], [data-no-draw], iframe, video';
/** On the deep-blue grounds the pencil writes in light chalk. */
const DARK = ".cta-band, .site-footer";
/** Travel before a press becomes a stroke, so a click never leaves a dot. */
const START_AFTER = 4;
/** Scrolling after the last stroke before the doodle rubs out. */
const ERASE_AFTER = 24;
const RUB_OUT_MS = 700;
const MAX_POINTS = 5000;

export function PencilLayer() {
  return (
    <Suspense fallback={null}>
      <Layer />
    </Suspense>
  );
}

function Layer() {
  const ref = useRef<HTMLCanvasElement>(null);
  const clear = useRef<() => void>(() => {});
  const pathname = usePathname();

  // A new page gets a clean sheet.
  useEffect(() => {
    clear.current();
  }, [pathname]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !window.matchMedia("(any-pointer: fine)").matches) return;
    const html = document.documentElement;

    // Graphite grain: a tile of speckled alpha used as the stroke paint.
    const grain = (r: number, g: number, b: number): CanvasPattern | string => {
      const tile = document.createElement("canvas");
      tile.width = tile.height = 96;
      const t = tile.getContext("2d");
      if (!t) return `rgb(${r} ${g} ${b})`;
      const img = t.createImageData(96, 96);
      for (let i = 0; i < img.data.length; i += 4) {
        img.data[i] = r;
        img.data[i + 1] = g;
        img.data[i + 2] = b;
        img.data[i + 3] = Math.random() < 0.1 ? 0 : 170 + Math.random() * 85;
      }
      t.putImageData(img, 0, 0);
      return ctx.createPattern(tile, "repeat") ?? `rgb(${r} ${g} ${b})`;
    };
    const graphite = grain(34, 38, 50);
    const chalk = grain(220, 229, 255);

    let dpr = 1;
    let strokes: Stroke[] = [];
    let current: Stroke | null = null;
    let pending: Press | null = null;
    let last = { x: 0, y: 0, t: 0 };
    let anchor = 0; // scroll position when the last stroke ended
    let rubbing = 0;
    let frame = 0;

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(html.clientWidth * dpr);
      canvas.height = Math.round(html.clientHeight * dpr);
      // grain at one device pixel, whatever the zoom
      const m = new DOMMatrix().scale(1 / dpr);
      if (typeof graphite !== "string") graphite.setTransform(m);
      if (typeof chalk !== "string") chalk.setTransform(m);
    };

    // Points are kept in page coordinates; draw them where the page is now.
    const toPage = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, -window.scrollY * dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    const mid = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

    // One piece of pencil line: grainy graphite with a slightly darker core.
    const line = (s: Stroke, x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, w: number) => {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(cx, cy, x1, y1);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = s.chalk ? chalk : graphite;
      ctx.lineWidth = w;
      ctx.stroke();
      ctx.globalAlpha = s.chalk ? 0.35 : 0.6;
      ctx.strokeStyle = s.chalk ? "#eef2ff" : "#161b27";
      ctx.lineWidth = w * 0.5;
      ctx.stroke();
    };

    // Curves through the midpoints keep the line smooth at any speed.
    const paint = (s: Stroke, from: number) => {
      const p = s.points;
      for (let i = Math.max(from, 1); i < p.length; i++) {
        const a = p[i - 1];
        const start = i === 1 ? a : mid(p[i - 2], a);
        const end = mid(a, p[i]);
        line(s, start.x, start.y, a.x, a.y, end.x, end.y, (a.w + p[i].w) / 2);
      }
    };
    const finish = (s: Stroke) => {
      const p = s.points;
      if (p.length < 2) return;
      const b = p[p.length - 1];
      const start = mid(p[p.length - 2], b);
      line(s, start.x, start.y, b.x, b.y, b.x, b.y, b.w);
    };

    const render = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      toPage();
      for (const s of strokes) {
        paint(s, 1);
        if (s !== current) finish(s);
      }
    };

    const wipe = () => {
      window.clearTimeout(rubbing);
      rubbing = 0;
      strokes = [];
      current = null;
      pending = null;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // hidden first, so dropping the rub-out styles doesn't animate back
      canvas.hidden = true;
      canvas.classList.remove("is-rubbing");
      canvas.style.transform = "";
      html.classList.remove("is-drawing");
    };
    clear.current = wipe;

    const rubOut = () => {
      if (rubbing) return;
      canvas.classList.add("is-rubbing");
      rubbing = window.setTimeout(wipe, RUB_OUT_MS);
    };

    const begin = (press: Press, t: number): Stroke => {
      if (rubbing) wipe();
      else if (canvas.style.transform) {
        // scrolled a little since the last stroke: redraw in place before adding to it
        canvas.style.transform = "";
        render();
      }
      canvas.hidden = false;
      html.classList.add("is-drawing");
      const stroke: Stroke = { points: [{ x: press.x, y: press.y + window.scrollY, w: 2.2 }], chalk: press.chalk };
      strokes.push(stroke);
      current = stroke;
      pending = null;
      last = { x: press.x, y: press.y, t };
      return stroke;
    };

    // Faster is lighter, like a real pencil; a pen's pressure sets the weight directly.
    const add = (stroke: Stroke, e: PointerEvent) => {
      const d = Math.hypot(e.clientX - last.x, e.clientY - last.y);
      if (d < 0.75) return;
      const speed = d / Math.max(1, e.timeStamp - last.t);
      const aim =
        e.pointerType === "pen" && e.pressure > 0
          ? 0.8 + e.pressure * 2.6
          : Math.min(3, Math.max(1.7, 3.1 - speed * 0.45));
      const prev = stroke.points[stroke.points.length - 1];
      stroke.points.push({
        x: e.clientX,
        y: e.clientY + window.scrollY,
        w: prev.w * 0.65 + aim * 0.35 + (Math.random() - 0.5) * 0.12,
      });
      last = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    };

    const trim = () => {
      let total = strokes.reduce((n, s) => n + s.points.length, 0);
      let dropped = false;
      while (total > MAX_POINTS && strokes.length > 1) {
        total -= strokes.shift()?.points.length ?? 0;
        dropped = true;
      }
      if (dropped) render();
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || !e.isPrimary || e.pointerType === "touch" || e.altKey) return;
      if (e.clientX >= html.clientWidth || e.clientY >= html.clientHeight) return; // the scrollbars
      const target = e.target instanceof Element ? e.target : null;
      if (!target || target.closest(KEEP)) return;
      pending = { x: e.clientX, y: e.clientY, chalk: !!target.closest(DARK) };
      html.classList.add("is-pressing");
    };

    const onMove = (e: PointerEvent) => {
      let stroke = current;
      if (!stroke) {
        if (!pending || Math.hypot(e.clientX - pending.x, e.clientY - pending.y) < START_AFTER) return;
        stroke = begin(pending, e.timeStamp);
      }
      const from = stroke.points.length;
      const list = e.getCoalescedEvents?.() ?? [];
      for (const c of list.length ? list : [e]) add(stroke, c);
      toPage();
      paint(stroke, from);
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) selection.removeAllRanges();
    };

    const onUp = () => {
      pending = null;
      html.classList.remove("is-pressing");
      if (!current) return;
      toPage();
      finish(current);
      current = null;
      html.classList.remove("is-drawing");
      anchor = window.scrollY;
      trim();
    };

    const onScroll = () => {
      if (!strokes.length || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!strokes.length) return;
        if (current) {
          render(); // scrolled with the wheel mid-stroke: keep the doodle on the page
          return;
        }
        // the doodle travels with the page, then rubs out
        const offset = anchor - window.scrollY;
        canvas.style.transform = offset ? `translate3d(0, ${offset}px, 0)` : "";
        if (Math.abs(offset) > ERASE_AFTER) rubOut();
      });
    };

    const onResize = () => {
      wipe();
      size();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && strokes.length && !current) wipe();
    };
    const onDrag = (e: DragEvent) => {
      if (pending || current) e.preventDefault();
    };

    size();
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("blur", onUp);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    window.addEventListener("dragstart", onDrag);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("dragstart", onDrag);
      cancelAnimationFrame(frame);
      window.clearTimeout(rubbing);
      html.classList.remove("is-drawing", "is-pressing");
      clear.current = () => {};
    };
  }, []);

  return <canvas ref={ref} className="pencil-layer" aria-hidden hidden />;
}
