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
  )
  .replace(
    /(<meta property="og:description" content=")[^"]*(")/,
    "$1Senior design partnership across positioning, brand, websites and products.$2",
  )
  .replace(
    /(<meta property="og:image" content=")[^"]*(")/,
    "$1https://small.design/assets/social.png$2",
  )
  .replace(
    /(<meta property="og:image:alt" content=")[^"]*(")/,
    "$1Small — Built to be understood. Designed to be chosen.$2",
  );
await mkdir("dist/diagnostic", { recursive: true });
await writeFile("dist/diagnostic/index.html", html);
console.log("Built clean /diagnostic entry with route-specific SEO metadata");
