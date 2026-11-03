export async function processLead(job, deps) {
  try {
    const record = job.attio_record_id || await deps.syncCRM(job.payload);
    if (!job.attio_record_id) await deps.recordCRM(job.id, job.lease, record);
    // The receiver must deduplicate on submission_id. Webhook delivery is at-least-once.
    await deps.notify({ submission_id: job.id, business: 'Small Design', attio_record_id: record, lead: job.payload });
    await deps.finish(job.id, job.lease);
    return 'done';
  } catch (error) {
    await deps.retry(job.id, job.lease, error.code || 'processing_failed');
    return 'retry';
  }
}
export function integrationError(code) { return Object.assign(new Error(code), { code }); }
export function attioClient(token, ownerEmail, fetcher = fetch) {
  async function request(path, method, body) {
    const response = await fetcher(`https://api.attio.com/v2/${path}`, {
      method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body == null ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      const code = typeof detail.code === 'string' && /^[a-z_]+$/.test(detail.code) ? detail.code : 'request';
      const step = path.endsWith('/query') ? 'lookup' : path.startsWith('objects/people/') ? 'person' : 'deal';
      throw integrationError(`attio_${step}_${response.status}_${code}`);
    }
    return (await response.json()).data;
  }
  return async data => {
    const existing = await request('objects/deals/records/query', 'POST', {
      filter: { submission_id: { $eq: data.submission_id } }, limit: 1,
    });
    if (existing.length) return existing[0].id.record_id;
    // Do not overwrite existing contact names with a possibly different form name.
    const person = await request('objects/people/records?matching_attribute=email_addresses', 'PUT', {
      data: { values: { email_addresses: [{ email_address: data.email }] } },
    });
    const summary = [
      `Name: ${data.name}`, `Email: ${data.email}`, `Website: ${data.website || 'Not supplied'}`,
      `Starting point: ${data.stage}`, `Focus: ${data.focus.join(', ')}`, `Priority: ${data.goal}`,
      `Role: ${data.role}`, `Team: ${data.size || 'Not supplied'}`, `Note: ${data.note || 'None'}`,
      `Attribution: ${JSON.stringify(data.attribution)}`,
    ].join('\n');
    const deal = await request('objects/deals/records?matching_attribute=submission_id', 'PUT', {
      data: { values: {
        name: `Diagnostic: ${data.name}`, stage: 'New',
        owner: [{ workspace_member_email_address: ownerEmail }],
        associated_people: [{ target_object: 'people', target_record_id: person.id.record_id }],
        submission_id: data.submission_id, business: 'Small Design',
        lead_source: data.source, source_url: data.source_url,
        next_action: 'Review inquiry and draft a personal reply', intake_summary: summary,
      } },
    });
    return deal.id.record_id;
  };
}
