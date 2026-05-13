import { Copy, Facebook, Globe, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { motion } from 'framer-motion'

import type { EmployeeCard } from '../../types/employee'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { useToast } from '../../ui/Toast'

function digitsOnly(input: string) {
	return input.replace(/\D/g, '')
}

function formatUzPhone(value?: string | null) {
	if (!value) return null
	const raw = digitsOnly(value)
	if (!raw) return value

	let digits = raw
	if (digits.startsWith('998')) digits = digits.slice(3)

	if (digits.length === 9) {
		const a = digits.slice(0, 2)
		const b = digits.slice(2, 5)
		const c = digits.slice(5, 7)
		const d = digits.slice(7, 9)
		return `+998 ${a} ${b} ${c} ${d}`
	}

	return value
}

function telHref(value?: string | null) {
	if (!value) return null
	const raw = digitsOnly(value)
	if (!raw) return `tel:${value}`
	if (raw.startsWith('998')) return `tel:+${raw}`
	if (raw.length === 9) return `tel:+998${raw}`
	return value.startsWith('+') ? `tel:${value}` : `tel:+${raw}`
}

type Action =
	| { type: 'link'; href: string; label: string }
	| { type: 'copy'; value: string; label: string }

function ContactRow({
	icon,
	label,
	value,
	action,
	delay = 0,
}: {
	icon: React.ReactNode
	label: string
	value: string
	action?: Action
	delay?: number
}) {
	const toast = useToast()

	return (
		<motion.div
			initial= opacity: 0, y: 10 
			animate= opacity: 1, y: 0 
			transition= duration: 0.28, delay 
			className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur"
		>
			<div className="flex items-center justify-between gap-3">
				<div className="flex min-w-0 items-center gap-3">
					<div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/25">
						{icon}
					</div>
					<div className="min-w-0">
						<div className="text-[11px] uppercase tracking-wide text-white/45">{label}</div>
						<div className="truncate text-sm text-white/85" title={value}>
							{value}
						</div>
					</div>
				</div>

				{action ? (
					action.type === 'link' ? (
						<a
							href={action.href}
							target={action.href.startsWith('http') ? '_blank' : undefined}
							rel="noreferrer"
						>
							<Button
								size="sm"
								variant={action.href.startsWith('tel:') ? 'primary' : 'secondary'}
								aria-label={action.label}
							>
								{action.label}
							</Button>
						</a>
					) : (
						<Button
							size="sm"
							variant="secondary"
							aria-label={action.label}
							onClick={async () => {
								await navigator.clipboard.writeText(action.value)
								toast.push('Copied')
							}}
						>
							<Copy className="h-4 w-4" /> {action.label}
						</Button>
					)
				) : null}
			</div>
		</motion.div>
	)
}

export function ContactSection({ card }: { card: EmployeeCard }) {
	const rows: Array<JSX.Element> = []
	let i = 0
	const delayStep = 0.03

	const push = (el: JSX.Element) => {
		i += 1
		rows.push(el)
	}

	if (card.work_email) {
		push(
			<ContactRow
				key="work_email"
				icon={<Mail className="h-4 w-4 text-brand-gold" />}
				label="Work email"
				value={card.work_email}
				action={{ type: 'link', href: `mailto:${card.work_email}`, label: 'Email' }}
				delay={delayStep * i}
			/>
		)
	}

	if (card.personal_email) {
		push(
			<ContactRow
				key="personal_email"
				icon={<Mail className="h-4 w-4 text-brand-gold" />}
				label="Personal email"
				value={card.personal_email}
				action={{ type: 'link', href: `mailto:${card.personal_email}`, label: 'Email' }}
				delay={delayStep * i}
			/>
		)
	}

	if (card.phone_primary) {
		const href = telHref(card.phone_primary)
		push(
			<ContactRow
				key="phone_primary"
				icon={<Phone className="h-4 w-4 text-brand-gold" />}
				label="Primary phone"
				value={formatUzPhone(card.phone_primary) ?? card.phone_primary}
				action={href ? { type: 'link', href, label: 'Call' } : undefined}
				delay={delayStep * i}
			/>
		)
	}

	if (card.phone_secondary) {
		const href = telHref(card.phone_secondary)
		push(
			<ContactRow
				key="phone_secondary"
				icon={<Phone className="h-4 w-4 text-brand-gold" />}
				label="Secondary phone"
				value={formatUzPhone(card.phone_secondary) ?? card.phone_secondary}
				action={href ? { type: 'link', href, label: 'Call' } : undefined}
				delay={delayStep * i}
			/>
		)
	}

	if (card.phone_extra) {
		const href = telHref(card.phone_extra)
		push(
			<ContactRow
				key="phone_extra"
				icon={<Phone className="h-4 w-4 text-brand-gold" />}
				label="Extra phone"
				value={formatUzPhone(card.phone_extra) ?? card.phone_extra}
				action={href ? { type: 'link', href, label: 'Call' } : undefined}
				delay={delayStep * i}
			/>
		)
	}

	if (card.short_phone) {
		push(
			<ContactRow
				key="short_phone"
				icon={<Phone className="h-4 w-4 text-brand-gold" />}
				label="Internal"
				value={`Internal: ${card.short_phone}`}
				action= type: 'copy', value: String(card.short_phone), label: 'Copy' 
				delay={delayStep * i}
			/>
		)
	}

	if (card.telegram_username || card.telegram_url) {
		push(
			<ContactRow
				key="telegram"
				icon={<MessageCircle className="h-4 w-4 text-brand-gold" />}
				label="Telegram"
				value={
					card.telegram_username
						? `@${String(card.telegram_username).replace(/^@/, '')}`
						: card.telegram_url ?? ''
				}
				action={card.telegram_url ? { type: 'link', href: card.telegram_url, label: 'Open' } : undefined}
				delay={delayStep * i}
			/>
		)
	}

	if (card.facebook_url) {
		push(
			<ContactRow
				key="facebook"
				icon={<Facebook className="h-4 w-4 text-brand-gold" />}
				label="Facebook"
				value={card.facebook_url}
				action={card.facebook_url ? { type: 'link', href: card.facebook_url, label: 'Open' } : undefined}
				delay={delayStep * i}
			/>
		)
	}

	if (card.website_url) {
		push(
			<ContactRow
				key="website"
				icon={<Globe className="h-4 w-4 text-brand-gold" />}
				label="Website"
				value={card.website_url}
				action={card.website_url ? { type: 'link', href: card.website_url, label: 'Open' } : undefined}
				delay={delayStep * i}
			/>
		)
	}

	if (card.address) {
		push(
			<ContactRow
				key="address"
				icon={<MapPin className="h-4 w-4 text-brand-gold" />}
				label="Address"
				value={card.address}
				action={card.address ? { type: 'copy', value: card.address, label: 'Copy' } : undefined}
				delay={delayStep * i}
			/>
		)
	}

	return (
		<Card className="p-5">
			<div>
				<div className="text-sm font-semibold">Contact</div>
				<div className="mt-1 text-xs text-brand-muted">Action buttons adapt to each field</div>
			</div>
			<div className="mt-4 grid gap-3">{rows}</div>
		</Card>
	)
}
