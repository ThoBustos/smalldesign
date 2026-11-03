-- Small Design only. No backfill: existing submissions must not receive surprises.
create table intake_private.acknowledgements (
  id uuid primary key references intake_private.submissions(id),
  email text not null,
  state text not null default 'pending' check(state in ('pending','processing','accepted','failed','review')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  first_attempt_at timestamptz,
  locked_until timestamptz,
  lease uuid,
  provider_id text unique,
  last_error text,
  created_at timestamptz not null default now()
);
alter table intake_private.acknowledgements enable row level security;
create table intake_private.email_events (
  event_id text primary key,
  provider_id text not null,
  event_type text not null,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now()
);
alter table intake_private.email_events enable row level security;
create index on intake_private.email_events(provider_id,occurred_at desc);

create function intake_private.queue_acknowledgement() returns trigger
language plpgsql security definer set search_path='' as $$ begin
  insert into intake_private.acknowledgements(id,email) values(new.id,new.payload->>'email');
  return new;
end $$;
revoke all on function intake_private.queue_acknowledgement() from public,anon,authenticated;
create trigger queue_acknowledgement after insert on intake_private.submissions
for each row execute function intake_private.queue_acknowledgement();

create function public.claim_acknowledgements() returns table(id uuid,email text,lease uuid,first_attempt_at timestamptz)
language plpgsql security definer set search_path='' as $$ begin
  update intake_private.acknowledgements a set state='review',last_error='receipt_window_expired'
    where a.state in ('pending','processing') and a.first_attempt_at<now()-interval '20 hours';
  update intake_private.acknowledgements a set state='failed',last_error='attempt_limit'
    where a.state='processing' and a.locked_until<now() and a.attempts>=8;
  return query with candidate as (
    select a.id from intake_private.acknowledgements a
    where ((a.state='pending' and a.available_at<=now()) or (a.state='processing' and a.locked_until<now())) and a.attempts<8
    order by a.created_at for update skip locked limit 1
  ), claimed as (
    update intake_private.acknowledgements a set state='processing',attempts=a.attempts+1,
      first_attempt_at=coalesce(a.first_attempt_at,now()),locked_until=now()+interval '5 minutes',lease=gen_random_uuid()
    from candidate c where a.id=c.id returning a.id,a.email,a.lease,a.first_attempt_at
  ) select * from claimed;
end $$;
create function public.finish_acknowledgement(p_id uuid,p_lease uuid,p_provider text) returns void
language plpgsql security definer set search_path='' as $$ begin
  update intake_private.acknowledgements set state='accepted',provider_id=p_provider,last_error=null,locked_until=null
  where id=p_id and lease=p_lease and state='processing';
  if not found then raise exception 'stale acknowledgement lease'; end if;
end $$;
create function public.retry_acknowledgement(p_id uuid,p_lease uuid,p_error text,p_review boolean default false) returns void
language plpgsql security definer set search_path='' as $$ begin
  update intake_private.acknowledgements set
    state=case when p_review then 'review' when attempts>=8 then 'failed' else 'pending' end,
    available_at=now()+make_interval(secs=>least(3600,(30*power(2,attempts))::integer)),
    locked_until=null,last_error=left(p_error,80)
  where id=p_id and lease=p_lease and state='processing';
end $$;
create function public.record_email_event(p_event text,p_provider text,p_type text,p_occurred timestamptz) returns void
language sql security definer set search_path='' as $$
  insert into intake_private.email_events(event_id,provider_id,event_type,occurred_at)
  values(p_event,p_provider,p_type,p_occurred) on conflict(event_id) do nothing;
$$;
revoke all on function public.claim_acknowledgements(),public.finish_acknowledgement(uuid,uuid,text),public.retry_acknowledgement(uuid,uuid,text,boolean),public.record_email_event(text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.claim_acknowledgements(),public.finish_acknowledgement(uuid,uuid,text),public.retry_acknowledgement(uuid,uuid,text,boolean),public.record_email_event(text,text,text,timestamptz) to service_role;

-- The status view is private. Accepted means API receipt, not inbox delivery.
create view intake_private.acknowledgement_status as
select a.id,a.state,a.attempts,a.provider_id,a.last_error,e.event_type as latest_delivery_event,e.occurred_at
from intake_private.acknowledgements a left join lateral (
  select event_type,occurred_at from intake_private.email_events e where e.provider_id=a.provider_id
  order by occurred_at desc limit 1
) e on true;
revoke all on intake_private.acknowledgement_status from public,anon,authenticated;

select cron.schedule('small-design-process-leads','* * * * *',$job$
  select net.http_post(
    url := 'https://fpmppovrpnupoqlexaya.supabase.co/functions/v1/process-leads',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' ||
      (select decrypted_secret from vault.decrypted_secrets where name='small_design_worker_secret')),
    body := '{}'::jsonb,timeout_milliseconds := 60000
  ) where exists(select 1 from intake_private.jobs where (state='pending' and available_at<=now()) or (state='processing' and locked_until<now()))
    or exists(select 1 from intake_private.acknowledgements where (state='pending' and available_at<=now()) or (state='processing' and locked_until<now()));
$job$);
