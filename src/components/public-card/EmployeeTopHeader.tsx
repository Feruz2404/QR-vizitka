import { cn } from '../../lib/utils'

type Lang = 'uz' | 'ru' | 'en'

const LANGS: Lang[] = ['uz', 'ru', 'en']

function initials(fullName: string) {
	const parts = fullName.trim().split(/\s+/).filter(Boolean)
	const a = parts[0]?.[0] ?? ''
	const b = parts[1]?.[0] ?? ''
	return (a + b).toUpperCase()
}

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
			<div className="relative border-b border-yellow-300/20 bg-gradient-to-b from-[#04060f]/85 to-[#04060f]/65 backdrop-blur-2xl">
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/55 to-transparent" />
				<div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-3 px-4 py-3 sm:gap-4 sm:py-4">
					<div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
						<div
							className={cn(
								'relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-yellow-300/30 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.5)] sm:h-14 sm:w-14'
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
								<span className="text-base font-bold tracking-wide text-yellow-200">
									{orgName.slice(0, 2).toUpperCase()}
								</span>
							)}
						</div>

						<div className="min-w-0">
							<div className="truncate text-base font-semibold uppercase leading-tight tracking-[0.18em] text-yellow-200 sm:text-lg">
								{orgName}
							</div>
							<div className="truncate text-[11px] font-medium uppercase leading-tight tracking-[0.22em] text-white/55 sm:text-xs">
								{subtitle}
							</div>
						</div>
					</div>

					<div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:gap-4">
						<div className="flex items-center gap-2">
							<span className="hidden text-[10px] font-medium uppercase tracking-[0.25em] text-white/45 sm:inline">
								{languageLabel}
							</span>
							<div className="inline-flex overflow-hidden rounded-full border border-yellow-300/25 bg-white/[0.04] p-0.5">
								{LANGS.map((code) => {
									const active = lang === code
									const cls =
										'px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition ' +
										(active
											? 'rounded-full bg-yellow-300/20 text-yellow-100 shadow-inner'
											: 'text-white/70 hover:text-white')
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

						<div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-2.5 py-1.5">
							<div className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/15 bg-white/10">
								{profilePhotoUrl ? (
									<img
										src={profilePhotoUrl}
										alt={fullName + ' photo'}
										className="h-full w-full object-cover"
										loading="lazy"
									/>
								) : (
									<span className="text-xs font-semibold text-white">{initials(fullName)}</span>
								)}
							</div>
							<div className="hidden min-w-0 sm:block">
								<div className="truncate text-xs font-semibold leading-tight text-white">{fullName}</div>
								<div className="truncate text-[10px] leading-tight text-white/55">{position ?? ''}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	)
}
