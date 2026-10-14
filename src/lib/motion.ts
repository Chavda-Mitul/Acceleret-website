"use client";

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, type DependencyList, type RefObject } from "react";
import { MOTION_KEY as KEY, type MotionMode } from "./motion-script";

export type { MotionMode } from "./motion-script";

/*
 * Motion modes
 *   full — everything: scroll scenes, pinning, parallax, smooth scrolling
 *   calm — no travel: lines still draw, text and parts still fade in
 * The mode lives on <html data-motion>, set before first paint by the inline
 * script in layout.tsx: the visitor's own choice (localStorage) if they made
 * one, otherwise calm when the device asks for reduced motion.
 */

const EVENT = "acc-motion";

export function getMotionMode(): MotionMode {
  if (typeof document === "undefined") return "full";
  return document.documentElement.dataset.motion === "calm" ? "calm" : "full";
}

export function motionChosen() {
  return typeof document !== "undefined" && document.documentElement.dataset.motionChosen === "1";
}

export function setMotionMode(mode: MotionMode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* private mode: the choice lasts for this page view */
  }
  document.documentElement.dataset.motion = mode;
  document.documentElement.dataset.motionChosen = "1";
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

/** The current motion mode; re-renders when the visitor switches it. */
export function useMotionMode(): MotionMode {
  return useSyncExternalStore(subscribe, getMotionMode, () => "full");
}

/* ------------------------------------------------------------------ seen once */

/**
 * Top rootMargin for "play once when seen" observers. Stretching the viewport
 * far upwards makes anything already scrolled past (a fast scroll, the End
 * key, a restored scroll position) count as seen, so it is finished when the
 * visitor scrolls back up instead of waiting there unwritten.
 */
export const SEEN_ABOVE = "100000px";

/* ------------------------------------------------------------------ GSAP, loaded on demand */

type GsapKit = {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
  SplitText: typeof import("gsap/SplitText").SplitText;
};

let kit: Promise<GsapKit> | null = null;

/** GSAP + ScrollTrigger + SplitText, imported after the page is interactive and registered once. */
export function loadGsap(): Promise<GsapKit> {
  kit ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText")]).then(
    ([g, st, sp]) => {
      const gsap = g.gsap;
      gsap.registerPlugin(st.ScrollTrigger, sp.SplitText);
      gsap.defaults({ ease: "power3.out", duration: 1 });
      st.ScrollTrigger.config({ ignoreMobileResize: true });
      return { gsap, ScrollTrigger: st.ScrollTrigger, SplitText: sp.SplitText };
    },
  );
  return kit;
}

let refreshQueued = 0;
/** Batch ScrollTrigger.refresh() calls from scenes that set up around the same time. */
export function queueRefresh() {
  if (refreshQueued) return;
  refreshQueued = window.setTimeout(async () => {
    refreshQueued = 0;
    (await loadGsap()).ScrollTrigger.refresh();
  }, 120);
}

/* ------------------------------------------------------------------ coming back to a page */

/**
 * Next keeps recently visited pages mounted but hidden (<Activity>), so going
 * Back shows the same DOM again and re-runs its effects. Returns a ref that is
 * true while this component is being shown again after its page was hidden,
 * so entrance animations can settle instead of replaying.
 *
 * Calls `onReturn` before the returning page paints. The hide is recorded a
 * tick after cleanup, so the dev-mode double mount doesn't count as a return.
 */
export function useReturn(onReturn?: () => void) {
  const returning = useRef(false);
  const state = useRef({ hidden: false, pending: 0 });
  const cb = useRef(onReturn);
  useEffect(() => {
    cb.current = onReturn;
  });
  useLayoutEffect(() => {
    const s = state.current;
    if (s.pending) {
      window.clearTimeout(s.pending);
      s.pending = 0;
    } else if (s.hidden) {
      returning.current = true;
      cb.current?.();
    }
    return () => {
      s.pending = window.setTimeout(() => {
        s.pending = 0;
        s.hidden = true;
      });
    };
  }, []);
  return returning;
}

export type SceneApi = GsapKit & {
  el: HTMLElement;
  mode: MotionMode;
  mm: gsap.MatchMedia;
  /** The page is being shown again after Back/Forward: skip entrances, keep scroll-linked scenes. */
  returning: boolean;
};

/**
 * Sets up GSAP animations scoped to `ref` once GSAP has loaded. Everything
 * created inside `setup` (tweens, ScrollTriggers, SplitText) is reverted on
 * unmount, when the page is hidden, and when the motion mode changes.
 * When the page is shown again, `returning` is true and `el` carries
 * data-settled, which CSS uses to stop one-shot entrances replaying.
 */
export function useScene<T extends HTMLElement>(
  ref: RefObject<T | null>,
  setup: (api: SceneApi) => void | (() => void),
  deps: DependencyList = [],
) {
  const mode = useMotionMode();
  const returning = useReturn(() => ref.current?.setAttribute("data-settled", "true"));
  const setupRef = useRef(setup);
  useEffect(() => {
    setupRef.current = setup;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let ctx: gsap.Context | undefined;
    let mm: gsap.MatchMedia | undefined;
    let extra: void | (() => void);
    loadGsap().then((k) => {
      if (cancelled || !ref.current) return;
      mm = k.gsap.matchMedia(el);
      ctx = k.gsap.context(() => {
        extra = setupRef.current({ ...k, el, mode, mm: mm!, returning: returning.current });
      }, el);
      queueRefresh();
    });
    return () => {
      cancelled = true;
      if (typeof extra === "function") extra();
      mm?.revert();
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, mode, ...deps]);
}
