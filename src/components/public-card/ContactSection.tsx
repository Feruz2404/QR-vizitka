import { Mail, MapPin, Phone, Globe, MessageCircle, Facebook } from 'lucide-react'
import type { EmployeeCard } from '../../types/employee'
import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'

function Row({ label, value, href, icon }: { label: string; value?: string | null; href?: string | null; icon: React.ReactNode }) {
	if (!value) return null
	return (
		<div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
			<div className="flex items-center gap-3 min-w-0">
				<div className="grid h-9 w-9 place-items-center rounded-xl bg-black/30 border border-white/10">{icon}</div>
				<div className="min-w-0">
					<div className="text-xs text-brand-muted">{label}</div>
					<div className="truncate text-sm">{value}</div>
				</div>
			</div>
			{href ? (
				<a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
					<Button size="sm" variant="secondary">Open</Button>
				</a>
			) : null}
		</div>
	)
}

export function ContactSection({ card }: { card: EmployeeCard }) {
	return (
		<Card className="p-4">
			<div className="text-sm font-semibold">Contact</div>
			<div className="mt-3 grid gap-3">
				<Row label="Work email" value={card.work_email} href={card.work_email ? `mailto:${card.work_email}` : null} icon={<Mail className="h-4 w-4 text-brand-gold" />} />
				<Row label="Personal email" value={card.personal_email} href={card.personal_email ? `mailto:${card.personal_email}` : null} icon={<Mail className="h-4 w-4 text-brand-gold" />} />
				<Row label="Primary phone" value={card.phone_primary} href={card.phone_primary ? `tel:${card.phone_primary}` : null} icon={<Phone className="h-4 w-4 text-brand-gold" />} />
				<Row label="Secondary phone" value={card.phone_secondary} href={card.phone_secondary ? `tel:${card.phone_secondary}` : null} icon={<Phone className="h-4 w-4 text-brand-gold" />} />
				<Row label="Extra phone" value={card.phone_extra} href={card.phone_extra ? `tel:${card.phone_extra}` : null} icon={<Phone className="h-4 w-4 text-brand-gold" />} />
				<Row label="Short/Internal" value={card.short_phone} href={card.short_phone ? `tel:${card.short_phone}` : null} icon={<Phone className="h-4 w-4 text-brand-gold" />} />
				<Row label="Telegram" value={card.telegram_username} href={card.telegram_url} icon={<MessageCircle className="h-4 w-4 text-brand-gold" />} />
				<Row label="Facebook" value={card.facebook_url} href={card.facebook_url} icon={<Facebook className="h-4 w-4 text-brand-gold" />} />
				<Row label="Website" value={card.website_url} href={card.website_url} icon={<Globe className="h-4 w-4 text-brand-gold" />} />
				<Row label="Address" value={card.address} href={null} icon={<MapPin className="h-4 w-4 text-brand-gold" />} />
			</div>
		</Card>
	)
}
