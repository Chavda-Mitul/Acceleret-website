import type { ReactNode } from "react";
import { Spine } from "@/components/motion/Spine";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Note } from "@/components/Note";

/**
 * Inner-page opening: the route arrives down the margin and stops at a node
 * beside the title — this page's station. `children` is an optional visual.
 */
export function PageHero({
  title,
  lead,
  children,
  note,
  id = "page-title",
}: {
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  /** A handwritten aside under the lead. */
  note?: ReactNode;
  id?: string;
}) {
  return (
    <section className="page-hero" aria-labelledby={id}>
      <Spine />
      <div className={`wrap page-hero__inner${children ? " page-hero__inner--split" : ""}`}>
        <div className="page-hero__text">
          <span className="page-hero__station" aria-hidden />
          <SplitHeading as="h1" id={id} className="t-h1 page-hero__title" onLoad sketch>
            {title}
          </SplitHeading>
          {lead ? <div className="t-lead page-hero__lead">{lead}</div> : null}
          {note ? (
            <Note arrow="down-right" className="page-hero__note">
              {note}
            </Note>
          ) : null}
        </div>
        {children ? <div className="page-hero__aside">{children}</div> : null}
      </div>
    </section>
  );
}
