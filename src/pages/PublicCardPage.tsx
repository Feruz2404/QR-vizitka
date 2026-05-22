import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
	BarChart3,
	ChevronRight,
	Cpu,
	Database,
	ExternalLink,
	Facebook,
	Globe2,
	Landmark,
	Lightbulb,
	MapPin,
	Network,
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
		orgName: 'O‘zbekiston Respublikasi Ekologiya va iqlim o‘zgarishi milliy qo‘mitasi huzuridagi Gidrometeorologiya xizmati agentligi',
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
		orgName: 'Агентство гидрометеорологической службы при Национальном комитете Республики Узбекистан по экологии и изменению климата',
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
		orgName: 'Hydrometeorological Service Agency under the National Committee of the Republic of Uzbekistan on Ecology and Climate Change',
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

const DEBUG_OVERLAY_STYLE = { whiteSpace: 'pre-wrap' as const }
const TEXT_SHADOW_STYLE = { textShadow: '0 1px 10px rgba(0,0,0,0.75)' } as const
const HERO_TITLE_TEXT_SHADOW = { textShadow: '0 2px 12px rgba(0,0,0,0.85)' } as const

const SPEC_CHIP =
	'group flex min-w-0 items-center gap-2 rounded-xl border border-yellow-300/15 bg-transparent px-2.5 py-1.5 backdrop-blur-[1px] transition hover:border-yellow-300/45 hover:bg-yellow-300/[0.10]'

const SPEC_ICON_BOX =
	'grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-yellow-300/20 bg-black/[0.04] text-yellow-200 backdrop-blur-[1px]'

const SOCIAL_BTN =
	'group inline-flex shrink-0 items-center gap-2 rounded-full border border-yellow-300/25 bg-black/[0.04] px-3.5 py-2 text-xs font-semibold text-yellow-100 backdrop-blur-[1px] transition hover:border-yellow-300/55 hover:bg-yellow-300/15 hover:text-yellow-50 hover:shadow-[0_0_22px_rgba(245,197,66,0.30)] active:scale-95 sm:px-4 sm:py-2.5 sm:text-sm'

const SOCIAL_BTN_ICON = 'h-4 w-4 shrink-0 sm:h-[18px] sm:w-[18px]'

const SOCIAL_BTN_LABEL = 'whitespace-nowrap'

const SECTION_CARD =
	'relative h-full w-full min-w-0 max-w-full overflow-hidden rounded-[24px] border border-yellow-300/25 bg-transparent p-4 shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-[1px] sm:rounded-[28px] sm:p-6'

const SECTION_TITLE =
	'flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-yellow-200 sm:text-[11px] sm:tracking-[0.28em]'

const PROFILE_ROW =
	'group flex w-full min-w-0 max-w-full items-center gap-3 rounded-2xl border border-yellow-300/15 bg-transparent p-3 backdrop-blur-[1px] transition hover:border-yellow-300/45 hover:bg-yellow-300/[0.10]'

const PROFILE_ROW_ICON_BOX =
	'grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-yellow-300/20 bg-black/[0.04] text-yellow-200 backdrop-blur-[1px]'

const PROFILE_ROW_LABEL =
	'text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-200 sm:text-[11px] sm:tracking-[0.24em]'

const SPEC_ICONS = [Cpu, Network, BarChart3, ShieldCheck, Lightbulb, Workflow, Database, Settings2]

const WECHAT_URL = 'https://u.wechat.com/MIti95wYI7SoRjfZwXWoU2s?s=2'
const MAPS_BASE = 'https://www.google.com/maps/search/?api=1&query='
const DEPLOY_MARKER = 'public-card-hero-multilingual-2026-05-22'

function WeChatIcon({ className = '' }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			className={className}
			fill="currentColor"
			aria-hidden="true"
			focusable="false"
		>
			<path d="M8.7 3.4C4.45 3.4 1 6.27 1 9.83c0 2 1.07 3.77 2.79 4.95l-.83 2.43 2.85-1.45c.93.26 1.9.4 2.89.4.27 0 .55-.02.82-.05a5.5 5.5 0 0 1-.2-1.51c0-3.27 3.07-5.93 6.85-5.93.26 0 .52.02.78.05C16.31 5.66 12.84 3.4 8.7 3.4Zm-2.65 4.43a.94.94 0 1 1 0-1.88.94.94 0 0 1 0 1.88Zm5.3 0a.94.94 0 1 1 0-1.88.94.94 0 0 1 0 1.88Z" />
			<path d="M23 14.6c0-2.78-2.85-5.04-6.36-5.04-3.5 0-6.35 2.26-6.35 5.04 0 2.79 2.85 5.05 6.35 5.05.72 0 1.42-.1 2.07-.27l2.34 1.19-.5-1.89c1.5-.92 2.45-2.36 2.45-4.08Zm-8.34-.55a.83.83 0 1 1 0-1.66.83.83 0 0 1 0 1.66Zm3.94 0a.83.83 0 1 1 0-1.66.83.83 0 0 1 0 1.66Z" />
		</svg>
	)
}

function fullUrl(publicBaseUrl: string, slug: string) {
	return publicBaseUrl.replace(/\/$/, '') + '/v/' + slug
}

function initials(fullName: string) {
	const parts = fullName.trim().split(/\s+/).filter(Boolean)
	const a = parts[0]?.[0] ?? ''
	const b = parts[1]?.[0] ?? ''
	return (a + b).toUpperCase()
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

type LocalizableField = 'full_name' | 'position' | 'department' | 'organization_name' | 'bio' | 'address'

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
				<div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />
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

function DebugOverlay(props: {
	pathname: string
	search: string
	paramsSlug: string | undefined
	resolvedSlug: string
	safeSlug: string
	isLoading: boolean
	isError: boolean
	hasData: boolean
	dataId: string | null
	dataSlug: string | null
	dataIsActive: boolean | null
	supabaseUrl: string
}) {
	const lines = [
		'pathname: ' + props.pathname,
		'search: ' + props.search,
		'params.slug: ' + (props.paramsSlug ?? '(undefined)'),
		'resolvedSlug: ' + props.resolvedSlug,
		'safeSlug: ' + props.safeSlug,
		'querySlug: ' + props.safeSlug,
		'isLoading: ' + String(props.isLoading),
		'isError: ' + String(props.isError),
		'hasData: ' + String(props.hasData),
		'data.id: ' + (props.dataId ?? '(none)'),
		'data.slug: ' + (props.dataSlug ?? '(none)'),
		'data.is_active: ' + (props.dataIsActive === null ? '(none)' : String(props.dataIsActive)),
		'VITE_SUPABASE_URL: ' + props.supabaseUrl,
	].join('\n')
	return (
		<pre
			className="fixed bottom-2 right-2 z-[100] max-w-[92vw] overflow-auto rounded-lg border border-yellow-300/40 bg-black/50 p-3 text-[10px] leading-tight text-yellow-100 shadow-xl backdrop-blur-md"
			style={DEBUG_OVERLAY_STYLE}
		>
			{lines}
		</pre>
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
					className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-yellow-300/25 bg-transparent p-6 text-center shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-[1px] sm:p-7"
				>
					<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/80 to-transparent" />
					<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/35 to-transparent" />

					<div className="relative mx-auto grid h-20 w-20 place-items-center sm:h-24 sm:w-24">
						<div className="absolute inset-0 rounded-full border-[3px] border-yellow-300/15" />
						<div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-yellow-300 border-r-yellow-300/55" />
						<div className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-yellow-300/35 bg-black/[0.04] backdrop-blur-[1px] sm:h-16 sm:w-16">
							{orgLogo ? (
								<img src={orgLogo} alt="" className="h-full w-full object-cover" loading="eager" />
							) : (
								<ShieldCheck className="h-7 w-7 text-yellow-200" aria-hidden="true" />
							)}
						</div>
					</div>

					<div
						className="relative mt-5 break-words text-sm font-bold leading-snug text-white sm:text-base"
						style={TEXT_SHADOW_STYLE}
					>
						{orgName}
					</div>
					<div
						className="relative mt-2 break-words text-xs text-yellow-100 sm:text-sm"
						style={TEXT_SHADOW_STYLE}
					>
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
	const params = useParams()
	const location = useLocation()

	const resolvedSlug = (() => {
		const fromParams = params.slug
		if (fromParams && fromParams.trim().length > 0) return fromParams
		return location.pathname.replace(/^\/v\//, '').replace(/^\//, '').split('/')[0]
	})()

	const safeSlug = (() => {
		let raw = resolvedSlug || ''
		try {
			raw = decodeURIComponent(raw)
		} catch {
			/* ignore malformed percent-escapes */
		}
		return raw.split('?')[0].split('#')[0].trim().toLowerCase()
	})()

	const isDebug = new URLSearchParams(location.search).get('debug') === 'card'

	if (import.meta.env.DEV) {
		// eslint-disable-next-line no-console
		console.log('PublicCardPage slug:', safeSlug)
	}

	const { data, isLoading, isError } = useGetCardBySlugQuery(safeSlug, { skip: safeSlug.length === 0 })
	const { data: settings } = useGetAppSettingsQuery()

	useEffect(() => {
		if (!isDebug) return
		// eslint-disable-next-line no-console
		console.log('[PublicCardPage debug]', {
			pathname: location.pathname,
			search: location.search,
			paramsSlug: params.slug,
			resolvedSlug,
			safeSlug,
			querySlug: safeSlug,
			isLoading,
			isError,
			hasData: Boolean(data),
			dataId: data?.id ?? null,
			dataSlug: data?.slug ?? null,
			dataIsActive: data?.is_active ?? null,
			supabaseUrl: (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '(unset)',
		})
	}, [isDebug, location.pathname, location.search, params.slug, resolvedSlug, safeSlug, isLoading, isError, data])

	const [lang, setLang] = useState<PublicLang>('uz')
	const labels = T[lang]

	const [introDone, setIntroDone] = useState(false)
	useEffect(() => {
		const timer = window.setTimeout(() => {
			setIntroDone(true)
		}, 3000)
		return () => window.clearTimeout(timer)
	}, [])

	const publicBaseUrl =
		(import.meta.env.VITE_PUBLIC_BASE_URL as string | undefined) ?? window.location.origin
	const url = safeSlug ? fullUrl(publicBaseUrl, safeSlug) : window.location.href

	const tgHref = useMemo(() => (data ? telegramHref(data) : null), [data])

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
				address: '',
				specialties: [] as string[],
			}
		}
		return {
			fullName: pickTranslatedField(data, lang, 'full_name'),
			position: pickTranslatedField(data, lang, 'position'),
			department: pickTranslatedField(data, lang, 'department'),
			organizationName: pickTranslatedField(data, lang, 'organization_name'),
			bio: pickTranslatedField(data, lang, 'bio'),
			address: pickTranslatedField(data, lang, 'address'),
			specialties: pickTranslatedSpecialties(data, lang),
		}
	}, [data, lang])

	const displayOrgName = localized.organizationName || labels.orgName
	// In the hero, always show the full official organization name from translations,
	// regardless of any short form stored in the DB (e.g. "O‘zgidromet").
	const heroOrgName = labels.orgName

	const debugOverlay = isDebug ? (
		<DebugOverlay
			pathname={location.pathname}
			search={location.search}
			paramsSlug={params.slug}
			resolvedSlug={resolvedSlug}
			safeSlug={safeSlug}
			isLoading={isLoading}
			isError={isError}
			hasData={Boolean(data)}
			dataId={data?.id ?? null}
			dataSlug={data?.slug ?? null}
			dataIsActive={data?.is_active ?? null}
			supabaseUrl={(import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '(unset)'}
		/>
	) : null

	const showLoader = !introDone || isLoading
	if (showLoader) {
		return (
			<>
				<PublicCardLoader
					lang={lang}
					orgLogo={orgLogo}
					backgroundImage={backgroundImage}
					orgName={heroOrgName}
				/>
				{debugOverlay}
			</>
		)
	}

	if (isError || !data) {
		return (
			<>
				<div className="min-h-screen grid w-full max-w-full place-items-center overflow-x-hidden p-6 text-white">
					<BackgroundLayers backgroundImage={backgroundImage} />
					<Card className="relative w-full max-w-lg overflow-hidden rounded-[24px] border border-yellow-300/25 bg-transparent p-6 text-center shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-[1px]">
						<div className="text-xl font-semibold" style={TEXT_SHADOW_STYLE}>{labels.notFound}</div>
						<p className="mt-2 text-sm text-white" style={TEXT_SHADOW_STYLE}>{labels.notFoundDescription}</p>
					</Card>
				</div>
				{debugOverlay}
			</>
		)
	}

	if (!data.is_active) {
		return (
			<>
				<div className="min-h-screen grid w-full max-w-full place-items-center overflow-x-hidden p-6 text-white">
					<BackgroundLayers backgroundImage={backgroundImage} />
					<Card className="relative w-full max-w-lg overflow-hidden rounded-[24px] border border-yellow-300/25 bg-transparent p-6 text-center shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-[1px]">
						<div className="text-xl font-semibold" style={TEXT_SHADOW_STYLE}>{labels.unavailable}</div>
						<p className="mt-2 text-sm text-white" style={TEXT_SHADOW_STYLE}>{labels.unavailableDescription}</p>
					</Card>
				</div>
				{debugOverlay}
			</>
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
	const addressValue = (localized.address || data.address || '').trim()
	const mapsHref = addressValue ? MAPS_BASE + encodeURIComponent(addressValue) : null

	return (
		<div
			className="min-h-screen w-full max-w-full overflow-x-hidden text-white"
			data-deploy-marker={DEPLOY_MARKER}
		>
			<Helmet>
				<title>{pageTitle}</title>
				<meta name="description" content={pageDesc} />
				<meta property="og:title" content={pageTitle} />
				<meta property="og:description" content={pageDesc} />
			</Helmet>

			<BackgroundLayers backgroundImage={backgroundImage} />

			<EmployeeTopHeader
				orgName={heroOrgName}
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
					<div className="grid w-full max-w-full grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-6">
						<div className="contents w-full min-w-0 max-w-full lg:flex lg:flex-col lg:gap-6">
							<motion.div {...HERO_MOTION} className="order-1 min-w-0 lg:order-none">
								<Card className="relative h-full w-full min-w-0 max-w-full overflow-hidden rounded-[24px] border border-yellow-300/25 bg-transparent p-4 shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-[1px] sm:rounded-[28px] sm:p-6 lg:p-7">
									<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/80 to-transparent" />
									<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/35 to-transparent" />

									<div className="relative flex w-full min-w-0 flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
										<div className="relative shrink-0">
											<div className="pointer-events-none absolute -inset-4 rounded-full bg-gradient-to-br from-yellow-300/40 via-yellow-300/15 to-blue-400/10 blur-2xl" />
											<div className="relative h-64 w-64 max-w-full overflow-hidden rounded-full border-[3px] border-yellow-300/55 bg-white/[0.06] shadow-[0_25px_70px_rgba(0,0,0,0.45)] sm:h-32 sm:w-32 lg:h-40 lg:w-40">
												{heroPhoto ? (
													<img
														src={heroPhoto}
														alt={displayFullName + ' photo'}
														className="h-full w-full object-cover"
													loading="lazy"
													/>
												) : (
													<div
														className="grid h-full w-full place-items-center text-4xl font-semibold text-white sm:text-5xl"
													style={TEXT_SHADOW_STYLE}
												>
													{initials(displayFullName)}
												</div>
												)}
											</div>
											<div className="pointer-events-none absolute -inset-1 rounded-full border border-yellow-300/35" />
										</div>

										<div className="flex w-full min-w-0 max-w-full flex-1 flex-col items-center sm:items-start">
											<div
												className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-yellow-300/35 bg-yellow-300/[0.08] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-yellow-100 backdrop-blur-[1px] sm:gap-2 sm:px-3 sm:text-[10px] sm:tracking-[0.22em]"
												style={TEXT_SHADOW_STYLE}
											>
												<ShieldCheck className="h-3 w-3 shrink-0 text-yellow-200 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
												<span className="min-w-0 truncate">{labels.profileBadge}</span>
											</div>

											<h1
												className="mt-3 w-full break-words text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-[28px]"
												style={HERO_TITLE_TEXT_SHADOW}
											>
												{displayFullName}
											</h1>
											<div
												className="mt-1.5 w-full break-words text-sm text-yellow-100 sm:text-base"
												style={TEXT_SHADOW_STYLE}
											>
												{displayPosition}
											</div>
											{displayDepartment ? (
												<div
													className="mt-1 w-full break-words text-xs text-white sm:text-sm"
													style={TEXT_SHADOW_STYLE}
												>
													{displayDepartment}
												</div>
											) : null}
											<div
												className="mt-3 flex w-full min-w-0 max-w-full items-start gap-2.5 text-sm font-semibold leading-snug text-yellow-100 sm:gap-3 sm:text-[15px] lg:text-base"
												style={TEXT_SHADOW_STYLE}
											>
												<Landmark className="mt-0.5 h-4 w-4 shrink-0 text-yellow-200 sm:mt-1 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
												<span className="min-w-0 max-w-full break-words leading-snug">{heroOrgName}</span>
											</div>
											{displayBio ? (
												<p
													className="mt-3 w-full max-w-prose break-words text-sm leading-relaxed text-white sm:text-[15px]"
													style={TEXT_SHADOW_STYLE}
												>
													{displayBio}
												</p>
											) : null}

											<div className="mt-5 flex w-full min-w-0 max-w-full flex-wrap items-center justify-center gap-2 sm:justify-start">
												{tgHref ? (
													<a
														href={tgHref}
														target="_blank"
														rel="noopener noreferrer"
														className={SOCIAL_BTN}
														title={labels.telegram}
													>
														<Send className={SOCIAL_BTN_ICON} aria-hidden="true" />
														<span className={SOCIAL_BTN_LABEL} style={TEXT_SHADOW_STYLE}>{labels.telegram}</span>
													</a>
												) : null}
												{facebookHref ? (
													<a
														href={facebookHref}
														target="_blank"
														rel="noopener noreferrer"
														className={SOCIAL_BTN}
														title={labels.facebook}
													>
														<Facebook className={SOCIAL_BTN_ICON} aria-hidden="true" />
														<span className={SOCIAL_BTN_LABEL} style={TEXT_SHADOW_STYLE}>{labels.facebook}</span>
													</a>
												) : null}
												<a
													href={WECHAT_URL}
													target="_blank"
													rel="noopener noreferrer"
													className={SOCIAL_BTN}
													title="WeChat"
												>
													<WeChatIcon className={SOCIAL_BTN_ICON} />
													<span className={SOCIAL_BTN_LABEL} style={TEXT_SHADOW_STYLE}>WeChat</span>
												</a>
											</div>
										</div>
									</div>
								</Card>
							</motion.div>

							{hasSpecialties ? (
								<motion.div {...SPEC_MOTION} className="order-3 min-w-0 lg:order-none">
									<Card className={SECTION_CARD}>
										<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/55 to-transparent" />
										<div className="relative">
											<div className={SECTION_TITLE} style={TEXT_SHADOW_STYLE}>
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
															<span
																className="min-w-0 flex-1 break-words text-left text-xs text-white sm:text-[13px]"
																style={TEXT_SHADOW_STYLE}
															>
																{item}
															</span>
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

						<div className="contents w-full min-w-0 max-w-full lg:flex lg:flex-col lg:gap-6">
							<motion.div {...TR_MOTION} className="order-2 min-w-0 lg:order-none">
								<ContactSection card={data} labels={labels} />
							</motion.div>

							<motion.div {...PROFILE_MOTION} className="order-4 min-w-0 lg:order-none">
								<Card className={SECTION_CARD}>
									<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/70 to-transparent" />
									<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent" />

									<div className="relative flex h-full w-full min-w-0 max-w-full flex-col">
										<div className={SECTION_TITLE} style={TEXT_SHADOW_STYLE}>
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
													<div className={PROFILE_ROW_LABEL} style={TEXT_SHADOW_STYLE}>{labels.digitalCardLabel}</div>
													<div
														className="mt-0.5 break-words text-sm font-semibold text-white sm:text-base"
														style={TEXT_SHADOW_STYLE}
													>
														{heroOrgName}
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
														<div className={PROFILE_ROW_LABEL} style={TEXT_SHADOW_STYLE}>{labels.website}</div>
														<div
															className="mt-0.5 truncate text-sm text-white sm:text-[15px]"
															style={TEXT_SHADOW_STYLE}
														>
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
														<div className={PROFILE_ROW_LABEL} style={TEXT_SHADOW_STYLE}>{labels.address}</div>
														<div
															className="mt-0.5 break-words text-sm text-white sm:text-[15px]"
															style={TEXT_SHADOW_STYLE}
														>
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
			{debugOverlay}
		</div>
	)
}
