/** Home page copy. All text is from the brief (§4 Home) unless marked "design copy". */

export const hero = {
  headline: "Software built around how your business works.",
  /**
   * Shortened at the client's request (less text on screen), and names the range
   * so the hero doesn't read as CRM-only. The brief's full line is `subFull`.
   */
  sub: "Our engineers embed with your team, map how it works and build whatever it needs: CRM, ERP, apps, AI, automation. Any industry, any stack.",
  subFull:
    "At Acceleret, software starts with understanding. Our engineers embed with your team, map your operations and build around them — AI-driven CRM and ERP systems, web portals, apps and workflow automation designed for how your business works, not how a template assumes it does.",
  secondaryCta: { label: "See how we work", href: "/how-we-work" },
};

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
