import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DIAGNOSTIC_EVENTS,
  analyticsToken,
  captureOptions,
  isTrackedHost,
} from "../src/small/analytics-policy.ts";

const vercel = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8")) as {
  headers: { headers: { key: string; value: string }[] }[];
  redirects: {
    source: string;
    destination: string;
    permanent?: boolean;
    has?: { type: string; value: string }[];
  }[];
};
const csp = vercel.headers[0].headers.find((header) => header.key === "Content-Security-Policy")!.value;
const directive = (name: string) =>
  csp
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(name + " "));

test("production hosts are tracked and previews are not", () => {
  assert.equal(isTrackedHost("small.design"), true);
  assert.equal(isTrackedHost("www.small.design"), true);
  for (const hostname of [
    "localhost",
    "127.0.0.1",
    "smalldesign.vercel.app",
    "small-design-git-main-thobustos.vercel.app",
    "preview.small.design",
  ]) {
    assert.equal(isTrackedHost(hostname), false, hostname);
  }
});

test("only a public project token enables capture", () => {
  assert.equal(analyticsToken("  phc_example  "), "phc_example");
  assert.equal(analyticsToken("phx_secret"), undefined);
  assert.equal(analyticsToken("  "), undefined);
  assert.equal(analyticsToken(undefined), undefined);
});

test("the diagnostic click is sent immediately with sendBeacon", () => {
  assert.deepEqual(captureOptions("small_diagnostic_clicked"), {
    transport: "sendBeacon",
    send_instantly: true,
  });
  assert.equal(captureOptions("small_landing_viewed"), undefined);
  assert.equal(captureOptions("small_diagnostic_submitted"), undefined);
});

test("the named funnel events stay in place", () => {
  assert.deepEqual(DIAGNOSTIC_EVENTS, [
    "small_landing_viewed",
    "small_diagnostic_clicked",
    "small_diagnostic_submitted",
  ]);
});

test("CSP allows PostHog connections without a remote script", () => {
  const scripts = directive("script-src");
  assert.equal(scripts, "script-src 'self' https://challenges.cloudflare.com");
  assert.equal(scripts?.includes("posthog"), false);
  const connect = directive("connect-src");
  assert.equal(connect?.includes("https://us.i.posthog.com"), true);
  assert.equal(connect?.includes("https://us-assets.i.posthog.com"), true);
  assert.equal(connect?.includes("https://fpmppovrpnupoqlexaya.supabase.co"), true);
});

test("www redirects permanently to the apex and keeps path and query", () => {
  const redirect = vercel.redirects.find((rule) =>
    rule.has?.some((condition) => condition.value === "www.small.design"),
  );
  assert.ok(redirect);
  assert.equal(redirect.permanent, true);
  assert.equal(redirect.source, "/:path*");
  assert.equal(redirect.destination, "https://small.design/:path*");
  assert.equal(redirect.destination.includes("?"), false);
  assert.equal(
    vercel.redirects.some(
      (rule) => rule.source === "/diagnostic.html" && rule.destination === "/diagnostic" && rule.permanent === true,
    ),
    true,
  );
});
