import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const outputDir = "screenshots";
const viewports = [
  ["mobile", { width: 390, height: 844 }],
  ["tablet", { width: 768, height: 1024 }],
  ["desktop", { width: 1440, height: 1000 }],
  ["wide", { width: 1920, height: 1200 }],
];
const directions = ["Signal", "Index", "System"];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

for (const [viewportName, viewport] of viewports) {
  await page.setViewportSize(viewport);
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });

  for (const direction of directions) {
    await page.getByRole("tab", { name: direction }).first().click();
    await page.waitForTimeout(100);
    await page.screenshot({
      path: `${outputDir}/${direction.toLowerCase()}-${viewportName}.png`,
      fullPage: false,
    });
  }
}

await browser.close();
