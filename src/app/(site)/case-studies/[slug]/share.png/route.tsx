import { ogImage } from "@/lib/og";
import { getCaseStudy } from "@/lib/work";

/** Title card for sharing a case study that has no image of its own (see caseShareImage in src/lib/work.ts). */
export async function GET(_request: Request, ctx: RouteContext<"/case-studies/[slug]/share.png">) {
  const { slug } = await ctx.params;
  const c = await getCaseStudy(slug);
  if (!c) return new Response("Not found", { status: 404 });
  return ogImage(c.title, `${c.client} · Case studies · acceleret.com`);
}
