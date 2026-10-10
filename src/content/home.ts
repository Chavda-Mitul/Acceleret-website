/** Home page copy. All text is from the brief (§4 Home) unless marked "design copy". */

export const hero = {
  headline: "Software built around how your business works.",
  /** Shortened at the client's request (less text on screen). The brief's full line is `subFull`. */
  sub: "At Acceleret, software starts with understanding. Our engineers embed with your team, map your operations and build around them.",
  subFull:
    "At Acceleret, software starts with understanding. Our engineers embed with your team, map your operations and build around them — AI-driven CRM and ERP systems, web portals, apps and workflow automation designed for how your business works, not how a template assumes it does.",
  secondaryCta: { label: "See how we work", href: "/how-we-work" },
};

/**
 * Design copy for the hero diagram: one enquiry's path through a business.
 * `today` is the workaround each step depends on now (pencil); `built` is
 * what replaces it, drawn from the service examples in the brief.
 * Illustrative, not a claim about a specific client.
 */
export const operationSteps = [
  { id: "enquiry", label: "Enquiry", today: "arrives on WhatsApp", built: "captured from WhatsApp" },
  { id: "quote", label: "Quote", today: "typed up in Excel", built: "tracked to follow-up" },
  { id: "approval", label: "Approval", today: "a voice note, maybe", built: "moves without chasing" },
  { id: "order", label: "Order", today: "retyped into the sheet", built: "entered once" },
  { id: "dispatch", label: "Dispatch", today: "“did you send that?”", built: "status the customer sees" },
  { id: "invoice", label: "Invoice", today: "made from memory", built: "generated from the order" },
  { id: "payment", label: "Payment", today: "chased by phone", built: "synced with accounts" },
] as const;

export const problem = {
  heading: "Most businesses run on three things.",
  cards: [
    {
      id: "whatsapp",
      title: "WhatsApp",
      text: "Where every enquiry, approval and “did you send that?” lives, until it scrolls away.",
    },
    {
      id: "excel",
      title: "Excel",
      text: "Where the real numbers are, in a file only one person understands.",
    },
    {
      id: "memory",
      title: "Memory",
      text: "Where the process actually lives, until that person is on leave.",
    },
  ],
  closing: "We replace all three with a system that fits the way your team already works.",
} as const;

export const build = {
  heading: "What we build",
};

export const proof = {
  heading: "Work",
};

export const team = {
  heading: "Who we are",
};
