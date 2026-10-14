"use server";

import { headers } from "next/headers";
import { deliverLead } from "@/lib/leads";
import { validateLead, type LeadErrors, type LeadValues } from "./validation";

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  errors: LeadErrors;
  /** Echoed back so a failed submission keeps what was typed (also without JavaScript). */
  values: Partial<LeadValues>;
  /** First name, for the thank-you. */
  name?: string;
};

const MIN_FILL_MS = 2500;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

function read(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

export async function submitWalkthrough(_prev: ContactState, form: FormData): Promise<ContactState> {
  const values: LeadValues = {
    name: read(form, "name"),
    company: read(form, "company"),
    phone: read(form, "phone"),
    email: read(form, "email"),
    message: read(form, "message"),
  };

  // Spam traps: a field people never see, and a form filled faster than a person can.
  const started = Number(read(form, "started"));
  const tooFast = Number.isFinite(started) && started > 0 && Date.now() - started < MIN_FILL_MS;
  if (read(form, "website") || tooFast) {
    return { status: "success", message: "", errors: {}, values: {}, name: values.name.split(" ")[0] };
  }

  const errors = validateLead(values);
  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Some details need another look.", errors, values };
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) {
    return {
      status: "error",
      message: "We've received several requests from this connection. Email support@acceleret.com and we'll pick it up from there.",
      errors: {},
      values,
    };
  }

  try {
    await deliverLead(values);
  } catch (err) {
    console.error("[contact] delivery failed:", err);
    return {
      status: "error",
      message: "Your request didn't reach us. Email support@acceleret.com or message us on WhatsApp, and we'll reply from there.",
      errors: {},
      values,
    };
  }

  return { status: "success", message: "", errors: {}, values: {}, name: values.name.split(" ")[0] };
}
