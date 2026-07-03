-- Production hotfix: ensure employee_cards.instagram_url exists in the public schema.
-- Safe to re-run and reloads PostgREST so Supabase REST accepts the column immediately.
alter table public.employee_cards
	add column if not exists instagram_url text;

notify pgrst, 'reload schema';

