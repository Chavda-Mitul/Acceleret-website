import type { Metadata } from "next";
import { baseOpenGraph, seo } from "@/content/seo";
import { services, servicesIntro } from "@/content/services";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { ServiceIndex } from "@/components/services/ServiceIndex";
import { ServiceDiagram } from "@/components/diagrams/ServiceDiagram";
import { Spine } from "@/components/motion/Spine";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { SketchSolid } from "@/components/motion/SketchSolid";

export const metadata: Metadata = {
  title: seo.services.title,
  description: seo.services.description,
  alternates: { canonical: "/services" },
  openGraph: { ...baseOpenGraph, title: seo.services.title, description: seo.services.description, url: "/services" },
};

// The brief's intro: its first sentence is the headline, the second the lead.
const [introHead, introRest] = (() => {
  const i = servicesIntro.indexOf(". ");
  return [servicesIntro.slice(0, i + 1), servicesIntro.slice(i + 2)];
})();

export default function ServicesPage() {
  return (
    <>
      <PageHero title={introHead} lead={introRest} note="six of them, below" />

      <div className="services-body">
        <Spine />
        <div className="wrap services-body__inner">
          <aside className="services-body__index">
            <ServiceIndex />
          </aside>

          <div className="services-body__list">
            {services.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                className={`svc-section svc-section--${i % 3}`}
                aria-labelledby={`${s.id}-title`}
              >
                <div className="svc-section__text">
                  <SplitHeading id={`${s.id}-title`} className="t-h2 svc-section__title" sketch>
                    {s.title}
                  </SplitHeading>
                  <p className="svc-section__body">{s.body}</p>
                  <p className="svc-section__typical">
                    <span className="svc-section__typical-label">Typical for</span>{" "}
                    {s.typicalFor.charAt(0).toLowerCase() + s.typicalFor.slice(1)}
                  </p>
                  <h3 className="svc-section__examples-title">for example</h3>
                  <Reveal as="ul" className="svc-section__examples" stagger>
                    {s.examples.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </Reveal>
                </div>
                <Parallax amount={6}>
                  <SketchSolid className="svc-section__figure" threshold={0.3} seed={s.id.length * 13}>
                    <ServiceDiagram id={s.id} />
                  </SketchSolid>
                </Parallax>
              </section>
            ))}
          </div>
        </div>
      </div>

      <CtaBand />
    </>
  );
}
