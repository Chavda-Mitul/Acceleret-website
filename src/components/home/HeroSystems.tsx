"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { heroObjects } from "./heroArt";
import { cumulative, dedupe, orthoWaypoints, roundedPath, type Axis, type Pt } from "@/lib/geometry";
import { useMotionMode } from "@/lib/motion";
import { subscribeScroll } from "@/lib/scroll";

/** "sketch": the pencil draws every kind of software; "built": the route connects them and they ink in. */
type Phase = "init" | "sketch" | "built";

type Geometry = {
  w: number;
  h: number;
  route: string;
  /** Seconds after the route starts drawing that it reaches each drawing. */
  locks: number[];
  /** How far along the route (0–1) each drawing sits. */
  stops: number[];
};

const ROUTE_DRAW = 1.8; // seconds, matches .hs-route in hero.css
const ROUTE_DELAY = 0.2;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* cubic-bezier(0.65, 0, 0.35, 1), the site's drawing ease, inverted numerically
   so a drawing inks in exactly when the line reaches it. */
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

/**
 * The hero drawing: six kinds of software a business runs on — an app,
 * dashboards, a CRM, automation, AI, integrations — sketched in pencil one
 * after another. Then one engineered line runs through all of them and each
 * inks in as it's reached: one system, whatever it needs to be. The last
 * frame stays a sketch ("yours next"), and the line leaves past it, down the
 * page, where scrolling carries the dot.
 */
export function HeroSystems() {
  const mapRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const tokenRef = useRef<SVGGElement>(null);
  const timers = useRef<number[]>([]);
  const played = useRef(false);
  /** Sends the dot along the line to a drawing; false when it can't go (calm motion, scrolled). */
  const travelRef = useRef<((i: number, arrive: () => void) => boolean) | null>(null);
  const busy = useRef(new Set<number>());
  const [phase, setPhase] = useState<Phase>("init");
  const [geo, setGeo] = useState<Geometry | null>(null);

  /* ---------------------------------------------------------- measure */
  const measure = useCallback(() => {
    const map = mapRef.current;
    const hero = map?.closest<HTMLElement>(".hero");
    const text = hero?.querySelector<HTMLElement>(".hero__text");
    if (!map || !hero || !text) return;

    const hr = hero.getBoundingClientRect();
    const tr = text.getBoundingClientRect();
    const wide = window.matchMedia("(min-width: 1200px)").matches; // matches hero.css

    const pts: Pt[] = [];
    const halfW: number[] = [];
    const axes: Axis[] = [];
    map.querySelectorAll<HTMLElement>(".hs-obj").forEach((n) => {
      const art = n.querySelector<HTMLElement>(".hs-obj__art");
      if (!art) return;
      const c = art.getBoundingClientRect();
      pts.push({ x: c.left + c.width / 2 - hr.left, y: c.top + c.height / 2 - hr.top });
      const label = n.querySelector<HTMLElement>(".hs-obj__label")?.getBoundingClientRect().width ?? 0;
      halfW.push(Math.max(c.width, label) / 2);
      axes.push((getComputedStyle(n).getPropertyValue("--in").trim() || "h") as Axis);
    });
    if (pts.length !== heroObjects.length) return;

    const first = pts[0];
    const last = pts[pts.length - 1];
    const textTop = tr.top - hr.top;
    const textBottom = tr.bottom - hr.top;
    // The spine: the line leaves the hero down the page margin, half the
    // content's left offset, where the next sections pick it up (.spine).
    const spineX = Math.round((tr.left - hr.left) / 2);

    // It enters above the headline, runs through every drawing in order,
    // then returns beneath the buttons: built around the words.
    const entryY = wide ? (first.y <= textTop - 20 ? first.y : textTop - 40) : first.y;
    const start: Pt = { x: -12, y: entryY };
    const exitY = wide ? Math.max(last.y + 72, textBottom + 56) : last.y + 72;

    const head: Pt[] = [start];
    if (entryY !== first.y) head.push({ x: first.x, y: entryY });
    const through = orthoWaypoints(pts, axes);
    // Leave the last frame from a side, away from where the line came in.
    const before = through.pts[through.pts.length - 2];
    const fromLeft = Math.abs(before.y - last.y) < 1 && before.x < last.x;
    const sideX = fromLeft ? last.x + halfW[halfW.length - 1] + 14 : last.x - halfW[halfW.length - 1] - 14;
    const tail: Pt[] = [
      { x: sideX, y: last.y },
      { x: sideX, y: exitY },
      { x: spineX, y: exitY },
      { x: spineX, y: hr.height + 2 },
    ];
    const raw = [...head, ...through.pts, ...tail];
    const lens = cumulative(raw);
    const total = lens[lens.length - 1];
    const stops = pts.map((_, i) => lens[head.length + through.nodeIndex[i]] / total);
    const locks = stops.map((f) => ROUTE_DELAY + ROUTE_DRAW * easeDrawInverse(f));

    setGeo({ w: hr.width, h: hr.height, route: roundedPath(dedupe(raw), 26), locks, stops });
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
     Plays once: the pencil sketches every drawing, then the line connects
     them and they ink in. Returning to the page shows the result. */
  const ready = geo !== null;
  useEffect(() => {
    if (!ready || played.current) return;
    // Calm motion plays this too: lines draw and drawings ink in, nothing travels.
    timers.current.push(window.setTimeout(() => setPhase("sketch"), 250));
    timers.current.push(
      window.setTimeout(() => {
        setPhase("built");
        played.current = true;
      }, 2700),
    );
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [ready]);

  // When the page is hidden (navigating away keeps it mounted), mark the intro
  // as played so coming back doesn't replay it. Done on hide, not after the
  // intro, so removing the animations never repaints the page in view.
  useLayoutEffect(() => {
    const hero = mapRef.current?.closest(".hero");
    return () => hero?.setAttribute("data-played", "true");
  }, []);

  /* ---------------------------------------------------------- the dot travelling */
  const motion = useMotionMode();
  useEffect(() => {
    if (phase !== "built" || !geo || motion === "calm") return;
    const path = routeRef.current;
    const token = tokenRef.current;
    const hero = mapRef.current?.closest<HTMLElement>(".hero");
    if (!path || !token || !hero) return;

    // Once the line is drawn, the dot runs it, rests, and runs it again.
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(hero);

    const total = path.getTotalLength();
    const travel = 3800;
    const rest = 4200;
    const waits: number[] = [];
    let raf = 0;
    let begin = 0;
    let running = false;
    let scrolled = false;
    let held = 0; // the visitor is playing: the dot's own runs wait until then
    let at = -1; // the drawing the visitor last sent the dot to
    let go = 0;
    const firstDelay = (ROUTE_DELAY + ROUTE_DRAW) * 1000 + 300;

    const tick = (now: number) => {
      if (!begin) begin = now;
      const t = (now - begin) / travel;
      if (t >= 1) {
        token.style.opacity = "0";
        begin = 0;
        running = false;
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
          if (!visible || document.hidden || scrolled || performance.now() < held) return loop(1500);
          running = true;
          raf = requestAnimationFrame(tick);
        }, delay),
      );
    };
    loop(firstDelay);
    const stopRun = () => {
      if (!running) return;
      cancelAnimationFrame(raf);
      running = false;
      begin = 0;
      loop(rest);
    };

    // Pointing at a drawing sends the dot to it, out of the one before (or the
    // last one visited): the line is what makes them one system.
    travelRef.current = (i, arrive) => {
      if (scrolled) return false;
      stopRun();
      cancelAnimationFrame(go);
      held = performance.now() + 6000;
      const from = (at >= 0 && at !== i ? geo.stops[at] : i > 0 ? geo.stops[i - 1] : 0) * total;
      const to = geo.stops[i] * total;
      at = i;
      const dur = Math.min(1000, Math.max(450, (Math.abs(to - from) / total) * 2600));
      let t0 = 0;
      const step = (now: number) => {
        if (!t0) t0 = now;
        const t = Math.min(1, (now - t0) / dur);
        const p = path.getPointAtLength(from + (to - from) * easeInOut(t));
        token.style.transform = `translate(${p.x}px, ${p.y}px)`;
        token.style.opacity = t < 0.15 ? String(t / 0.15) : t > 0.85 ? String((1 - t) / 0.15) : "1";
        if (t < 1) go = requestAnimationFrame(step);
        else {
          token.style.opacity = "0";
          arrive();
        }
      };
      go = requestAnimationFrame(step);
      return true;
    };

    // The drawing leans a little towards the pointer (lines and drawings move
    // together). The lean settles to nothing as the hero's bottom reaches the
    // next section's drawn tip (62% down, see Spine), so the line leaving down
    // the margin meets the spine exactly.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const layers = [hero.querySelector<HTMLElement>(".hs-map"), hero.querySelector<SVGElement>(".hs-lines")];
    let px = 0;
    let py = 0;
    let settle = 1;
    let lean = 0;
    const applyLean = () => {
      lean = 0;
      const k = settle;
      for (const l of layers) if (l) l.style.translate = k ? `${(px * -10 * k).toFixed(1)}px ${(py * -7 * k).toFixed(1)}px` : "";
    };
    const queueLean = () => {
      if (!lean) lean = requestAnimationFrame(applyLean);
    };
    const onPointer = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth - 0.5) * 2;
      py = (e.clientY / window.innerHeight - 0.5) * 2;
      queueLean();
    };
    if (fine) window.addEventListener("pointermove", onPointer, { passive: true });

    // As the hero scrolls away, the scroll itself carries the dot along the
    // line and out down the margin, into the rest of the page.
    const unsubscribe = subscribeScroll(hero, (rect, vh) => {
      const k = Math.min(1, Math.max(0, (rect.bottom - vh * 0.62) / 200));
      if (k !== settle) {
        settle = k;
        if (fine) queueLean();
      }
      const p = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.8)));
      if (p > 0.01) {
        if (!scrolled) {
          scrolled = true;
          stopRun();
          cancelAnimationFrame(go);
        }
        const pt = path.getPointAtLength(p * total);
        token.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
        token.style.opacity = "1";
      } else if (scrolled) {
        scrolled = false;
        token.style.opacity = "0";
      }
    });

    return () => {
      io.disconnect();
      unsubscribe();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(go);
      cancelAnimationFrame(lean);
      travelRef.current = null;
      waits.forEach((w) => window.clearTimeout(w));
      window.removeEventListener("pointermove", onPointer);
      for (const l of layers) if (l) l.style.translate = "";
      token.style.opacity = "0";
    };
  }, [phase, geo, motion]);

  /* ---------------------------------------------------------- play with it
     Pointing at (or tapping) a built drawing sends the dot to it, and it
     does its job once: the bars grow, the deal moves on, the reply comes in. */
  const poke = (i: number) => {
    if (phase !== "built" || busy.current.has(i)) return;
    const li = mapRef.current?.querySelector<HTMLElement>(`.hs-obj[data-slot="${i}"]`);
    if (!li) return;
    busy.current.add(i);
    const run = () => {
      li.classList.add("is-run");
      window.setTimeout(() => {
        li.classList.remove("is-run");
        busy.current.delete(i);
      }, 1900);
    };
    if (!travelRef.current?.(i, run)) run();
  };

  return (
    <>
      <svg
        className="hs-lines"
        aria-hidden
        focusable={false}
        viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined}
        data-phase={phase}
      >
        {geo ? (
          <>
            <path ref={routeRef} className="hs-route" d={geo.route} pathLength={1} />
            <g ref={tokenRef} className="hs-token" style={{ opacity: 0 }}>
              <circle r="11" className="hs-token__halo" />
              <circle r="4.5" className="hs-token__core" />
            </g>
          </>
        ) : null}
      </svg>

      <div className="hs-map" ref={mapRef} data-phase={phase}>
        <figure className="hs-figure">
          <figcaption className="sr-only">
            Drawing: the kinds of software we build — mobile apps, dashboards, CRM, workflow automation, AI that reads
            documents and integrations between systems — sketched in pencil, then connected by one line into a single
            system. A last, empty frame is left for whatever your business needs next.
          </figcaption>
          <ol className="hs-objs" aria-hidden>
            {heroObjects.map((o, i) => (
              <li
                key={o.id}
                className={`hs-obj${o.open ? " hs-obj--open" : ""}`}
                data-slot={i}
                data-no-draw
                onPointerEnter={() => poke(i)}
                onClick={() => poke(i)}
                style={{ "--i": i, "--w": o.w, "--lock": `${geo?.locks[i] ?? 0}s` } as CSSProperties}
              >
                <svg className="hs-obj__art" viewBox={`-6 -6 ${o.w + 12} ${o.h + 12}`} focusable={false}>
                  {o.open ? <rect x={4} y={4} width={o.w - 8} height={o.h - 8} className="hs-paper" /> : null}
                  <path d={o.line} pathLength={1} className="hs-pen hs-pen--line" />
                  <path d={o.ink} pathLength={1} className="hs-pen hs-pen--ink" />
                  {o.open ? (
                    <text x={o.w / 2} y={o.h / 2 + 15} className="hs-ask">
                      ?
                    </text>
                  ) : (
                    <g className="hs-built">{o.built}</g>
                  )}
                </svg>
                <span className="hs-obj__label">{o.label}</span>
              </li>
            ))}
          </ol>
        </figure>
      </div>
    </>
  );
}
