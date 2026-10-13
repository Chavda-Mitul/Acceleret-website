import { ogImage, ogSize, ogContentType } from "@/lib/og";

export const alt = "CRM, ERP, automation, AI, portals and integrations.";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage("CRM, ERP, automation, AI, portals and integrations.", "Services · acceleret.com");
}
