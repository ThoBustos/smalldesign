import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
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
    plugins: [react()],
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
    define: { __INTAKE_CONFIG__: JSON.stringify({ endpoint, siteKey }) },
  };
});
