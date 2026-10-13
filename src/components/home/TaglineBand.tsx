"use client";

import { Fragment, useRef } from "react";
import { site } from "@/content/site";
import { useScene } from "@/lib/motion";
import { Spine } from "@/components/motion/Spine";

/**
 * The tagline (brief §3) as kinetic type between the problem and the
 * services: two rows sliding in opposite directions with the scroll, leaning
 * into the speed you scroll at. Each ">" is a node on the route. The second
 * row starts as an outline (a sketch) and inks in solid as it passes.
 */
export function TaglineBand() {
  const ref = useRef<HTMLElement>(null);
  const words = site.tagline.split(" > ");

  useScene(ref, ({ gsap, mode, el }) => {
    if (mode === "calm") return;
    const [a, b] = el.querySelectorAll<HTMLElement>(".band__row");
    const st = { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 };
    gsap.fromTo(a, { xPercent: 0 }, { xPercent: -28, ease: "none", scrollTrigger: st });
    gsap.fromTo(b, { xPercent: -28 }, { xPercent: 0, ease: "none", scrollTrigger: { ...st } });
    // the outlined (sketched) row inks in solid as it passes
    gsap.fromTo(
      b,
      { "--fill": "0%" },
      {
        "--fill": "100%",
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 20%", scrub: 0.6 },
      },
    );

    const skewA = gsap.quickTo(a, "skewX", { duration: 0.5, ease: "power3.out" });
    const skewB = gsap.quickTo(b, "skewX", { duration: 0.5, ease: "power3.out" });
    gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-10, 10, self.getVelocity() / -260);
          skewA(v);
          skewB(-v);
        },
        onLeave: () => (skewA(0), skewB(0)),
        onLeaveBack: () => (skewA(0), skewB(0)),
      },
    });
  });

  const row = (n: number) =>
    Array.from({ length: n }, (_, r) => (
      <Fragment key={r}>
        {words.map((w) => (
          <Fragment key={w}>
            <span>{w}</span>
            <span className="band__node">
              <svg viewBox="0 0 24 24" focusable={false}>
                <path d="M9 6l6 6-6 6" />
              </svg>
            </span>
          </Fragment>
        ))}
      </Fragment>
    ));

  return (
    <section ref={ref} className="band" aria-label={site.tagline}>
      <Spine />
      <div className="band__row" aria-hidden>
        {row(3)}
      </div>
      <div className="band__row band__row--2" aria-hidden>
        {row(3)}
      </div>
    </section>
  );
}
