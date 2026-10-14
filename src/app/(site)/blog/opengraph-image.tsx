import { ogImage, ogSize, ogContentType } from "@/lib/og";
import { blog } from "@/content/blog";

export const alt = "Acceleret blog";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage(blog.title, "acceleret.com/blog");
}
