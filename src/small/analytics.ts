type DiagnosticEvent =
  | "small_landing_viewed"
  | "small_diagnostic_clicked"
  | "small_diagnostic_submitted";

const projectToken = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN?.trim();
const endpoint = "https://us.i.posthog.com/i/v0/e/";
const sessionKey = "small-analytics-session";
const campaignKeys = ["utm_source", "utm_medium", "utm_campaign"] as const;

let landingCaptured = false;

export function captureDiagnosticEvent(event: DiagnosticEvent) {
  if (!projectToken?.startsWith("phc_") || location.hostname !== "small.design")
    return;

  if (event === "small_landing_viewed" && landingCaptured) return;

  try {
    const saved = sessionStorage.getItem(sessionKey);
    const session = saved
      ? (JSON.parse(saved) as { id: string; campaign: Record<string, string> })
      : { id: crypto.randomUUID(), campaign: {} };
    const query = new URLSearchParams(location.search);
    for (const key of campaignKeys) {
      const value = query.get(key);
      if (!session.campaign[key] && value && /^[a-z0-9_-]{1,64}$/i.test(value))
        session.campaign[key] = value;
    }
    sessionStorage.setItem(sessionKey, JSON.stringify(session));
    if (event === "small_landing_viewed") landingCaptured = true;

    void fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      credentials: "omit",
      referrerPolicy: "no-referrer",
      keepalive: true,
      body: JSON.stringify({
        api_key: projectToken,
        event,
        properties: {
          distinct_id: session.id,
          $process_person_profile: false,
          $ip: null,
          $geoip_disable: true,
          ...session.campaign,
        },
      }),
    }).catch(() => {});
  } catch {
    // Analytics is optional when browser storage or capture is unavailable.
  }
}
