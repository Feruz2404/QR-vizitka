import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
	BarChart3,
	ChevronRight,
	Cpu,
	Database,
	Landmark,
	Lightbulb,
	Mail,
	Network,
	Phone,
	Send,
	Settings2,
	ShieldCheck,
	Workflow,
} from 'lucide-react'

import { EmployeeTopHeader } from '../components/public-card/EmployeeTopHeader'
import { ContactSection, type ContactLabels } from '../components/public-card/ContactSection'
import { SaveContactButton } from '../components/public-card/SaveContactButton'
import { ShareButton } from '../components/public-card/ShareButton'
import { useGetAppSettingsQuery } from '../services/appSettingsApi'
import { useGetCardBySlugQuery } from '../services/employeeCardsApi'
import type { EmployeeCard, EmployeeCardTranslation } from '../types/employee'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

type PublicLang = 'uz' | 'ru' | 'en'

type Translations = ContactLabels & {
	orgName: string
	orgSubtitle: string
	brandBadge: string
	profileBadge: string
	languageLabel: string
	specialtiesTitle: string
	call: string
	email: string
	telegram: string
	notFound: string
	notFoundDescription: string
	unavailable: string
	unavailableDescription: string
}

const T: Record<PublicLang, Translations> = {
	uz: {
		orgName: 'O‘ZGIDROMET',
		orgSubtitle: 'Rasmiy raqamli vizitka',
		brandBadge: 'Raqamli vizitka',
		profileBadge: 'Rasmiy raqamli profil',
		languageLabel: 'Til',
		specialtiesTitle: 'Mutaxassisliklar',
		contactsTitle: 'Aloqa ma’lumotlari',
		workEmail: 'Ish email',
		personalEmail: 'Shaxsiy email',
		primaryPhone: 'Bosh telefon',
		secondaryPhone: 'Qo‘shimcha telefon',
		extraPhone: 'Zaxira telefon',
		internalPhone: 'Ichki raqam',
		telegram: 'Telegram',
		facebook: 'Facebook',
		website: 'Veb-sayt',
		address: 'Manzil',
		openAction: 'Ochish',
		callAction: 'Qo‘ng‘iroq',
		emailAction: 'Yozish',
		copyAction: 'Nusxalash',
		mapAction: 'Xaritada ochish',
		call: 'Qo‘ng‘iroq',
		email: 'Email',
		notFound: 'Karta topilmadi',
		notFoundDescription: 'Bu xodim kartasi mavjud emas yoki havola yaroqsiz.',
		unavailable: 'Karta mavjud emas',
		unavailableDescription: 'Bu xodim kartasi hozircha nashr etilmagan.',
	},
	ru: {
		orgName: 'ЎЗГИДРОМЕТ',
		orgSubtitle: 'Официальная цифровая визитка',
		brandBadge: 'Цифровая визитка',
		profileBadge: 'Официальный цифровой профиль',
		languageLabel: 'Язык',
		specialtiesTitle: 'Специализации',
		contactsTitle: 'Контакты',
		workEmail: 'Рабочий email',
		personalEmail: 'Личный email',
		primaryPhone: 'Основной телефон',
		secondaryPhone: 'Дополнительный телефон',
		extraPhone: 'Резервный телефон',
		internalPhone: 'Внутренний номер',
		telegram: 'Telegram',
		facebook: 'Facebook',
		website: 'Веб-сайт',
		address: 'Адрес',
		openAction: 'Открыть',
		callAction: 'Позвонить',
		emailAction: 'Написать',
		copyAction: 'Копировать',
		mapAction: 'Открыть на карте',
		call: 'Позвонить',
		email: 'Email',
		notFound: 'Карта не найдена',
		notFoundDescription: 'Эта карта сотрудника не существует или ссылка недействительна.',
		unavailable: 'Карта недоступна',
		unavailableDescription: 'Эта карта сотрудника пока не опубликована.',
	},
	en: {
		orgName: 'UZHYDROMET',
		orgSubtitle: 'Official digital business card',
		brandBadge: 'Digital business card',
		profileBadge: 'Official digital profile',
		languageLabel: 'Language',
		specialtiesTitle: 'Specialties',
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
		call: 'Call',
		email: 'Email',
		notFound: 'Card not found',
		notFoundDescription: 'This employee card does not exist or the link is invalid.',
		unavailable: 'Card unavailable',
		unavailableDescription: 'This employee card is currently unpublished.',
	},
}

const PAGE_MOTION = {
	initial: { opacity: 0, y: 12 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.35 },
} as const

const HERO_MOTION = {
	initial: { opacity: 0, y: 16 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.45, delay: 0.05 },
} as const

const TR_MOTION = {
	initial: { opacity: 0, y: 16 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.5, delay: 0.1 },
} as const

const BL_MOTION = {
	initial: { opacity: 0, y: 16 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.5, delay: 0.14 },
} as const

const CTA_PRIMARY =
	'inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-yellow-300/55 bg-gradient-to-b from-yellow-300/45 via-yellow-300/22 to-yellow-300/8 px-4 py-2.5 text-sm font-semibold text-yellow-50 shadow-[0_12px_36px_rgba(245,197,66,0.25)] transition hover:from-yellow-300/55 hover:via-yellow-300/28 hover:to-yellow-300/14 active:scale-[0.98]'

const CTA_SECONDARY =
	'inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-yellow-300/30 bg-black/45 px-4 py-2.5 text-sm font-semibold text-yellow-100 transition hover:border-yellow-300/55 hover:bg-yellow-300/10 active:scale-[0.98]'

const ROW_GLASS =
	'group flex items-center gap-3 rounded-2xl border border-yellow-300/12 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent px-3 py-2.5 transition hover:border-yellow-300/30'

const ICON_BOX =
	'grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-yellow-300/35 bg-gradient-to-br from-yellow-300/20 via-yellow-300/5 to-transparent text-yellow-200 shadow-[0_8px_30px_rgba(0,0,0,0.45)]'

const SPEC_ICONS = [Cpu, Network, BarChart3, ShieldCheck, Lightbulb, Workflow, Database, Settings2]

function fullUrl(publicBaseUrl: string, slug: string) {
	return publicBaseUrl.replace(/\/$/, '') + '/v/' + slug
}

function initials(fullName: string) {
	const parts = fullName.trim().split(/\s+/).filter(Boolean)
	const a = parts[0]?.[0] ?? ''
	const b = parts[1]?.[0] ?? ''
	return (a + b).toUpperCase()
}

function digitsOnly(v: string) {
	return v.replace(/\D/g, '')
}

function telNormalize(value?: string | null) {
	if (!value) return null
	const raw = digitsOnly(value)
	if (!raw) return null
	if (raw.startsWith('998')) return '+' + raw
	if (raw.length === 9) return '+998' + raw
	return value.startsWith('+') ? value : '+' + raw
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

const TG_BASE = 'https://' + 't.me/'

function telegramHref(card: {
	telegram_url?: string | null
	telegram_username?: string | null
}) {
	if (isHttpUrl(card.telegram_url)) return card.telegram_url as string
	const u = (card.telegram_username ?? '').trim().replace(/^@/, '')
	if (u) return TG_BASE + u
	const f = (card.telegram_url ?? '').trim().replace(/^@/, '')
	if (f && /^[a-zA-Z0-9_]{3,}$/.test(f)) return TG_BASE + f
	return null
}

type LocalizableField = 'full_name' | 'position' | 'department' | 'organization_name' | 'bio'

function pickTranslatedField(
	card: EmployeeCard,
	lang: PublicLang,
	field: LocalizableField,
): string {
	const trs = card.translations ?? undefined
	const langTr = (trs ? trs[lang] : undefined) as EmployeeCardTranslation | undefined
	const uzTr = (trs ? trs.uz : undefined) as EmployeeCardTranslation | undefined
	const fromLang = langTr ? (langTr as any)[field] : undefined
	if (fromLang !== undefined && fromLang !== null && fromLang !== '') return String(fromLang)
	const fromUz = uzTr ? (uzTr as any)[field] : undefined
	if (fromUz !== undefined && fromUz !== null && fromUz !== '') return String(fromUz)
	const base = (card as any)[field]
	if (base !== undefined && base !== null && base !== '') return String(base)
	return ''
}

function pickTranslatedSpecialties(card: EmployeeCard, lang: PublicLang): string[] {
	const trs = card.translations ?? undefined
	const langTr = (trs ? trs[lang] : undefined) as EmployeeCardTranslation | undefined
	const uzTr = (trs ? trs.uz : undefined) as EmployeeCardTranslation | undefined
	const fromLang = langTr?.specialties
	if (Array.isArray(fromLang) && fromLang.length > 0) return fromLang.filter((s) => s && s.trim().length > 0)
	const fromUz = uzTr?.specialties
	if (Array.isArray(fromUz) && fromUz.length > 0) return fromUz.filter((s) => s && s.trim().length > 0)
	return []
}

export function PublicCardPage() {
	const { slug } = useParams()
	const safeSlug = slug ?? ''
	const { data, isLoading, isError } = useGetCardBySlugQuery(safeSlug)
	const { data: settings } = useGetAppSettingsQuery()

	const [lang, setLang] = useState<PublicLang>('uz')
	const labels = T[lang]

	const publicBaseUrl =
		(import.meta.env.VITE_PUBLIC_BASE_URL as string | undefined) ?? window.location.origin
	const url = safeSlug ? fullUrl(publicBaseUrl, safeSlug) : window.location.href

	const tgHref = useMemo(() => (data ? telegramHref(data) : null), [data])

	const phoneRaw = data?.phone_primary ?? data?.phone_secondary ?? data?.phone_extra ?? null
	const phoneHref = useMemo(() => {
		if (!phoneRaw) return null
		const n = telNormalize(phoneRaw)
		return n ? 'tel:' + n : 'tel:' + phoneRaw
	}, [phoneRaw])

	const emailRaw = data?.work_email ?? data?.personal_email ?? null
	const emailHref = emailRaw ? 'mailto:' + emailRaw : null

	const globalBg = isHttpUrl(settings?.background_image_url) ? settings!.background_image_url : null
	const employeeBg = isHttpUrl(data?.background_image_url) ? data!.background_image_url : null
	const backgroundImage = globalBg ?? employeeBg ?? null

	const globalLogo = isHttpUrl(settings?.organization_logo_url)
		? settings!.organization_logo_url
		: null
	const employeeLogo = isHttpUrl(data?.logo_url) ? data!.logo_url : null
	const orgLogo = globalLogo ?? employeeLogo ?? null

	const localized = useMemo(() => {
		if (!data) {
			return {
				fullName: '',
				position: '',
				department: '',
				organizationName: '',
				bio: '',
				specialties: [] as string[],
			}
		}
		return {
			fullName: pickTranslatedField(data, lang, 'full_name'),
			position: pickTranslatedField(data, lang, 'position'),
			department: pickTranslatedField(data, lang, 'department'),
			organizationName: pickTranslatedField(data, lang, 'organization_name'),
			bio: pickTranslatedField(data, lang, 'bio'),
			specialties: pickTranslatedSpecialties(data, lang),
		}
	}, [data, lang])

	const displayOrgName = localized.organizationName || labels.orgName

	if (isLoading) {
		return (
			<div className="min-h-screen overflow-x-hidden">
				<div className="sticky top-0 z-40 border-b border-yellow-300/20 bg-black/45 backdrop-blur-xl">
					<div className="mx-auto max-w-[1320px] px-4 py-4">
						<Skeleton className="h-12 w-56" />
					</div>
				</div>
				<div className="mx-auto max-w-[1320px] p-4">
					<Skeleton className="h-72 w-full" />
				</div>
			</div>
		)
	}

	if (isError || !data) {
		return (
			<div className="min-h-screen grid place-items-center overflow-x-hidden p-6">
				<Card className="max-w-lg p-6 text-center">
					<div className="text-xl font-semibold">{labels.notFound}</div>
					<p className="mt-2 text-sm text-brand-muted">{labels.notFoundDescription}</p>
				</Card>
			</div>
		)
	}

	if (!data.is_active) {
		return (
			<div className="min-h-screen grid place-items-center overflow-x-hidden p-6">
				<Card className="max-w-lg p-6 text-center">
					<div className="text-xl font-semibold">{labels.unavailable}</div>
					<p className="mt-2 text-sm text-brand-muted">{labels.unavailableDescription}</p>
				</Card>
			</div>
		)
	}

	const heroPhoto = data.profile_photo_url
	const displayFullName = localized.fullName || data.full_name
	const displayPosition = localized.position || data.position
	const displayDepartment = localized.department
	const displayBio = localized.bio
	const pageTitle = displayFullName + ' | ' + displayOrgName
	const pageDesc = displayFullName + ', ' + displayPosition

	const saveOverrides = {
		full_name: displayFullName,
		position: displayPosition,
		organization_name: displayOrgName,
	}

	const hasSpecialties = localized.specialties.length > 0

	return (
		<div className="min-h-screen overflow-x-hidden text-white">
			<Helmet>
				<title>{pageTitle}</title>
				<meta name="description" content={pageDesc} />
				<meta property="og:title" content={pageTitle} />
				<meta property="og:description" content={pageDesc} />
			</Helmet>

			{backgroundImage ? (
				<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
					<img
						src={backgroundImage}
						alt=""
						className="absolute inset-0 h-full w-full object-cover object-center"
						loading="eager"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-[#02030a]/72 via-[#04060f]/62 to-[#02030a]/82" />
					<div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_8%_15%,rgba(245,197,66,0.18),transparent_55%),radial-gradient(900px_circle_at_92%_28%,rgba(59,130,246,0.16),transparent_55%),radial-gradient(900px_circle_at_50%_110%,rgba(167,139,250,0.14),transparent_60%)]" />
				</div>
			) : (
				<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
					<div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_15%,rgba(245,197,66,0.18),transparent_55%),radial-gradient(1000px_circle_at_90%_25%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(800px_circle_at_45%_95%,rgba(167,139,250,0.14),transparent_55%),linear-gradient(180deg,#050712_0%,#070A14_30%,#02030A_100%)]" />
					<div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:18px_18px]" />
					<div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-yellow-400/10 blur-3xl" />
					<div className="absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-3xl" />
					<div className="absolute left-1/3 bottom-[-240px] h-[520px] w-[520px] rounded-full bg-purple-500/10 blur-3xl" />
				</div>
			)}

			<EmployeeTopHeader
				orgName={displayOrgName}
				subtitle={labels.orgSubtitle}
				organizationLogoUrl={orgLogo}
				fullName={displayFullName}
				position={displayPosition}
				profilePhotoUrl={data.profile_photo_url}
				lang={lang}
				onLangChange={setLang}
				languageLabel={labels.languageLabel}
			/>

			<div className="mx-auto w-full max-w-[1320px] px-3 pb-12 pt-5 sm:px-5 sm:pt-7 lg:px-6 lg:pt-8">
				<motion.div {...PAGE_MOTION}>
					<div className="grid gap-5 sm:gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
						<motion.div {...HERO_MOTION}>
							<Card className="relative h-full overflow-hidden rounded-[28px] border border-yellow-300/30 bg-[#06090f]/82 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.65)] sm:p-6 lg:p-7">
								<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_10%_5%,rgba(245,197,66,0.18),transparent_55%),radial-gradient(900px_circle_at_95%_15%,rgba(59,130,246,0.14),transparent_60%)]" />
								<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/75 to-transparent" />
								<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent" />

								<div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
									<div className="relative shrink-0">
										<div className="pointer-events-none absolute -inset-4 rounded-full bg-gradient-to-br from-yellow-300/40 via-yellow-300/15 to-blue-400/10 blur-2xl" />
										<div className="relative h-36 w-36 overflow-hidden rounded-full border-[3px] border-yellow-300/55 bg-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.7)] sm:h-40 sm:w-40 lg:h-44 lg:w-44">
											{heroPhoto ? (
												<img
													src={heroPhoto}
													alt={displayFullName + ' photo'}
													className="h-full w-full object-cover"
													loading="lazy"
												/>
											) : (
												<div className="grid h-full w-full place-items-center text-5xl font-semibold text-white/90">
													{initials(displayFullName)}
												</div>
											)}
										</div>
										<div className="pointer-events-none absolute -inset-1 rounded-full border border-yellow-300/30" />
									</div>

									<div className="min-w-0 flex-1">
										<div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/40 bg-yellow-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-yellow-100">
											<ShieldCheck className="h-3.5 w-3.5 text-yellow-200" aria-hidden="true" />
											{labels.profileBadge}
										</div>

										<h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[32px]">
											{displayFullName}
										</h1>
										<div className="mt-1.5 text-sm text-yellow-100/90 sm:text-base">
											{displayPosition}
										</div>
										{displayDepartment ? (
											<div className="mt-1 text-xs text-white/65 sm:text-sm">{displayDepartment}</div>
										) : null}
										<div className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-yellow-200 sm:text-xs">
											<Landmark className="h-3.5 w-3.5 text-yellow-200/85" aria-hidden="true" />
											<span className="break-words">{displayOrgName}</span>
										</div>
										{displayBio ? (
											<p className="mt-3 max-w-prose break-words text-sm leading-relaxed text-white/70 sm:text-[15px]">
												{displayBio}
											</p>
										) : null}

										<div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
											{phoneHref ? (
												<a href={phoneHref} className={CTA_PRIMARY} aria-label={labels.call}>
													<Phone className="h-4 w-4" aria-hidden="true" />
													<span>{labels.call}</span>
												</a>
											) : null}
											{emailHref ? (
												<a href={emailHref} className={CTA_SECONDARY} aria-label={labels.email}>
													<Mail className="h-4 w-4" aria-hidden="true" />
													<span>{labels.email}</span>
												</a>
											) : null}
											{tgHref ? (
												<a
													href={tgHref}
													target="_blank"
													rel="noreferrer noopener"
													className={CTA_SECONDARY}
													aria-label={labels.telegram}
												>
													<Send className="h-4 w-4" aria-hidden="true" />
													<span>{labels.telegram}</span>
												</a>
											) : null}
										</div>

										<div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
											<SaveContactButton card={data} className="w-full" overrides={saveOverrides} />
											<ShareButton url={url} title={pageTitle} />
										</div>
									</div>
								</div>
							</Card>
						</motion.div>

						<motion.div {...TR_MOTION}>
							<ContactSection card={data} labels={labels} />
						</motion.div>

						{hasSpecialties ? (
							<motion.div {...BL_MOTION} className="lg:col-span-2">
								<Card className="relative h-full overflow-hidden rounded-[28px] border border-yellow-300/25 bg-[#06090f]/85 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:p-6">
									<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/70 to-transparent" />
									<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/25 to-transparent" />
									<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_circle_at_-5%_-10%,rgba(245,197,66,0.10),transparent_55%)]" />
									<div className="relative">
										<div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-200/90">
											<span className="h-1.5 w-1.5 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(245,197,66,0.8)]" />
											{labels.specialtiesTitle}
										</div>
										<ul className="mt-4 grid gap-2 sm:grid-cols-2">
											{localized.specialties.map((item, idx) => {
												const Icon = SPEC_ICONS[idx % SPEC_ICONS.length]
												return (
													<li key={idx} className={ROW_GLASS}>
														<span className={ICON_BOX}>
															<Icon className="h-4 w-4" aria-hidden="true" />
														</span>
														<span className="min-w-0 flex-1 break-words text-sm text-white/90">{item}</span>
														<ChevronRight className="h-4 w-4 shrink-0 text-yellow-200/70 transition group-hover:text-yellow-200" aria-hidden="true" />
													</li>
												)
											})}
										</ul>
									</div>
								</Card>
							</motion.div>
						) : null}
					</div>
				</motion.div>
			</div>
		</div>
	)
}
