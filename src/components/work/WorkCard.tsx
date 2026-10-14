import Image from "next/image";
import Link from "next/link";
import type { CaseStudy } from "@/payload-types";
import { coverOf } from "@/lib/work";
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
  /** First row on /case-studies: visible on first paint (see SketchFrame). */
  priority?: boolean;
}) {
  const cover = coverOf(study);
  const card = cover?.sizes?.card;
  const classes = ["work-card", compact && "work-card--compact", cover && "work-card--cover"].filter(Boolean).join(" ");

  return (
    <SketchFrame radius={26} seed={index + 5} priority={priority}>
      <article className={classes}>
        {cover ? (
          <div className="work-card__cover">
            <Image
              src={card?.url ?? cover.url!}
              alt=""
              width={card?.width ?? cover.width ?? 720}
              height={card?.height ?? cover.height ?? 450}
              sizes="(min-width: 900px) 320px, 100vw"
              priority={priority}
            />
          </div>
        ) : null}
        <div className="work-card__head">
          <p className="work-card__client">{study.client}</p>
          <Heading className="t-h3 work-card__title">
            <Link href={`/case-studies/${study.slug}`} className="work-card__link">
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
