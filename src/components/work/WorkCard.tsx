import Link from "next/link";
import type { CaseStudy } from "@/content/work";
import { SketchFrame } from "@/components/motion/SketchFrame";

/** A case study as its own little route: problem (pencil) → what we built → what changed. */
export function WorkCard({
  study,
  as: Heading = "h3",
  index = 0,
  compact = false,
  priority = false,
}: {
  study: CaseStudy;
  as?: "h2" | "h3";
  index?: number;
  /** Title, one-line result and Read only (brief §4 Home section 5). */
  compact?: boolean;
  /** First row on /work: visible on first paint (see SketchFrame). */
  priority?: boolean;
}) {
  return (
    <SketchFrame radius={26} seed={index + 5} delay={index * 0.18} priority={priority}>
      <article className={`work-card${compact ? " work-card--compact" : ""}`}>
        <div className="work-card__head">
          <p className="work-card__client">
            {study.client}
            {study.sample ? <span className="pending-tag">Sample</span> : null}
          </p>
          <Heading className="t-h3 work-card__title">
            <Link href={`/work/${study.slug}`} className="work-card__link">
              {study.title}
            </Link>
          </Heading>
        </div>
        {compact ? (
          <p className="work-card__result">{study.result}</p>
        ) : (
          <ol className="work-card__flow">
            <li data-kind="problem">
              <span className="work-card__label">Problem</span>
              <p className="work-card__pencil">{study.summary.problem}</p>
            </li>
            <li data-kind="built">
              <span className="work-card__label">What we built</span>
              <p>{study.summary.built}</p>
            </li>
            <li data-kind="changed">
              <span className="work-card__label">What changed</span>
              <p>{study.summary.changed}</p>
            </li>
          </ol>
        )}
        <span className="work-card__read" aria-hidden>
          Read
        </span>
      </article>
    </SketchFrame>
  );
}
