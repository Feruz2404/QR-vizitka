import { ArrowUpRight, Copy, Mail, Phone, PhoneCall } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

import type { EmployeeCard } from '../../types/employee'
import { Card } from '../../ui/Card'
import { useToast } from '../../ui/Toast'

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
	mapAction?: string
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
	mapAction: 'Open in maps',
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

function telHrefFor(value?: string | null) {
	if (!value) return null
	const raw = digitsOnly(value)
	if (!raw) return 'tel:' + value
	if (raw.startsWith('998')) return 'tel:+' + raw
	if (raw.length === 9) return 'tel:+998' + raw
	return value.startsWith('+') ? 'tel:' + value : 'tel:+' + raw
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
	displayValue,
	action,
}: {
	icon: ReactNode
	label: string
	value: string
	displayValue?: string
	action?: RowAction
}) {
	const toast = useToast()
	const shown = displayValue ?? value
	return (
		<motion.div
			initial={ROW_FROM}
			animate={ROW_TO}
			className="group flex w-full min-w-0 max-w-full items-center gap-2.5 overflow-hidden rounded-2xl border border-yellow-300/15 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent px-2.5 py-2 transition hover:border-yellow-300/35 hover:from-yellow-300/[0.06] sm:gap-3 sm:px-3 sm:py-2.5"
		>
			<div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-yellow-300/30 bg-gradient-to-br from-yellow-300/20 via-yellow-300/5 to-transparent text-yellow-200 shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
				{icon}
			</div>
			<div className="min-w-0 flex-1 overflow-hidden">
				<div className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow-200/65 sm:text-[10px] sm:tracking-[0.2em]">
					{label}
				</div>
				<div className="truncate text-[13px] text-white/90 sm:text-sm" title={value}>
					{shown}
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
const COPY_ICON = <Copy className="h-4 w-4" />

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
		const href = telHrefFor(card.phone_primary)
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
		const href = telHrefFor(card.phone_secondary)
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
		const href = telHrefFor(card.phone_extra)
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

	return (
		<Card className="relative h-full w-full min-w-0 max-w-full overflow-hidden rounded-[20px] border border-yellow-300/25 bg-[#06090f]/85 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:rounded-[24px] sm:p-5 lg:rounded-[28px] lg:p-6">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/70 to-transparent" />
			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/25 to-transparent" />
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_circle_at_-5%_-10%,rgba(245,197,66,0.10),transparent_55%)]" />
			<div className="relative w-full min-w-0 max-w-full">
				<div className="flex min-w-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-200/90 sm:text-[11px] sm:tracking-[0.24em]">
					<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(245,197,66,0.8)]" />
					<span className="min-w-0 truncate">{L.contactsTitle}</span>
				</div>
				<div className="mt-4 grid w-full min-w-0 max-w-full gap-2">{rows}</div>
			</div>
		</Card>
	)
}
