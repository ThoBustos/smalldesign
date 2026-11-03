# Small Design email operations

## Intended flow

A validated diagnostic submission is saved in Supabase. An atomic database trigger queues a fixed acknowledgement for new submissions only. The existing scheduled worker handles acknowledgement and CRM/agent work independently. Resend sends from Small Design <human@small.design>, with replies routed to human@small.design in Workspace Gmail. No AI-generated content, booking link, promises, pricing or lead text appears in this receipt.

Grok uses Gmail for personal conversations. Start with read/draft and specific approval before sending. Configure and test the verified human@small.design sender identity. Labels are selection rules, not mailbox access boundaries: the centralized Gmail account contains other brands. Inspect OAuth scope and Grok connection sharing before accepting. If stricter technical isolation is needed, use a dedicated Small Design mailbox rather than claiming labels isolate data.

## Provisioning checklist

1. Sign up/log into Resend under AI Native Club. Use Free; do not purchase or add other brands.
2. Add only small.design as a sending domain. Keep Google Workspace root MX untouched. Add the Resend DKIM and the dedicated return-path DNS records shown by Resend in the Letstalk AI Cloudflare profile. Verify sender domain before sending.
3. Create a sending-only API key restricted to small.design. Store only in Supabase function secret RESEND_API_KEY.
4. Keep RESEND_ACK_ENABLED=false. Deploy updated process-leads and resend-events. Apply only migration 202611020003_acknowledgements.sql, once. Existing migrations are already live. There is no backfill and no automatic mail to old leads.
5. Create one Resend webhook to https://fpmppovrpnupoqlexaya.supabase.co/functions/v1/resend-events for sent, delivered, delivery_delayed, bounced, complained, failed and suppressed events supported by Resend. Store its signing secret only in RESEND_WEBHOOK_SECRET. The public endpoint verifies raw-body Svix signatures; disabling the legacy JWT gate requires action-time user approval.
6. Enable RESEND_ACK_ENABLED=true only once DNS, secrets, migration and signature verification are confirmed. Submit a clearly labeled fresh test to an inbox Thomas controls. Verify receipt, From, Reply-To, one acknowledgement, one CRM record and the phone alert. Never test sending to an invented third-party inbox.
7. Check intake_private.acknowledgement_status. State accepted is an API receipt, not proof of delivery. Inspect latest_delivery_event and the event history. Signed delivery events may arrive before the API receipt is persisted; they reconcile by provider ID afterward.

## Reliability

The provider idempotency key uses flow version and submission UUID. Payload and sender are fixed for version 1. Do not alter this template in place while jobs are retrying; version a new flow instead. Resend retains keys for 24 hours. Unknown receipts stop for review after 20 hours from first attempt, preventing blind resend beyond that guarantee. Eight attempts cap retries. Database leases prevent concurrent workers. Suppression/bounce/complaint events are tracked, never used to auto-resend. Logs contain categories only. No credentials or original webhook payloads are committed.

Email failure tracking is stored in the private database. A proactive operational failure push alert remains a separate follow-up; no one should assume the status table itself sends alerts.

## Rollout state

Prepared on codex/small-design-email. Account setup and deployment remain pending browser connectivity. Do not claim Resend or Gmail is connected until verified in their UIs. The deployed lead pipeline remains unchanged.
