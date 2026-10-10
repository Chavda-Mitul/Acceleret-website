import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Alongside custom work, we build products of our own.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage("Alongside custom work, we build products of our own.", "Products · acceleret.com");
}
