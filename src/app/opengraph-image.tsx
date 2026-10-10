import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "Software built around how your business works.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage("Software built around how your business works.", "CRM, ERP, portals, apps and workflow automation · Surat");
}
