import { expect, test } from "@playwright/test";
for (const [width, height] of [
  [375, 667],
  [375, 548],
  [320, 568],
  [1440, 900],
]) {
  test(`landing fits ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("canvas").first()).toHaveAttribute(
      "data-phase",
      "idle",
    );
    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      ctaBottom: document.querySelector(".diagnostic")!.getBoundingClientRect()
        .bottom,
      h1: getComputedStyle(document.querySelector("h1")!).fontSize,
      h2: getComputedStyle(document.querySelector(".contact-copy h2")!)
        .fontSize,
      body: getComputedStyle(document.querySelector(".bottom-copy p")!)
        .fontSize,
      footer: getComputedStyle(document.querySelector(".contact-copy p")!)
        .fontSize,
    }));
    expect(metrics.overflow).toBe(false);
    expect(metrics.ctaBottom).toBeLessThanOrEqual(height);
    expect(metrics.h1).toBe(metrics.h2);
    expect(metrics.body).toBe(metrics.footer);
    await expect(page.locator(".footer-motion img")).toBeVisible();
  });
}
test("diagnostic validates, reviews and preserves edits", async ({ page }) => {
  await page.goto("/diagnostic");
  await page.getByRole("button", { name: "Review my request" }).click();
  await expect(page.getByText("Please add your name.")).toBeVisible();
  await expect(page.getByLabel("Your name", { exact: true })).toBeFocused();
  await page.getByLabel("Your name", { exact: true }).fill("Test migration");
  await page.getByLabel("Work email", { exact: true }).fill("test@example.com");
  await page
    .getByRole("radio", { name: "Starting from scratch", exact: true })
    .check();
  await page.getByRole("checkbox", { name: "Brand", exact: true }).check();
  await page
    .getByRole("radio", { name: "A clearer story", exact: true })
    .check();
  await page.getByRole("radio", { name: "Founder / CEO", exact: true }).check();
  await page.getByRole("button", { name: "Review my request" }).click();
  await expect(
    page.getByRole("heading", { name: "Your starting point." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send my request" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "← Edit my request" }).click();
  await expect(page.getByLabel("Your name", { exact: true })).toHaveValue(
    "Test migration",
  );
});
test("clean diagnostic has route metadata and an accessible mobile form", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/diagnostic");
  await expect(page).toHaveTitle("Your diagnostic — Small");
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    "https://small.design/diagnostic",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await expect(page.getByLabel("Work email", { exact: true })).toHaveAttribute(
    "type",
    "email",
  );
});
