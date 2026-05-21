import { Globe2, Landmark, UserCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

type Lang = 'uz' | 'ru' | 'en'

const LANGS: Lang[] = ['uz', 'ru', 'en']

function initials(fullName: string) {
	const parts = fullName.trim().split(/\s+/).filter(Boolean)
	const a = parts[0]?.[0] ?? ''
	const b = parts[1]?.[0] ?? ''
	return (a + b).toUpperCase()
}

const LANG_BTN_ACTIVE =
	'rounded-full bg-gradient-to-b from-yellow-300/40 via-yellow-300/20 to-yellow-300/10 text-yellow-100 shadow-inner ring-1 ring-yellow-300/35'
const LANG_BTN_INACTIVE = 'text-white/70 hover:text-white'

export function EmployeeTopHeader({
	orgName,
	subtitle,
	organizationLogoUrl,
	fullName,
	position,
	profilePhotoUrl,
	lang,
	onLangChange,
	languageLabel,
}: {
	orgName: string
	subtitle: string
	organizationLogoUrl?: string | null
	fullName: string
	position?: string | null
	profilePhotoUrl?: string | null
	lang: Lang
	onLangChange: (code: Lang) => void
	languageLabel: string
}) {
	return (
		<header className="sticky top-0 z-40">
			<div className="relative border-b border-yellow-300/25 bg-black/10 backdrop-blur-2xl">
				<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent" />
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/60 to-transparent" />
				<div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 lg:px-6 lg:py-5">
					<div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
						<div className="relative shrink-0">
							<div className="pointer-events-none absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-yellow-300/35 via-yellow-300/10 to-blue-400/10 blur-md" />
							<div
								className={cn(
									'relative grid h-12 w-12 place-items-center overflow-hidden rounded-2xl border border-yellow-300/35 bg-black/10 backdrop-blur-xl shadow-[0_15px_45px_rgba(0,0,0,0.30)] sm:h-14 sm:w-14 lg:h-16 lg:w-16'
								)}
							>
								{organizationLogoUrl ? (
									<img
										src={organizationLogoUrl}
										alt="Organization logo"
										className="h-full w-full object-contain p-1.5"
										loading="eager"
									/>
								) : (
									<Landmark className="h-5 w-5 text-yellow-200 sm:h-6 sm:w-6 lg:h-7 lg:w-7" aria-hidden="true" />
								)}
							</div>
						</div>

						<div className="min-w-0">
							<div className="truncate text-base font-semibold uppercase leading-tight tracking-[0.22em] text-yellow-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] sm:text-lg lg:text-xl">
								{orgName}
							</div>
							<div className="truncate text-[10px] font-medium uppercase leading-tight tracking-[0.28em] text-white/65 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] sm:text-[11px] lg:text-xs">
								{subtitle}
							</div>
						</div>
					</div>

					<div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:gap-4">
						<div className="flex items-center gap-2">
							<Globe2 className="h-4 w-4 text-yellow-200/80 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
							<span className="hidden text-[10px] font-medium uppercase tracking-[0.28em] text-white/65 sm:inline">
								{languageLabel}
							</span>
							<div className="inline-flex overflow-hidden rounded-full border border-yellow-300/25 bg-black/10 p-0.5 backdrop-blur-xl">
								{LANGS.map((code) => {
									const active = lang === code
									const cls =
										'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition ' +
										(active ? LANG_BTN_ACTIVE : LANG_BTN_INACTIVE)
									return (
										<button
											key={code}
											type="button"
											onClick={() => onLangChange(code)}
											className={cls}
											aria-label={'Language ' + code}
											aria-pressed={active}
										>
											{code}
										</button>
									)
								})}
							</div>
						</div>

						<div className="hidden items-center gap-2.5 rounded-2xl border border-yellow-300/25 bg-black/10 px-2.5 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:flex">
							<div className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-yellow-300/30 bg-white/[0.06]">
								{profilePhotoUrl ? (
									<img
										src={profilePhotoUrl}
										alt={fullName + ' photo'}
										className="h-full w-full object-cover"
										loading="lazy"
									/>
								) : fullName ? (
									<span className="text-xs font-semibold text-yellow-200">{initials(fullName)}</span>
								) : (
									<UserCircle className="h-5 w-5 text-yellow-200" aria-hidden="true" />
								)}
							</div>
							<div className="hidden min-w-0 md:block">
								<div className="truncate text-xs font-semibold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]">{fullName}</div>
								<div className="truncate text-[10px] leading-tight text-yellow-200/75">{position ?? ''}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	)
}
