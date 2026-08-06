-- ============================================================
-- MyDopa — Email sequence schema + send-sequence cron job
-- ============================================================

-- 1. New columns on waitlist_subscribers
alter table public.waitlist_subscribers
  add column if not exists consent_version   text,
  add column if not exists consent_source    text,
  add column if not exists email_1_status    text,
  add column if not exists email_1_sent_at   timestamptz,
  add column if not exists resend_email_1_id text,
  add column if not exists email_2_status    text,
  add column if not exists email_2_sent_at   timestamptz,
  add column if not exists resend_email_2_id text,
  add column if not exists email_3_status    text,
  add column if not exists email_3_sent_at   timestamptz,
  add column if not exists resend_email_3_id text,
  add column if not exists email_4_status    text,
  add column if not exists email_4_sent_at   timestamptz,
  add column if not exists resend_email_4_id text,
  add column if not exists email_5_status    text,
  add column if not exists email_5_sent_at   timestamptz,
  add column if not exists resend_email_5_id text,
  add column if not exists last_email_error  text;

-- Index: fast lookup of subscribers due for sequence sends
create index if not exists waitlist_sequence_idx
  on public.waitlist_subscribers (email_1_sent_at)
  where consent_status = 'subscribed' and email_1_sent_at is not null;

-- 2. pg_cron: run send-sequence daily at 13:00 UTC (08:00 Panama)
--    Requires pg_cron and pg_net enabled (already done in 20260513000000).
--    Requires vault secret 'edge_fn_auth' already set (same as existing jobs).
select cron.unschedule(jobid)
from cron.job
where jobname = 'email-sequence-daily';

select cron.schedule(
  'email-sequence-daily',
  '0 13 * * *',
  $cron$
  select net.http_post(
    url     := 'https://qcfoykmmbjvduspunvsb.supabase.co/functions/v1/send-sequence',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', (select decrypted_secret from vault.decrypted_secrets where name = 'edge_fn_auth')
    ),
    body    := '{}'::jsonb
  )
  $cron$
);
