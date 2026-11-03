// Fixed transactional copy. Lead text is never interpreted as instructions or HTML.
export function acknowledgementMessage(job) {
  return {
    from: 'Small Design <human@small.design>',
    to: [job.email],
    reply_to: 'human@small.design',
    subject: 'We received your Small Diagnostic request',
    text: 'Thanks for reaching out to Small Design.\n\nWe received your diagnostic request and will review it personally. If you would like to add anything, just reply to this email.\n\nThomas\nSmall Design',
    tags: [{ name: 'business', value: 'small-design' }, { name: 'flow', value: 'diagnostic-receipt-v1' }],
  };
}
export async function processAcknowledgement(job, deps) {
  // Resend remembers idempotency keys for 24 hours. Stop earlier rather than risk
  // duplicating a send whose provider receipt was lost during a prolonged outage.
  if (deps.now() - Date.parse(job.first_attempt_at) >= 20 * 60 * 60 * 1000) {
    await deps.retry(job.id, job.lease, 'receipt_window_expired', true);
    return 'review';
  }
  try {
    const id = await deps.send(acknowledgementMessage(job), `small-design/diagnostic-receipt-v1/${job.id}`);
    await deps.finish(job.id, job.lease, id);
    return 'accepted';
  } catch (error) {
    await deps.retry(job.id, job.lease, error.code || 'acknowledgement_failed', false);
    return 'retry';
  }
}
export function resendSender(key, fetcher = fetch) {
  return async (message, idempotencyKey) => {
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(message), signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw Object.assign(new Error('Resend request failed'), { code: `resend_${response.status}` });
    const result = await response.json();
    if (typeof result.id !== 'string' || !result.id) throw new Error('Missing provider receipt');
    return result.id;
  };
}
