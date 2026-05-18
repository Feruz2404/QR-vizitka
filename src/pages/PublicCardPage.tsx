import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
	BarChart3,
	Check,
	ChevronRight,
	Cpu,
	Database,
	ExternalLink,
	Facebook,
	Globe2,
	Landmark,
	Lightbulb,
	Mail,
	MapPin,
	MessageCircle,
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

type PublicLang = 'uz' | 'ru' | 'en'

type Translations = ContactLabels & {
	orgName: string
	orgSubtitle: string
	brandBadge: string
	profileBadge: string
	languageLabel: string
	specialtiesTitle: string
	socialTitle: string
	officialProfileTitle: string
	digitalCardLabel: string
	wechatCopied: string
	copiedLabel: string
	loadingSubtitle: string
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
		socialTitle: 'Ijtimoiy tarmoqlar',
		officialProfileTitle: 'Rasmiy raqamli profil',
		digitalCardLabel: 'Raqamli vizitka',
		wechatCopied: 'WeChat foydalanuvchi nomi nusxalandi',
		copiedLabel: 'Nusxalandi',
		loadingSubtitle: 'Raqamli vizitka yuklanmoqda',
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
		socialTitle: 'Социальные сети',
		officialProfileTitle: 'Официальный цифровой профиль',
		digitalCardLabel: 'Цифровая визитка',
		wechatCopied: 'Имя пользователя WeChat скопировано',
		copiedLabel: 'Скопировано',
		loadingSubtitle: 'Цифровая визитка загружается',
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
		socialTitle: 'Social media',
		officialProfileTitle: 'Official digital profile',
		digitalCardLabel: 'Digital business card',
		wechatCopied: 'WeChat username copied',
		copiedLabel: 'Copied',
		loadingSubtitle: 'Loading digital business card',
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

const SPEC_MOTION = {
	initial: { opacity: 0, y: 16 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.5, delay: 0.15 },
} as const

const PROFILE_MOTION = {
	initial: { opacity: 0, y: 16 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.5, delay: 0.2 },
} as const

const LOADER_MOTION = {
	initial: { opacity: 0, scale: 0.96, y: 8 },
	animate: { opacity: 1, scale: 1, y: 0 },
	transition: { duration: 0.55, ease: 'easeOut' },
} as const

const BAR_MOTION = {
	initial: { width: '0%' },
	animate: { width: '100%' },
	transition: { duration: 3, ease: 'easeInOut' },
} as const

const PULSE_2 = { animationDelay: '150ms' } as const
const PULSE_3 = { animationDelay: '300ms' } as const

const CTA_PRIMARY =
	'inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-2xl border border-yellow-300/55 bg-gradient-to-b from-yellow-300/55 via-yellow-300/28 to-yellow-300/12 px-3 py-2.5 text-sm font-semibold text-yellow-50 shadow-[0_12px_36px_rgba(245,197,66,0.28)] backdrop-blur-md transition hover:from-yellow-300/65 hover:via-yellow-300/35 hover:to-yellow-300/18 hover:shadow-[0_0_30px_rgba(245,197,66,0.32)] active:scale-[0.98] sm:px-4'

const CTA_SECONDARY =
	'inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-2xl border border-yellow-300/30 bg-black/30 px-3 py-2.5 text-sm font-semibold text-yellow-100 backdrop-blur-xl transition hover:border-yellow-300/55 hover:bg-yellow-300/12 hover:shadow-[0_0_24px_rgba(245,197,66,0.18)] active:scale-[0.98] sm:px-4'

const SPEC_CHIP =
	'group flex min-w-0 items-center gap-2 rounded-xl border border-yellow-300/20 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent px-2.5 py-1.5 backdrop-blur-md transition hover:border-yellow-300/45 hover:from-yellow-300/[0.08]'

const SPEC_ICON_BOX =
	'grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-yellow-300/30 bg-gradient-to-br from-yellow-300/25 via-yellow-300/8 to-transparent text-yellow-200'

const SOCIAL_BTN =
	'group relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-yellow-300/35 bg-gradient-to-br from-yellow-300/15 via-white/[0.05] to-transparent text-yellow-200 backdrop-blur-md transition hover:border-yellow-300/65 hover:bg-yellow-300/20 hover:text-yellow-50 hover:shadow-[0_0_22px_rgba(245,197,66,0.32)] active:scale-95 sm:h-12 sm:w-12'

const SECTION_CARD =
	'relative h-full w-full min-w-0 max-w-full overflow-hidden rounded-[24px] border border-yellow-300/25 bg-gradient-to-br from-white/[0.10] via-white/[0.04] to-[#06090f]/55 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.55),0_0_60px_rgba(245,197,66,0.10)] backdrop-blur-2xl sm:rounded-[28px] sm:p-6'

const SECTION_TITLE =
	'flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-yellow-200/90 sm:text-[11px] sm:tracking-[0.28em]'

const PROFILE_ROW =
	'group flex w-full min-w-0 max-w-full items-center gap-3 rounded-2xl border border-yellow-300/25 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent p-3 backdrop-blur-md transition hover:border-yellow-300/45 hover:from-yellow-300/[0.08]'

const PROFILE_ROW_ICON_BOX =
	'grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-yellow-300/35 bg-black/30 text-yellow-200'

const PROFILE_ROW_LABEL =
	'text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-200/75 sm:text-[11px] sm:tracking-[0.24em]'

const SPEC_ICONS = [Cpu, Network, BarChart3, ShieldCheck, Lightbulb, Workflow, Database, Settings2]

const WECHAT_USERNAME = '@umirzakov_u'
const MAPS_BASE = 'https://www.google.com/maps/search/?api=1&query='

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

function prettyUrl(value: string) {
	try {
		const u = new URL(value)
		const host = u.host.replace(/^www\./, '')
		const path = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '')
		return host + path
	} catch {
		return value
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

function BackgroundLayers({ backgroundImage }: { backgroundImage: string | null }) {
	if (backgroundImage) {
		return (
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
		)
	}
	return (
		<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
			<div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_15%,rgba(245,197,66,0.18),transparent_55%),radial-gradient(1000px_circle_at_90%_25%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(800px_circle_at_45%_95%,rgba(167,139,250,0.14),transparent_55%),linear-gradient(180deg,#050712_0%,#070A14_30%,#02030A_100%)]" />
			<div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:18px_18px]" />
			<div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-yellow-400/10 blur-3xl" />
			<div className="absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-3xl" />
			<div className="absolute left-1/3 bottom-[-240px] h-[520px] w-[520px] rounded-full bg-purple-500/10 blur-3xl" />
		</div>
	)
}

function PublicCardLoader({
	lang,
	orgLogo,
	backgroundImage,
	orgName,
}: {
	lang: PublicLang
	orgLogo: string | null
	backgroundImage: string | null
	orgName: string
}) {
	const subtitle = T[lang].loadingSubtitle
	return (
		<div className="min-h-screen w-full max-w-full overflow-x-hidden text-white">
			<BackgroundLayers backgroundImage={backgroundImage} />
			<div className="relative grid min-h-screen w-full max-w-full place-items-center px-4 py-10">
				<motion.div
					{...LOADER_MOTION}
					className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-yellow-300/30 bg-gradient-to-br from-white/[0.10] via-white/[0.04] to-transparent p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.55),0_0_70px_rgba(245,197,66,0.12)] backdrop-blur-2xl sm:p-7"
				>
					<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/80 to-transparent" />
					<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/35 to-transparent" />
					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_circle_at_50%_-10%,rgba(245,197,66,0.18),transparent_60%)]" />

					<div className="relative mx-auto grid h-20 w-20 place-items-center sm:h-24 sm:w-24">
						<div className="absolute inset-0 rounded-full border-[3px] border-yellow-300/15" />
						<div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-yellow-300 border-r-yellow-300/55" />
						<div className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-yellow-300/35 bg-black/35 backdrop-blur-md sm:h-16 sm:w-16">
							{orgLogo ? (
								<img src={orgLogo} alt="" className="h-full w-full object-cover" loading="eager" />
							) : (
								<ShieldCheck className="h-7 w-7 text-yellow-200" aria-hidden="true" />
							)}
						</div>
					</div>

					<div className="relative mt-5 break-words text-base font-bold uppercase tracking-[0.26em] text-white sm:text-lg sm:tracking-[0.3em]">
						{orgName}
					</div>
					<div className="relative mt-2 break-words text-xs text-yellow-100/85 sm:text-sm">
						{subtitle}
					</div>

					<div className="relative mx-auto mt-5 h-1 w-full max-w-[240px] overflow-hidden rounded-full bg-white/10">
						<motion.div
							{...BAR_MOTION}
							className="h-full rounded-full bg-gradient-to-r from-yellow-300/70 via-yellow-300 to-yellow-200/80 shadow-[0_0_18px_rgba(245,197,66,0.6)]"
						/>
					</div>

					<div className="relative mt-4 flex items-center justify-center gap-1.5">
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-300/75" />
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-300/55" style={PULSE_2} />
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-300/30" style={PULSE_3} />
					</div>
				</motion.div>
			</div>
		</div>
	)
}

export function PublicCardPage() {
	const { slug } = useParams()
	const safeSlug = slug ?? ''
	const { data, isLoading, isError } = useGetCardBySlugQuery(safeSlug)
	const { data: settings } = useGetAppSettingsQuery()

	const [lang, setLang] = useState<PublicLang>('uz')
	const labels = T[lang]

	const [introDone, setIntroDone] = useState(false)
	useEffect(() => {
		const timer = window.setTimeout(() => {
			setIntroDone(true)
		}, 3000)
		return () => window.clearTimeout(timer)
	}, [])

	const [wechatCopied, setWechatCopied] = useState(false)

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

	const handleWeChatCopy = () => {
		if (typeof navigator === 'undefined' || !navigator.clipboard) return
		void navigator.clipboard
			.writeText(WECHAT_USERNAME)
			.then(() => {
				setWechatCopied(true)
				window.setTimeout(() => setWechatCopied(false), 1500)
			})
			.catch(() => {})
	}

	const showLoader = !introDone || isLoading
	if (showLoader) {
		return (
			<PublicCardLoader
				lang={lang}
				orgLogo={orgLogo}
				backgroundImage={backgroundImage}
				orgName={displayOrgName}
			/>
		)
	}

	if (isError || !data) {
		return (
			<div className="min-h-screen grid w-full max-w-full place-items-center overflow-x-hidden p-6 text-white">
				<BackgroundLayers backgroundImage={backgroundImage} />
				<Card className="relative w-full max-w-lg overflow-hidden rounded-[24px] border border-yellow-300/25 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent p-6 text-center shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
					<div className="text-xl font-semibold">{labels.notFound}</div>
					<p className="mt-2 text-sm text-white/70">{labels.notFoundDescription}</p>
				</Card>
			</div>
		)
	}

	if (!data.is_active) {
		return (
			<div className="min-h-screen grid w-full max-w-full place-items-center overflow-x-hidden p-6 text-white">
				<BackgroundLayers backgroundImage={backgroundImage} />
				<Card className="relative w-full max-w-lg overflow-hidden rounded-[24px] border border-yellow-300/25 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent p-6 text-center shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
					<div className="text-xl font-semibold">{labels.unavailable}</div>
					<p className="mt-2 text-sm text-white/70">{labels.unavailableDescription}</p>
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
	const facebookHref = isHttpUrl(data.facebook_url) ? data.facebook_url : null
	const websiteHref = isHttpUrl(data.website_url) ? data.website_url : null
	const addressValue = (data.address ?? '').trim()
	const mapsHref = addressValue ? MAPS_BASE + encodeURIComponent(addressValue) : null
	const wechatTitle = 'WeChat: ' + WECHAT_USERNAME

	return (
		<div className="min-h-screen w-full max-w-full overflow-x-hidden text-white">
			<Helmet>
				<title>{pageTitle}</title>
				<meta name="description" content={pageDesc} />
				<meta property="og:title" content={pageTitle} />
				<meta property="og:description" content={pageDesc} />
			</Helmet>

			<BackgroundLayers backgroundImage={backgroundImage} />

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
					<div className="grid w-full max-w-full gap-5 sm:gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-6">
						<div className="flex w-full min-w-0 max-w-full flex-col gap-5 sm:gap-6">
							<motion.div {...HERO_MOTION} className="min-w-0">
								<Card className="relative h-full w-full min-w-0 max-w-full overflow-hidden rounded-[24px] border border-yellow-300/30 bg-gradient-to-br from-white/[0.10] via-white/[0.04] to-[#06090f]/55 p-4 shadow-[0_40px_120px_rgba(0,0,0,0.6),0_0_70px_rgba(245,197,66,0.10)] backdrop-blur-2xl sm:rounded-[28px] sm:p-6 lg:p-7">
									<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_10%_5%,rgba(245,197,66,0.20),transparent_55%),radial-gradient(900px_circle_at_95%_15%,rgba(59,130,246,0.16),transparent_60%)]" />
									<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/80 to-transparent" />
									<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/35 to-transparent" />

									<div className="relative flex w-full min-w-0 flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
										<div className="relative shrink-0">
											<div className="pointer-events-none absolute -inset-4 rounded-full bg-gradient-to-br from-yellow-300/45 via-yellow-300/18 to-blue-400/12 blur-2xl" />
											<div className="relative h-28 w-28 overflow-hidden rounded-full border-[3px] border-yellow-300/60 bg-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.7)] sm:h-36 sm:w-36 lg:h-40 lg:w-40">
												{heroPhoto ? (
													<img
														src={heroPhoto}
														alt={displayFullName + ' photo'}
														className="h-full w-full object-cover"
														loading="lazy"
													/>
												) : (
													<div className="grid h-full w-full place-items-center text-4xl font-semibold text-white/90 sm:text-5xl">
														{initials(displayFullName)}
													</div>
												)}
											</div>
											<div className="pointer-events-none absolute -inset-1 rounded-full border border-yellow-300/35" />
										</div>

										<div className="flex w-full min-w-0 max-w-full flex-1 flex-col items-center sm:items-start">
											<div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-yellow-300/45 bg-yellow-300/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-yellow-100 backdrop-blur-md sm:gap-2 sm:px-3 sm:text-[10px] sm:tracking-[0.22em]">
												<ShieldCheck className="h-3 w-3 shrink-0 text-yellow-200 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
												<span className="min-w-0 truncate">{labels.profileBadge}</span>
											</div>

											<h1 className="mt-3 w-full break-words text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-[28px]">
												{displayFullName}
											</h1>
											<div className="mt-1.5 w-full break-words text-sm text-yellow-100/90 sm:text-base">
												{displayPosition}
											</div>
											{displayDepartment ? (
												<div className="mt-1 w-full break-words text-xs text-white/65 sm:text-sm">{displayDepartment}</div>
											) : null}
											<div className="mt-3 inline-flex max-w-full items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow-200 sm:text-[11px] sm:tracking-[0.22em]">
												<Landmark className="h-3.5 w-3.5 shrink-0 text-yellow-200/85" aria-hidden="true" />
												<span className="min-w-0 break-words">{displayOrgName}</span>
											</div>
											{displayBio ? (
												<p className="mt-3 w-full max-w-prose break-words text-sm leading-relaxed text-white/70 sm:text-[15px]">
													{displayBio}
												</p>
											) : null}

											<div className="mt-5 flex w-full min-w-0 max-w-full flex-col gap-2.5">
												<div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-2 sm:grid-cols-2">
													{phoneHref ? (
														<a href={phoneHref} className={CTA_PRIMARY} aria-label={labels.call}>
															<Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
															<span className="truncate">{labels.call}</span>
														</a>
													) : null}
													{emailHref ? (
														<a href={emailHref} className={CTA_SECONDARY} aria-label={labels.email}>
															<Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
															<span className="truncate">{labels.email}</span>
														</a>
													) : null}
												</div>

												<div className="flex w-full min-w-0 max-w-full flex-wrap items-center justify-center gap-2 sm:justify-start">
													{tgHref ? (
														<a
															href={tgHref}
															target="_blank"
															rel="noreferrer noopener"
															className={SOCIAL_BTN}
															title={labels.telegram}
															aria-label={labels.telegram}
														>
															<Send className="h-5 w-5" aria-hidden="true" />
														</a>
													) : null}
													{facebookHref ? (
														<a
															href={facebookHref}
															target="_blank"
															rel="noreferrer noopener"
															className={SOCIAL_BTN}
															title={labels.facebook}
															aria-label={labels.facebook}
														>
															<Facebook className="h-5 w-5" aria-hidden="true" />
														</a>
													) : null}
													<button
														type="button"
														onClick={handleWeChatCopy}
														className={SOCIAL_BTN}
														title={wechatTitle}
														aria-label={wechatTitle}
													>
														{wechatCopied ? (
															<Check className="h-5 w-5" aria-hidden="true" />
														) : (
															<MessageCircle className="h-5 w-5" aria-hidden="true" />
														)}
													</button>
												</div>

												<div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-2 sm:grid-cols-2">
													<SaveContactButton card={data} className="w-full" overrides={saveOverrides} />
													<ShareButton url={url} title={pageTitle} />
												</div>

												<div
													className={
														'min-h-[16px] text-center text-[11px] text-yellow-200 transition-opacity sm:text-left ' +
														(wechatCopied ? 'opacity-100' : 'opacity-0')
													}
													aria-live="polite"
												>
													{labels.copiedLabel}
												</div>
											</div>
										</div>
									</div>
								</Card>
							</motion.div>

							{hasSpecialties ? (
								<motion.div {...SPEC_MOTION} className="min-w-0">
									<Card className={SECTION_CARD}>
										<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_10%_0%,rgba(245,197,66,0.16),transparent_55%)]" />
										<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/55 to-transparent" />
										<div className="relative">
											<div className={SECTION_TITLE}>
												<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(245,197,66,0.8)]" />
												<span className="min-w-0 break-words">{labels.specialtiesTitle}</span>
											</div>
											<div className="mt-3 grid w-full min-w-0 max-w-full grid-cols-1 gap-2 sm:grid-cols-2">
												{localized.specialties.map((item, idx) => {
													const Icon = SPEC_ICONS[idx % SPEC_ICONS.length]
													return (
														<div key={idx} className={SPEC_CHIP}>
															<span className={SPEC_ICON_BOX}>
																<Icon className="h-3.5 w-3.5" aria-hidden="true" />
															</span>
															<span className="min-w-0 flex-1 break-words text-left text-xs text-white/90 sm:text-[13px]">{item}</span>
															<ChevronRight className="h-3.5 w-3.5 shrink-0 text-yellow-200/55 transition group-hover:translate-x-0.5 group-hover:text-yellow-200" aria-hidden="true" />
														</div>
													)
												})}
											</div>
										</div>
									</Card>
								</motion.div>
							) : null}
						</div>

						<div className="flex w-full min-w-0 max-w-full flex-col gap-5 sm:gap-6">
							<motion.div {...TR_MOTION} className="min-w-0">
								<ContactSection card={data} labels={labels} />
							</motion.div>

							<motion.div {...PROFILE_MOTION} className="min-w-0">
								<Card className={SECTION_CARD}>
									<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_85%_0%,rgba(245,197,66,0.18),transparent_55%),radial-gradient(700px_circle_at_15%_100%,rgba(59,130,246,0.14),transparent_55%)]" />
									<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/70 to-transparent" />
									<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent" />

									<div className="relative flex h-full w-full min-w-0 max-w-full flex-col">
										<div className={SECTION_TITLE}>
											<ShieldCheck className="h-3.5 w-3.5 shrink-0 text-yellow-200" aria-hidden="true" />
											<span className="min-w-0 break-words">{labels.officialProfileTitle}</span>
										</div>

										<div className="mt-3 flex w-full min-w-0 max-w-full flex-col gap-2">
											<div className={PROFILE_ROW}>
												<div className={PROFILE_ROW_ICON_BOX}>
													{orgLogo ? (
														<img src={orgLogo} alt="" className="h-full w-full object-cover" loading="lazy" />
													) : (
														<Landmark className="h-5 w-5" aria-hidden="true" />
													)}
												</div>
												<div className="min-w-0 flex-1">
													<div className={PROFILE_ROW_LABEL}>{labels.digitalCardLabel}</div>
													<div className="mt-0.5 break-words text-sm font-semibold text-white sm:text-base">
														{displayOrgName}
													</div>
												</div>
											</div>

											{websiteHref ? (
												<a
													href={websiteHref}
													target="_blank"
													rel="noreferrer noopener"
													className={PROFILE_ROW}
													aria-label={labels.website}
													title={websiteHref}
												>
													<div className={PROFILE_ROW_ICON_BOX}>
														<Globe2 className="h-5 w-5" aria-hidden="true" />
													</div>
													<div className="min-w-0 flex-1">
														<div className={PROFILE_ROW_LABEL}>{labels.website}</div>
														<div className="mt-0.5 truncate text-sm text-white/90 sm:text-[15px]">
															{prettyUrl(websiteHref)}
														</div>
													</div>
													<ExternalLink className="h-4 w-4 shrink-0 text-yellow-200/70 transition group-hover:text-yellow-200" aria-hidden="true" />
												</a>
											) : null}

											{mapsHref ? (
												<a
													href={mapsHref}
													target="_blank"
													rel="noreferrer noopener"
													className={PROFILE_ROW}
													aria-label={labels.mapAction ?? labels.address}
													title={addressValue}
												>
													<div className={PROFILE_ROW_ICON_BOX}>
														<MapPin className="h-5 w-5" aria-hidden="true" />
													</div>
													<div className="min-w-0 flex-1">
														<div className={PROFILE_ROW_LABEL}>{labels.address}</div>
														<div className="mt-0.5 break-words text-sm text-white/90 sm:text-[15px]">
															{addressValue}
														</div>
													</div>
													<ExternalLink className="h-4 w-4 shrink-0 text-yellow-200/70 transition group-hover:text-yellow-200" aria-hidden="true" />
												</a>
											) : null}
										</div>

										<div className="mt-auto pt-4">
											<div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-2 sm:grid-cols-2">
												<SaveContactButton card={data} className="w-full" overrides={saveOverrides} />
												<ShareButton url={url} title={pageTitle} />
											</div>
										</div>
									</div>
								</Card>
							</motion.div>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	)
}
