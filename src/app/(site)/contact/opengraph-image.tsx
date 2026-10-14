import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Tell us what runs on WhatsApp and Excel today.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage("Tell us what runs on WhatsApp and Excel today.", "Book a 30-minute operations walkthrough");
}
