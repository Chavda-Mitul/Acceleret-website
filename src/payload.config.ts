import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import sharp from "sharp";
import { site } from "./content/site";
import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Categories } from "./collections/Categories";
import { Posts } from "./collections/Posts";
import { CaseStudies } from "./collections/CaseStudies";
import { blogEditor } from "./collections/editor";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The CMS for the blog and case studies, served at /admin.
 *
 * Postgres holds the content (DATABASE_URI). Uploaded images are stored in the
 * `media/` folder on the server, so that folder must persist across deploys.
 */
export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "",
  admin: {
    user: Users.slug,
    // Payload's own avatar instead of Gravatar, which would send a hash of each admin's email to a third party.
    avatar: "default",
    meta: { titleSuffix: " | Acceleret CMS", robots: "noindex, nofollow" },
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Posts, Categories, CaseStudies, Media, Users],
  editor: blogEditor,
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || "" },
    // Development syncs the schema directly. Production applies src/migrations
    // once, before the build (`npm run migrate`, run by `build:prod`).
  }),
  // Admin emails (password resets) go out through Gmail SMTP. Without
  // SMTP_PASS, Payload prints them to the server console instead.
  email: process.env.SMTP_PASS
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_USER || "",
        defaultFromName: "Acceleret CMS",
        transportOptions: {
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  graphQL: { disable: true },
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  plugins: [
    seoPlugin({
      collections: ["posts", "case-studies"],
      uploadsCollection: "media",
      tabbedUI: true,
      generateTitle: ({ doc }) => (doc?.title ? `${doc.title} | Acceleret` : "Acceleret"),
      generateDescription: ({ doc, collectionSlug }) =>
        (collectionSlug === "case-studies" ? doc?.result : doc?.excerpt) ?? "",
      generateURL: ({ doc, collectionSlug }) =>
        `${site.url}/${collectionSlug === "case-studies" ? "case-studies" : "blog"}/${doc?.slug ?? ""}`,
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: "canonical",
          type: "text",
          label: "Canonical URL",
          admin: {
            description: "Only if this article was first published elsewhere. Leave empty otherwise.",
          },
        },
        {
          name: "noindex",
          type: "checkbox",
          label: "Hide from search engines",
          defaultValue: false,
        },
      ],
    }),
  ],
});
