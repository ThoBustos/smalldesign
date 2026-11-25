/// <reference types="vite/client" />
import posthog from "posthog-js/no-external";
import {
  analyticsToken,
  captureOptions,
  isTrackedHost,
  type DiagnosticEvent,
} from "./analytics-policy";

const projectToken = analyticsToken(import.meta.env.VITE_POSTHOG_PROJECT_TOKEN);

let started = false;
let landingCaptured = false;

export function initAnalytics() {
  if (started || !projectToken || !isTrackedHost(location.hostname)) return;
  try {
    posthog.init(projectToken, {
      api_host: "https://us.i.posthog.com",
      person_profiles: "identified_only",
      persistence: "localStorage+cookie",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false,
      rageclick: false,
      disable_session_recording: true,
      // Remote scripts would violate script-src 'self'. Config is still fetched as JSON.
      disable_external_dependency_loading: true,
    });
    started = true;
  } catch {
    // Analytics is optional and must not block the page.
  }
}

export function captureDiagnosticEvent(event: DiagnosticEvent) {
  if (!started) initAnalytics();
  if (!started) return;
  if (event === "small_landing_viewed") {
    if (landingCaptured) return;
    landingCaptured = true;
  }
  try {
    posthog.capture(event, undefined, captureOptions(event));
  } catch {
    // Analytics is optional when capture is unavailable.
  }
}
