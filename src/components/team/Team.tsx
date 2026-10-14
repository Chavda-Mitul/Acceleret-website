import Image from "next/image";
import { people } from "@/content/team";
import { site } from "@/content/site";
import { Spine } from "@/components/motion/Spine";
import { SketchFrame } from "@/components/motion/SketchFrame";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** The /team page's people: two founders and a partner (pending). */
export function Team() {
  const shown = people.filter((p) => !p.pending || site.showPending);
  return (
    <section className="section team" aria-label="Founders">
      <Spine />
      <div className="wrap">
        <ul className="team__grid">
          {shown.map((p, i) => (
            <li key={p.name} className="person" data-pending={p.pending ? "true" : undefined}>
              <SketchFrame radius={22} seed={i + 11} delay={i * 0.15} priority>
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
              <h2 className="t-h4 person__name">
                {p.name}
                {p.pending ? <span className="pending-tag">Pending</span> : null}
              </h2>
              <p className="person__role">{p.role}</p>
              <p className="person__line">{p.line}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
