import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";

/** Cache tag on every blog query (src/lib/blog.ts). */
export const BLOG_TAG = "blog";
/** Cache tag on every case study query (src/lib/work.ts). */
export const WORK_TAG = "work";

/**
 * Marks the cached data behind the given tags stale. `expire: 0` makes the
 * next visit render fresh, so an editor sees a published change on their
 * first reload.
 */
function expire(tags: string[], context: Record<string, unknown>) {
  if (context.disableRevalidate) return;
  try {
    for (const tag of tags) revalidateTag(tag, { expire: 0 });
  } catch {
    // Outside a Next.js request (CLI scripts, seeding) there is no cache to expire.
  }
}

/** afterChange / afterDelete hooks that expire the pages built from a collection. */
export function revalidates(...tags: string[]): {
  afterChange: CollectionAfterChangeHook[];
  afterDelete: CollectionAfterDeleteHook[];
} {
  return {
    afterChange: [
      ({ doc, req }) => {
        expire(tags, req.context);
        return doc;
      },
    ],
    afterDelete: [
      ({ doc, req }) => {
        expire(tags, req.context);
        return doc;
      },
    ],
  };
}
