import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Embed, map, build, run.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage("Embed, map, build, run.", "How we work · acceleret.com");
}
