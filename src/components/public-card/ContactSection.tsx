import { ExternalLink, Facebook, Mail, Phone, Send } from 'lucide-react'

import type { EmployeeCard } from '../../types/employee'

export type ContactLabels = {
	contactsTitle: string
	workEmail: string
	personalEmail: string
	primaryPhone: string
	secondaryPhone: string
	extraPhone: string
	telegram: string
	facebook: string
}

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

function isHttpUrl(value?: string | null) {
	if (!value) return false
	try {
		const u = new URL(value)
		return u.protocol === 'http:' || u.protocol === 'https:'
	} catch {
		return false
	}
}

function ContactRow({
	icon,
	actionIcon,
	label,
	value,
	href,
	external,
}: {
	icon: React.ReactNode
	actionIcon: React.ReactNode
	label: string
	value: string
	href: string
	external?: boolean
}) {
	return (
		<div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-3.5">
			<div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-yellow-300/30 bg-yellow-300/[0.07] text-yellow-200">
				{icon}
			</div>
			<div className="min-w-0 flex-1">
				<div className="text-[11px] font-medium uppercase tracking-wide text-white/45">
					{label}
				</div>
				<div className="mt-0.5 truncate text-sm text-white/90" title={value}>
					{value}
				</div>
			</div>
			<a
				href={href}
				target={external ? '_blank' : undefined}
				rel={external ? 'noreferrer noopener' : undefined}
				aria-label={label}
				className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-yellow-300/45 bg-yellow-300/10 text-yellow-100 shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition hover:bg-yellow-300/20"
			>
				{actionIcon}
			</a>
		</div>
	)
}

export function ContactSection({
	card,
	labels,
}: {
	card: EmployeeCard
	labels: ContactLabels
}) {
	const rows: Array<JSX.Element> = []

	if (card.work_email) {
		rows.push(
			<ContactRow
				key="work_email"
				icon={<Mail className="h-4 w-4" />}
				actionIcon={<Mail className="h-4 w-4" />}
				label={labels.workEmail}
				value={card.work_email}
				href={`mailto:${card.work_email}`}
			/>
		)
	}

	if (card.personal_email) {
		rows.push(
			<ContactRow
				key="personal_email"
				icon={<Mail className="h-4 w-4" />}
				actionIcon={<Mail className="h-4 w-4" />}
				label={labels.personalEmail}
				value={card.personal_email}
				href={`mailto:${card.personal_email}`}
			/>
		)
	}

	if (card.phone_primary) {
		const href = telHref(card.phone_primary)
		if (href) {
			rows.push(
				<ContactRow
					key="phone_primary"
					icon={<Phone className="h-4 w-4" />}
					actionIcon={<Phone className="h-4 w-4" />}
					label={labels.primaryPhone}
					value={formatUzPhone(card.phone_primary) ?? card.phone_primary}
					href={href}
				/>
			)
		}
	}

	if (card.phone_secondary) {
		const href = telHref(card.phone_secondary)
		if (href) {
			rows.push(
				<ContactRow
					key="phone_secondary"
					icon={<Phone className="h-4 w-4" />}
					actionIcon={<Phone className="h-4 w-4" />}
					label={labels.secondaryPhone}
					value={formatUzPhone(card.phone_secondary) ?? card.phone_secondary}
					href={href}
				/>
			)
		}
	}

	if (card.phone_extra) {
		const href = telHref(card.phone_extra)
		if (href) {
			rows.push(
				<ContactRow
					key="phone_extra"
					icon={<Phone className="h-4 w-4" />}
					actionIcon={<Phone className="h-4 w-4" />}
					label={labels.extraPhone}
					value={formatUzPhone(card.phone_extra) ?? card.phone_extra}
					href={href}
				/>
			)
		}
	}

	const tgUrl = (() => {
		if (isHttpUrl(card.telegram_url)) return card.telegram_url as string
		const handle = (card.telegram_username ?? '').trim().replace(/^@/, '')
		return handle ? `https://t.me/${handle}` : null
	})()
	const tgDisplay = (() => {
		const handle = (card.telegram_username ?? '').trim().replace(/^@/, '')
		if (handle) return `@${handle}`
		return card.telegram_url ?? ''
	})()
	if (tgUrl) {
		rows.push(
			<ContactRow
				key="telegram"
				icon={<Send className="h-4 w-4" />}
				actionIcon={<Send className="h-4 w-4" />}
				label={labels.telegram}
				value={tgDisplay}
				href={tgUrl}
				external
			/>
		)
	}

	if (isHttpUrl(card.facebook_url)) {
		rows.push(
			<ContactRow
				key="facebook"
				icon={<Facebook className="h-4 w-4" />}
				actionIcon={<ExternalLink className="h-4 w-4" />}
				label={labels.facebook}
				value={card.facebook_url as string}
				href={card.facebook_url as string}
				external
			/>
		)
	}

	return (
		<div className="relative overflow-hidden rounded-[28px] border border-yellow-500/20 bg-black/45 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:p-6">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_-10%,rgba(245,197,66,0.10),transparent_60%)]" />
			<div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-yellow-300/15" />
			<div className="relative">
				<div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-200/85">
					{labels.contactsTitle}
				</div>
				<div className="mt-4 grid gap-2.5">{rows}</div>
			</div>
		</div>
	)
}
