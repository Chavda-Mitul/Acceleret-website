import Image from "next/image";
import { team as copy } from "@/content/home";
import { mergerLine, people } from "@/content/team";
import { site } from "@/content/site";
import { Spine } from "@/components/motion/Spine";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { SketchFrame } from "@/components/motion/SketchFrame";
import { Note } from "@/components/Note";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Home section 6: who we are. Two founders and a partner (pending). */
export function Team() {
  const shown = people.filter((p) => !p.pending || site.showPending);
  return (
    <section className="section team" aria-labelledby="team-title">
      <Spine />
      <div className="wrap team__inner">
        <div className="team__head">
          <SplitHeading id="team-title" className="t-h2" sketch>
            {copy.heading}
          </SplitHeading>
          {mergerLine ? (
            <p className="t-lead">{mergerLine}</p>
          ) : site.showPending ? (
            <p className="team__pending">
              <span className="pending-tag">Pending: the merger line from File 02</span>
            </p>
          ) : null}
          <Note arrow="right" className="team__note">
            built in Surat
          </Note>
        </div>
        <ul className="team__grid">
          {shown.map((p, i) => (
            <li key={p.name} className="person" data-pending={p.pending ? "true" : undefined}>
              <SketchFrame radius={22} seed={i + 11} delay={i * 0.15}>
                <div className="person__photo">
                  {p.photo ? (
                    <Image src={p.photo} alt={p.name} fill sizes="(max-width: 700px) 100vw, 30vw" />
                  ) : (
                    <span className="person__mono" aria-hidden>
                      {p.pending ? "?" : initials(p.name)}
                    </span>
                  )}
                  {!p.photo && site.showPending ? <span className="person__photo-note">photo to come</span> : null}
                </div>
              </SketchFrame>
              <h3 className="t-h4 person__name">
                {p.name}
                {p.pending ? <span className="pending-tag">Pending</span> : null}
              </h3>
              <p className="person__role">{p.role}</p>
              <p className="person__line">{p.line}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
