import { slugField, type CollectionConfig } from "payload";
import { BLOG_TAG, revalidates } from "./revalidate";

/** Topics that group articles, each with its own page at /blog/category/<slug>. */
export const Categories: CollectionConfig = {
  slug: "categories",
  access: { read: () => true },
  admin: { useAsTitle: "title", defaultColumns: ["title", "slug"], group: "Blog" },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "description",
      type: "textarea",
      admin: { description: "One or two sentences, shown at the top of the category page and to search engines." },
    },
    slugField({ position: "sidebar" }),
  ],
  hooks: revalidates(BLOG_TAG),
};
