"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { operationSteps } from "@/content/home";
import {
  cumulative,
  dedupe,
  orthoWaypoints,
  roundedPath,
  scribbleLoop,
  seeded,
  sketchCurve,
  type Axis,
  type Pt,
} from "@/lib/geometry";
import { useMotionMode } from "@/lib/motion";
import { subscribeScroll } from "@/lib/scroll";

type Phase = "init" | "today" | "built";

type Geometry = {
  w: number;
  h: number;
  route: string;
  /** Seconds after the route starts drawing that it reaches each step. */
  locks: Record<string, number>;
  sketches: string[];
  lost: Pt;
};

const ROUTE_DRAW = 1.8; // seconds, matches .op-route in hero.css
const ROUTE_DELAY = 0.2;

/** Pairs of steps the pencil connects "today": out of order, doubled back, skipped. */
const SKETCH_PAIRS: [string, string][] = [
  ["start", "enquiry"],
  ["enquiry", "quote"],
  ["enquiry", "order"],
  ["quote", "approval"],
  ["approval", "quote"],
  ["quote", "order"],
  ["order", "dispatch"],
  ["dispatch", "enquiry"],
  ["order", "invoice"],
  ["dispatch", "invoice"],
  ["invoice", "payment"],
  ["payment", "lost"],
];

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* cubic-bezier(0.65, 0, 0.35, 1), the site's drawing ease, inverted numerically
   so a step lights up exactly when the drawn line reaches it. */
function bezier(t: number, p1: number, p2: number) {
  const u = 1 - t;
  return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t;
}
function easeDrawInverse(progress: number) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const x = bezier(mid, 0.65, 0.35);
    const y = bezier(mid, 0, 1);
    if (y < progress) lo = mid;
    else hi = mid;
    if (Math.abs(y - progress) < 1e-4) return x;
  }
  return bezier((lo + hi) / 2, 0.65, 0.35);
}

export function OperationMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const tokenRef = useRef<SVGGElement>(null);
  const timers = useRef<number[]>([]);
  const played = useRef(false);
  const [phase, setPhase] = useState<Phase>("init");
  const [geo, setGeo] = useState<Geometry | null>(null);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  /* ---------------------------------------------------------- measure */
  const measure = useCallback(() => {
    const map = mapRef.current;
    const hero = map?.closest<HTMLElement>(".hero");
    const text = hero?.querySelector<HTMLElement>(".hero__text");
    if (!map || !hero || !text) return;

    const hr = hero.getBoundingClientRect();
    const tr = text.getBoundingClientRect();
    const wide = window.matchMedia("(min-width: 1200px)").matches; // matches hero.css

    const pts: Record<string, Pt> = {};
    const halfW: Record<string, number> = {};
    const axes: Axis[] = [];
    map.querySelectorAll<HTMLElement>(".op-node").forEach((n) => {
      const chip = n.querySelector<HTMLElement>(".op-node__chip");
      if (!chip) return;
      const c = chip.getBoundingClientRect();
      pts[n.dataset.id!] = { x: c.left + c.width / 2 - hr.left, y: c.top + c.height / 2 - hr.top };
      // the wider of the chip and its label, so lines leaving a step clear both
      const label = n.querySelector<HTMLElement>(".op-node__now")?.getBoundingClientRect().width ?? 0;
      halfW[n.dataset.id!] = Math.max(c.width, label) / 2;
      axes.push((getComputedStyle(n).getPropertyValue("--in").trim() || "h") as Axis);
    });
    const ordered = operationSteps.map((s) => pts[s.id]).filter(Boolean);
    if (ordered.length !== operationSteps.length) return;

    const first = ordered[0];
    const last = ordered[ordered.length - 1];
    const textTop = tr.top - hr.top;
    const textBottom = tr.bottom - hr.top;
    // The spine: the route leaves the hero down the page margin, half the
    // content's left offset, where the next sections pick it up (.spine).
    const spineX = Math.round((tr.left - hr.left) / 2);

    // The engineered route enters above the headline, runs through every step
    // in order, then returns beneath the buttons: built around the words.
    const entryY = wide ? (first.y <= textTop - 20 ? first.y : textTop - 40) : first.y;
    const start: Pt = { x: -12, y: entryY };
    const exitY = wide ? Math.max(last.y + 48, textBottom + 56) : last.y + 48;

    const head: Pt[] = [start];
    if (entryY !== first.y) head.push({ x: first.x, y: entryY });
    const through = orthoWaypoints(ordered, axes);
    // Leave the last step from a side, so the line clears the label beneath it:
    // the side opposite to where the route came in (left when it came from above).
    const before = through.pts[through.pts.length - 2];
    const fromLeft = Math.abs(before.y - last.y) < 1 && before.x < last.x;
    const lastHalf = halfW[operationSteps[operationSteps.length - 1].id];
    const sideX = fromLeft ? last.x + lastHalf + 14 : last.x - lastHalf - 14;
    const tail: Pt[] = [
      { x: sideX, y: last.y },
      { x: sideX, y: exitY },
      { x: spineX, y: exitY },
      { x: spineX, y: hr.height + 2 },
    ];
    const raw = [...head, ...through.pts, ...tail];
    const lens = cumulative(raw);
    const total = lens[lens.length - 1];

    const locks: Record<string, number> = {};
    operationSteps.forEach((s, i) => {
      const f = lens[head.length + through.nodeIndex[i]] / total;
      locks[s.id] = ROUTE_DELAY + ROUTE_DRAW * easeDrawInverse(f);
    });

    const rnd = seeded(20261114);
    const named: Record<string, Pt> = {
      ...pts,
      start: { x: wide ? tr.left - hr.left - 4 : 0, y: entryY },
      lost: { x: last.x - 84, y: last.y + 70 },
    };
    const sketches: string[] = [];
    SKETCH_PAIRS.forEach(([a, b], i) => {
      const bend = a === "start" ? 0.06 : i % 3 === 0 ? 0.42 : 0.3;
      sketches.push(sketchCurve(named[a], named[b], rnd, bend));
      // a second, lighter pass, like a pencil going over a line twice
      if (i % 2 === 0) sketches.push(sketchCurve(named[a], named[b], rnd, bend * 0.8));
    });
    sketches.push(scribbleLoop(pts.approval, 58, 24, rnd));
    sketches.push(scribbleLoop(pts.invoice, 50, 22, rnd));

    setGeo({ w: hr.width, h: hr.height, route: roundedPath(dedupe(raw), 26), locks, sketches, lost: named.lost });
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const hero = map?.closest<HTMLElement>(".hero");
    if (!map || !hero) return;
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(hero);
    const text = hero.querySelector(".hero__text");
    if (text) ro.observe(text);
    document.fonts?.ready.then(schedule);
    schedule();
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [measure]);

  /* ---------------------------------------------------------- sequence
     Plays once: the pencil draws how the business runs today, then the
     engineered route redraws it. Returning to the page shows the result. */
  const ready = geo !== null;
  useEffect(() => {
    if (!ready || played.current) return;
    const done = () => {
      played.current = true;
    };
    // Calm motion plays this too: lines draw and steps light up, nothing travels.
    timers.current.push(window.setTimeout(() => setPhase("today"), 350));
    timers.current.push(
      window.setTimeout(() => {
        setPhase("built");
        done();
      }, 2700),
    );
    return clearTimers;
  }, [ready]);

  // When the page is hidden (navigating away keeps it mounted), mark the intro
  // as played so coming back doesn't replay it. Done on hide, not after the
  // intro, so removing the animations never repaints the page in view.
  useLayoutEffect(() => {
    const hero = mapRef.current?.closest(".hero");
    return () => hero?.setAttribute("data-played", "true");
  }, []);

  const choose = (next: "today" | "built") => {
    clearTimers();
    played.current = true;
    setPhase(next);
  };

  /* ---------------------------------------------------------- the enquiry travelling */
  const motion = useMotionMode();
  useEffect(() => {
    if (phase !== "built" || !geo || motion === "calm") return;
    const path = routeRef.current;
    const token = tokenRef.current;
    const hero = mapRef.current?.closest<HTMLElement>(".hero");
    if (!path || !token || !hero) return;

    // Once the route is drawn, the enquiry runs it, rests, and runs it again.
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(hero);

    const total = path.getTotalLength();
    const travel = 3400;
    const rest = 4200;
    const waits: number[] = [];
    let raf = 0;
    let begin = 0;
    let scrolled = false;
    const firstDelay = (ROUTE_DELAY + ROUTE_DRAW) * 1000 + 300;

    const tick = (now: number) => {
      if (!begin) begin = now;
      const t = (now - begin) / travel;
      if (t >= 1) {
        token.style.opacity = "0";
        begin = 0;
        loop(rest);
        return;
      }
      const p = path.getPointAtLength(easeInOut(t) * total);
      token.style.transform = `translate(${p.x}px, ${p.y}px)`;
      token.style.opacity = t < 0.04 ? String(t / 0.04) : t > 0.94 ? String((1 - t) / 0.06) : "1";
      raf = requestAnimationFrame(tick);
    };
    const loop = (delay: number) => {
      waits.push(
        window.setTimeout(() => {
          if (!visible || document.hidden || scrolled) return loop(1500);
          raf = requestAnimationFrame(tick);
        }, delay),
      );
    };
    loop(firstDelay);

    // As the hero scrolls away, the scroll itself carries the enquiry along
    // the route and out down the margin, into the rest of the page.
    const unsubscribe = subscribeScroll(hero, (rect) => {
      const p = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.8)));
      if (p > 0.01) {
        if (!scrolled) {
          scrolled = true;
          cancelAnimationFrame(raf);
          begin = 0;
        }
        const pt = path.getPointAtLength(p * total);
        token.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
        token.style.opacity = "1";
      } else if (scrolled) {
        scrolled = false;
        token.style.opacity = "0";
      }
    });

    // The map leans a little towards the pointer (lines and steps move together).
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const layers = [hero.querySelector<HTMLElement>(".op-map"), hero.querySelector<SVGElement>(".op-lines")];
    let px = 0;
    let py = 0;
    let lean = 0;
    const onPointer = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth - 0.5) * 2;
      py = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!lean) lean = requestAnimationFrame(applyLean);
    };
    const applyLean = () => {
      lean = 0;
      for (const l of layers) if (l) l.style.translate = `${(px * -10).toFixed(1)}px ${(py * -7).toFixed(1)}px`;
    };
    if (fine) window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      io.disconnect();
      unsubscribe();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(lean);
      waits.forEach((w) => window.clearTimeout(w));
      window.removeEventListener("pointermove", onPointer);
      for (const l of layers) if (l) l.style.translate = "";
      token.style.opacity = "0";
    };
  }, [phase, geo, motion]);

  return (
    <>
      <svg
        className="op-lines"
        aria-hidden
        focusable={false}
        viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined}
        data-phase={phase}
      >
        {geo ? (
          <>
            <g className="op-sketch">
              {geo.sketches.map((d, i) => (
                <path key={i} d={d} pathLength={1} style={{ "--k": i } as CSSProperties} />
              ))}
              <text x={geo.lost.x - 18} y={geo.lost.y + 12} className="op-lost">
                ?
              </text>
            </g>
            <path ref={routeRef} className="op-route" d={geo.route} pathLength={1} />
            <g ref={tokenRef} className="op-token" style={{ opacity: 0 }}>
              <circle r="11" className="op-token__halo" />
              <circle r="4.5" className="op-token__core" />
            </g>
          </>
        ) : null}
      </svg>

      <div className="op-map" ref={mapRef} data-phase={phase}>
        <figure className="op-figure">
          <figcaption className="sr-only">
            Diagram: one enquiry&apos;s path through a business — enquiry, quote, approval, order, dispatch, invoice,
            payment. Today the steps are held together by WhatsApp, spreadsheets and memory; built around them, one
            connected system carries the enquiry through every step: captured from WhatsApp, tracked to follow-up,
            approved without chasing, entered once, with status the customer sees, invoices generated from the order and
            payments synced with accounts.
          </figcaption>
          <ol className="op-nodes" aria-hidden>
            {operationSteps.map((s, i) => (
              <li
                key={s.id}
                className="op-node"
                data-id={s.id}
                style={{ "--i": i, "--lock": `${geo?.locks[s.id] ?? 0}s` } as CSSProperties}
              >
                <span className="op-node__chip">
                  <span className="op-node__dot" />
                  {s.label}
                </span>
                <span className="op-node__note">{s.today}</span>
                <span className="op-node__now">{s.built}</span>
              </li>
            ))}
          </ol>
        </figure>

        <div className="op-toggle" role="group" aria-label="Show the operation">
          <button type="button" aria-pressed={phase === "today"} onClick={() => choose("today")}>
            How it runs today
          </button>
          <button type="button" aria-pressed={phase === "built"} onClick={() => choose("built")}>
            Built around it
          </button>
        </div>
      </div>
    </>
  );
}
