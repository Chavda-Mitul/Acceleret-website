import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import sharp from "sharp";
import { site } from "./content/site";
import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Categories } from "./collections/Categories";
import { Posts } from "./collections/Posts";
import { blogEditor } from "./collections/editor";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The blog CMS, served at /admin.
 *
 * Postgres holds the content (DATABASE_URI). Images go to Vercel Blob when
 * BLOB_READ_WRITE_TOKEN is set, otherwise to the local `media/` folder,
 * which only works on a host with a writable disk.
 */
export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "",
  admin: {
    user: Users.slug,
    // Payload's own avatar instead of Gravatar, which would send a hash of each admin's email to a third party.
    avatar: "default",
    meta: { titleSuffix: " | Acceleret blog", robots: "noindex, nofollow" },
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Posts, Categories, Media, Users],
  editor: blogEditor,
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || "" },
    // Development syncs the schema directly. Production applies src/migrations
    // once, before the build (`npm run migrate`, run by `vercel-build`).
  }),
  graphQL: { disable: true },
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  plugins: [
    seoPlugin({
      collections: ["posts"],
      uploadsCollection: "media",
      tabbedUI: true,
      generateTitle: ({ doc }) => (doc?.title ? `${doc.title} | Acceleret` : "Acceleret"),
      generateDescription: ({ doc }) => doc?.excerpt ?? "",
      generateURL: ({ doc }) => `${site.url}/blog/${doc?.slug ?? ""}`,
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
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
});
