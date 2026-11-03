-- Private intake storage and transactional outbox. No anonymous table access.
create schema if not exists intake_private;
revoke all on schema intake_private from public, anon, authenticated;
create table intake_private.submissions (
  id uuid primary key,
  payload jsonb not null,
  fingerprint text not null,
  created_at timestamptz not null default now(),
  attio_record_id uuid,
  notified_at timestamptz
);
create table intake_private.jobs (
  id uuid primary key references intake_private.submissions(id),
  state text not null default 'pending' check (state in ('pending','processing','done','failed')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  locked_until timestamptz,
  lease uuid,
  last_error text,
  updated_at timestamptz not null default now()
);
create index on intake_private.jobs (state, available_at);
create table intake_private.rate_windows (
  key text not null,
  bucket timestamptz not null,
  count integer not null,
  primary key (key,bucket)
);
alter table intake_private.submissions enable row level security;
alter table intake_private.jobs enable row level security;
alter table intake_private.rate_windows enable row level security;

create function public.accept_lead(p_data jsonb, p_fingerprint text, p_rate_key text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := (p_data->>'submission_id')::uuid;
  v_fingerprint text;
  v_count integer;
  v_bucket timestamptz := date_trunc('hour', now());
begin
  -- Serialize replay checks for the same request, including concurrent retries.
  perform pg_advisory_xact_lock(hashtextextended(v_id::text, 0));
  select fingerprint into v_fingerprint from intake_private.submissions where id=v_id;
  if found then
    return jsonb_build_object('status',case when v_fingerprint=p_fingerprint then 'saved' else 'conflict' end);
  end if;
  -- A verified challenge is still required upstream. Atomic counters prevent races.
  insert into intake_private.rate_windows as r values ('global',v_bucket,1)
    on conflict (key,bucket) do update set count=r.count+1 returning count into v_count;
  if v_count>100 then return '{"status":"limited"}'::jsonb; end if;
  insert into intake_private.rate_windows as r values (p_rate_key,v_bucket,1)
    on conflict (key,bucket) do update set count=r.count+1 returning count into v_count;
  if v_count>3 then return '{"status":"limited"}'::jsonb; end if;
  insert into intake_private.submissions(id,payload,fingerprint) values(v_id,p_data,p_fingerprint);
  insert into intake_private.jobs(id) values(v_id);
  delete from intake_private.rate_windows where bucket < now()-interval '2 days';
  return '{"status":"saved"}'::jsonb;
end $$;

create function public.claim_leads(p_limit integer default 5)
returns table(id uuid, payload jsonb, attio_record_id uuid, lease uuid, attempts integer)
language plpgsql security definer set search_path = '' as $$
begin
  return query with candidates as (
    select j.id from intake_private.jobs j
    where ((j.state='pending' and j.available_at<=now()) or (j.state='processing' and j.locked_until<now()))
      and j.attempts<8
    order by j.available_at for update skip locked limit least(greatest(p_limit,1),5)
  ), claimed as (
    update intake_private.jobs j set state='processing',attempts=j.attempts+1,
      locked_until=now()+interval '5 minutes',lease=gen_random_uuid(),updated_at=now()
    from candidates c where j.id=c.id returning j.id,j.lease,j.attempts
  ) select c.id,s.payload,s.attio_record_id,c.lease,c.attempts from claimed c join intake_private.submissions s on s.id=c.id;
  update intake_private.jobs j set state='failed',last_error='attempt_limit',updated_at=now()
    where j.state='processing' and j.locked_until<now() and j.attempts>=8;
end $$;

create function public.record_lead_crm(p_id uuid,p_lease uuid,p_record uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select 1 from intake_private.jobs where id=p_id and lease=p_lease and state='processing') then raise exception 'stale lease'; end if;
  update intake_private.submissions set attio_record_id=p_record where id=p_id;
end $$;
create function public.finish_lead(p_id uuid,p_lease uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update intake_private.jobs set state='done',locked_until=null,updated_at=now() where id=p_id and lease=p_lease and state='processing';
  if not found then raise exception 'stale lease'; end if;
  update intake_private.submissions set notified_at=now() where id=p_id;
end $$;
create function public.retry_lead(p_id uuid,p_lease uuid,p_error text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update intake_private.jobs set state=case when attempts>=8 then 'failed' else 'pending' end,
    available_at=now()+make_interval(secs=>least(3600,(30*power(2,attempts))::integer)),
    locked_until=null,last_error=left(p_error,80),updated_at=now()
    where id=p_id and lease=p_lease and state='processing';
end $$;
create function public.lead_health()
returns jsonb language sql security definer set search_path = '' as $$
 select jsonb_build_object('failed',count(*) filter(where state='failed'),
   'stale',count(*) filter(where state in ('pending','processing') and updated_at<now()-interval '15 minutes'))
 from intake_private.jobs;
$$;
revoke all on function public.accept_lead(jsonb,text,text), public.claim_leads(integer), public.record_lead_crm(uuid,uuid,uuid),public.finish_lead(uuid,uuid),public.retry_lead(uuid,uuid,text),public.lead_health() from public,anon,authenticated;
grant execute on function public.accept_lead(jsonb,text,text), public.claim_leads(integer), public.record_lead_crm(uuid,uuid,uuid),public.finish_lead(uuid,uuid),public.retry_lead(uuid,uuid,text),public.lead_health() to service_role;
