-- 2026-05-14: add optional background_image_url for premium card backgrounds.
-- Safe to re-run; the column is only added when missing.
alter table public.employee_cards
add column if not exists background_image_url text;
