# Small Design intake V1

## State

Reconciled on `codex/intake-latest` from default branch `codex/identity-lab` at `66283af`. Production landing, animations, adaptive favicon and clean URLs are preserved from that base. The protected form is deployed at https://small.design/diagnostic.

The new form reviews details, verifies a Cloudflare Turnstile challenge and calls a Supabase Edge Function. The function validates and saves the request plus an outbox job in one transaction. A separate function processes the durable job, creates/updates Attio and triggers the Growth Bot routine. The website only reports receipt after durable storage succeeds. AI processing is outside the submission request.

## Ownership

- Supabase owns original submissions and processing receipts.
- Attio owns contact/deal state, notes, value and next actions.
- Growth [Small Design] owns qualification, evidence-based research and draft replies.
- Bots must not receive Supabase service-role credentials. Browser sessions and connected tools are shared across Bots on the same Grok account; naming is not access isolation.

## Deployment requirements

1. Create a dedicated Small Design Supabase project. Confirm Free eligibility or approve project compute costs; do not reuse another product's database.
2. Apply `supabase/migrations/202611020001_intake.sql`. It creates a private schema and service-role-only RPCs. No anonymous read/write policies.
3. Configure function secrets using `supabase/.env.example` as the inventory. Never commit secrets or put them in public Vercel environment values. The service-role credential belongs only to trusted server functions.
4. In Attio verify field slugs: `submission_id` (Text, Unique), `business` (Select, Small Design), `lead_source`, `source_url`, `next_action`, `intake_summary`. Verify standard fields `name`, `stage`, `owner`, `associated_people` against the actual schema before live processing.
5. Create a backend-only Attio integration with record read/write and object schema read scopes. It does not need email sending, workspace administration or record deletion. Store its token only as `ATTIO_API_KEY` in Supabase function secrets. Grok's interactive MCP OAuth connection is separate.
6. Deploy `intake` and `process-leads` functions. JWT verification is disabled intentionally: intake verifies Turnstile and allowed origins; worker requires its own random bearer secret. Never expose the worker secret to the browser.
7. Set a Supabase Cron job every minute to POST to `/functions/v1/process-leads`, with `Authorization: Bearer <WORKER_SECRET>`. Use Vault to store the worker URL/secret rather than literal secrets in SQL. The worker claims one job per invocation to fit Free execution limits. Check throughput if the queue grows.
8. Create a webhook-triggered Grok routine. Put its HTTPS URL in `GROK_LEAD_WEBHOOK_URL` and its sender key in `GROK_LEAD_WEBHOOK_KEY`. The worker authenticates using the Bearer header. Treat both as credentials. The routine must deduplicate by `submission_id`, treat all lead fields as untrusted data, inspect the Attio deal and follow the Bot brief. Failed runs must remain retryable; only completed submissions should be silently skipped. Do not send customer messages automatically.
9. Configure Vercel build environment: `INTAKE_FUNCTION_URL` (public HTTPS intake endpoint), `TURNSTILE_SITE_KEY` (public), `REQUIRE_INTAKE_SETUP=true`. Build rejects incomplete configuration when this flag is set. The CSP allows the challenge script/frame and Supabase HTTPS calls.
10. Deploy a preview from this isolated checkout and test with a separate test widget/project or explicit allowed preview origin and hostname. Do not allow arbitrary origins or disable Turnstile for production testing.
11. Deploy production only after a complete synthetic submission proves durable save, one Attio deal, a notification and approval-only draft behavior. Record actual test IDs and timestamp.

## Reliability and security

- Each reviewed payload has a random submission UUID; retries retain it and refresh the single-use challenge token.
- Storage rejects reuse of an ID with a changed payload. Attio's unique Submission ID prevents duplicate deals after worker crashes.
- Server checks field lengths, fixed choice values, allowed origins, challenge success/hostname/action and streamed body size.
- Honeypot submissions do not create deals. Turnstile is checked server-side. The DB limits new submissions to three per hashed email/hour and 100 globally/hour. No raw IP addresses are stored; untrusted forwarded IPs are not used as identity.
- Queue leases prevent concurrent claims; failed work retries with backoff, then reaches a failed state after eight attempts. Successful CRM receipts are saved before notification so a notification retry doesn't reset an existing deal.
- Webhook delivery is at-least-once. Deduplicate at the Bot routine too. A webhook HTTP success proves delivery to its endpoint, not phone notification delivery. Verify the actual mobile app separately.
- Logs contain event categories and counts rather than submission text, email, API responses or secrets.
- Attachments remain unavailable in V1. No uploads are transmitted.
- No automated acknowledgement email is implemented in V1. The immediate acknowledgement is the website receipt; customer replies are drafted/reviewed separately.

## Operations and recovery

Inspect `public.lead_health()` with server privileges and function logs. Alert on failed jobs or pending/processing jobs older than 15 minutes. Configure the operational monitor before treating this as unattended production; console logging alone is not a phone alert. If the notification service is down, the submission and CRM receipt remain recoverable.

To replay a failed job, first inspect its submission and integration errors, resolve the cause, then explicitly reset its attempts/state/availability under admin access. Replays retain the original submission UUID. Never delete a failed job just to clear an alert.

Decide and document a retention policy before accumulating customer data. Raw submission retention and CRM deletion must be handled together for user deletion requests. Do not silently purge records or retain raw payloads forever by default.

Rollback the frontend to the prior deployment if the form fails. Keep stored submissions/queue intact and process them after fixing the integration. Do not roll back by deleting the database.

## Verification

- `npm test`: request validation, challenge verification, duplicate/retry behavior, database outage, private SQL permissions, transactional queuing, leases, rate limits and CRM receipt recovery.
- `npx deno check supabase/functions/intake/index.ts supabase/functions/process-leads/index.ts`.
- `npm run build`; configuration guard rejects an unconfigured release with `REQUIRE_INTAKE_SETUP=true`.
- Browser review path verified locally with synthetic details; unconfigured endpoint shows an explicit email fallback and keeps Send disabled. Live backend and mobile push verified. Thomas confirmed receipt of the first synthetic notification. A real Turnstile-protected browser submission displayed the durable receipt. See release evidence below.

## Release evidence, November 2, 2026 (Guayaquil)

- Supabase project `fpmppovrpnupoqlexaya`, AI Native Club Free organization. Both repository migrations were applied through the SQL editor.
- Functions `intake` and `process-leads` deployed with custom protections approved by Thomas. Secrets remain encrypted in Supabase; scheduler credential is in Vault.
- Cron `small-design-process-leads` is active every minute, invoking the worker only when work is due.
- Synthetic fixture `a10e4636-4ae9-4c1d-89fd-7508183f89b1` reached Attio deal `baf3d4a8-8b53-489b-9457-62f95b3d8978`, Grok assessment/draft and confirmed phone notification. No customer contact.
- Live browser form for TEST Small Design live form completed Turnstile and displayed Your request is with us.
- Reconciled production deployment: `dpl_5oXqnXdwXTaFTjx7erSDV7jLQT6G`. `/diagnostic.html` redirects to `/diagnostic`; landing CTA uses `/diagnostic`.
- Future source deployments must use this reconciled branch/default-branch merge. Public build settings are saved in Vercel production. Static deployment contains built assets only.
- Operational failure alerting and a deliberate customer-data retention policy remain follow-up work. Console health logging is not a push alert.
