-- ============================================================
-- DOPAmine Email Campaign — Schema & Automation Setup
-- ============================================================
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Must be run as postgres/service role.
--
-- BEFORE running this file, store your service role key in Vault:
--
--   select vault.create_secret(
--     'Bearer YOUR_SERVICE_ROLE_KEY_HERE',
--     'edge_fn_auth'
--   );
--
-- Replace YOUR_SERVICE_ROLE_KEY_HERE with the key from:
-- Dashboard > Project Settings > API > service_role (secret)
-- ============================================================

-- 1. Enable extensions
create extension if not exists pg_net  with schema extensions;
create extension if not exists pg_cron with schema extensions;

-- 2. Add campaign columns to push_subscriptions
alter table public.push_subscriptions
  add column if not exists first_name           text,
  add column if not exists account_age_days     integer default 0,
  add column if not exists wins_total           integer default 0,
  add column if not exists paid                 boolean default false,
  add column if not exists email_welcome_sent   boolean default false,
  add column if not exists email_day3_sent      boolean default false,
  add column if not exists email_day7_sent      boolean default false,
  add column if not exists email_day8_sent      boolean default false,
  add column if not exists email_day14_sent     boolean default false;

-- 3. Create email_queue table
create table if not exists public.email_queue (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  email_type   text        not null,
  status       text        not null default 'pending',
  error        text,
  created_at   timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists email_queue_pending_idx
  on public.email_queue (created_at)
  where status = 'pending';

-- 4. Trigger function: enqueue welcome email on new signup
create or replace function public.enqueue_welcome_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.email_queue (user_id, email_type)
  values (new.id, 'welcome');
  return new;
end;
$$;

-- 5. Attach trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.enqueue_welcome_email();

-- 6. Remove old cron jobs if they exist (idempotent)
select cron.unschedule(jobid)
from cron.job
where jobname in ('process-email-queue', 'daily-email-campaign');

-- 7. pg_cron: process welcome email queue every minute
select cron.schedule(
  'process-email-queue',
  '* * * * *',
  $cron$
  select net.http_post(
    url     := 'https://qcfoykmmbjvduspunvsb.supabase.co/functions/v1/send-email-campaign',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', (select decrypted_secret from vault.decrypted_secrets where name = 'edge_fn_auth')
    ),
    body    := '{"action":"process_queue"}'::jsonb
  )
  $cron$
);

-- 8. pg_cron: daily email campaign at 08:00 Panama = 13:00 UTC
select cron.schedule(
  'daily-email-campaign',
  '0 13 * * *',
  $cron$
  select net.http_post(
    url     := 'https://qcfoykmmbjvduspunvsb.supabase.co/functions/v1/send-email-campaign',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', (select decrypted_secret from vault.decrypted_secrets where name = 'edge_fn_auth')
    ),
    body    := '{"action":"daily"}'::jsonb
  )
  $cron$
);
