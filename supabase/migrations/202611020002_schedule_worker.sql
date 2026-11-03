-- Provision small_design_worker_secret through Vault UI before applying.
-- No credential values belong in migrations or saved SQL queries.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

do $$ begin
  if not exists (select 1 from vault.secrets where name='small_design_worker_secret') then
    raise exception 'Provision small_design_worker_secret in Vault first';
  end if;
end $$;

select cron.schedule('small-design-process-leads','* * * * *',$job$
  select net.http_post(
    url := 'https://fpmppovrpnupoqlexaya.supabase.co/functions/v1/process-leads',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name='small_design_worker_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  ) where exists (
    select 1 from intake_private.jobs
    where (state='pending' and available_at<=now())
       or (state='processing' and locked_until<now())
  );
$job$);
