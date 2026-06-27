create extension if not exists pg_cron with schema pg_catalog;

create table if not exists public.emails (
  id            uuid primary key default gen_random_uuid(),
  message_id    text unique,
  recipient     text not null,
  sender        text not null,
  subject       text not null default '(no subject)',
  body_text     text not null default '',
  body_html     text not null default '',
  created_at    timestamptz not null default now()
);

create index if not exists idx_emails_recipient on public.emails (recipient);
create index if not exists idx_emails_created_at on public.emails (created_at desc);

alter table public.emails enable row level security;

create policy "Allow anonymous read by recipient"
  on public.emails for select
  using (true);

create policy "Allow service role full access"
  on public.emails for all
  using (auth.role() = 'service_role');

create or replace function public.delete_expired_emails()
returns void
language plpgsql
as $$
begin
  delete from public.emails
  where created_at < now() - interval '15 minutes';
end;
$$;

do $$
begin
  if exists (
    select 1 from pg_extension where extname = 'pg_cron'
  ) then
    perform cron.schedule(
      'purge-expired-emails',
      '1 minute',
      $$select public.delete_expired_emails()$$
    );
  end if;
end;
$$;
