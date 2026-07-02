-- Add instagram_url column to employee_cards (safe, idempotent)
alter table employee_cards
  add column if not exists instagram_url text;

-- Reload PostgREST schema cache so the new column is immediately writable.
notify pgrst, 'reload schema';
