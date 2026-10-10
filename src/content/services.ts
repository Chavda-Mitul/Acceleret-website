/**
 * The six services. Copy is from the brief (§4 Home section 3 and Services).
 * - `id` is the anchor on /services (e.g. /services#crm)
 * - `short` is the one-liner used on Home
 */

export type ServiceId = "crm" | "erp" | "automation" | "ai" | "portals" | "integrations";

export type Service = {
  id: ServiceId;
  title: string;
  short: string;
  body: string;
  typicalFor: string;
  examples: string[];
};

export const servicesIntro =
  "We don't sell a product list; we build what your operation needs. These are the shapes that work usually takes.";

export const services: Service[] = [
  {
    id: "crm",
    title: "CRM systems",
    short: "Every enquiry, customer and follow-up in one place",
    body: "Every enquiry, customer, quote and follow-up in one place, built around your sales process rather than a generic pipeline.",
    typicalFor: "Businesses losing leads between WhatsApp and the sales team.",
    examples: [
      "Enquiry capture from WhatsApp and web",
      "Quotation and follow-up tracking",
      "Customer history visible to everyone who needs it",
    ],
  },
  {
    id: "erp",
    title: "ERP systems",
    short: "Operations, inventory, billing and reporting connected",
    body: "Operations, inventory, purchasing, billing and reporting connected, so the numbers in the report are the numbers on the floor.",
    typicalFor: "Businesses that have outgrown Tally-plus-Excel.",
    examples: ["Order-to-invoice flow", "Stock and purchase tracking", "Owner dashboards"],
  },
  {
    id: "automation",
    title: "Workflow automation",
    short: "The manual steps removed, the handoffs made automatic",
    body: "We find the steps your team does by hand every day — retyping, forwarding, reminding, reconciling — and make them happen on their own.",
    typicalFor: "Any business where “someone has to remember to” is part of the process.",
    examples: [
      "Automatic follow-ups and reminders",
      "Document generation",
      "Approvals that move without chasing",
    ],
  },
  {
    id: "ai",
    title: "AI-assisted processes",
    short: "AI where it removes work, not where it adds novelty",
    body: "AI inside the systems above, used where it removes work: drafting replies, classifying enquiries, summarising, extracting data from documents. We don't add AI for the label.",
    typicalFor: "Teams drowning in repetitive communication or paperwork.",
    examples: ["Enquiry triage", "Document reading", "Draft responses for review"],
  },
  {
    id: "portals",
    title: "Web portals and apps",
    short: "For customers, vendors, field teams",
    body: "Portals and apps for the people outside your office: customers checking status, vendors submitting documents, field teams reporting from site.",
    typicalFor: "Businesses answering the same “where is my…” question all day.",
    examples: ["Customer status portal", "Vendor onboarding app", "Field-team reporting app"],
  },
  {
    id: "integrations",
    title: "Integrations",
    short: "Your existing tools talking to each other",
    body: "Your existing tools connected — accounting, messaging, payments, suppliers — so data is entered once.",
    typicalFor: "Businesses with five tools and no bridge between them.",
    examples: [
      "WhatsApp Business API",
      "Payment gateways",
      "Supplier and partner APIs",
      "Accounting software",
    ],
  },
];
