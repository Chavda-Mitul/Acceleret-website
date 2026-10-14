import { expect, test, type Page } from "@playwright/test";

/*
 * Case studies read from the CMS database, so these run against whatever is
 * published there. To publish the imported ones locally:
 *   SEED_PUBLISH=1 npm run seed:work
 * Tests that need a case study skip when none is published.
 */

async function firstCaseStudy(page: Page) {
  await page.goto("/case-studies");
  const link = page.locator(".work-card__link").first();
  if (!(await link.count())) return null;
  return link.getAttribute("href");
}

test("/case-studies lists published case studies and links to them", async ({ page }) => {
  const href = await firstCaseStudy(page);
  test.skip(!href, "no published case studies");
  await page.locator(".work-card__link").first().click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.locator("h1:visible")).toHaveCount(1);
  await expect(page.locator(".case__outcomes li").first()).toBeVisible();
});

test("a case study carries its search and sharing metadata", async ({ page }) => {
  const href = await firstCaseStudy(page);
  test.skip(!href, "no published case studies");
  await page.goto(href!);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/case-studies\//);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /.+/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
});

test("a case study loads without errors and does not widen the page", async ({ page }) => {
  const href = await firstCaseStudy(page);
  test.skip(!href, "no published case studies");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(href!);
  await page.waitForTimeout(800);
  const { scrollW, innerW } = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
  }));
  expect(scrollW).toBeLessThanOrEqual(innerW);
  expect(errors).toEqual([]);
});

test("the sitemap lists published case studies", async ({ page, request }) => {
  const href = await firstCaseStudy(page);
  test.skip(!href, "no published case studies");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain(href!);
});

test("unpublished case studies are not readable without signing in", async ({ request }) => {
  const res = await request.get("/api/case-studies?draft=true&limit=100");
  expect(res.ok()).toBe(true);
  const { docs } = (await res.json()) as { docs: { _status?: string }[] };
  expect(docs.every((d) => d._status === "published")).toBe(true);
});

test("old /work links move to /case-studies", async ({ request }) => {
  for (const [from, to] of [
    ["/work", "/case-studies"],
    ["/work/mahalaxmi-real-estate", "/case-studies/mahalaxmi-real-estate"],
  ]) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toBe(to);
  }
});

test("clicking Read or the card's text opens the case study", async ({ page }) => {
  const href = await firstCaseStudy(page);
  test.skip(!href, "no published case studies");
  for (const part of [".work-card__read", ".work-card__flow p, .work-card__result"]) {
    await page.goto("/case-studies");
    // A real mouse click at the label's position, so anything covering the link is caught.
    const box = await page.locator(`.work-card`).first().locator(part).first().boundingBox();
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  }
});
