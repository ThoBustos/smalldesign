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
      ctaBottom: document.querySelector(".hero-concept-diagnostic")!.getBoundingClientRect()
        .bottom,
    }));
    expect(metrics.overflow).toBe(false);
    expect(metrics.ctaBottom).toBeLessThanOrEqual(height);
    await expect(page.getByRole("heading", { name: "Design for ROI" })).toBeVisible();
    const leftCaption = page.getByRole("heading", { name: "From pitch to product." });
    const rightCaption = page.getByText("From product to market.");
    await expect(leftCaption).toBeVisible();
    await expect(leftCaption).toHaveCSS("rotate", "180deg");
    await expect(rightCaption).toBeVisible();
    await expect(rightCaption).toHaveCSS("rotate", "none");
    await expect(page.locator(".footer-motion img")).toBeVisible();
  });
}
test("mobile wordmark shows a fallback and can play after autoplay is blocked", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    let blocked = false;
    HTMLMediaElement.prototype.play = function () {
      if (!blocked && this.closest(".footer-motion")) {
        blocked = true;
        return Promise.reject(new DOMException("Autoplay blocked", "NotAllowedError"));
      }
      return play.call(this);
    };
  });

  await page.goto("/");
  const panel = page.locator(".footer-motion");
  const poster = panel.getByRole("img", { name: "Small" });
  await expect(poster).toBeVisible();
  await page.getByRole("link", { name: "Scroll to explore" }).click();
  const playButton = page.getByRole("button", { name: "Play animation" });
  await expect(playButton).toBeVisible();
  await expect(poster).toBeVisible();
  await playButton.click();
  await expect(panel).toHaveAttribute("data-playback", "playing");
  await expect(poster).toBeHidden();
});

test("diagnostic validates, reviews and preserves edits", async ({ page }) => {
  await page.goto("/diagnostic");
  await page.getByRole("button", { name: "Review my request" }).click();
  await expect(page.getByText("Please add your name.")).toBeVisible();
  await expect(page.getByLabel("Your name", { exact: true })).toBeFocused();
  await page.getByLabel("Your name", { exact: true }).fill("Test migration");
  await page.getByLabel("Work email", { exact: true }).fill("test@example.com");
  await page.getByText("Starting from scratch", { exact: true }).click();
  await page.getByText("Brand", { exact: true }).click();
  await page.getByText("A clearer story", { exact: true }).click();
  await page.getByText("Founder / CEO", { exact: true }).click();
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
