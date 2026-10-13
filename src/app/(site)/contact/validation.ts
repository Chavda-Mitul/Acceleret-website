/** Shared by the form (instant feedback) and the server action (the real check). */

export type LeadField = "name" | "company" | "phone" | "email" | "message";
export type LeadValues = Record<LeadField, string>;
export type LeadErrors = Partial<Record<LeadField, string>>;

export const limits: Record<LeadField, number> = {
  name: 100,
  company: 140,
  phone: 30,
  email: 160,
  message: 3000,
};

export function validateLead(v: LeadValues): LeadErrors {
  const errors: LeadErrors = {};
  if (!v.name.trim()) errors.name = "Enter your name.";
  if (!v.company.trim()) errors.company = "Enter your company name.";
  const digits = v.phone.replace(/\D/g, "");
  if (!v.phone.trim()) errors.phone = "Enter a phone number we can call.";
  else if (!/^[+(\d][\d\s().-]*$/.test(v.phone.trim()) || digits.length < 8 || digits.length > 15)
    errors.phone = "Enter a phone number with 8–15 digits, for example +91 98765 43210.";
  if (!v.email.trim()) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) errors.email = "Enter an email address like name@company.com.";
  if (v.message.trim().length < 10) errors.message = "Add a sentence or two so we can prepare for the call.";
  (Object.keys(limits) as LeadField[]).forEach((k) => {
    if (v[k].length > limits[k]) errors[k] = `Keep this under ${limits[k]} characters.`;
  });
  return errors;
}
