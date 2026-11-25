export const TRACKED_HOSTS = ["small.design", "www.small.design"] as const;

export const DIAGNOSTIC_EVENTS = [
  "small_landing_viewed",
  "small_diagnostic_clicked",
  "small_diagnostic_submitted",
] as const;

export type DiagnosticEvent = (typeof DIAGNOSTIC_EVENTS)[number];

export function isTrackedHost(hostname: string) {
  return (TRACKED_HOSTS as readonly string[]).includes(hostname);
}

export function analyticsToken(token: string | undefined) {
  const trimmed = token?.trim();
  return trimmed?.startsWith("phc_") ? trimmed : undefined;
}

/** Click events must leave the page immediately, so they skip the batch queue. */
export function captureOptions(event: DiagnosticEvent) {
  if (event !== "small_diagnostic_clicked") return undefined;
  return { transport: "sendBeacon" as const, send_instantly: true };
}
