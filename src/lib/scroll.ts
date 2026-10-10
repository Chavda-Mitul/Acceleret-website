"use client";

import { useEffect, useRef, type RefObject } from "react";
import { getMotionMode, useMotionMode } from "@/lib/motion";

/**
 * One shared scroll loop for every scroll-linked drawing on the page.
 * Elements are only measured while they are near the viewport, and all
 * measurements happen in a single requestAnimationFrame per scroll frame.
 */

type Measure = (rect: DOMRect, vh: number) => void;
type Sub = { el: Element; fn: Measure; active: boolean };

const subs = new Map<Element, Set<Sub>>();
let io: IntersectionObserver | null = null;
let queued = false;

function flush() {
  queued = false;
  const vh = window.innerHeight;
  // Read every rect first, then let subscribers write: interleaving reads and
  // style writes would force a layout per element.
  const reads: [Set<Sub>, DOMRect][] = [];
  subs.forEach((set, el) => {
    for (const s of set) {
      if (s.active) {
        reads.push([set, el.getBoundingClientRect()]);
        break;
      }
    }
  });
  for (const [set, rect] of reads) set.forEach((s) => s.active && s.fn(rect, vh));
}

function request() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(flush);
}

function ensureObserver() {
  if (io) return io;
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) subs.get(e.target)?.forEach((s) => (s.active = e.isIntersecting));
      request();
    },
    { rootMargin: "25% 0px 25% 0px" },
  );
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  return io;
}

export function subscribeScroll(el: Element, fn: Measure) {
  const observer = ensureObserver();
  const sub: Sub = { el, fn, active: true };
  let set = subs.get(el);
  if (!set) {
    set = new Set();
    subs.set(el, set);
    observer.observe(el);
  }
  set.add(sub);
  request();
  return () => {
    const s = subs.get(el);
    if (!s) return;
    s.delete(sub);
    if (s.size === 0) {
      subs.delete(el);
      observer.unobserve(el);
    }
  };
}

/** True in calm motion mode (the device asked for reduced motion, or the visitor chose it). */
export function prefersReducedMotion() {
  return getMotionMode() === "calm";
}

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * How far an element has travelled, 0 → 1.
 * - "through": from its top entering the viewport bottom to its bottom leaving the top
 * - "sticky":  across a tall container whose child is position: sticky
 * - "enter":   from its top entering the viewport to its top reaching 25% from the top
 * - "center":  from its top entering the viewport to its centre reaching the viewport centre
 */
export type ProgressMode = "through" | "sticky" | "enter" | "center" | "tip";

export function progressFor(mode: ProgressMode, r: DOMRect, vh: number) {
  switch (mode) {
    case "tip":
      // a line whose drawn tip stays ~62% down the viewport as you read
      return clamp((vh * 0.62 - r.top) / Math.max(1, r.height));
    case "through":
      return clamp((vh - r.top) / (vh + r.height));
    case "sticky":
      return clamp(-r.top / Math.max(1, r.height - vh));
    case "enter":
      return clamp((vh - r.top) / (vh * 0.75));
    case "center":
      return clamp((vh - r.top) / (vh / 2 + r.height / 2));
  }
}

/**
 * Writes the element's progress to the CSS variable `--p` (and calls
 * `onProgress`). With reduced motion it pins progress at 1, the finished state.
 */
export function useScrollProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  progressMode: ProgressMode = "through",
  onProgress?: (p: number) => void,
) {
  const cb = useRef(onProgress);
  const mode = useMotionMode();
  useEffect(() => {
    cb.current = onProgress;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (mode === "calm") {
      el.style.setProperty("--p", "1");
      cb.current?.(1);
      return;
    }
    let last = -1;
    return subscribeScroll(el, (rect, vh) => {
      const p = progressFor(progressMode, rect, vh);
      if (Math.abs(p - last) < 0.0005) return;
      last = p;
      el.style.setProperty("--p", p.toFixed(4));
      cb.current?.(p);
    });
  }, [ref, mode, progressMode]);
}
