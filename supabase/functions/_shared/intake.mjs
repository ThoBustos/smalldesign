export class InputError extends Error {}
const choices = {
  stage: ['Starting from scratch', 'Improving something existing'],
  focus: ['Positioning', 'Brand', 'Website', 'Product', 'Help me decide'],
  goal: ['A clearer story', 'A stronger identity', 'A better experience', 'A new launch', 'Not sure yet'],
  role: ['Founder / CEO', 'Marketing / Growth', 'Product / Engineering', 'Design', 'Other'],
  size: ['', 'Just me', '2–10', '11–50', '51–200', '201+'],
};
export function normalizeSubmission(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new InputError('Invalid request.');
  const text = (key, max, required = false) => {
    if (raw[key] != null && typeof raw[key] !== 'string') throw new InputError(`Invalid ${key}.`);
    const value = (raw[key] || '').trim();
    if (value.length > max || (required && !value)) throw new InputError(`Please check ${key}.`);
    return value;
  };
  const id = text('submission_id', 36, true);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new InputError('Invalid submission identifier.');
  const name = text('name', 100, true), email = text('email', 254, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(name)) throw new InputError('Please check your name and email.');
  let website = text('website', 500);
  if (website) {
    let url;
    try { url = new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`); } catch { throw new InputError('Please check your website.'); }
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) throw new InputError('Please check your website.');
    website = url.href;
  }
  const data = { submission_id: id, name, email, website, note: text('note', 1500) };
  for (const key of ['stage', 'goal', 'role', 'size']) {
    const value = text(key, 80, key !== 'size');
    if (!choices[key].includes(value)) throw new InputError(`Please check ${key}.`);
    data[key] = value;
  }
  if (!Array.isArray(raw.focus) || !raw.focus.length || raw.focus.length > 5 || raw.focus.some(v => !choices.focus.includes(v))) throw new InputError('Please choose a focus.');
  data.focus = [...new Set(raw.focus)];
  data.source = 'Website diagnostic';
  data.source_url = 'https://small.design/diagnostic';
  data.attribution = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const value = raw.attribution?.[key];
    if (typeof value === 'string' && value.length <= 200) data.attribution[key] = value;
  }
  data.honeypot = text('company_fax', 500);
  return data;
}
export async function sha256(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(v => v.toString(16).padStart(2, '0')).join('');
}
export async function handleIntake(request, deps) {
  const origin = request.headers.get('origin');
  const allowed = deps.allowedOrigins.includes(origin);
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' };
  if (allowed) Object.assign(headers, { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type' });
  const respond = (status, body) => new Response(JSON.stringify(body), { status, headers });
  if (!allowed) return respond(403, { error: 'Origin not allowed.' });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return respond(405, { error: 'Method not allowed.' });
  if (!request.headers.get('content-type')?.startsWith('application/json')) return respond(415, { error: 'Expected JSON.' });
  try {
    // Bound streaming reads as well as Content-Length. Never buffer an unbounded body.
    if (Number(request.headers.get('content-length') || 0) > 12000) return respond(413, { error: 'Request too large.' });
    const reader = request.body?.getReader();
    if (!reader) throw new InputError('Invalid request.');
    let size = 0; const chunks = [];
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 12000) { await reader.cancel(); return respond(413, { error: 'Request too large.' }); } chunks.push(value); }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    let raw; try { raw = JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new InputError('Invalid JSON.'); }
    const data = normalizeSubmission(raw);
    if (data.honeypot) return respond(200, { received: true });
    delete data.honeypot;
    if (typeof raw.turnstile_token !== 'string' || !raw.turnstile_token || raw.turnstile_token.length > 2048) throw new InputError('Please complete the security check.');
    // Do not trust a caller-provided forwarded IP. The verified Turnstile token is
    // mandatory; a global DB budget plus hashed email limits bounds abuse without it.
    const result = await deps.verifyTurnstile(raw.turnstile_token);
    if (!result.success || !deps.hostnames.includes(result.hostname) || result.action !== 'diagnostic') throw new InputError('Security check expired. Please try again.');
    const fingerprint = await sha256(JSON.stringify(data));
    const saved = await deps.save(data, fingerprint, await sha256(`${deps.rateSalt}:${data.email}`));
    if (saved.status === 'limited') return respond(429, { error: 'Too many requests. Please try later or email human@small.design.' });
    if (saved.status === 'conflict') return respond(409, { error: 'This request changed. Please review and submit again.' });
    return respond(200, { received: true, submission_id: data.submission_id });
  } catch (error) {
    if (error instanceof InputError) return respond(400, { error: error.message });
    deps.log?.('intake_failed');
    return respond(503, { error: 'We could not save your request. Please retry or email human@small.design.' });
  }
}
