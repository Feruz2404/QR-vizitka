import { ChevronDown, Globe } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '../../lib/utils'

export type PublicLang = 'uz' | 'ru' | 'en'

function initials(fullName: string) {
	const parts = fullName.trim().split(/\s+/).filter(Boolean)
	const a = parts[0]?.[0] ?? ''
	const b = parts[1]?.[0] ?? ''
	return (a + b).toUpperCase()
}

function compactName(fullName: string) {
	const parts = fullName.trim().split(/\s+/).filter(Boolean)
	if (parts.length === 0) return ''
	if (parts.length === 1) return parts[0]
	return `${parts[0]} ${parts[1][0]}.`
}

const LANG_NATIVE: Record<PublicLang, string> = {
	uz: "O'zbekcha",
	ru: 'Русский',
	en: 'English',
}

export function EmployeeTopHeader({
	fullName,
	position,
	profilePhotoUrl,
	organizationLogoUrl,
	brandTitle,
	brandSubtitle,
	languageLabel,
	lang,
	onLangChange,
}: {
	fullName: string
	position?: string | null
	profilePhotoUrl?: string | null
	organizationLogoUrl?: string | null
	brandTitle: string
	brandSubtitle: string
	languageLabel: string
	lang: PublicLang
	onLangChange: (lang: PublicLang) => void
}) {
	const [logoBroken, setLogoBroken] = useState(false)
	const [photoBroken, setPhotoBroken] = useState(false)
	const [langOpen, setLangOpen] = useState(false)
	const langRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (!langOpen) return
		function onDoc(e: MouseEvent) {
			if (langRef.current && !langRef.current.contains(e.target as Node)) {
				setLangOpen(false)
			}
		}
		document.addEventListener('mousedown', onDoc)
		return () => document.removeEventListener('mousedown', onDoc)
	}, [langOpen])

	const showLogo = !!organizationLogoUrl && !logoBroken
	const showPhoto = !!profilePhotoUrl && !photoBroken

	return (
		<header className="sticky top-0 z-40">
			<div className="border-b border-yellow-300/15 bg-black/55 backdrop-blur-2xl">
				<div className="mx-auto flex max-w-[1280px] items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6">
					{/* Brand: logo + title + subtitle */}
					<div className="flex min-w-0 flex-1 items-center gap-3">
						<div
							className={cn(
								'relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-yellow-300/55 bg-black/70 shadow-[0_10px_30px_rgba(0,0,0,0.45)] sm:h-12 sm:w-12'
							)}
						>
							{showLogo ? (
								<img
									src={organizationLogoUrl!}
									alt="Organization logo"
									className="h-full w-full object-cover"
									loading="lazy"
									onError={() => setLogoBroken(true)}
								/>
							) : (
								<span className="text-[11px] font-semibold text-yellow-200">
									{initials(fullName)}
								</span>
							)}
						</div>
						<div className="min-w-0">
							<div className="truncate text-sm font-bold uppercase tracking-[0.12em] text-yellow-200 sm:text-base">
								{brandTitle}
							</div>
							<div className="truncate text-[11px] leading-tight text-white/65 sm:text-xs">
								{brandSubtitle}
							</div>
						</div>
					</div>

					{/* Language selector */}
					<div className="relative" ref={langRef}>
						<button
							type="button"
							onClick={() => setLangOpen((v) => !v)}
							className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-2.5 text-xs text-white/85 hover:bg-white/[0.12] sm:px-3 sm:text-sm"
							aria-haspopup="menu"
							aria-expanded={langOpen}
							aria-label={languageLabel}
						>
							<Globe className="h-4 w-4 text-yellow-200" />
							<span className="hidden sm:inline">{languageLabel}</span>
							<span className="sm:hidden">{lang.toUpperCase()}</span>
							<ChevronDown className="h-3.5 w-3.5 text-white/60" />
						</button>
						{langOpen ? (
							<div
								role="menu"
								className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
							>
								{(['uz', 'ru', 'en'] as PublicLang[]).map((code) => (
									<button
										key={code}
										type="button"
										role="menuitem"
										onClick={() => {
											onLangChange(code)
											setLangOpen(false)
										}}
										className={cn(
											'flex w-full items-center justify-between px-3 py-2 text-sm transition hover:bg-white/10',
											code === lang ? 'text-yellow-200' : 'text-white/85'
										)}
									>
										<span>{LANG_NATIVE[code]}</span>
										<span className="text-[10px] uppercase tracking-wide text-white/45">
											{code}
										</span>
									</button>
								))}
							</div>
						) : null}
					</div>

					{/* Employee compact pill (hidden on very small screens) */}
					<div className="hidden items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-2 py-1 sm:flex">
						<div className="h-7 w-7 overflow-hidden rounded-full border border-white/15 bg-white/10">
							{showPhoto ? (
								<img
									src={profilePhotoUrl!}
									alt=""
									className="h-full w-full object-cover"
									loading="lazy"
									onError={() => setPhotoBroken(true)}
								/>
							) : (
								<div className="grid h-full w-full place-items-center text-[10px] font-semibold text-white/90">
									{initials(fullName)}
								</div>
							)}
						</div>
						<span
							className="hidden max-w-[140px] truncate text-xs text-white/85 md:inline"
							title={position ? `${fullName} — ${position}` : fullName}
						>
							{compactName(fullName)}
						</span>
						<ChevronDown className="h-3.5 w-3.5 text-white/55" />
					</div>
				</div>
			</div>
		</header>
	)
}
