import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Privacy, short and plain.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage("Privacy, short and plain.", "acceleret.com");
}
