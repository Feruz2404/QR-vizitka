import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

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
		contactsTitle: 'Aloqa',
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
		contactsTitle: 'Contact',
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

const RIGHT_MOTION = {
	initial: { opacity: 0, y: 18 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.5, delay: 0.09 },
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
			<div className="min-h-screen">
				<div className="sticky top-0 z-40 border-b border-yellow-300/20 bg-black/40 backdrop-blur-xl">
					<div className="mx-auto max-w-[1180px] px-4 py-3">
						<Skeleton className="h-10 w-52" />
					</div>
				</div>
				<div className="mx-auto max-w-[1180px] p-4">
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		)
	}

	if (isError || !data) {
		return (
			<div className="min-h-screen grid place-items-center p-6">
				<Card className="max-w-lg p-6 text-center">
					<div className="text-xl font-semibold">{labels.notFound}</div>
					<p className="mt-2 text-sm text-brand-muted">{labels.notFoundDescription}</p>
				</Card>
			</div>
		)
	}

	if (!data.is_active) {
		return (
			<div className="min-h-screen grid place-items-center p-6">
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
						className="absolute inset-0 h-full w-full object-cover"
						loading="eager"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-[#02030a]/85 via-[#04060f]/80 to-[#02030a]/90" />
					<div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_10%_20%,rgba(245,197,66,0.18),transparent_55%),radial-gradient(800px_circle_at_90%_30%,rgba(59,130,246,0.14),transparent_55%)]" />
				</div>
			) : (
				<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
					<div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_15%,rgba(245,197,66,0.16),transparent_55%),radial-gradient(1000px_circle_at_90%_25%,rgba(59,130,246,0.16),transparent_55%),radial-gradient(800px_circle_at_45%_95%,rgba(167,139,250,0.12),transparent_55%),linear-gradient(180deg,#050712_0%,#070A14_30%,#02030A_100%)]" />
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

			<div className="mx-auto max-w-[1180px] px-4 pb-12 pt-6 sm:pt-8">
				<motion.div {...PAGE_MOTION}>
					<div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
						<motion.div {...HERO_MOTION}>
							<Card className="relative overflow-hidden rounded-[28px] border border-yellow-300/15 p-6 sm:p-7">
								<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_15%_10%,rgba(245,197,66,0.18),transparent_55%),radial-gradient(900px_circle_at_95%_15%,rgba(59,130,246,0.14),transparent_60%)]" />
								<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/60 to-transparent" />
								<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/25 to-transparent" />

								<div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
									<div className="relative">
										<div className="absolute -inset-3 rounded-full bg-gradient-to-b from-yellow-300/25 via-yellow-300/10 to-blue-400/10 blur-xl" />
										<div className="relative h-40 w-40 overflow-hidden rounded-full border-2 border-yellow-300/40 bg-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:h-44 sm:w-44">
											{heroPhoto ? (
												<img
													src={heroPhoto}
													alt={displayFullName + ' photo'}
													className="h-full w-full object-cover"
													loading="lazy"
												/>
											) : (
												<div className="grid h-full w-full place-items-center text-4xl font-semibold text-white/90">
													{initials(displayFullName)}
												</div>
											)}
										</div>
									</div>

									<div className="min-w-0 flex-1">
										<div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/30 bg-yellow-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-100">
											<span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
											{labels.profileBadge}
										</div>

										<div className="mt-3 text-3xl font-semibold tracking-tight sm:text-[34px]">
											{displayFullName}
										</div>
										<div className="mt-1 text-sm text-white/80 sm:text-base">{displayPosition}</div>
										<div className="mt-2 text-sm font-medium text-yellow-200/85">
											{displayOrgName}
										</div>
										{displayDepartment ? (
											<div className="mt-1 text-sm text-white/65">{displayDepartment}</div>
										) : null}
										{displayBio ? (
											<p className="mt-3 max-w-prose text-sm leading-relaxed text-white/70">
												{displayBio}
											</p>
										) : null}

										<div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2.5">
											{phoneHref ? (
												<a href={phoneHref} className="w-full sm:w-auto">
													<Button className="w-full sm:w-auto" aria-label={labels.call}>
														{labels.call}
													</Button>
												</a>
											) : null}

											{emailHref ? (
												<a href={emailHref} className="w-full sm:w-auto">
													<Button
														className="w-full sm:w-auto"
														variant="secondary"
														aria-label={labels.email}
													>
														{labels.email}
													</Button>
												</a>
											) : null}

											{tgHref ? (
												<a
													href={tgHref}
													target="_blank"
													rel="noreferrer noopener"
													className="w-full sm:w-auto"
												>
													<Button
														className="w-full sm:w-auto"
														variant="secondary"
														aria-label={labels.telegram}
													>
														{labels.telegram}
													</Button>
												</a>
											) : null}

											<div className="w-full sm:w-auto">
												<SaveContactButton
													card={data}
													className="w-full sm:w-auto"
													overrides={saveOverrides}
												/>
											</div>

											<div className="col-span-2 w-full sm:w-auto">
												<ShareButton url={url} title={pageTitle} />
											</div>
										</div>
									</div>
								</div>
							</Card>
						</motion.div>

						<motion.div {...RIGHT_MOTION} className="grid gap-5">
							{localized.specialties.length > 0 ? (
								<Card className="relative overflow-hidden rounded-[28px] border border-yellow-300/15 p-6">
									<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent" />
									<div className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-200/80">
										{labels.specialtiesTitle}
									</div>
									<ul className="mt-3 grid gap-2">
										{localized.specialties.map((item, idx) => (
											<li
												key={idx}
												className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85"
											>
												<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-300" />
												<span className="min-w-0 break-words">{item}</span>
											</li>
										))}
									</ul>
								</Card>
							) : null}

							<ContactSection card={data} labels={labels} />
						</motion.div>
					</div>
				</motion.div>
			</div>
		</div>
	)
}
