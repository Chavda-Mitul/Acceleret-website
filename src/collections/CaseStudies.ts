import { slugField, type CollectionConfig } from "payload";
import { WORK_TAG, revalidates } from "./revalidate";

/**
 * Case studies at /case-studies/<slug>, also shown as cards on /case-studies and Home. Each
 * reads as a small route: the situation → what we built → what changed.
 * Drafts autosave and stay in /admin; the site reads published ones only
 * (src/lib/work.ts). The SEO tab is added by the SEO plugin (payload.config.ts).
 */
export const CaseStudies: CollectionConfig = {
  slug: "case-studies",
  labels: { singular: "Case study", plural: "Case studies" },
  access: {
    // Signed-in writers see drafts; everyone else only published case studies.
    read: ({ req: { user } }) => (user ? true : { _status: { equals: "published" } }),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "client", "_status", "order"],
    group: "Case studies",
    description: "Projects shown on /case-studies. Save as a draft while writing; Publish puts it live.",
  },
  versions: {
    drafts: { autosave: { interval: 1500 } },
    maxPerDoc: 30,
  },
  defaultSort: "order",
  fields: [
    /* An unnamed tabs field first: the SEO plugin adds its tab next to "Content"
       and leaves the fields below in the sidebar. Unnamed tabs don't change the data. */
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          fields: [
            { name: "title", type: "text", required: true },
            {
              name: "client",
              type: "text",
              required: true,
              admin: { description: 'Client name, or a sector and city ("A Surat textile exporter").' },
            },
            {
              name: "result",
              type: "text",
              required: true,
              maxLength: 160,
              admin: {
                description:
                  "One line on what changed. Shown under the title, on Home, and to search engines if the SEO tab is empty.",
              },
            },
            {
              name: "coverImage",
              type: "upload",
              relationTo: "media",
              admin: { description: "Wide images work best (about 1600 × 900)." },
            },
            {
              name: "summary",
              type: "group",
              admin: { description: "The card on /case-studies: one sentence each." },
              fields: [
                { name: "problem", type: "text", required: true },
                { name: "built", type: "text", required: true, label: "What we built" },
                { name: "changed", type: "text", required: true, label: "What changed" },
              ],
            },
            {
              name: "situation",
              type: "textarea",
              required: true,
              admin: { description: "About 80 words: the business and what wasn't working." },
            },
            {
              name: "whatWeBuilt",
              type: "textarea",
              required: true,
              label: "What we built",
              admin: { description: "About 100 words." },
            },
            {
              name: "features",
              type: "array",
              minRows: 1,
              maxRows: 6,
              admin: { description: "Three to five, one line each.", initCollapsed: false },
              fields: [{ name: "text", type: "text", required: true }],
            },
            {
              name: "outcomes",
              type: "array",
              minRows: 1,
              maxRows: 4,
              admin: { description: 'Three is best. Add a number when there is one ("30%", "5k+").' },
              fields: [
                { name: "value", type: "text", admin: { description: "Optional." } },
                { name: "label", type: "text", required: true },
              ],
            },
            {
              name: "quote",
              type: "group",
              admin: { description: "Optional. Only a real quote from the client." },
              fields: [
                { name: "text", type: "textarea" },
                { name: "name", type: "text", admin: { description: "Leave empty to show the role only." } },
                { name: "role", type: "text" },
              ],
            },
          ],
        },
      ],
    },
    slugField({ position: "sidebar" }),
    {
      name: "order",
      type: "number",
      defaultValue: 100,
      admin: {
        position: "sidebar",
        description: "Lower numbers come first. The first three are shown on Home.",
      },
    },
    {
      name: "tags",
      type: "text",
      hasMany: true,
      admin: { position: "sidebar", description: 'Industry and kind of software ("Real estate", "CRM"). Press Enter after each.' },
    },
    {
      name: "techStack",
      type: "text",
      hasMany: true,
      label: "Tech stack",
      admin: { position: "sidebar", description: "Press Enter after each." },
    },
  ],
  hooks: revalidates(WORK_TAG),
};
