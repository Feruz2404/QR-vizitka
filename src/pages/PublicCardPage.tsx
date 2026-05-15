import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowUpRight, Building2, Globe, MapPin } from 'lucide-react'

import { EmployeeTopHeader } from '../components/public-card/EmployeeTopHeader'
import { ContactSection, type ContactLabels } from '../components/public-card/ContactSection'
import { SaveContactButton } from '../components/public-card/SaveContactButton'
import { ShareButton } from '../components/public-card/ShareButton'
import { useGetAppSettingsQuery } from '../services/appSettingsApi'
import { useGetCardBySlugQuery } from '../services/employeeCardsApi'
import type { EmployeeCard, EmployeeCardTranslation } from '../types/employee'
import { Button } from '../ui/Button'
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
	officialProfileTitle: string
	organizationLabel: string
	websiteLabel: string
	addressLabel: string
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
		officialProfileTitle: 'Rasmiy raqamli profil',
		organizationLabel: 'Tashkilot',
		websiteLabel: 'Veb-sayt',
		addressLabel: 'Manzil',
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
		officialProfileTitle: 'Официальный цифровой профиль',
		organizationLabel: 'Организация',
		websiteLabel: 'Веб-сайт',
		addressLabel: 'Адрес',
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
		officialProfileTitle: 'Official digital profile',
		organizationLabel: 'Organization',
		websiteLabel: 'Website',
		addressLabel: 'Address',
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

const BR_MOTION = {
	initial: { opacity: 0, y: 16 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.55, delay: 0.18 },
} as const

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
	const websiteUrl = data.website_url && isHttpUrl(data.website_url) ? data.website_url : null
	const addressValue = data.address && data.address.trim().length > 0 ? data.address : null
	const officialColSpanCls = hasSpecialties ? '' : 'lg:col-span-2'

	return (
		<div className="min-h-screen overflow-x-hidden text-white">
			<Helmet>
				<title>{pageTitle}</title>
				<meta name="description" content={pageDesc} />
				<meta property="og:title" content={pageTitle} />
				<meta property="og:description" content={pageDesc} />
			</Helmet>

			{backgroundImage ? (
				<div
					className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
					aria-hidden="true"
				>
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

			<div className="mx-auto w-full max-w-[1320px] px-3 pb-12 pt-5 sm:px-5 sm:pt-7 lg:px-6 lg:pt-9">
				<motion.div {...PAGE_MOTION}>
					<div className="grid gap-5 sm:gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-7">
						<motion.div {...HERO_MOTION}>
							<Card className="relative h-full overflow-hidden rounded-[28px] border border-yellow-300/30 bg-[#06090f]/82 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.65)] sm:p-7 lg:p-8">
								<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_10%_5%,rgba(245,197,66,0.18),transparent_55%),radial-gradient(900px_circle_at_95%_15%,rgba(59,130,246,0.14),transparent_60%)]" />
								<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/75 to-transparent" />
								<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent" />

								<div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:gap-7 sm:text-left">
									<div className="relative shrink-0">
										<div className="pointer-events-none absolute -inset-4 rounded-full bg-gradient-to-br from-yellow-300/40 via-yellow-300/15 to-blue-400/10 blur-2xl" />
										<div className="relative h-44 w-44 overflow-hidden rounded-full border-[3px] border-yellow-300/55 bg-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.7)] sm:h-48 sm:w-48 lg:h-52 lg:w-52">
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
											<span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
											{labels.profileBadge}
										</div>

										<h1 className="mt-3 break-words text-3xl font-bold tracking-tight text-white sm:text-[34px] lg:text-[38px]">
											{displayFullName}
										</h1>
										<div className="mt-1.5 text-sm text-yellow-100/90 sm:text-base">
											{displayPosition}
										</div>
										{displayDepartment ? (
											<div className="mt-1 text-xs text-white/65 sm:text-sm">{displayDepartment}</div>
										) : null}
										<div className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200 sm:text-sm">
											{displayOrgName}
										</div>
										{displayBio ? (
											<p className="mt-4 max-w-prose break-words text-sm leading-relaxed text-white/70 sm:text-[15px]">
												{displayBio}
											</p>
										) : null}

										<div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
											{phoneHref ? (
												<a href={phoneHref} className="w-full">
													<Button className="w-full" aria-label={labels.call}>
														{labels.call}
													</Button>
												</a>
											) : null}
											{emailHref ? (
												<a href={emailHref} className="w-full">
													<Button className="w-full" variant="secondary" aria-label={labels.email}>
														{labels.email}
													</Button>
												</a>
											) : null}
											{tgHref ? (
												<a
													href={tgHref}
													target="_blank"
													rel="noreferrer noopener"
													className="w-full"
												>
													<Button className="w-full" variant="secondary" aria-label={labels.telegram}>
														{labels.telegram}
													</Button>
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
							<motion.div {...BL_MOTION}>
								<Card className="relative h-full overflow-hidden rounded-[28px] border border-yellow-300/25 bg-[#06090f]/85 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:p-6">
									<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/70 to-transparent" />
									<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/25 to-transparent" />
									<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_circle_at_-5%_-10%,rgba(245,197,66,0.10),transparent_55%)]" />
									<div className="relative">
										<div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-200/90">
											<span className="h-1.5 w-1.5 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(245,197,66,0.8)]" />
											{labels.specialtiesTitle}
										</div>
										<ul className="mt-4 grid gap-2">
											{localized.specialties.map((item, idx) => (
												<li
													key={idx}
													className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent px-3 py-2.5 transition hover:border-yellow-300/30"
												>
													<span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-yellow-300/35 bg-gradient-to-br from-yellow-300/20 via-yellow-300/5 to-transparent">
														<span className="h-1.5 w-1.5 rounded-full bg-yellow-300 shadow-[0_0_10px_rgba(245,197,66,0.7)]" />
													</span>
													<span className="min-w-0 flex-1 break-words text-sm text-white/90">{item}</span>
													<ArrowUpRight className="h-4 w-4 shrink-0 text-yellow-200/70 transition group-hover:text-yellow-200" />
												</li>
											))}
										</ul>
									</div>
								</Card>
							</motion.div>
						) : null}

						<motion.div {...BR_MOTION} className={officialColSpanCls}>
							<Card className="relative h-full overflow-hidden rounded-[28px] border border-yellow-300/30 bg-gradient-to-br from-[#0a0f1c]/90 via-[#06090f]/90 to-[#020308]/95 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:p-6">
								<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/75 to-transparent" />
								<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent" />
								<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_circle_at_110%_110%,rgba(245,197,66,0.14),transparent_55%),radial-gradient(400px_circle_at_-5%_-5%,rgba(59,130,246,0.10),transparent_55%)]" />

								<div className="relative">
									<div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-yellow-200/90">
										<span className="h-1.5 w-1.5 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(245,197,66,0.8)]" />
										{labels.officialProfileTitle}
									</div>

									<div className="mt-4 grid gap-2">
										<div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent px-3 py-2.5">
											<div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-yellow-300/35 bg-gradient-to-br from-yellow-300/20 via-yellow-300/5 to-transparent text-yellow-200">
												{orgLogo ? (
													<img src={orgLogo} alt="" className="h-full w-full object-contain p-1.5" />
												) : (
													<Building2 className="h-4 w-4" />
												)}
											</div>
											<div className="min-w-0 flex-1">
												<div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-200/65">
													{labels.organizationLabel}
												</div>
												<div className="break-words text-sm font-semibold text-white/95">{displayOrgName}</div>
											</div>
										</div>

										{websiteUrl ? (
											<a
												href={websiteUrl}
												target="_blank"
												rel="noreferrer noopener"
												className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent px-3 py-2.5 transition hover:border-yellow-300/30"
											>
												<div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-yellow-300/35 bg-gradient-to-br from-yellow-300/20 via-yellow-300/5 to-transparent text-yellow-200">
													<Globe className="h-4 w-4" />
												</div>
												<div className="min-w-0 flex-1">
													<div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-200/65">
														{labels.websiteLabel}
													</div>
													<div className="truncate text-sm text-white/90" title={websiteUrl}>
														{websiteUrl}
													</div>
												</div>
												<ArrowUpRight className="h-4 w-4 shrink-0 text-yellow-200/70 transition group-hover:text-yellow-200" />
											</a>
										) : null}

										{addressValue ? (
											<div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent px-3 py-2.5">
												<div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-yellow-300/35 bg-gradient-to-br from-yellow-300/20 via-yellow-300/5 to-transparent text-yellow-200">
													<MapPin className="h-4 w-4" />
												</div>
												<div className="min-w-0 flex-1">
													<div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-200/65">
														{labels.addressLabel}
													</div>
													<div className="break-words text-sm text-white/90">{addressValue}</div>
												</div>
											</div>
										) : null}
									</div>

									<div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
										<SaveContactButton card={data} className="w-full" overrides={saveOverrides} />
										<ShareButton url={url} title={pageTitle} />
									</div>
								</div>
							</Card>
						</motion.div>
					</div>
				</motion.div>
			</div>
		</div>
	)
}
