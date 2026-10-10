import type { CSSProperties, ReactNode } from "react";
import type { ServiceId } from "@/content/services";

/*
 * One diagram per service, drawn in the site's vocabulary: steps are chips,
 * connections are routes, pencil is how it works today. Lines draw and parts
 * settle when an ancestor gets data-inview="true" (see .draw / .rise).
 * Labels are illustrative, not claims.
 */

const W = 480;
const H = 340;

type ChipProps = {
  x: number;
  y: number;
  w: number;
  label: string;
  tone?: "route" | "pencil" | "solid" | "soft";
  delay?: number;
  h?: number;
};

function Chip({ x, y, w, label, tone = "route", delay = 0, h = 34 }: ChipProps) {
  return (
    <g className={`dg-chip dg-chip--${tone} rise`} style={{ "--rise-delay": `${delay}s` } as CSSProperties}>
      <rect x={x} y={y} width={w} height={h} rx={10} />
      <circle cx={x + 15} cy={y + h / 2} r={4} className="dg-chip__dot" />
      <text x={x + 27} y={y + h / 2 + 5}>
        {label}
      </text>
    </g>
  );
}

function Route({
  d,
  delay = 0,
  dur = 1.1,
  tone = "route",
}: {
  d: string;
  delay?: number;
  dur?: number;
  tone?: "route" | "pencil";
}) {
  return (
    <path
      d={d}
      pathLength={1}
      className={`dg-line dg-line--${tone} draw`}
      style={{ "--draw-delay": `${delay}s`, "--draw-dur": `${dur}s` } as CSSProperties}
    />
  );
}

function Panel({
  x,
  y,
  w,
  h,
  delay = 0,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  delay?: number;
  children?: ReactNode;
}) {
  return (
    <g className="dg-panel rise" style={{ "--rise-delay": `${delay}s` } as CSSProperties}>
      <rect x={x} y={y} width={w} height={h} rx={14} />
      {children}
    </g>
  );
}

function Bar({ x, y, w, tone = "ink" }: { x: number; y: number; w: number; tone?: "ink" | "soft" | "electric" }) {
  return <rect x={x} y={y} width={w} height={7} rx={3.5} className={`dg-bar dg-bar--${tone}`} />;
}

function Note({
  x,
  y,
  children,
  rotate = -3,
  anchor = "start",
}: {
  x: number;
  y: number;
  children: ReactNode;
  rotate?: number;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text x={x} y={y} className="dg-note rise" textAnchor={anchor} transform={`rotate(${rotate} ${x} ${y})`}>
      {children}
    </text>
  );
}

function Pill({
  x,
  y,
  label,
  tone = "soft",
  w,
}: {
  x: number;
  y: number;
  label: string;
  tone?: "soft" | "electric" | "pencil";
  w?: number;
}) {
  const width = w ?? label.length * 6.6 + 18;
  return (
    <g className={`dg-pill dg-pill--${tone}`}>
      <rect x={x} y={y} width={width} height={20} rx={10} />
      <text x={x + width / 2} y={y + 14} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

/* ---------------------------------------------------------------- diagrams */

function Crm() {
  return (
    <>
      <Chip x={18} y={58} w={124} label="WhatsApp" tone="soft" delay={0.05} />
      <Chip x={18} y={153} w={124} label="Web form" tone="soft" delay={0.12} />
      <Chip x={18} y={248} w={124} label="Phone call" tone="soft" delay={0.19} />
      <Route d="M142 75 H170 Q184 75 184 89 V156 Q184 170 198 170 H214" delay={0.3} />
      <Route d="M142 170 H214" delay={0.38} />
      <Route d="M142 265 H170 Q184 265 184 251 V184 Q184 170 198 170 H214" delay={0.46} />
      <Panel x={214} y={52} w={248} h={236} delay={0.2}>
        <text x={234} y={84} className="dg-title">
          Enquiries
        </text>
        <Pill x={384} y={70} label="one list" tone="electric" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} className="rise" style={{ "--rise-delay": `${0.55 + i * 0.1}s` } as CSSProperties}>
            <line x1={234} x2={442} y1={104 + i * 44} y2={104 + i * 44} className="dg-rule" />
            <circle cx={246} cy={126 + i * 44} r={9} className="dg-avatar" />
            <Bar x={264} y={118 + i * 44} w={[92, 70, 104, 80][i]} />
            <Bar x={264} y={131 + i * 44} w={[60, 84, 50, 66][i]} tone="soft" />
            <Pill
              x={366}
              y={116 + i * 44}
              w={72}
              label={["New", "Quoted", "Follow up", "Won"][i]}
              tone={i === 2 ? "electric" : "soft"}
            />
          </g>
        ))}
      </Panel>
    </>
  );
}

function Erp() {
  return (
    <>
      <Route d="M120 92 H190" delay={0.35} />
      <Route d="M290 92 H360" delay={0.45} />
      <Route d="M410 112 V214" delay={0.55} />
      <Route d="M360 248 H290" delay={0.65} />
      <Route d="M190 248 H120" delay={0.75} />
      <Route d="M70 214 V112" delay={0.85} />
      <Route d="M240 112 V150" delay={0.95} dur={0.6} />
      <Route d="M240 228 V190" delay={0.95} dur={0.6} />
      <Chip x={20} y={75} w={100} label="Orders" delay={0.05} />
      <Chip x={190} y={75} w={100} label="Stock" delay={0.1} />
      <Chip x={360} y={75} w={100} label="Purchase" delay={0.15} />
      <Chip x={360} y={231} w={100} label="Dispatch" delay={0.2} />
      <Chip x={190} y={231} w={100} label="Billing" delay={0.25} />
      <Chip x={20} y={231} w={100} label="Accounts" delay={0.3} />
      <Panel x={176} y={150} w={128} h={40} delay={0.5}>
        <text x={240} y={175} textAnchor="middle" className="dg-title dg-title--sm">
          Owner report
        </text>
      </Panel>
      <Note x={240} y={318} anchor="middle" rotate={-1.5}>
        the numbers in the report are the numbers on the floor
      </Note>
    </>
  );
}

function Automation() {
  const steps = [
    { x: 30, label: "Quote sent" },
    { x: 176, label: "Reminder" },
    { x: 322, label: "Approved" },
  ];
  return (
    <>
      <Route d="M140 140 H176" delay={0.35} />
      <Route d="M286 140 H322" delay={0.5} />
      <Route d="M377 157 V214 Q377 228 363 228 H200" delay={0.65} />
      {steps.map((s, i) => (
        <Chip key={s.label} x={s.x} y={123} w={110} label={s.label} delay={0.05 + i * 0.1} />
      ))}
      <Chip x={90} y={211} w={110} label="Invoice" delay={0.4} />
      <Pill x={176} y={88} label="after 2 days, on its own" tone="electric" w={150} />
      <Pill x={208} y={254} label="generated, not retyped" tone="soft" w={140} />
      {/* the manual step that goes away */}
      <g className="dg-struck rise" style={{ "--rise-delay": "0.2s" } as CSSProperties}>
        <rect x={140} y={34} width={200} height={30} rx={10} />
        <text x={240} y={54} textAnchor="middle">
          someone remembers to follow up
        </text>
        <path
          d="M150 50 C200 44 280 54 330 47"
          pathLength={1}
          className="dg-strike draw"
          style={{ "--draw-delay": "0.9s", "--draw-dur": "0.5s" } as CSSProperties}
        />
      </g>
      <Note x={240} y={312} anchor="middle" rotate={-1}>
        the handoffs happen without chasing
      </Note>
    </>
  );
}

function Ai() {
  return (
    <>
      <Panel x={20} y={40} w={170} h={250} delay={0.05}>
        <text x={38} y={70} className="dg-title dg-title--sm">
          Purchase order.pdf
        </text>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect
            key={i}
            x={38}
            y={88 + i * 22}
            width={[120, 96, 128, 84, 112, 70, 118, 90][i]}
            height={8}
            rx={4}
            className={i === 1 || i === 4 || i === 6 ? "dg-hl" : "dg-bar dg-bar--soft"}
          />
        ))}
      </Panel>
      <Route d="M150 114 C220 114 220 82 268 82" delay={0.35} />
      <Route d="M162 180 C224 180 224 126 268 126" delay={0.45} />
      <Route d="M168 224 C230 224 230 170 268 170" delay={0.55} />
      <Panel x={268} y={58} w={194} h={136} delay={0.3}>
        {[
          ["Buyer", "Buyer C"],
          ["Quantity", "800 m"],
          ["Due", "Friday"],
        ].map(([k, v], i) => (
          <g key={k} className="rise" style={{ "--rise-delay": `${0.6 + i * 0.12}s` } as CSSProperties}>
            <text x={286} y={88 + i * 44} className="dg-key">
              {k}
            </text>
            <text x={444} y={88 + i * 44} textAnchor="end" className="dg-val">
              {v}
            </text>
          </g>
        ))}
      </Panel>
      <Panel x={268} y={208} w={194} h={82} delay={0.8}>
        <text x={286} y={234} className="dg-key">
          Draft reply
        </text>
        <Bar x={286} y={246} w={140} tone="soft" />
        <Pill x={286} y={260} label="for your review" tone="electric" w={110} />
      </Panel>
      <Note x={104} y={318} anchor="middle" rotate={-2}>
        read, not retyped
      </Note>
    </>
  );
}

function Portals() {
  const stages = ["Received", "In production", "Dispatched", "Delivered"];
  return (
    <>
      <g className="dg-phone rise">
        <rect x={150} y={18} width={180} height={304} rx={26} />
        <rect x={214} y={30} width={52} height={6} rx={3} className="dg-phone__notch" />
      </g>
      <text x={172} y={72} className="dg-title dg-title--sm rise" style={{ "--rise-delay": "0.15s" } as CSSProperties}>
        Order status
      </text>
      <Bar x={172} y={84} w={84} tone="soft" />
      <Route d="M184 120 V264" delay={0.4} dur={1.2} />
      {stages.map((s, i) => (
        <g key={s} className="rise" style={{ "--rise-delay": `${0.45 + i * 0.25}s` } as CSSProperties}>
          <circle cx={184} cy={120 + i * 48} r={8} className={i < 3 ? "dg-step dg-step--done" : "dg-step"} />
          <text x={202} y={125 + i * 48} className={i === 2 ? "dg-val" : "dg-key"}>
            {s}
          </text>
        </g>
      ))}
      <Chip x={346} y={84} w={116} label="Customers" tone="soft" delay={0.2} />
      <Chip x={346} y={150} w={116} label="Vendors" tone="soft" delay={0.3} />
      <Chip x={346} y={216} w={116} label="Field teams" tone="soft" delay={0.4} />
      <Note x={72} y={140} anchor="middle" rotate={-4}>
        no more
      </Note>
      <Note x={72} y={164} anchor="middle" rotate={-4}>
        &ldquo;where is my…?&rdquo;
      </Note>
    </>
  );
}

function Integrations() {
  const tools = [
    { x: 24, y: 40, label: "Accounting" },
    { x: 24, y: 254, label: "Payments" },
    { x: 338, y: 40, label: "WhatsApp" },
    { x: 338, y: 254, label: "Suppliers" },
  ];
  return (
    <>
      <Route d="M142 57 H170 Q190 57 190 77 V140" delay={0.35} />
      <Route d="M142 271 H170 Q190 271 190 251 V200" delay={0.45} />
      <Route d="M338 57 H310 Q290 57 290 77 V140" delay={0.55} />
      <Route d="M338 271 H310 Q290 271 290 251 V200" delay={0.65} />
      {tools.map((t, i) => (
        <Chip key={t.label} x={t.x} y={t.y} w={118} label={t.label} tone="soft" delay={0.05 + i * 0.08} />
      ))}
      <Panel x={170} y={140} w={140} h={60} delay={0.3}>
        <text x={240} y={168} textAnchor="middle" className="dg-title dg-title--sm">
          Your system
        </text>
        <text x={240} y={186} textAnchor="middle" className="dg-key dg-key--sm">
          one record
        </text>
      </Panel>
      <Note x={240} y={118} anchor="middle" rotate={-1.5}>
        entered once
      </Note>
    </>
  );
}

const DIAGRAMS: Record<ServiceId, () => ReactNode> = {
  crm: Crm,
  erp: Erp,
  automation: Automation,
  ai: Ai,
  portals: Portals,
  integrations: Integrations,
};

export function ServiceDiagram({ id, className = "" }: { id: ServiceId; className?: string }) {
  const Diagram = DIAGRAMS[id];
  return (
    <svg className={`dg ${className}`} viewBox={`0 0 ${W} ${H}`} aria-hidden focusable={false}>
      <Diagram />
    </svg>
  );
}
