-- Add explicit per-card organization logo support.
-- logo_url is kept as a legacy mirror for existing data and older code paths.
alter table public.employee_cards
	add column if not exists organization_logo_url text;

update public.employee_cards
set organization_logo_url = logo_url
where organization_logo_url is null
	and logo_url is not null;

notify pgrst, 'reload schema';
