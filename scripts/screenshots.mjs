import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const outputDir = "screenshots";
const previewUrl = "http://127.0.0.1:4175/";
const viewports = [
  ["mobile", { width: 390, height: 844 }],
  ["tablet", { width: 768, height: 1024 }],
  ["desktop", { width: 1440, height: 1000 }],
  ["wide", { width: 1920, height: 1200 }],
];
await mkdir(outputDir, { recursive: true });

const preview = spawn("npm", ["run", "preview", "--", "--port", "4175", "--strictPort"], {
  stdio: "inherit",
});

const waitForPreview = async () => {
  const deadline = Date.now() + 15000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(previewUrl);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw new Error(`Preview server did not start on ${previewUrl}`);
};

await waitForPreview();

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();

  for (const [viewportName, viewport] of viewports) {
    await page.setViewportSize(viewport);
    await page.goto(previewUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(4700);
    await page.screenshot({
      path: `${outputDir}/plane-${viewportName}.png`,
      fullPage: false,
    });
  }
} finally {
  await browser.close();
  preview.kill();
}
