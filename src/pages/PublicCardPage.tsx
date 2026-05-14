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
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

type PublicLang = 'uz' | 'ru' | 'en'

type Translations = ContactLabels & {
	brandBadge: string
	languageLabel: string
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
		brandBadge: 'Raqamli vizitka',
		languageLabel: 'Til',
		contactsTitle: 'Aloqa',
		workEmail: 'Ish email',
		personalEmail: 'Shaxsiy email',
		primaryPhone: 'Bosh telefon',
		secondaryPhone: "Qo'shimcha telefon",
		extraPhone: 'Zaxira telefon',
		internalPhone: 'Ichki raqam',
		telegram: 'Telegram',
		facebook: 'Facebook',
		website: 'Veb-sayt',
		address: 'Manzil',
		openAction: 'Ochish',
		callAction: "Qo'ng'iroq",
		emailAction: 'Yozish',
		copyAction: 'Nusxalash',
		call: "Qo'ng'iroq",
		email: 'Email',
		notFound: 'Karta topilmadi',
		notFoundDescription: 'Bu xodim kartasi mavjud emas yoki havola yaroqsiz.',
		unavailable: 'Karta mavjud emas',
		unavailableDescription: 'Bu xodim kartasi hozircha nashr etilmagan.',
	},
	ru: {
		brandBadge: 'Цифровая визитка',
		languageLabel: 'Язык',
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
		brandBadge: 'Digital business card',
		languageLabel: 'Language',
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
}

const HERO_MOTION = {
	initial: { opacity: 0, y: 16 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.45, delay: 0.05 },
}

const RIGHT_MOTION = {
	initial: { opacity: 0, y: 18 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.5, delay: 0.09 },
}

const LANG_CODES = ['uz', 'ru', 'en'] as const

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

function telegramHref(card: { telegram_url?: string | null; telegram_username?: string | null }) {
	if (isHttpUrl(card.telegram_url)) return card.telegram_url as string
	const u = (card.telegram_username ?? '').trim().replace(/^@/, '')
	if (u) return TG_BASE + u
	const f = (card.telegram_url ?? '').trim().replace(/^@/, '')
	if (f && /^[a-zA-Z0-9_]{3,}$/.test(f)) return TG_BASE + f
	return null
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

	if (isLoading) {
		return (
			<div className="min-h-screen">
				<div className="sticky top-0 z-40 border-b border-white/10 bg-black/35 backdrop-blur-xl">
					<div className="mx-auto max-w-[1100px] px-4 py-3">
						<Skeleton className="h-10 w-52" />
					</div>
				</div>
				<div className="mx-auto max-w-[1100px] p-4">
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
	const pageTitle = data.full_name + ' | ' + labels.brandBadge
	const pageDesc = data.full_name + ', ' + data.position

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
					<div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/65 to-black/75" />
					<div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_10%_20%,rgba(59,130,246,0.22),transparent_55%),radial-gradient(800px_circle_at_90%_30%,rgba(245,197,66,0.20),transparent_55%)]" />
				</div>
			) : (
				<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
					<div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_20%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(1000px_circle_at_90%_30%,rgba(245,197,66,0.20),transparent_55%),radial-gradient(800px_circle_at_40%_90%,rgba(167,139,250,0.12),transparent_55%),linear-gradient(180deg,#050712_0%,#070A14_30%,#02030A_100%)]" />
					<div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:18px_18px]" />
					<div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl" />
					<div className="absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-yellow-400/10 blur-3xl" />
					<div className="absolute left-1/3 bottom-[-240px] h-[520px] w-[520px] rounded-full bg-purple-500/10 blur-3xl" />
				</div>
			)}

			<EmployeeTopHeader
				fullName={data.full_name}
				position={data.position}
				profilePhotoUrl={data.profile_photo_url}
				organizationLogoUrl={orgLogo}
			/>

			<div className="mx-auto max-w-[1100px] px-4 pt-4">
				<div className="flex items-center justify-end gap-2">
					<span className="text-[11px] uppercase tracking-wide text-white/55">
						{labels.languageLabel}
					</span>
					<div className="inline-flex overflow-hidden rounded-full border border-white/10 bg-white/5 p-0.5">
						{LANG_CODES.map((code) => {
							const active = lang === code
							const cls =
								'px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ' +
								(active
									? 'rounded-full bg-yellow-300/20 text-yellow-100'
									: 'text-white/70 hover:text-white')
							return (
								<button
									key={code}
									type="button"
									onClick={() => setLang(code)}
									className={cls}
								>
									{code}
								</button>
							)
						})}
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-[1100px] px-4 pb-10 pt-4">
				<motion.div {...PAGE_MOTION}>
					<div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
						<motion.div {...HERO_MOTION}>
							<Card className="relative overflow-hidden rounded-[32px] p-6">
								<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_20%_10%,rgba(245,197,66,0.16),transparent_55%),radial-gradient(900px_circle_at_90%_20%,rgba(59,130,246,0.14),transparent_60%)]" />
								<div className="pointer-events-none absolute inset-0 border border-white/10" />

								<div className="relative">
									<div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
										<div className="relative">
											<div className="absolute -inset-2 rounded-[28px] bg-gradient-to-b from-yellow-300/25 to-blue-400/10 blur-xl" />
											<div className="relative h-40 w-40 overflow-hidden rounded-[28px] border border-white/15 bg-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
												{heroPhoto ? (
													<img
														src={heroPhoto}
														alt={data.full_name + ' photo'}
														className="h-full w-full object-cover"
														loading="lazy"
													/>
												) : (
													<div className="grid h-full w-full place-items-center text-4xl font-semibold text-white/90">
														{initials(data.full_name)}
													</div>
												)}
											</div>
										</div>

										<div className="min-w-0 flex-1">
											<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
												<span className="h-1.5 w-1.5 rounded-full bg-yellow-300/80" />
												{labels.brandBadge}
											</div>

											<div className="mt-3 text-3xl font-semibold tracking-tight">
												{data.full_name}
											</div>
											<div className="mt-1 text-sm text-white/80">{data.position}</div>
											{data.organization_name ? (
												<div className="mt-2 text-sm text-white/90">{data.organization_name}</div>
											) : null}
											{data.department ? (
												<div className="mt-1 text-sm text-white/70">{data.department}</div>
											) : null}
											{data.bio ? (
												<p className="mt-3 text-sm leading-relaxed text-white/70">{data.bio}</p>
											) : null}

											<div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
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
													<SaveContactButton card={data} className="w-full sm:w-auto" />
												</div>
											</div>

											<div className="mt-4 flex items-center justify-center sm:justify-start">
												<ShareButton url={url} title={pageTitle} />
											</div>
										</div>
									</div>
								</div>
							</Card>
						</motion.div>

						<motion.div {...RIGHT_MOTION} className="grid gap-5">
							<ContactSection card={data} labels={labels} />
						</motion.div>
					</div>
				</motion.div>
			</div>
		</div>
	)
}
