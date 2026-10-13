import { ogImage } from "@/lib/og";
import { getPost } from "@/lib/blog";

/** Title card for sharing an article that has no image of its own (see shareImage in src/lib/blog.ts). */
export async function GET(_request: Request, ctx: RouteContext<"/blog/[slug]/share.png">) {
  const { slug } = await ctx.params;
  const post = await getPost(slug);
  if (!post) return new Response("Not found", { status: 404 });
  return ogImage(post.title, "acceleret.com/blog");
}
