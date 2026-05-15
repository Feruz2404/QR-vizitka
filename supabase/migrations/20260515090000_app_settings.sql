-- Ensure app_settings table exists for global background image and organization logo.
-- Idempotent: safe to run multiple times.
-- Background image and organization logo are GLOBAL only and managed from /admin/settings.
-- Per-employee background image is no longer used.

create table if not exists public.app_settings (
  id text primary key,
  background_image_url text,
  organization_logo_url text,
  updated_at timestamptz not null default now()
);

-- Reusable updated-at trigger function (idempotent).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

-- Enable Row Level Security.
alter table public.app_settings enable row level security;

-- Anyone may read the settings (single 'global' row).
drop policy if exists "app_settings_public_read" on public.app_settings;
create policy "app_settings_public_read"
  on public.app_settings
  for select
  using (true);

-- Only authenticated users (admins) may write.
drop policy if exists "app_settings_admin_write" on public.app_settings;
create policy "app_settings_admin_write"
  on public.app_settings
  for all
  to authenticated
  using (true)
  with check (true);

-- Seed the singleton row used by the frontend ('global').
insert into public.app_settings (id) values ('global')
on conflict (id) do nothing;
