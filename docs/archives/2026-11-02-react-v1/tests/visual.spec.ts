import { expect, test } from "@playwright/test";

const viewports = [
  ["mobile", { width: 390, height: 844 }],
  ["tablet", { width: 768, height: 1024 }],
  ["desktop", { width: 1440, height: 1000 }],
] as const;

for (const [name, viewport] of viewports) {
  test(`landing page ${name} visual snapshot`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });

    await expect(page).toHaveScreenshot(`landing-${name}.png`, {
      fullPage: false,
      maxDiffPixelRatio: 0.04,
    });
  });
}
