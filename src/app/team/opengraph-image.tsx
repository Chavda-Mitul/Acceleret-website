import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Who we are.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage("Who we are.", "Team · acceleret.com");
}
