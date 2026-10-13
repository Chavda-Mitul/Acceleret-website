import { expect, test, type Page } from "@playwright/test";

/*
 * The blog reads from the CMS database, so these run against whatever is
 * published there. For a predictable article, publish the example first:
 *   SEED_PUBLISH=1 npm run seed:blog
 * Tests that need an article skip when none is published.
 */

async function firstArticle(page: Page) {
  await page.goto("/blog");
  const link = page.locator(".post-card__link").first();
  if (!(await link.count())) return null;
  return link.getAttribute("href");
}

test("/blog lists published articles and links to them", async ({ page }) => {
  const res = await page.goto("/blog");
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1:visible")).toHaveCount(1);
  const href = await firstArticle(page);
  test.skip(!href, "no published articles");
  await page.locator(".post-card__link").first().click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.locator("h1:visible")).toHaveCount(1);
});

test("an article carries its search and sharing metadata", async ({ page }) => {
  const href = await firstArticle(page);
  test.skip(!href, "no published articles");
  await page.goto(href!);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/blog\//);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /.+/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);

  const types = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent || "{}")["@type"]));
  expect(types).toContain("BlogPosting");
  expect(types).toContain("BreadcrumbList");
});

test("an article does not widen the page on small screens", async ({ page }) => {
  const href = await firstArticle(page);
  test.skip(!href, "no published articles");
  await page.goto(href!);
  await page.waitForTimeout(500);
  const { scrollW, innerW } = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
  }));
  expect(scrollW).toBeLessThanOrEqual(innerW);
});

test("feed and sitemap list the articles", async ({ page, request }) => {
  const href = await firstArticle(page);
  test.skip(!href, "no published articles");
  const rss = await request.get("/blog/rss.xml");
  expect(rss.headers()["content-type"]).toContain("application/rss+xml");
  expect(await rss.text()).toContain(href!);
  expect(await (await request.get("/sitemap.xml")).text()).toContain(href!);
});

test("the CMS stays out of search engines", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
  const admin = await request.get("/admin", { maxRedirects: 0 });
  expect(admin.headers()["x-robots-tag"]).toContain("noindex");
});

test("drafts are not readable without signing in", async ({ request }) => {
  const res = await request.get("/api/posts?draft=true&limit=100");
  expect(res.ok()).toBe(true);
  const { docs } = (await res.json()) as { docs: { _status?: string }[] };
  expect(docs.every((d) => d._status === "published")).toBe(true);
});
