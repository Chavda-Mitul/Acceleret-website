import Link from "next/link";
import { proof } from "@/content/home";
import { caseStudies } from "@/content/work";
import { WorkCard } from "@/components/work/WorkCard";
import { Spine } from "@/components/motion/Spine";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Note } from "@/components/Note";

/** Home section 5: two or three case studies (brief). */
export function Work() {
  const shown = caseStudies.slice(0, 3);
  return (
    <section className="section work-home" aria-labelledby="work-title">
      <Spine />
      <div className="wrap">
        <div className="work-home__head">
          <SplitHeading id="work-title" className="t-h2" sketch>
            {proof.heading}
          </SplitHeading>
          <Link href="/work" className="link">
            All work
          </Link>
        </div>
        <Note arrow="down-right" className="work-home__note">
          problem, what we built, what changed
        </Note>
        <div className="work-home__list">
          {shown.map((c, i) => (
            <WorkCard key={c.slug} study={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
