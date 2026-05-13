import { cn } from '../../lib/utils'

function initials(fullName: string) {
	const parts = fullName.trim().split(/\s+/).filter(Boolean)
	const a = parts[0]?.[0] ?? ''
	const b = parts[1]?.[0] ?? ''
	return (a + b).toUpperCase()
}

export function EmployeeTopHeader({
	fullName,
	position,
	profilePhotoUrl,
	organizationLogoUrl,
}: {
	fullName: string
	position?: string | null
	profilePhotoUrl?: string | null
	organizationLogoUrl?: string | null
}) {
	return (
		<header className="sticky top-0 z-40">
			<div className="border-b border-white/10 bg-black/30 backdrop-blur-2xl">
				<div className="mx-auto flex max-w-[1100px] items-center gap-3 px-4 py-3">
					<div
						className={cn(
							'relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)]'
						)}
					>
						{profilePhotoUrl ? (
							<img
								src={profilePhotoUrl}
								alt={`${fullName} profile photo`}
								className="h-full w-full object-cover"
								loading="lazy"
							/>
						) : (
							<span className="text-sm font-semibold text-white">{initials(fullName)}</span>
						)}
					</div>

					<div className="min-w-0 flex-1">
						<div className="truncate text-sm font-semibold leading-tight text-white">{fullName}</div>
						<div className="truncate text-xs leading-tight text-white/60">{position ?? ''}</div>
					</div>

					{organizationLogoUrl ? (
						<div className="rounded-2xl border border-white/10 bg-white/5 p-2">
							<img
								src={organizationLogoUrl}
								alt="Organization logo"
								className="h-8 w-8 rounded-xl object-contain"
								loading="lazy"
							/>
						</div>
					) : null}
				</div>
			</div>
		</header>
	)
}
