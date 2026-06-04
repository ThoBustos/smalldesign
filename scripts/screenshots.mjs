import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const outputDir = "screenshots";
const viewports = [
  ["mobile", { width: 390, height: 844 }],
  ["tablet", { width: 768, height: 1024 }],
  ["desktop", { width: 1440, height: 1000 }],
  ["wide", { width: 1920, height: 1200 }],
];
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

for (const [viewportName, viewport] of viewports) {
  await page.setViewportSize(viewport);
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await page.waitForTimeout(4700);
  await page.screenshot({
    path: `${outputDir}/plane-${viewportName}.png`,
    fullPage: false,
  });
}

await browser.close();
