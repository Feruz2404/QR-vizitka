-- Add translations JSONB column to employee_cards for multilingual content (uz/ru/en).
-- Idempotent: safe to re-run.
alter table public.employee_cards
  add column if not exists translations jsonb not null default '{}'::jsonb;

-- Backfill: copy existing base fields into translations.uz for rows that have no
-- uz translation yet, so backwards compatibility is preserved and existing rows
-- have a complete Uzbek language record after the migration.
update public.employee_cards
set translations = jsonb_set(
  coalesce(translations, '{}'::jsonb),
  '{uz}',
  jsonb_build_object(
    'full_name', coalesce(full_name, ''),
    'position', coalesce(position, ''),
    'department', coalesce(department, ''),
    'organization_name', coalesce(organization_name, ''),
    'bio', coalesce(bio, ''),
    'specialties', '[]'::jsonb
  ),
  true
)
where (translations ->> 'uz') is null;
