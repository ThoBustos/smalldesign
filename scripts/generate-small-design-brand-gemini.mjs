import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
const model = process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";
const imagenModel = process.env.IMAGEN_MODEL ?? "imagen-4.0-generate-001";
const outputDir = "public/brand";

if (!apiKey) {
  throw new Error("Set GEMINI_API_KEY or GOOGLE_API_KEY before running this script.");
}

const prompt = `
Create a polished brand mark for "small.design".

Visual direction:
- Painterly impressionist mark in the Monet universe.
- A large brush-painted letter S as the central symbol.
- Thick, legible S shape suitable for logo use.
- Warm pale yellow / cream S with hints of soft peach and mint brush variation.
- Clear ultramarine / sky-blue painterly square background.
- Rounded-square app icon composition.
- High contrast, readable at small favicon sizes.
- Minimal texture noise near the edges.
- No extra letters, no words, no watermark, no mockup.

Output:
- Single centered icon.
- Square image.
- Clean enough to become favicon, app icon, and logo mark.
`.trim();

async function generateWithGemini() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ["Image"],
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const parts = data.candidates?.flatMap((candidate) => candidate.content?.parts ?? []) ?? [];
  const imagePart = parts.find((part) => part.inlineData?.data);

  if (!imagePart) {
    throw new Error(`Gemini did not return image data: ${JSON.stringify(data, null, 2)}`);
  }

  return Buffer.from(imagePart.inlineData.data, "base64");
}

async function generateWithImagen() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${imagenModel}:predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
        imageSize: "1K",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Imagen request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const imageBytes = data.predictions?.[0]?.bytesBase64Encoded;

  if (!imageBytes) {
    throw new Error(`Imagen did not return image data: ${JSON.stringify(data, null, 2)}`);
  }

  return Buffer.from(imageBytes, "base64");
}

await mkdir(outputDir, { recursive: true });

const logoPath = `${outputDir}/small-design-mark.png`;
const faviconPath = "public/favicon.png";
const appleTouchIconPath = "public/apple-touch-icon.png";

let png;
try {
  png = await generateWithGemini();
} catch (error) {
  console.warn(error.message);
  console.warn(`Retrying with ${imagenModel}...`);
  png = await generateWithImagen();
}

await writeFile(logoPath, png);

await execFileAsync("sips", ["-z", "512", "512", logoPath, "--out", `${outputDir}/small-design-mark-512.png`]);
await execFileAsync("sips", ["-z", "192", "192", logoPath, "--out", `${outputDir}/small-design-mark-192.png`]);
await execFileAsync("sips", ["-z", "180", "180", logoPath, "--out", appleTouchIconPath]);
await execFileAsync("sips", ["-z", "32", "32", logoPath, "--out", faviconPath]);

console.log(`Generated ${logoPath}`);
console.log(`Generated ${faviconPath}`);
console.log(`Generated ${appleTouchIconPath}`);
