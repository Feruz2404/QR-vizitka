-- Premium Employee QR Business Card Platform

create extension if not exists "pgcrypto";

create table if not exists employee_cards (
	id uuid primary key default gen_random_uuid(),
	full_name text not null,
	slug text unique not null,
	position text not null,
	department text,
	organization_name text,
	profile_photo_url text,
	logo_url text,
	background_image_url text,
	work_email text,
	personal_email text,
	phone_primary text,
	phone_secondary text,
	phone_extra text,
	short_phone text,
	telegram_username text,
	telegram_url text,
	facebook_url text,
	website_url text,
	address text,
	bio text,
	theme text default 'premium-dark-gold',
	is_active boolean default true,
	created_at timestamptz default now(),
	updated_at timestamptz default now()
);

-- Safe upgrade for existing databases (no-op if column already exists)
alter table employee_cards
add column if not exists background_image_url text;

create or replace function update_updated_at_column()
returns trigger as $$
begin
	new.updated_at = now();
	return new;
end;
$$ language plpgsql;

drop trigger if exists update_employee_cards_updated_at on employee_cards;
create trigger update_employee_cards_updated_at
before update on employee_cards
for each row
execute function update_updated_at_column();

alter table employee_cards enable row level security;

drop policy if exists "Public can read active employee cards" on employee_cards;
create policy "Public can read active employee cards"
on employee_cards
for select
using (is_active = true);

drop policy if exists "Authenticated admins can manage employee cards" on employee_cards;
create policy "Authenticated admins can manage employee cards"
on employee_cards
for all
to authenticated
using (true)
with check (true);

-- Global singleton settings (shared background + organization logo)
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
