-- Add wechat_url column to employee_cards for per-employee WeChat links
alter table public.employee_cards
	add column if not exists wechat_url text;
