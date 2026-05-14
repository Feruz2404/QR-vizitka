-- Premium QR Business Card Platform: global app settings (singleton)
--
-- One global row (id = 'global') holds platform-wide media that should be
-- shared by every public employee card page (background image + organization
-- logo). Public read is allowed so /v/:slug can fetch settings without auth.

create table if not exists public.app_settings (
	id text primary key default 'global',
	background_image_url text,
	organization_logo_url text,
	updated_at timestamptz default now()
);

alter table public.app_settings
	drop constraint if exists app_settings_singleton_check;
alter table public.app_settings
	add constraint app_settings_singleton_check check (id = 'global');

insert into public.app_settings (id) values ('global')
on conflict (id) do nothing;

-- Reuse the existing update_updated_at_column() trigger function defined in schema.sql.
drop trigger if exists update_app_settings_updated_at on public.app_settings;
create trigger update_app_settings_updated_at
before update on public.app_settings
for each row
execute function update_updated_at_column();

alter table public.app_settings enable row level security;

drop policy if exists "Public can read app settings" on public.app_settings;
create policy "Public can read app settings"
	on public.app_settings for select using (true);

drop policy if exists "Authenticated admins can manage app settings" on public.app_settings;
create policy "Authenticated admins can manage app settings"
	on public.app_settings for all
	to authenticated
	using (true) with check (true);
