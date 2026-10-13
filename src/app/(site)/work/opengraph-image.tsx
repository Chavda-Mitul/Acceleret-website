import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "What we’ve built and what changed.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage("What we’ve built and what changed.", "Work · acceleret.com");
}
