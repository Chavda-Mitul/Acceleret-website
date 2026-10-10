import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end checks against a production build.
 *   npm run build && npm run test:e2e
 * Uses the locally installed Chrome (no browser download). LEADS_FILE=1 lets
 * the contact form deliver to .data/leads.jsonl so the success path is testable.
 */
const PORT = Number(process.env.E2E_PORT ?? 3219);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // Modest parallelism: scroll scenes and many Chrome instances are heavy on smaller machines.
  workers: 4,
  retries: 0,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "chrome",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1440, height: 900 } } },
    {
      name: "mobile-360",
      use: { ...devices["Pixel 5"], channel: "chrome", viewport: { width: 360, height: 780 } },
    },
  ],
  webServer: {
    command: `npx next start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    env: { LEADS_FILE: "1" },
    timeout: 60_000,
  },
});
