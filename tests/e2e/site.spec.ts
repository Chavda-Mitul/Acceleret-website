import { expect, test, type Page } from "@playwright/test";

const routes = ["/", "/services", "/how-we-work", "/products", "/work", "/work/sample-textile-exporter", "/team", "/contact", "/privacy"];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}

for (const path of routes) {
  test(`${path} loads with one h1 and no console errors`, async ({ page }) => {
    const errors = collectErrors(page);
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1:visible")).toHaveCount(1);
    await page.waitForTimeout(800);
    expect(errors).toEqual([]);
  });

  test(`${path} has no horizontal overflow`, async ({ page }) => {
    await page.goto(path);
    await page.waitForTimeout(500);
    const { scrollW, innerW } = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
    }));
    expect(scrollW).toBeLessThanOrEqual(innerW);
  });
}

test("unknown pages return 404 with a way back", async ({ page }) => {
  const res = await page.goto("/not-a-real-page");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "Go to the home page" })).toBeVisible();
});

test("primary CTA leads to the contact form", async ({ page }) => {
  await page.goto("/");
  await page.locator("main").getByRole("link", { name: "Book a walkthrough" }).first().click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByLabel("Name")).toBeVisible();
});

test("service tiles link to their anchors on /services", async ({ page }) => {
  await page.goto("/");
  const crm = page.locator('a[href="/services#crm"]').first();
  await crm.scrollIntoViewIfNeeded();
  await crm.click();
  await expect(page).toHaveURL(/\/services#crm$/);
  await expect(page.locator("#crm h2")).toBeVisible();
});

test("main navigation reaches every page", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop navigation");
  await page.goto("/");
  for (const name of ["Services", "How we work", "Products", "Work", "Contact"]) {
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name, exact: true }).click();
    await expect(page.locator("h1:visible")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name, exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }
});

test("mobile menu opens, navigates and closes", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile menu");
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  const dialog = page.getByRole("dialog", { name: "Menu" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("link", { name: "How we work" }).click();
  await expect(page).toHaveURL(/\/how-we-work$/);
  await expect(dialog).toBeHidden();
});

test("contact form explains what to fix, then sends", async ({ page }) => {
  await page.goto("/contact");
  const form = page.locator("form.lead-form");
  await form.getByRole("button", { name: "Book a walkthrough" }).click();
  await expect(form.getByText("Enter your name.")).toBeVisible();
  await expect(form.getByLabel("Name")).toBeFocused();

  await form.getByLabel("Name").fill("Test Person");
  await form.getByLabel("Company").fill("Test Textiles");
  await form.getByLabel("Phone").fill("12");
  await form.getByLabel("Email").fill("not-an-email");
  await form.getByLabel("What does your team currently manage").fill("Orders come in on WhatsApp groups.");
  await form.getByRole("button", { name: "Book a walkthrough" }).click();
  await expect(page.getByText("Enter a phone number with 8–15 digits", { exact: false })).toBeVisible();
  await expect(page.getByText("Enter an email address like name@company.com.")).toBeVisible();

  await form.getByLabel("Phone").fill("+91 98765 43210");
  await form.getByLabel("Email").fill("test@example.com");
  await page.waitForTimeout(2600); // the form ignores submissions faster than a person can type
  await form.getByRole("button", { name: "Book a walkthrough" }).click();
  await expect(page.getByRole("heading", { name: /Thanks, Test\. We've got it\./ })).toBeVisible();
});

test("reduced motion shows the finished drawings", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator(".hs-map")).toHaveAttribute("data-phase", "built");
  await ctx.close();
});

test("reduced-motion devices start calm and can switch on full animation", async ({ browser, isMobile }) => {
  test.skip(isMobile, "pinned scenes are desktop-only");
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "calm");
  await expect(page.locator(".pscene")).not.toHaveClass(/is-pinned/);
  await page.getByRole("button", { name: "Play full animation" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
  await expect(page.locator(".pscene")).toHaveClass(/is-pinned/);
  // the choice is remembered
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
  await expect(page.getByRole("button", { name: "Play full animation" })).toHaveCount(0);
  await ctx.close();
});

test("full motion pins the problem scene and runs the services journey sideways", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop scenes");
  await page.goto("/");
  await expect(page.locator(".pscene")).toHaveClass(/is-pinned/);
  await expect(page.locator(".journey")).toHaveClass(/is-horizontal/);
});

test("pressing turns the arrow into a pencil that draws, and scrolling rubs it out", async ({ page, isMobile }) => {
  test.skip(isMobile, "mouse and pen only");
  await page.goto("/");
  const html = page.locator("html");
  const layer = page.locator(".pencil-layer");
  await expect(layer).toBeHidden();
  await page.mouse.click(720, 820);
  await expect(layer).toBeHidden(); // a click never leaves a mark
  await page.mouse.move(200, 470);
  await page.mouse.down();
  await expect(html).toHaveClass(/is-pressing/);
  for (let i = 1; i <= 20; i++) await page.mouse.move(200 + i * 15, 470 + Math.sin(i / 2) * 12);
  await page.mouse.up();
  await expect(layer).toBeVisible();
  await expect(html).not.toHaveClass(/is-pressing|is-drawing/);
  // the pencil rests, and the sketch is inked over in the route's blue
  await expect
    .poll(() =>
      layer.evaluate((c: HTMLCanvasElement) => {
        const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
        for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && d[i + 2] > 200 && d[i] < 80 && d[i + 1] < 120) return true;
        return false;
      }),
    )
    .toBe(true);
  await page.mouse.wheel(0, 400);
  await expect(layer).toBeHidden();
});

test("hero sketches every kind of software, then builds it", async ({ page }) => {
  await page.goto("/");
  const map = page.locator(".hs-map");
  await expect(map).toHaveAttribute("data-phase", "sketch");
  await expect(map).toHaveAttribute("data-phase", "built");
  await expect(page.locator(".hs-obj")).toHaveCount(7);
  await expect(page.locator(".hs-obj__label").filter({ hasText: "CRM" })).toBeVisible();
});
