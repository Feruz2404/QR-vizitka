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
		<header className="sticky top-0 z-40 border-b border-white/10 bg-black/35 backdrop-blur-xl">
			<div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
				<div
					className={cn(
						'grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-white/10'
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
						<span className="text-sm font-semibold text-white">
							{initials(fullName)}
						</span>
					)}
				</div>

				<div className="min-w-0 flex-1">
					<div className="truncate text-sm font-semibold leading-tight">{fullName}</div>
					<div className="truncate text-xs text-brand-muted leading-tight">
						{position ?? ''}
					</div>
				</div>

				{organizationLogoUrl ? (
					<img
						src={organizationLogoUrl}
						alt="Organization logo"
						className="h-8 w-8 rounded-lg object-contain"
						loading="lazy"
					/>
				) : null}
			</div>
		</header>
	)
}
