import { handleIntake } from '../_shared/intake.mjs';
import { databaseClient, requireEnv, serverKey } from '../_shared/services.mjs';
const rpc = databaseClient(requireEnv('SUPABASE_URL'), serverKey());
Deno.serve((request: Request) => handleIntake(request, {
  allowedOrigins: requireEnv('ALLOWED_ORIGINS').split(',').map((v: string) => v.trim()),
  hostnames: requireEnv('TURNSTILE_HOSTNAMES').split(',').map((v: string) => v.trim()),
  rateSalt: requireEnv('RATE_LIMIT_SALT'),
  verifyTurnstile: async (token: string) => {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: new URLSearchParams({ secret: requireEnv('TURNSTILE_SECRET_KEY'), response: token }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('turnstile_unavailable');
    return response.json();
  },
  save: (data: unknown, fingerprint: string, rateKey: string) => rpc('accept_lead', { p_data: data, p_fingerprint: fingerprint, p_rate_key: rateKey }),
  log: (event: string) => console.error(event),
}));
