/**
 * Case studies (brief §4 Work). Each entry becomes a card on /work and Home,
 * and a page at /work/<slug>.
 *
 * The founders supply two real case studies by 3 Nov. Until then the entries
 * below are SAMPLES that show the layout: `sample: true` puts a visible
 * "Sample" marker on them, keeps them out of the sitemap and tells search
 * engines not to index them. They deliberately contain no numbers or quotes.
 *
 * To add a real one: copy an entry, give it a new slug (lowercase-with-dashes),
 * fill every field, and leave out `sample`.
 */

export type CaseStudy = {
  slug: string;
  /** Client name, or an anonymised sector + city ("A Surat textile exporter"). */
  client: string;
  title: string;
  /** One-line result for cards. */
  result: string;
  /** Card summary: problem → what we built → what changed. */
  summary: { problem: string; built: string; changed: string };
  /** ~80 words. */
  situation: string;
  /** ~100 words. */
  whatWeBuilt: string;
  /** 3–5 features. */
  features: string[];
  /** Three numbers if available ("6 hrs" / "a week"), otherwise three outcomes in words. */
  outcomes: { value?: string; label: string }[];
  quote?: { text: string; name: string; role: string };
  sample?: boolean;
};

export const workIntro = "What we've built and what changed.";

export const caseStudies: CaseStudy[] = [
  {
    slug: "sample-textile-exporter",
    client: "A Surat textile exporter",
    title: "Orders out of WhatsApp groups and into one order book",
    result: "Orders entered once and tracked from enquiry to dispatch.",
    summary: {
      problem: "Orders arrived across WhatsApp groups and were retyped into Excel.",
      built: "An order book with WhatsApp enquiry capture and dispatch tracking.",
      changed: "One record per order, visible to sales, dispatch and the owner.",
    },
    situation:
      "Sample text. Orders, rate requests and dispatch updates arrived across several WhatsApp groups. Each morning someone retyped them into a shared spreadsheet, and more than one copy of that sheet was in use. Dispatch status lived with whoever had last spoken to the transporter, so customers' questions went round the office before anyone could answer them.",
    whatWeBuilt:
      "Sample text. After time spent with the sales and dispatch teams, an order book shaped around how they already worked: enquiries captured from WhatsApp into one list, approved quotes turned into orders without retyping, and each order tracked through production and dispatch. Customers receive status messages at the points the team chose, and the owner has one screen for open orders, dues and delays.",
    features: [
      "WhatsApp enquiry capture into the order book",
      "Quote to order to dispatch in one flow",
      "Status messages to customers at agreed points",
      "Owner view of open orders, dues and delays",
    ],
    outcomes: [
      { label: "Orders typed once, not retyped from chats" },
      { label: "Dispatch status visible to everyone who answers customers" },
      { label: "The owner sees the day without asking around" },
    ],
    sample: true,
  },
  {
    slug: "sample-distributor-stock",
    client: "A Gujarat distributor",
    title: "Stock, purchasing and billing on one set of numbers",
    result: "Sales can see stock before they promise it.",
    summary: {
      problem: "Stock lived in one person's spreadsheet; billing in a separate tool.",
      built: "Stock and purchase tracking connected to billing, with reorder reminders.",
      changed: "One set of numbers from the warehouse floor to the owner's report.",
    },
    situation:
      "Sample text. Stock levels were kept in a spreadsheet that one person maintained and understood. Billing ran in a separate accounting tool, and reorders depended on someone noticing that a shelf looked low. Sales staff phoned the warehouse before confirming any large order, and month-end meant reconciling three sources by hand.",
    whatWeBuilt:
      "Sample text. Stock, purchasing and billing connected in one system built around the existing warehouse routine. Goods in and goods out are recorded where they happen, purchase orders are raised from reorder levels the team set, and invoices pull from the same records. An integration keeps the accounting software in step, so nothing is entered twice.",
    features: [
      "Stock in and out recorded at the warehouse",
      "Reorder reminders from agreed levels",
      "Invoices generated from the same records",
      "Sync with the existing accounting software",
    ],
    outcomes: [
      { label: "Stock visible to sales before an order is confirmed" },
      { label: "Reorders raised from levels, not from memory" },
      { label: "Month-end without reconciling three sources" },
    ],
    sample: true,
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug);
}
