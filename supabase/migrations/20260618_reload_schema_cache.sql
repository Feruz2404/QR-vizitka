-- 2026-06-18: Fix "Could not find the 'background_image_url' column of
-- 'employee_cards' in the schema cache" (also covers wechat_url).
--
-- Cause: an older database may be missing these columns, and/or PostgREST's
-- schema cache went stale after a column was added. Reads via select('*')
-- silently ignore unknown columns, but insert()/update() validate every key
-- in the payload against the cache, so creating a card fails.
--
-- This script is idempotent. Run it once in Supabase Dashboard -> SQL Editor.

alter table public.employee_cards
	add column if not exists background_image_url text;

alter table public.employee_cards
	add column if not exists wechat_url text;

-- Force PostgREST (Supabase's REST layer) to reload its schema cache so the
-- columns become writable immediately.
notify pgrst, 'reload schema';
