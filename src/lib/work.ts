import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getPayload, type Where } from "payload";
import config from "@payload-config";
import type { CaseStudy } from "@/payload-types";
import { WORK_TAG } from "@/collections/revalidate";
import { mediaOf } from "@/lib/blog";

/*
 * Case studies for the public site, cached and tagged like the blog
 * (src/lib/blog.ts). The CMS expires the tag whenever a case study or image
 * changes. The local API skips access control, so each query asks for
 * published case studies explicitly.
 */

const published: Where = { _status: { equals: "published" } };

/** Every published case study, in the order set in /admin. */
export async function getCaseStudies(): Promise<CaseStudy[]> {
  "use cache";
  cacheTag(WORK_TAG);
  cacheLife("max");
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "case-studies",
    where: published,
    sort: ["order", "-createdAt"],
    depth: 1,
    pagination: false,
    draft: false,
  });
  return docs;
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  return (await getCaseStudies()).find((c) => c.slug === slug) ?? null;
}

/** The cover as a resolved image, or null when none is set. */
export function coverOf(study: CaseStudy) {
  return mediaOf(study.coverImage);
}

/**
 * The picture shown when a case study is shared: the SEO tab's image, else
 * the cover, else a title card drawn for it (case-studies/[slug]/share.png).
 */
export function caseShareImage(study: CaseStudy) {
  const media = mediaOf(study.meta?.image ?? null) ?? coverOf(study);
  const og = media?.sizes?.og;
  if (media && og?.url) return { url: og.url, width: og.width ?? 1200, height: og.height ?? 630, alt: media.alt };
  if (media) return { url: media.url!, width: media.width ?? 1200, height: media.height ?? 630, alt: media.alt };
  return { url: `/case-studies/${study.slug}/share.png`, width: 1200, height: 630, alt: study.title };
}
