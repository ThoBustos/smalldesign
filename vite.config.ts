import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

function previewRoutes(): Plugin {
  return {
    name: "small-preview-routes",
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") return next();
        const requestUrl = new URL(req.url ?? "/", "http://127.0.0.1");
        const pathname = decodeURIComponent(requestUrl.pathname);
        if (pathname.includes("\0") || pathname.split("/").includes(".."))
          return next();
        const bare = pathname.replace(/\/+$/, "") || "/";
        if (bare === "/diagnostic") {
          req.url = "/diagnostic/index.html" + requestUrl.search;
          return next();
        }
        const dist = path.resolve("dist");
        const candidate = path.resolve(dist, bare.replace(/^\/+/, ""));
        if (candidate !== dist && !candidate.startsWith(dist + path.sep))
          return next();
        const hasFile =
          bare === "/" ||
          [candidate, `${candidate}.html`, path.join(candidate, "index.html")].some(
            (file) => fs.existsSync(file) && fs.statSync(file).isFile(),
          );
        if (hasFile) return next();
        const accept = req.headers.accept ?? "";
        if (accept && !accept.includes("text/html") && !accept.includes("*/*"))
          return next();
        const missing = path.join(dist, "404.html");
        if (!fs.existsSync(missing)) return next();
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        if (req.method === "HEAD") {
          res.end();
          return;
        }
        res.end(fs.readFileSync(missing));
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  const endpoint = env.INTAKE_FUNCTION_URL || "",
    siteKey = env.TURNSTILE_SITE_KEY || "";
  if (Boolean(endpoint) !== Boolean(siteKey))
    throw Error("Configure both INTAKE_FUNCTION_URL and TURNSTILE_SITE_KEY.");
  if (env.REQUIRE_INTAKE_SETUP === "true" && (!endpoint || !siteKey))
    throw Error("Production intake is not configured.");
  if (endpoint && new URL(endpoint).protocol !== "https:")
    throw Error("Intake endpoint must use HTTPS.");
  return {
    plugins: [react(), previewRoutes()],
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
    define: { __INTAKE_CONFIG__: JSON.stringify({ endpoint, siteKey }) },
  };
});
