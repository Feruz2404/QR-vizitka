-- Add whatsapp_url column to employee_cards for per-employee WhatsApp links
alter table public.employee_cards
	add column if not exists whatsapp_url text;

notify pgrst, 'reload schema';
