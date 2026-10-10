"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { build } from "@/content/home";
import { services, servicesIntro, type ServiceId } from "@/content/services";
import { useScene } from "@/lib/motion";
import { Spine } from "@/components/motion/Spine";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { SketchSolid } from "@/components/motion/SketchSolid";
import { Note } from "@/components/Note";

// The second sentence of the Services intro (brief §4 Services).
const introLine = servicesIntro.slice(servicesIntro.indexOf(". ") + 2);

/**
 * Home section 3. Full motion on a wide screen: the section pins and the six
 * services travel past horizontally as you scroll down, each drawing its
 * diagram as it arrives, with a route along the bottom lighting each station.
 * Otherwise: the same panels stacked. Diagrams are server-rendered and passed in.
 */
export function ServicesJourney({ diagrams }: { diagrams: Record<ServiceId, ReactNode> }) {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, ({ gsap, ScrollTrigger, mode, mm, el }) => {
    if (mode === "calm") return;
    mm.add("(min-width: 1000px) and (min-height: 620px)", () => {
      el.classList.add("is-horizontal");
      const track = el.querySelector<HTMLElement>(".journey__track")!;
      const panels = el.querySelector<HTMLElement>(".journey__panels")!;
      const fill = el.querySelector<HTMLElement>(".journey__fill");
      const stations = Array.from(el.querySelectorAll<HTMLElement>(".journey__stations li"));
      const servicePanels = Array.from(el.querySelectorAll<HTMLElement>(".jpanel:not(.jpanel--intro)"));

      const distance = () => panels.scrollWidth - window.innerWidth;
      const size = () => (track.style.height = `${distance() + window.innerHeight}px`);
      size();

      const move = gsap.to(panels, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
          onRefreshInit: size,
          onUpdate: (self) => {
            if (fill) fill.style.transform = `scaleX(${self.progress})`;
          },
        },
      });

      // Each panel: its title slides in a touch faster than the panel, and its station lights.
      servicePanels.forEach((panel, i) => {
        gsap.from(panel.querySelector(".jpanel__text"), {
          xPercent: 18,
          opacity: 0.2,
          ease: "none",
          scrollTrigger: { trigger: panel, containerAnimation: move, start: "left 95%", end: "left 45%", scrub: true },
        });
        ScrollTrigger.create({
          trigger: panel,
          containerAnimation: move,
          start: "left 60%",
          onEnter: () => stations[i]?.setAttribute("data-on", "true"),
          onLeaveBack: () => stations[i]?.setAttribute("data-on", "false"),
        });
      });

      return () => {
        el.classList.remove("is-horizontal");
        track.style.height = "";
        stations.forEach((s) => s.removeAttribute("data-on"));
      };
    });
  });

  return (
    <section ref={ref} className="journey" aria-labelledby="build-title">
      <Spine />
      <div className="journey__track">
        <div className="journey__sticky">
          <div className="wrap journey__wrap">
            <div className="journey__panels">
              <div className="jpanel jpanel--intro">
                <SplitHeading id="build-title" className="t-h2" sketch>
                  {build.heading}
                </SplitHeading>
                <p className="t-lead">{introLine}</p>
                <Note arrow="right" className="journey__keep">
                  keep scrolling
                </Note>
              </div>
              {services.map((s) => (
                <article key={s.id} className="jpanel" aria-labelledby={`j-${s.id}`}>
                  <div className="jpanel__text">
                    <SplitHeading as="h3" id={`j-${s.id}`} className="jpanel__title" sketch inView>
                      {s.title}
                    </SplitHeading>
                    <p className="jpanel__short">{s.short}.</p>
                    <p className="jpanel__typical">
                      <b>Typical for</b>
                      {s.typicalFor.charAt(0).toLowerCase() + s.typicalFor.slice(1)}
                    </p>
                    <Link href={`/services#${s.id}`} className="link jpanel__more">
                      More on {s.title.replace(/ systems$/, "")}
                    </Link>
                  </div>
                  <div className="jpanel__visual">
                    <Note arrow="down-right" size="sm" className="jpanel__eg">
                      e.g. {s.examples[0].charAt(0).toLowerCase() + s.examples[0].slice(1)}
                    </Note>
                    <SketchSolid className="jpanel__figure" threshold={0.4} seed={s.id.length * 11}>
                      {diagrams[s.id]}
                    </SketchSolid>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="journey__rail" aria-hidden>
            <span className="journey__fill" />
            <ol className="journey__stations">
              {services.map((s) => (
                <li key={s.id}>
                  <span>{s.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
