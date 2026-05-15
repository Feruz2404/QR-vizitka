import {
	ArrowUpRight,
	Copy,
	ExternalLink,
	Facebook,
	Globe2,
	Mail,
	MapPin,
	Phone,
	PhoneCall,
	Send,
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

import type { EmployeeCard } from '../../types/employee'
import { Card } from '../../ui/Card'
import { useToast } from '../../ui/Toast'

const TG_BASE = 'https://' + 't.me/'

const ROW_FROM = { opacity: 0, y: 8 } as const
const ROW_TO = { opacity: 1, y: 0 } as const

export type ContactLabels = {
	contactsTitle: string
	workEmail: string
	personalEmail: string
	primaryPhone: string
	secondaryPhone: string
	extraPhone: string
	internalPhone?: string
	telegram: string
	facebook: string
	website?: string
	address?: string
	openAction?: string
	callAction?: string
	emailAction?: string
	copyAction?: string
}

const DEFAULT_LABELS: ContactLabels = {
	contactsTitle: 'Contact information',
	workEmail: 'Work email',
	personalEmail: 'Personal email',
	primaryPhone: 'Primary phone',
	secondaryPhone: 'Secondary phone',
	extraPhone: 'Extra phone',
	internalPhone: 'Internal',
	telegram: 'Telegram',
	facebook: 'Facebook',
	website: 'Website',
	address: 'Address',
	openAction: 'Open',
	callAction: 'Call',
	emailAction: 'Email',
	copyAction: 'Copy',
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
		return '+998 ' + a + ' ' + b + ' ' + c + ' ' + d
	}
	return value
}

function telHref(value?: string | null) {
	if (!value) return null
	const raw = digitsOnly(value)
	if (!raw) return 'tel:' + value
	if (raw.startsWith('998')) return 'tel:+' + raw
	if (raw.length === 9) return 'tel:+998' + raw
	return value.startsWith('+') ? 'tel:' + value : 'tel:+' + raw
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

function telegramHref(card: { telegram_url?: string | null; telegram_username?: string | null }) {
	if (isHttpUrl(card.telegram_url)) return card.telegram_url as string
	const u = (card.telegram_username ?? '').trim().replace(/^@/, '')
	if (u) return TG_BASE + u
	const f = (card.telegram_url ?? '').trim().replace(/^@/, '')
	if (f && /^[a-zA-Z0-9_]{3,}$/.test(f)) return TG_BASE + f
	return null
}

type LinkAction = { kind: 'link'; href: string; label: string; external?: boolean; actionIcon?: ReactNode }
type CopyAction = { kind: 'copy'; value: string; label: string; actionIcon?: ReactNode }
type RowAction = LinkAction | CopyAction

const ROW_BTN_CLS =
	'grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-yellow-300/30 bg-black/40 text-yellow-200 transition hover:border-yellow-300/55 hover:bg-yellow-300/15 active:scale-95'

function ContactRow({
	icon,
	label,
	value,
	action,
}: {
	icon: ReactNode
	label: string
	value: string
	action?: RowAction
}) {
	const toast = useToast()
	return (
		<motion.div
			initial={ROW_FROM}
			animate={ROW_TO}
			className="group flex items-center gap-3 rounded-2xl border border-yellow-300/12 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent px-3 py-2 transition hover:border-yellow-300/30 hover:from-yellow-300/[0.05]"
		>
			<div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-yellow-300/30 bg-gradient-to-br from-yellow-300/20 via-yellow-300/5 to-transparent text-yellow-200 shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
				{icon}
			</div>
			<div className="min-w-0 flex-1">
				<div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-200/65">
					{label}
				</div>
				<div className="truncate text-sm text-white/90" title={value}>
					{value}
				</div>
			</div>

			{action ? (
				action.kind === 'link' ? (
					<a
						href={action.href}
						target={action.external ? '_blank' : undefined}
						rel={action.external ? 'noreferrer noopener' : undefined}
						aria-label={action.label}
						className={ROW_BTN_CLS}
					>
						{action.actionIcon ?? <ArrowUpRight className="h-4 w-4" />}
					</a>
				) : (
					<button
						type="button"
						aria-label={action.label}
						onClick={async () => {
							await navigator.clipboard.writeText(action.value)
							toast.push('Copied')
						}}
						className={ROW_BTN_CLS}
					>
						{action.actionIcon ?? <Copy className="h-4 w-4" />}
					</button>
				)
			) : null}
		</motion.div>
	)
}

const MAIL_ICON = <Mail className="h-4 w-4" />
const PHONE_ICON = <Phone className="h-4 w-4" />
const PHONECALL_ICON = <PhoneCall className="h-4 w-4" />
const SEND_ICON = <Send className="h-4 w-4" />
const EXT_ICON = <ExternalLink className="h-4 w-4" />
const COPY_ICON = <Copy className="h-4 w-4" />
const FACEBOOK_ICON = <Facebook className="h-4 w-4" />
const GLOBE_ICON = <Globe2 className="h-4 w-4" />
const PIN_ICON = <MapPin className="h-4 w-4" />

export function ContactSection({
	card,
	labels,
}: {
	card: EmployeeCard
	labels?: ContactLabels
}) {
	const L: ContactLabels = { ...DEFAULT_LABELS, ...(labels ?? {}) }
	const rows: Array<JSX.Element> = []

	if (card.work_email) {
		const href = 'mailto:' + card.work_email
		const a: LinkAction = { kind: 'link', href, label: L.emailAction ?? 'Email', actionIcon: MAIL_ICON }
		rows.push(
			<ContactRow key="work_email" icon={MAIL_ICON} label={L.workEmail} value={card.work_email} action={a} />,
		)
	}

	if (card.personal_email) {
		const href = 'mailto:' + card.personal_email
		const a: LinkAction = { kind: 'link', href, label: L.emailAction ?? 'Email', actionIcon: MAIL_ICON }
		rows.push(
			<ContactRow key="personal_email" icon={MAIL_ICON} label={L.personalEmail} value={card.personal_email} action={a} />,
		)
	}

	if (card.phone_primary) {
		const href = telHref(card.phone_primary)
		const a: LinkAction | undefined = href
			? { kind: 'link', href, label: L.callAction ?? 'Call', actionIcon: PHONE_ICON }
			: undefined
		rows.push(
			<ContactRow
				key="phone_primary"
				icon={PHONE_ICON}
				label={L.primaryPhone}
				value={formatUzPhone(card.phone_primary) ?? card.phone_primary}
				action={a}
			/>,
		)
	}

	if (card.phone_secondary) {
		const href = telHref(card.phone_secondary)
		const a: LinkAction | undefined = href
			? { kind: 'link', href, label: L.callAction ?? 'Call', actionIcon: PHONE_ICON }
			: undefined
		rows.push(
			<ContactRow
				key="phone_secondary"
				icon={PHONE_ICON}
				label={L.secondaryPhone}
				value={formatUzPhone(card.phone_secondary) ?? card.phone_secondary}
				action={a}
			/>,
		)
	}

	if (card.phone_extra) {
		const href = telHref(card.phone_extra)
		const a: LinkAction | undefined = href
			? { kind: 'link', href, label: L.callAction ?? 'Call', actionIcon: PHONECALL_ICON }
			: undefined
		rows.push(
			<ContactRow
				key="phone_extra"
				icon={PHONECALL_ICON}
				label={L.extraPhone}
				value={formatUzPhone(card.phone_extra) ?? card.phone_extra}
				action={a}
			/>,
		)
	}

	if (card.short_phone) {
		const internalLabel = L.internalPhone ?? 'Internal'
		const copyValue = String(card.short_phone)
		const a: CopyAction = { kind: 'copy', value: copyValue, label: L.copyAction ?? 'Copy', actionIcon: COPY_ICON }
		rows.push(
			<ContactRow key="short_phone" icon={PHONE_ICON} label={internalLabel} value={copyValue} action={a} />,
		)
	}

	const tgHref = telegramHref(card)
	if (tgHref) {
		const display = card.telegram_username
			? '@' + String(card.telegram_username).replace(/^@/, '')
			: tgHref
		const a: LinkAction = {
			kind: 'link',
			href: tgHref,
			label: L.openAction ?? 'Open',
			external: true,
			actionIcon: SEND_ICON,
		}
		rows.push(
			<ContactRow key="telegram" icon={SEND_ICON} label={L.telegram} value={display} action={a} />,
		)
	}

	if (card.facebook_url && isHttpUrl(card.facebook_url)) {
		const a: LinkAction = {
			kind: 'link',
			href: card.facebook_url,
			label: L.openAction ?? 'Open',
			external: true,
			actionIcon: EXT_ICON,
		}
		rows.push(
			<ContactRow key="facebook" icon={FACEBOOK_ICON} label={L.facebook} value={card.facebook_url} action={a} />,
		)
	}

	if (card.website_url && isHttpUrl(card.website_url)) {
		const a: LinkAction = {
			kind: 'link',
			href: card.website_url,
			label: L.openAction ?? 'Open',
			external: true,
			actionIcon: EXT_ICON,
		}
		rows.push(
			<ContactRow key="website" icon={GLOBE_ICON} label={L.website ?? 'Website'} value={card.website_url} action={a} />,
		)
	}

	if (card.address) {
		const a: CopyAction = { kind: 'copy', value: card.address, label: L.copyAction ?? 'Copy', actionIcon: COPY_ICON }
		rows.push(
			<ContactRow key="address" icon={PIN_ICON} label={L.address ?? 'Address'} value={card.address} action={a} />,
		)
	}

	return (
		<Card className="relative h-full overflow-hidden rounded-[28px] border border-yellow-300/25 bg-[#06090f]/85 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:p-6">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/70 to-transparent" />
			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/25 to-transparent" />
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_85%_-10%,rgba(245,197,66,0.12),transparent_55%)]" />

			<div className="relative">
				<div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-200/90">
					<span className="h-1.5 w-1.5 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(245,197,66,0.8)]" />
					{L.contactsTitle}
				</div>
				<div className="mt-4 grid gap-2">{rows}</div>
			</div>
		</Card>
	)
}
