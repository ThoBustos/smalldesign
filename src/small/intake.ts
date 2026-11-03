export type IntakeConfig = { endpoint: string; siteKey: string };
declare const __INTAKE_CONFIG__: IntakeConfig;
export const intakeConfig = __INTAKE_CONFIG__;
export type Lead = {
  name: string;
  email: string;
  website: string;
  stage: string;
  focus: string[];
  goal: string;
  role: string;
  size: string;
  note: string;
  company_fax: string;
  attribution: Record<string, string>;
};
export class IntakeError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function sendLead(lead: Lead, id: string, token: string) {
  const response = await fetch(intakeConfig.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...lead,
      submission_id: id,
      turnstile_token: token,
    }),
    signal: AbortSignal.timeout(20000),
  });
  const result = (await response.json()) as {
    received?: boolean;
    error?: string;
  };
  if (!response.ok || result.received !== true)
    throw new IntakeError(
      response.status === 409
        ? "Your details changed. Please edit and review your request again."
        : result.error || "Your request could not be saved. Please retry.",
      response.status,
    );
  return result;
}
