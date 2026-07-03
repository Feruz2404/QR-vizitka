-- Add instagram_url column to employee_cards for per-employee Instagram links
alter table public.employee_cards
add column if not exists instagram_url text;

notify pgrst, 'reload schema';
