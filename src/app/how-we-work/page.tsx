import type { Metadata } from "next";
import { seo } from "@/content/seo";
import { processIntro, stages, whyThisWay } from "@/content/process";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { StageDrawing } from "@/components/process/StageDrawing";
import { ProcessDrawing } from "@/components/diagrams/ProcessDrawing";
import { Spine } from "@/components/motion/Spine";
import { InView } from "@/components/motion/InView";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Note } from "@/components/Note";

export const metadata: Metadata = {
  title: seo.howWeWork.title,
  description: seo.howWeWork.description,
  alternates: { canonical: "/how-we-work" },
  openGraph: { title: seo.howWeWork.title, description: seo.howWeWork.description, url: "/how-we-work" },
};

// Short asides per stage, each a phrase from the brief's stage copy.
const stageNotes: Record<string, string> = {
  embed: "in your office, on your WhatsApp groups",
  map: "a one-page map",
  build: "working software every week",
  run: "a long-term partner",
};

const [introHead, introRest] = (() => {
  const i = processIntro.indexOf(". ");
  return [processIntro.slice(0, i + 1), processIntro.slice(i + 2)];
})();

export default function HowWeWorkPage() {
  return (
    <>
      <PageHero title={introHead} lead={introRest} note="before a line of code is written">
        <ol className="stage-strip" aria-label="The four stages">
          {stages.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>
                <span className="stage-strip__num">{s.number}</span>
                {s.name}
              </a>
            </li>
          ))}
        </ol>
      </PageHero>

      <div className="stages">
        <Spine />
        {stages.map((s) => (
          <section key={s.id} id={s.id} className="stage" aria-labelledby={`${s.id}-title`}>
            <div className="wrap">
              <div className="stage__head">
                <p className="stage__num" aria-hidden>
                  {String(s.number).padStart(2, "0")}
                </p>
                <div className="stage__titlebox">
                  <SplitHeading
                    id={`${s.id}-title`}
                    className="t-h1 stage__title"
                    sketch
                    srPrefix={`Stage ${s.number}:`}
                  >
                    {s.name}
                  </SplitHeading>
                  <Note arrow="up-left" size="sm" className="stage__note">
                    {stageNotes[s.id]}
                  </Note>
                </div>
                <Reveal className="stage__copy">
                  <p className="stage__body">{s.body}</p>
                  <p className="stage__get">
                    <span>What you get</span>
                    {s.whatYouGet}
                  </p>
                </Reveal>
              </div>
              <div className="stage__drawing">
                <StageDrawing stage={s.id}>
                  <ProcessDrawing layout="wide" className="stage-drawing__wide" />
                  <ProcessDrawing layout="compact" className="stage-drawing__compact" />
                </StageDrawing>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="section why" aria-labelledby="why-title">
        <Spine />
        <div className="wrap">
          <SplitHeading id="why-title" className="t-h2" sketch>
            {whyThisWay.heading}
          </SplitHeading>
          <InView as="ol" className="why__list" threshold={0.2}>
            {whyThisWay.points.map((p, i) => (
              <li key={p} className="why__item rise" style={{ "--rise-delay": `${i * 0.12}s` } as React.CSSProperties}>
                <span className="why__mark" aria-hidden>
                  <svg viewBox="0 0 64 24" focusable={false}>
                    <path d="M2 12 C 14 2, 22 22, 32 12 S 50 4, 62 12" className="why__pencil" />
                    <path d="M2 12 H62" className="why__route" />
                  </svg>
                </span>
                <p>{p}</p>
              </li>
            ))}
          </InView>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
