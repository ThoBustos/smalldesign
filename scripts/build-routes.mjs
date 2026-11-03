import { readFile, mkdir, writeFile } from "node:fs/promises";
let html = await readFile("dist/index.html", "utf8");
html = html
  .replace(/<title>.*?<\/title>/, "<title>Your diagnostic — Small</title>")
  .replace(
    /(<meta name="description" content=")[^"]*(")/,
    "$1Request your Small Diagnostic: a focused review of your brand, website and product, with clear priorities for what comes next.$2",
  )
  .replace(
    /(<link rel="canonical" href=")[^"]*(")/,
    "$1https://small.design/diagnostic$2",
  )
  .replace(
    /(<meta property="og:url" content=")[^"]*(")/,
    "$1https://small.design/diagnostic$2",
  )
  .replace(
    /(<meta property="og:title" content=")[^"]*(")/,
    "$1Your diagnostic — Small$2",
  );
await mkdir("dist/diagnostic", { recursive: true });
await writeFile("dist/diagnostic/index.html", html);
console.log("Built clean /diagnostic entry with route-specific SEO metadata");
