import { slugField, type CollectionBeforeChangeHook, type CollectionConfig } from "payload";
import { BLOG_TAG, revalidates } from "./revalidate";

/** First publish stamps the date shown on the article, unless the writer set one. */
const stampPublishedAt: CollectionBeforeChangeHook = ({ data }) => {
  if (data._status === "published" && !data.publishedAt) {
    return { ...data, publishedAt: new Date().toISOString() };
  }
  return data;
};

/**
 * Blog articles at /blog/<slug>. Drafts autosave and are only visible in
 * /admin; the public site reads published versions only (src/lib/blog.ts).
 * The SEO tab is added by the SEO plugin (payload.config.ts).
 */
export const Posts: CollectionConfig = {
  slug: "posts",
  access: {
    // Signed-in writers see drafts; everyone else only published articles.
    read: ({ req: { user } }) => (user ? true : { _status: { equals: "published" } }),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "_status", "publishedAt"],
    group: "Blog",
    description: "Articles for the blog. Save as a draft while writing; Publish puts it live.",
  },
  versions: {
    drafts: { autosave: { interval: 1500 } },
    maxPerDoc: 30,
  },
  defaultSort: "-publishedAt",
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
              name: "excerpt",
              type: "textarea",
              required: true,
              maxLength: 300,
              admin: {
                description:
                  "One or two sentences. Shown on the blog list, and used as the search description if the SEO tab is left empty.",
              },
            },
            {
              name: "coverImage",
              type: "upload",
              relationTo: "media",
              admin: { description: "Optional. Wide images work best (about 1600 × 900)." },
            },
            { name: "content", type: "richText", required: true },
          ],
        },
      ],
    },
    slugField({ position: "sidebar" }),
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
        description: "Filled in automatically when first published.",
      },
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      admin: { position: "sidebar" },
      defaultValue: ({ user }) => user?.id,
    },
    { name: "category", type: "relationship", relationTo: "categories", admin: { position: "sidebar" } },
    {
      name: "tags",
      type: "text",
      hasMany: true,
      admin: { position: "sidebar", description: "Press Enter after each tag." },
    },
  ],
  hooks: {
    beforeChange: [stampPublishedAt],
    ...revalidates(BLOG_TAG),
  },
};
