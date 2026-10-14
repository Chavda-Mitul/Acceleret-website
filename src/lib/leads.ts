import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { site } from "@/content/site";

export type Lead = {
  name: string;
  company: string;
  phone: string;
  email: string;
  message: string;
};

type Stamped = Lead & { receivedAt: string; page: string };

/**
 * Delivers a walkthrough request (brief §4 Contact, §6 Form). Every channel
 * that is configured is tried; the request counts as delivered if at least
 * one succeeds.
 *
 * - RESEND_API_KEY        → email to LEADS_TO_EMAIL (default support@acceleret.com)
 * - LEADS_WEBHOOK_URL     → JSON POST, e.g. a Google Apps Script that appends to a
 *                           Sheet the founders can see, or an automation that also
 *                           sends the optional WhatsApp notification
 * - development only      → appended to .data/leads.jsonl so the form works locally
 *
 * With nothing configured in production, delivery fails and the visitor is
 * shown the email and WhatsApp fallbacks instead of a false "thank you".
 */
export async function deliverLead(lead: Lead) {
  const record: Stamped = { ...lead, receivedAt: new Date().toISOString(), page: `${site.url}/contact` };
  const channels: Promise<string>[] = [];

  if (process.env.RESEND_API_KEY) channels.push(sendEmail(record));
  if (process.env.LEADS_WEBHOOK_URL) channels.push(postWebhook(record));
  if (process.env.NODE_ENV !== "production" || process.env.LEADS_FILE === "1") channels.push(saveToFile(record));

  if (channels.length === 0) {
    throw new Error("No lead delivery channel is configured (set RESEND_API_KEY or LEADS_WEBHOOK_URL).");
  }

  const results = await Promise.allSettled(channels);
  for (const r of results) {
    if (r.status === "rejected") console.error("[leads] channel failed:", r.reason);
  }
  if (!results.some((r) => r.status === "fulfilled")) throw new Error("Every lead delivery channel failed.");
}

async function sendEmail(lead: Stamped) {
  const to = process.env.LEADS_TO_EMAIL || site.contact.email;
  const from = process.env.LEADS_FROM_EMAIL || "Acceleret website <website@acceleret.com>";
  const text = [
    "New walkthrough request from acceleret.com",
    "",
    `Name:    ${lead.name}`,
    `Company: ${lead.company}`,
    `Phone:   ${lead.phone}`,
    `Email:   ${lead.email}`,
    "",
    "What the team manages on WhatsApp, Excel or by memory today:",
    lead.message,
    "",
    `Received: ${lead.receivedAt}`,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: lead.email,
      subject: `Walkthrough request: ${lead.company} (${lead.name})`,
      text,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return "email";
}

async function postWebhook(lead: Stamped) {
  const res = await fetch(process.env.LEADS_WEBHOOK_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.LEADS_WEBHOOK_SECRET ? { "X-Leads-Secret": process.env.LEADS_WEBHOOK_SECRET } : {}),
    },
    body: JSON.stringify(lead),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Webhook ${res.status}`);
  return "webhook";
}

async function saveToFile(lead: Stamped) {
  const dir = path.join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "leads.jsonl"), `${JSON.stringify(lead)}\n`, "utf8");
  return "file";
}
