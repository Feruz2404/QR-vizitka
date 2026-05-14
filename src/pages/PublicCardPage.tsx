import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Building2, ChevronRight, Download, Mail, Phone, Send, Share2, Sparkles } from 'lucide-react'

import { ContactSection, type ContactLabels } from '../components/public-card/ContactSection'
import { EmployeeTopHeader, type PublicLang } from '../components/public-card/EmployeeTopHeader'
import { useGetAppSettingsQuery } from '../services/appSettingsApi'
import { useGetCardBySlugQuery } from '../services/employeeCardsApi'
import { downloadVCardFile, generateVCard } from '../lib/vcard'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { useToast } from '../ui/Toast'

type Translations = ContactLabels & {
	brandTitle: string
	brandSubtitle: string
	languageLabel: string
	profileBadge: string
	call: string
	email: string
	telegramAction: string
	saveContact: string
	share: string
	specializations: string
}

const TG_BASE = 'https://' + 't.me/'

const MOTION_FROM = { y: 16, opacity: 0 } as const
const MOTION_TO = { y: 0, opacity: 1 } as const
const T_HERO = { duration: 0.45, ease: 'easeOut' as const }
const T_CONTACT = { duration: 0.5, ease: 'easeOut' as const, delay: 0.05 }
const T_BIO = { duration: 0.55, ease: 'easeOut' as const, delay: 0.1 }

const T: Record<PublicLang, Translations> = {
	uz: {
		brandTitle: "O'ZGIDROMET",
		brandSubtitle: 'Rasmiy raqamli vizitka',
		languageLabel: 'Til',
		profileBadge: 'Rasmiy profil',
		contactsTitle: "Aloqa ma'lumotlari",
		workEmail: 'Ish email',
		personalEmail: 'Shaxsiy email',
		primaryPhone: 'Bosh telefon',
		secondaryPhone: "Qo'shimcha telefon",
		extraPhone: 'Zaxira telefon',
		telegram: 'Telegram',
		facebook: 'Facebook',
		call: "Qo'ng'iroq qilish",
		email: 'Email',
		telegramAction: 'Telegram',
		saveContact: 'Kontaktni saqlash',
		share: 'Ulashish',
		specializations: "Mutaxassislik yo'nalishlari",
	},
	ru: {
		brandTitle: 'УЗГИДРОМЕТ',
		brandSubtitle: 'Официальная цифровая визитка',
		languageLabel: 'Язык',
		profileBadge: 'Официальный профиль',
		contactsTitle: 'Контактная информация',
		workEmail: 'Рабочий email',
		personalEmail: 'Личный email',
		primaryPhone: 'Основной телефон',
		secondaryPhone: 'Дополнительный телефон',
		extraPhone: 'Резервный телефон',
		telegram: 'Telegram',
		facebook: 'Facebook',
		call: 'Позвонить',
		email: 'Написать',
		telegramAction: 'Telegram',
		saveContact: 'Сохранить контакт',
		share: 'Поделиться',
		specializations: 'Направления специализации',
	},
	en: {
		brandTitle: 'UZHYDROMET',
		brandSubtitle: 'Official digital business card',
		languageLabel: 'Language',
		profileBadge: 'Official profile',
		contactsTitle: 'Contact information',
		workEmail: 'Work email',
		personalEmail: 'Personal email',
		primaryPhone: 'Primary phone',
		secondaryPhone: 'Secondary phone',
		extraPhone: 'Extra phone',
		telegram: 'Telegram',
		facebook: 'Facebook',
		call: 'Call',
		email: 'Email',
		telegramAction: 'Telegram',
		saveContact: 'Save contact',
		share: 'Share',
		specializations: 'Specialization areas',
	},
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

function digitsOnly(s: string) {
	return s.replace(/\D/g, '')
}

function initials(name: string) {
	const parts = name.trim().split(/\s+/).slice(0, 2)
	return parts.map((p) => p.charAt(0).toUpperCase()).join('') || '?'
}

function telHref(value?: string | null) {
	if (!value) return null
	const raw = digitsOnly(value)
	if (!raw) return 'tel:' + value
	if (raw.startsWith('998')) return 'tel:+' + raw
	if (raw.length === 9) return 'tel:+998' + raw
	return value.startsWith('+') ? 'tel:' + value : 'tel:+' + raw
}

function telegramHref(card: { telegram_url?: string | null; telegram_username?: string | null }) {
	if (isHttpUrl(card.telegram_url)) return card.telegram_url as string
	const u = (card.telegram_username ?? '').trim().replace(/^@/, '')
	if (u) return TG_BASE + u
	const f = (card.telegram_url ?? '').trim().replace(/^@/, '')
	if (f && /^[a-zA-Z0-9_]{3,}$/.test(f)) return TG_BASE + f
	return null
}

function bioToBullets(bio?: string | null) {
	if (!bio) return []
	return bio
		.split(/[\n;•]/)
		.map((s) => s.trim())
		.filter(Boolean)
		.slice(0, 12)
}

function NotFound() {
	return (
		<div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4">
			<Card className="w-full p-8 text-center">
				<div className="text-lg font-semibold">Card not found</div>
				<div className="mt-1 text-sm text-brand-muted">The requested public card does not exist or is unpublished.</div>
			</Card>
		</div>
	)
}

function LoadingView() {
	return (
		<div className="mx-auto w-full max-w-[1240px] px-4 py-10">
			<Skeleton className="h-16 w-full" />
			<div className="mt-6 grid gap-6 lg:grid-cols-2">
				<Skeleton className="h-[420px] w-full" />
				<Skeleton className="h-[420px] w-full" />
			</div>
		</div>
	)
}

function PublicCardPage() {
	const { slug } = useParams<{ slug: string }>()
	const [lang, setLang] = useState<PublicLang>('uz')
	const labels = T[lang]
	const toast = useToast()

	const { data: card, isLoading, isError } = useGetCardBySlugQuery(slug ?? '', { skip: !slug })
	const { data: settings } = useGetAppSettingsQuery()

	const globalBg = isHttpUrl(settings?.background_image_url) ? (settings!.background_image_url as string) : null
	const globalLogo = isHttpUrl(settings?.organization_logo_url) ? (settings!.organization_logo_url as string) : null
	const employeeLogo = isHttpUrl(card?.logo_url) ? (card!.logo_url as string) : null
	const headerLogo = globalLogo ?? employeeLogo ?? null

	const bioBullets = useMemo(() => bioToBullets(card?.bio), [card?.bio])
	const tgUrl = useMemo(() => (card ? telegramHref(card) : null), [card])
	const phoneHref = useMemo(() => telHref(card?.phone_primary), [card?.phone_primary])
	const emailHref = card?.work_email ? 'mailto:' + card.work_email : null

	async function handleSaveContact() {
		if (!card) return
		try {
			const vc = generateVCard(card)
			downloadVCardFile(vc, (card.slug || 'card') + '.vcf')
		} catch {
			toast.push('Unable to generate contact file')
		}
	}

	async function handleShare() {
		if (typeof window === 'undefined') return
		const url = window.location.href
		const title = card?.full_name ?? labels.brandTitle
		try {
			if (typeof navigator !== 'undefined' && navigator.share) {
				await navigator.share({ title, url })
			} else if (typeof navigator !== 'undefined' && navigator.clipboard) {
				await navigator.clipboard.writeText(url)
				toast.push('Link copied')
			}
		} catch {
			/* user dismissed */
		}
	}

	if (isLoading) return <LoadingView />
	if (isError || !card) return <NotFound />

	const fullName = card.full_name
	const photo = card.profile_photo_url || null
	const orgName = card.organization || null
	const dept = card.department || null

	const bgStyle: React.CSSProperties = globalBg
		? { backgroundImage: 'url(' + globalBg + ')', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
		: { background: 'radial-gradient(1200px circle at 20% 10%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(1200px circle at 80% 0%, rgba(245,197,66,0.16), transparent 55%), linear-gradient(180deg, #05070d 0%, #0a0d16 60%, #05070d 100%)' }

	return (
		<>
			<Helmet>
				<title>{fullName + ' — ' + labels.brandTitle}</title>
			</Helmet>

			<div className="fixed inset-0 -z-10">
				<div className="absolute inset-0" style={bgStyle} />
				<div className="absolute inset-0 bg-black/65" />
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_15%_-10%,rgba(99,102,241,0.22),transparent_60%),radial-gradient(900px_circle_at_85%_-10%,rgba(245,197,66,0.20),transparent_55%)]" />
			</div>

			<div className="relative mx-auto w-full max-w-[1240px] px-4 py-8 sm:py-10">
				<EmployeeTopHeader
					fullName={fullName}
					position={card.position}
					profilePhotoUrl={photo}
					organizationLogoUrl={headerLogo}
					brandTitle={labels.brandTitle}
					brandSubtitle={labels.brandSubtitle}
					languageLabel={labels.languageLabel}
					lang={lang}
					onLangChange={setLang}
				/>

				<div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
					<motion.section
						initial={MOTION_FROM}
						animate={MOTION_TO}
						transition={T_HERO}
						className="relative overflow-hidden rounded-[28px] border border-yellow-500/25 bg-black/45 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.5)] sm:p-7"
					>
						<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_-10%,rgba(245,197,66,0.12),transparent_60%)]" />
						<div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-yellow-300/15" />
						<div className="relative">
							<div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-200/90">
								<Sparkles className="h-3.5 w-3.5" />
								{labels.profileBadge}
							</div>
							<div className="mt-5 flex items-start gap-5">
								<div className="relative shrink-0">
									<div className="absolute -inset-1 rounded-full bg-gradient-to-br from-yellow-300/40 via-yellow-500/20 to-transparent blur" />
									<div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-yellow-300/60 bg-white/10 sm:h-28 sm:w-28">
										{photo ? (
											<img src={photo} alt={fullName} className="h-full w-full object-cover" loading="lazy" />
										) : (
											<div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white/80">
												{initials(fullName)}
											</div>
										)}
									</div>
								</div>
								<div className="min-w-0 flex-1">
									<h1 className="truncate text-2xl font-semibold text-white sm:text-3xl">{fullName}</h1>
									<div className="mt-1 truncate text-sm text-white/80 sm:text-base">{card.position}</div>
									<div className="mt-3 flex flex-wrap gap-2">
										{orgName ? (
											<span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/80">
												<Building2 className="h-3.5 w-3.5" />
												{orgName}
											</span>
										) : null}
										{dept ? (
											<span className="inline-flex items-center rounded-full border border-yellow-300/25 bg-yellow-300/10 px-2.5 py-1 text-xs text-yellow-100">
												{dept}
											</span>
										) : null}
									</div>
								</div>
							</div>

							<div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
								<a
									href={phoneHref ?? '#'}
									aria-label={labels.call}
									className={
										'inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm transition ' +
										(phoneHref
											? 'border-yellow-300/45 bg-yellow-300/10 text-yellow-100 hover:bg-yellow-300/20'
											: 'pointer-events-none border-white/10 bg-white/5 text-white/40')
									}
								>
									<Phone className="h-4 w-4" />
									{labels.call}
								</a>
								<a
									href={emailHref ?? '#'}
									aria-label={labels.email}
									className={
										'inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm transition ' +
										(emailHref
											? 'border-white/15 bg-white/5 text-white/90 hover:bg-white/10'
											: 'pointer-events-none border-white/10 bg-white/5 text-white/40')
									}
								>
									<Mail className="h-4 w-4" />
									{labels.email}
								</a>
								<a
									href={tgUrl ?? '#'}
									target={tgUrl ? '_blank' : undefined}
									rel={tgUrl ? 'noreferrer noopener' : undefined}
									aria-label={labels.telegramAction}
									className={
										'inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm transition ' +
										(tgUrl
											? 'border-white/15 bg-white/5 text-white/90 hover:bg-white/10'
											: 'pointer-events-none border-white/10 bg-white/5 text-white/40')
									}
								>
									<Send className="h-4 w-4" />
									{labels.telegramAction}
								</a>
							</div>

							<div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
								<Button variant="primary" size="md" onClick={handleSaveContact}>
									<Download className="h-4 w-4" />
									{labels.saveContact}
								</Button>
								<Button variant="secondary" size="md" onClick={handleShare}>
									<Share2 className="h-4 w-4" />
									{labels.share}
								</Button>
							</div>
						</div>
					</motion.section>

					<motion.section
						initial={MOTION_FROM}
						animate={MOTION_TO}
						transition={T_CONTACT}
					>
						<ContactSection card={card} labels={labels} />
					</motion.section>

					{bioBullets.length > 0 ? (
						<motion.section
							initial={MOTION_FROM}
							animate={MOTION_TO}
							transition={T_BIO}
							className="lg:col-span-2"
						>
							<div className="relative overflow-hidden rounded-[28px] border border-yellow-500/20 bg-black/45 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:p-7">
								<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_-10%,rgba(99,102,241,0.10),transparent_60%)]" />
								<div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-yellow-300/15" />
								<div className="relative">
									<div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-200/85">
										{labels.specializations}
									</div>
									<ul className="mt-4 grid gap-2 sm:grid-cols-2">
										{bioBullets.map((line, idx) => (
											<li
												key={idx}
												className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/85"
											>
												<ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-yellow-200/85" />
												<span className="min-w-0">{line}</span>
											</li>
										))}
									</ul>
								</div>
							</div>
						</motion.section>
					) : null}
				</div>
			</div>
		</>
	)
}

export { PublicCardPage }
export default PublicCardPage
