import { databaseClient, requireEnv, serverKey } from '../_shared/services.mjs';
import { attioClient, integrationError, processLead } from '../_shared/worker.mjs';
const rpc = databaseClient(requireEnv('SUPABASE_URL'), serverKey());
const digest = async (v: string) => new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)));
async function authorized(request: Request) {
  const actual = await digest(request.headers.get('authorization') || '');
  const expected = await digest(`Bearer ${requireEnv('WORKER_SECRET')}`);
  let diff=0; for(let i=0;i<actual.length;i++) diff |= actual[i]^expected[i];
  return diff===0;
}
Deno.serve(async (request: Request) => {
  if(request.method!=='POST' || !await authorized(request)) return new Response('Unauthorized',{status:401});
  const deps = {
    syncCRM: attioClient(requireEnv('ATTIO_API_KEY'),requireEnv('ATTIO_OWNER_EMAIL')),
    recordCRM: (id: string, lease: string, record: string) => rpc('record_lead_crm',{p_id:id,p_lease:lease,p_record:record}),
    finish: (id: string, lease: string) => rpc('finish_lead',{p_id:id,p_lease:lease}),
    retry: (id: string, lease: string, error: string) => rpc('retry_lead',{p_id:id,p_lease:lease,p_error:error}),
    notify: async (event: unknown) => {
      const url=requireEnv('GROK_LEAD_WEBHOOK_URL');
      if(!url.startsWith('https://')) throw integrationError('notification_config');
      const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${requireEnv('GROK_LEAD_WEBHOOK_KEY')}`},body:JSON.stringify(event),signal:AbortSignal.timeout(15000)});
      if(!response.ok) throw integrationError(`notification_${response.status}`);
    },
  };
  try {
    const jobs=await rpc('claim_leads',{p_limit:1});
    const results=[];
    // Bound each invocation; queue leases allow a later invocation to recover a crash.
    for(const job of jobs) results.push(await processLead(job,deps));
    const health=await rpc('lead_health',{});
    if(health.failed || health.stale) console.error('lead_queue_needs_attention',health);
    return Response.json({processed:results.length,retried:results.filter(v=>v==='retry').length,health});
  } catch { console.error('lead_worker_failed'); return new Response('Processing unavailable',{status:503}); }
});
