import { Webhook } from 'npm:svix@2.9.1';
import { databaseClient, requireEnv, serverKey } from '../_shared/services.mjs';
const supported = new Set(['email.sent','email.delivered','email.delivery_delayed','email.bounced','email.complained','email.failed','email.suppressed']);
Deno.serve(async (request: Request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', {status:405});
  const reader = request.body?.getReader();
  if (!reader) return new Response('Missing body', {status:400});
  let size = 0; const chunks: Uint8Array[] = [];
  while (true) {
    const {done,value} = await reader.read(); if(done) break;
    size += value.byteLength;
    if(size > 20000) { await reader.cancel(); return new Response('Too large', {status:413}); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for(const chunk of chunks) {bytes.set(chunk,offset);offset+=chunk.byteLength;}
  let event: {type:string;created_at:string;data:{email_id:string}};
  const eventId = request.headers.get('svix-id') || '';
  try {
    const raw = new TextDecoder().decode(bytes);
    await new Webhook(requireEnv('RESEND_WEBHOOK_SECRET')).verify(raw, {
      'svix-id': eventId, 'svix-timestamp': request.headers.get('svix-timestamp') || '',
      'svix-signature': request.headers.get('svix-signature') || '',
    });
    event = JSON.parse(raw);
  } catch { return new Response('Invalid signature', {status:401}); }
  if (!supported.has(event.type)) return new Response('Ignored', {status:200});
  if (!eventId || typeof event.data?.email_id !== 'string' || !Number.isFinite(Date.parse(event.created_at))) return new Response('Invalid event', {status:400});
  try {
    const rpc = databaseClient(requireEnv('SUPABASE_URL'),serverKey());
    await rpc('record_email_event',{p_event:eventId,p_provider:event.data.email_id,p_type:event.type,p_occurred:event.created_at});
    return new Response('Recorded', {status:200});
  } catch { console.error('email_event_storage_failed'); return new Response('Retry later', {status:503}); }
});
