import type { Block } from "payload";
import {
  AlignFeature,
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  ChecklistFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

/* Blocks the writer can drop into an article. Each one has a renderer in src/components/blog/RichText.tsx. */

const Callout: Block = {
  slug: "callout",
  interfaceName: "CalloutBlock",
  labels: { singular: "Callout", plural: "Callouts" },
  fields: [
    {
      name: "tone",
      type: "select",
      defaultValue: "note",
      options: [
        { label: "Note", value: "note" },
        { label: "Tip", value: "tip" },
        { label: "Warning", value: "warning" },
      ],
    },
    { name: "title", type: "text" },
    { name: "body", type: "textarea", required: true },
  ],
};

const Faq: Block = {
  slug: "faq",
  interfaceName: "FaqBlock",
  labels: { singular: "FAQ", plural: "FAQs" },
  fields: [
    {
      name: "items",
      type: "array",
      minRows: 1,
      labels: { singular: "Question", plural: "Questions" },
      admin: { description: "Also sent to Google as FAQ data, which can show the questions in search results." },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },
  ],
};

const Cta: Block = {
  slug: "cta",
  interfaceName: "CtaBlock",
  labels: { singular: "Call to action", plural: "Calls to action" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "text", type: "textarea" },
    { name: "buttonLabel", type: "text", required: true, defaultValue: "Book a walkthrough" },
    { name: "href", type: "text", required: true, defaultValue: "/contact", label: "Button link" },
  ],
};

/** The article editor: everything a long-form SEO article needs, nothing it doesn't. */
export const blogEditor = lexicalEditor({
  features: [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    SubscriptFeature(),
    SuperscriptFeature(),
    InlineCodeFeature(),
    AlignFeature(),
    IndentFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    ChecklistFeature(),
    BlockquoteFeature(),
    HorizontalRuleFeature(),
    LinkFeature({
      enabledCollections: ["posts"],
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: "nofollow",
          type: "checkbox",
          label: "Don't pass ranking to this site (nofollow)",
          admin: { description: "Tick for sponsored, paid or untrusted links." },
        },
      ],
    }),
    UploadFeature({
      enabledCollections: ["media"],
      collections: {
        media: { fields: [{ name: "caption", type: "text" }] },
      },
    }),
    EXPERIMENTAL_TableFeature(),
    BlocksFeature({ blocks: [Callout, Faq, Cta] }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
});
