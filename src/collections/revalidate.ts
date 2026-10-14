import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";

/** Cache tag on every blog query (src/lib/blog.ts). */
export const BLOG_TAG = "blog";

/**
 * Any change to posts, categories or images marks the blog's cached data
 * stale. `expire: 0` makes the next visit render fresh, so an editor sees a
 * published change on their first reload.
 */
function expireBlog(context: Record<string, unknown>) {
  if (context.disableRevalidate) return;
  try {
    revalidateTag(BLOG_TAG, { expire: 0 });
  } catch {
    // Outside a Next.js request (CLI scripts, seeding) there is no cache to expire.
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  expireBlog(req.context);
  return doc;
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  expireBlog(req.context);
  return doc;
};
