/** Deterministic test-only case study; never imported into production. */
import { getPayload } from "payload";
import config from "../payload.config";

const database = new URL(process.env.DATABASE_URI || "postgres://invalid/invalid");
if (process.env.CI !== "true" || database.pathname !== "/acceleret_ci") {
  throw new Error("CI fixtures require CI=true and the acceleret_ci database.");
}

const payload = await getPayload({ config });
const existing = await payload.find({
  collection: "case-studies",
  where: { slug: { equals: "ci-workflow" } },
  limit: 1,
  draft: true,
});
if (!existing.docs.length) {
  await payload.create({
    collection: "case-studies",
    context: { disableRevalidate: true },
    data: {
      title: "A dependable workflow",
      slug: "ci-workflow",
      client: "CI fixture",
      result: "A deterministic example for browser checks.",
      summary: { problem: "Manual handovers.", built: "One shared workflow.", changed: "Clear ownership." },
      situation: "A test team coordinates work across a spreadsheet.",
      whatWeBuilt: "A shared application tracks each request and its owner.",
      features: [{ text: "A shared queue" }],
      outcomes: [{ label: "Clear ownership" }],
      tags: ["Operations", "Platform"],
      techStack: ["Next.js", "PostgreSQL"],
      _status: "published",
    },
  });
}
process.exit(0);
