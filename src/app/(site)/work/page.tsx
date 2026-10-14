import type { Metadata } from "next";
import { baseOpenGraph, seo } from "@/content/seo";
import { caseStudies, workIntro } from "@/content/work";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { WorkCard } from "@/components/work/WorkCard";
import { Spine } from "@/components/motion/Spine";

export const metadata: Metadata = {
  title: seo.work.title,
  description: seo.work.description,
  alternates: { canonical: "/work" },
  openGraph: { ...baseOpenGraph, title: seo.work.title, description: seo.work.description, url: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <PageHero title={workIntro} note="problem, what we built, what changed" />
      <section className="section work-list" aria-label="Case studies">
        <Spine />
        <div className="wrap">
          {caseStudies.length ? (
            <div className="work-home__list">
              {caseStudies.map((c, i) => (
                <WorkCard key={c.slug} study={c} as="h2" index={i} priority={i < 2} />
              ))}
            </div>
          ) : (
            <p className="t-lead">
              Case studies are on their way. In the meantime, ask us about our work on a walkthrough call.
            </p>
          )}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
