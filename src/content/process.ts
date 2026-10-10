/** Embed · Map · Build · Run. Copy is from the brief (§4 How we work). */

export type StageId = "embed" | "map" | "build" | "run";

export type Stage = {
  id: StageId;
  number: number;
  name: string;
  /** One line for the Home step row. Condensed from the stage copy. */
  line: string;
  body: string;
  whatYouGet: string;
};

export const processIntro = "Software starts with understanding. Here is what that means in practice.";

/** "Line under" the four steps on Home. */
export const processUnderline = "An engineer sits with your team before a line of code is written.";

export const stages: Stage[] = [
  {
    id: "embed",
    number: 1,
    name: "Embed",
    line: "Observation, not a requirements meeting.",
    body: "An Acceleret engineer spends time with your team — in your office, on your WhatsApp groups, watching how an enquiry becomes an invoice. Not a requirements meeting: observation. We see the workarounds nobody writes down.",
    whatYouGet: "An engineer who understands your business before proposing anything.",
  },
  {
    id: "map",
    number: 2,
    name: "Map",
    line: "The real workflow, documented and agreed.",
    body: "We document the real workflow — where information enters, who touches it, where it gets retyped or lost — and sit with you to agree what should be automated, what simplified, and what left alone.",
    whatYouGet: "A one-page map of your operation and a clear scope, before any build.",
  },
  {
    id: "build",
    number: 3,
    name: "Build",
    line: "Working software every week, built to the map.",
    body: "We build to that map. CRM, ERP, portal, app or automation — sometimes a combination — using proven technology, with AI where it earns its place. You see working software every week, not a reveal at the end.",
    whatYouGet: "Software your team recognises, because it was built from their day.",
  },
  {
    id: "run",
    number: 4,
    name: "Run",
    line: "We stay on to maintain, support and extend it.",
    body: "Businesses change; software has to keep up. We stay on as the team that maintains, supports and extends the system.",
    whatYouGet: "A long-term technology partner, not a handover document.",
  },
];

export const whyThisWay = {
  heading: "Why this way",
  points: [
    "Templates make you change your business to fit the software. We do the reverse.",
    "Most failed software projects fail at understanding, not at coding.",
    "Your team adopts what feels like theirs.",
  ],
};
