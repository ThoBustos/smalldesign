export function requireEnv(name) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}
export function serverKey() {
  const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
  const modern = Object.values(keys).find(value => typeof value === 'string' && value.startsWith('sb_secret_'));
  return modern || requireEnv('SUPABASE_SERVICE_ROLE_KEY');
}
export function databaseClient(url, key) {
  return async (name, args) => {
    const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
      method: 'POST', headers: { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}), 'Content-Type': 'application/json' },
      body: JSON.stringify(args), signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`database_${response.status}`);
    const body = await response.text();
    return body ? JSON.parse(body) : null;
  };
}
