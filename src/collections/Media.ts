import type { CollectionConfig } from "payload";
import { revalidateAfterChange, revalidateAfterDelete } from "./revalidate";

/** Images for articles: covers, inline pictures and share images. */
export const Media: CollectionConfig = {
  slug: "media",
  access: { read: () => true },
  admin: { group: "Blog" },
  upload: {
    // Without Vercel Blob (see payload.config.ts) files land here; needs a writable disk.
    staticDir: "media",
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif", "image/svg+xml"],
    focalPoint: true,
    imageSizes: [
      { name: "card", width: 720, height: 450, position: "centre" },
      { name: "content", width: 1440, withoutEnlargement: true },
      { name: "og", width: 1200, height: 630, position: "centre" },
    ],
    // The uncropped picture, as articles show it. The "card" crop cut wide images short in the editor.
    adminThumbnail: ({ doc }) => {
      const sizes = doc.sizes as { content?: { url?: string | null } } | undefined;
      return sizes?.content?.url ?? (doc.url as string | undefined) ?? null;
    },
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description: "Describe the image for people who can't see it, and for Google. One short sentence.",
      },
    },
  ],
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
};
