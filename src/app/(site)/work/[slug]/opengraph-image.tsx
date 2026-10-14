import { ogImage, ogSize, ogContentType } from "@/lib/og";
import { caseStudies, getCaseStudy } from "@/content/work";

export const alt = "Acceleret case study";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  return ogImage(c?.title ?? "Case study", c ? `${c.client} · Work · acceleret.com` : "acceleret.com");
}
