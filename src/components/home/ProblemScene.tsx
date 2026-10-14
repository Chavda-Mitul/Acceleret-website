"use client";

import { Fragment, useRef, type CSSProperties } from "react";
import { problem } from "@/content/home";
import { useScene } from "@/lib/motion";
import { WIDE_QUERY } from "@/lib/motion-script";
import { Spine } from "@/components/motion/Spine";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Note } from "@/components/Note";

/* Illustration copy for the three piles. Generic on purpose: no real clients, names or figures. */
const bubbles = [
  { who: "in", text: "Rate for 500 m cotton, dispatch by Friday?", enquiry: true },
  { who: "out", text: "Will check and send" },
  { who: "in", text: "Voice note · 0:42", voice: true },
  { who: "out", text: "Did you send the quote?" },
  { who: "in", text: "Which one? There are two" },
  { who: "out", text: "Did you send that?" },
  { who: "in", text: "Payment done, pls confirm" },
];
const cells: { v: string; e?: string; head?: boolean }[] = [
  { v: "Buyer", head: true },
  { v: "Qty", head: true },
  { v: "Rate", head: true },
  { v: "Status", head: true },
  { v: "Buyer A" },
  { v: "500 m" },
  { v: "₹ 182", e: "#REF!" },
  { v: "sent?" },
  { v: "Buyer B" },
  { v: "1,200 m", e: "#VALUE!" },
  { v: "₹ 96" },
  { v: "call", e: "???" },
  { v: "Buyer C" },
  { v: "800 m" },
  { v: "₹ 140", e: "#REF!" },
  { v: "ask" },
];
/* Noise that floods in with everything else and gets swept away: it never belongs to a pile. */
const noise = [
  "47 unread messages",
  "Missed call (3)",
  "Where is my order?",
  "FINAL_FINAL_v2.xlsx",
  "Can you resend the PO?",
  "Who has the latest file?",
  "Call me back",
  "Payment pending?",
  "Urgent!!",
  "Rate changed?",
  "typing…",
  "Forwarded",
];

/*
 * The closing statement (brief copy, unchanged) set in two lines: the
 * punchline, then what it means. The last two words carry a pen underline.
 */
const closingAt = problem.closing.indexOf(" with ");
const closingLead = problem.closing.slice(0, closingAt).split(" ");
const closingRest = problem.closing.slice(closingAt + 1).split(" ");
const closingMark = closingRest.splice(-2);

function Written({ words, from }: { words: string[]; from: number }) {
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="sw" style={{ "--i": from + i } as CSSProperties}>
            {w}
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

const notes = [
  "this buyer pays on the 15th",
  "approve if it's under ₹50k",
  "transporter picks up after 4",
  "export orders use the other invoice",
  "check stock before saying yes",
];

/**
 * Home section 2. Full motion on a large screen: a pinned scene. Fragments of
 * WhatsApp, Excel and memory flood in, sort themselves into three piles, fall
 * apart, and collapse into one line under the closing statement. Calm motion
 * and small screens: the same content in order, each pile settling in on arrival.
 */
export function ProblemScene() {
  const ref = useRef<HTMLElement>(null);
  const [wa, xl, mem] = problem.cards;

  useScene(ref, ({ gsap, ScrollTrigger, mode, mm, el }) => {
    const q = gsap.utils.selector(el);
    const sticky = q(".pscene__sticky")[0] as HTMLElement;
    const closing = q(".pscene__closing")[0] as HTMLElement;

    const simple = () => {
      q(".pcol").forEach((col) => {
        gsap.from(col.querySelectorAll(".frag"), {
          ...(mode === "full"
            ? { y: 46, rotation: () => gsap.utils.random(-14, 14), opacity: 0, ease: "back.out(1.5)" }
            : { opacity: 0, ease: "power2.out" }),
          duration: 0.9,
          stagger: 0.055,
          scrollTrigger: { trigger: col, start: "top 78%", once: true },
        });
      });
      gsap.from(q(".pscene__line"), {
        scaleX: 0,
        duration: 1.4,
        ease: "power3.inOut",
        scrollTrigger: { trigger: closing, start: "top 85%", once: true },
      });
      // the statement writes itself (CSS), then the pen underlines it
      ScrollTrigger.create({
        trigger: closing,
        start: "top 82%",
        once: true,
        onEnter: () => closing.classList.add("is-written"),
      });
    };

    if (mode === "calm") {
      simple();
      return;
    }

    mm.add(
      { pinned: WIDE_QUERY, other: "(max-width: 999px), (max-height: 619px)" },
      (ctx) => {
        if (ctx.conditions?.other) {
          simple();
          return;
        }
        el.classList.add("is-pinned");

        const frags = q(".frag") as HTMLElement[];
        const W = sticky.clientWidth;
        const H = sticky.clientHeight;
        const cx = W / 2;
        const cy = H * 0.52;

        // Position of an element's centre within the sticky stage (ignores transforms).
        const centre = (node: HTMLElement) => {
          let x = 0;
          let y = 0;
          let n: HTMLElement | null = node;
          while (n && n !== sticky) {
            x += n.offsetLeft;
            y += n.offsetTop;
            n = n.offsetParent as HTMLElement | null;
          }
          return { x: x + node.offsetWidth / 2, y: y + node.offsetHeight / 2 };
        };

        const plan = frags.map((f) => {
          const c = centre(f);
          const a = Math.random() * Math.PI * 2;
          const r = 0.15 + Math.random() * 0.85;
          const tx = cx + Math.cos(a) * r * W * 0.44;
          const ty = cy + Math.sin(a) * r * H * 0.4;
          return {
            x: tx - c.x,
            y: ty - c.y,
            sx: tx + Math.cos(a) * W * 0.8 - c.x,
            sy: ty + Math.sin(a) * H * 0.8 - c.y,
            rot: gsap.utils.random(-34, 34),
            s: gsap.utils.random(1.05, 1.55),
          };
        });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: q(".pscene__track")[0],
            start: "top 70%",
            end: "bottom bottom",
            scrub: 1,
          },
        });

        // 1. Flood: everything arrives at once, from every side.
        frags.forEach((f, i) => {
          const p = plan[i];
          tl.fromTo(
            f,
            { x: p.sx, y: p.sy, rotation: p.rot * 2, scale: p.s, opacity: 0 },
            { x: p.x, y: p.y, rotation: p.rot, scale: p.s, opacity: 1, duration: 1.5, ease: "power2.out" },
            (i % 9) * 0.09 + Math.floor(i / 9) * 0.22,
          );
        });

        const noiseEls = q(".noise") as HTMLElement[];
        noiseEls.forEach((n, i) => {
          const a = Math.random() * Math.PI * 2;
          const r = 0.2 + Math.random() * 0.75;
          const x = Math.cos(a) * r * W * 0.42;
          const y = Math.sin(a) * r * H * 0.36;
          tl.fromTo(
            n,
            {
              x: x + Math.cos(a) * W * 0.7,
              y: y + Math.sin(a) * H * 0.7,
              rotation: gsap.utils.random(-60, 60),
              opacity: 0,
              scale: 0.6,
            },
            {
              x,
              y,
              rotation: gsap.utils.random(-22, 22),
              opacity: 1,
              scale: gsap.utils.random(1, 1.5),
              duration: 1.4,
              ease: "power2.out",
            },
            0.15 + i * 0.12,
          );
          tl.to(
            n,
            { x: x * 3.2, y: y * 3.2, rotation: "+=40", opacity: 0, duration: 1, ease: "power2.in" },
            2.3 + (i % 4) * 0.06,
          );
        });

        // 2. Sort: the pieces find their piles, and the piles get their names.
        tl.to(
          frags,
          {
            x: 0,
            y: 0,
            rotation: (_i: number, t: HTMLElement) => Number(t.dataset.rot ?? 0),
            scale: 1,
            duration: 1.5,
            ease: "power3.inOut",
            stagger: { each: 0.02, from: "random" },
          },
          2.4,
        );
        tl.fromTo(q(".pnote"), { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.2 }, 3.6);
        tl.fromTo(
          q(".pcol__label"),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out" },
          3.3,
        );

        // 3. Fall apart: each pile fails the way it does in real life.
        tl.to(q(".bubble"), { y: -150, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power1.in" }, 5);
        tl.to(q(".xl .v.has-e"), { opacity: 0, duration: 0.3, stagger: 0.18 }, 5.1);
        tl.to(q(".xl .e"), { opacity: 1, duration: 0.3, stagger: 0.18 }, 5.1);
        tl.to(q(".xl__copy"), { opacity: 1, duration: 0.25, stagger: 0.35 }, 5.2);
        tl.to(q(".mem__state--in"), { opacity: 0, duration: 0.3 }, 5.2);
        tl.to(q(".mem__state--out"), { opacity: 1, duration: 0.3 }, 5.3);
        tl.to(q(".note"), { filter: "blur(5px)", opacity: 0.3, y: 12, duration: 0.9, stagger: 0.14 }, 5.3);

        // 4. Collapse: three piles become one line, and the line says what replaces them.
        tl.to(q(".pcol"), { scaleY: 0.02, opacity: 0, duration: 1, ease: "power3.in", stagger: 0.1 }, 7);
        tl.to(q(".pscene__title"), { yPercent: -40, opacity: 0, duration: 0.8, ease: "power2.in" }, 7);
        tl.fromTo(q(".pscene__line"), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power2.inOut" }, 7.6);
        // The line writes what replaces the piles: word by word, in ink, then a
        // pen stroke underlines the promise and drops a node at its end.
        const written = q(".pscene__closing .sw");
        tl.fromTo(
          written,
          { clipPath: "inset(-30% 104% -30% -8%)" },
          { clipPath: "inset(-30% -8% -30% -8%)", duration: 0.5, stagger: 0.09, ease: "power1.inOut" },
          8.1,
        );
        tl.fromTo(
          q(".pscene__swoosh path"),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" },
          ">-0.05",
        );
        tl.fromTo(q(".pscene__mark"), { "--dot": 0 }, { "--dot": 1, duration: 0.25 }, ">-0.05");
        tl.to({}, { duration: 1 }, ">+0.3");

        return () => el.classList.remove("is-pinned");
      },
    );
  });

  return (
    <section ref={ref} className="pscene" aria-labelledby="problem-title">
      <Spine />
      <div className="pscene__track">
        <div className="pscene__sticky">
          <div className="wrap pscene__inner">
            <SplitHeading id="problem-title" className="t-h2 pscene__title" sketch>
              {problem.heading}
            </SplitHeading>

            <div className="pscene__cols">
              <article className="pcol pcol--wa">
                <div className="pcol__stage" aria-hidden>
                  <ol className="wa-list">
                    {bubbles.map((b, i) => (
                      <li
                        key={i}
                        className={`frag bubble bubble--${b.who}${b.enquiry ? " bubble--enquiry" : ""}${b.voice ? " bubble--voice" : ""}`}
                      >
                        {b.voice ? <span className="bubble__wave" /> : b.text}
                        {b.enquiry ? <span className="bubble__note">the enquiry</span> : null}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="pcol__label">
                  <h3 className="t-h3">{wa.title}</h3>
                  <p>{wa.text}</p>
                </div>
              </article>

              <article className="pcol pcol--xl">
                <div className="pcol__stage" aria-hidden>
                  <div className="xl">
                    <div className="frag xl__bar">
                      rates_FINAL_v7.xlsx
                      <span className="xl__copy">rates_FINAL_v7 (2).xlsx</span>
                      <span className="xl__copy">rates_FINAL_v7 (3).xlsx</span>
                    </div>
                    <div className="frag xl__fx">
                      <i>fx</i> =IFERROR(VLOOKUP(B4,&apos;old rates&apos;!A:F,6,0)*1.18,&quot;ask&quot;)
                    </div>
                    <Note arrow="up" size="sm" className="pnote pnote--xl" as="span">
                      only one person knows this formula
                    </Note>
                    <div className="xl__grid">
                      {cells.map((c, i) => (
                        <span key={i} className={`frag xl__cell${c.head ? " xl__cell--head" : ""}`}>
                          <span className={`v${c.e ? " has-e" : ""}`}>{c.v}</span>
                          {c.e ? <span className="e">{c.e}</span> : null}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pcol__label">
                  <h3 className="t-h3">{xl.title}</h3>
                  <p>{xl.text}</p>
                </div>
              </article>

              <article className="pcol pcol--mem">
                <div className="pcol__stage" aria-hidden>
                  <div className="frag mem__status">
                    <span className="mem__state mem__state--in">
                      <i /> In the office
                    </span>
                    <span className="mem__state mem__state--out">
                      <i /> On leave till Monday
                    </span>
                  </div>
                  <Note arrow="left" size="sm" className="pnote pnote--mem" as="span">
                    all of it in one head
                  </Note>
                  <ul className="mem__notes">
                    {notes.map((n, i) => {
                      const rot = [-3, 2, -1.5, 3, -2][i];
                      return (
                        <li
                          key={n}
                          className="frag note"
                          data-rot={rot}
                          style={{ rotate: `${rot}deg` } as CSSProperties}
                        >
                          {n}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="pcol__label">
                  <h3 className="t-h3">{mem.title}</h3>
                  <p>{mem.text}</p>
                </div>
              </article>
            </div>

            <div className="pscene__noise" aria-hidden>
              {noise.map((n) => (
                <span key={n} className="noise">
                  {n}
                </span>
              ))}
            </div>

            <div className="pscene__finale">
              <span className="pscene__line" aria-hidden />
              <p
                className="pscene__closing"
                style={{ "--n": closingLead.length + closingRest.length + 2 } as CSSProperties}
              >
                <span className="pscene__closing-lead">
                  <Written words={closingLead} from={0} />
                </span>{" "}
                <span className="pscene__closing-rest">
                  <Written words={closingRest} from={closingLead.length} />{" "}
                  <span className="pscene__mark">
                    <Written words={closingMark} from={closingLead.length + closingRest.length} />
                    <svg
                      className="pscene__swoosh"
                      viewBox="0 0 220 30"
                      preserveAspectRatio="none"
                      aria-hidden
                      focusable={false}
                    >
                      <path d="M3 18 C 38 9, 84 25, 132 15 S 196 9, 217 13" pathLength={1} />
                    </svg>
                  </span>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
