alter table public.employee_cards
	add column if not exists translations jsonb not null default '{}'::jsonb;
