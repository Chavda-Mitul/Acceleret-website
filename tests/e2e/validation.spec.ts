import { expect, test } from "@playwright/test";
import { validateLead } from "../../src/app/(site)/contact/validation";

const valid = {
  name: "Asha Patel",
  company: "Patel Fabrics",
  phone: "+91 98765 43210",
  email: "asha@example.com",
  message: "Orders arrive on WhatsApp and get typed into Excel.",
};

test.describe("lead validation", () => {
  test.skip(({ isMobile }) => isMobile, "pure logic, run once");

  test("accepts a complete request", () => {
    expect(validateLead(valid)).toEqual({});
  });

  test("names every missing field", () => {
    const errors = validateLead({ name: "", company: "", phone: "", email: "", message: "" });
    expect(Object.keys(errors).sort()).toEqual(["company", "email", "message", "name", "phone"]);
  });

  test("rejects short or malformed phone numbers", () => {
    expect(validateLead({ ...valid, phone: "12345" }).phone).toBeTruthy();
    expect(validateLead({ ...valid, phone: "call me" }).phone).toBeTruthy();
    expect(validateLead({ ...valid, phone: "(0261) 222-3333" }).phone).toBeUndefined();
  });

  test("rejects malformed email and over-long text", () => {
    expect(validateLead({ ...valid, email: "asha@" }).email).toBeTruthy();
    expect(validateLead({ ...valid, message: "x".repeat(3001) }).message).toBeTruthy();
  });
});
