import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'

export function BrandedQrFrame({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<div
			className={cn(
				'relative rounded-[28px] border border-blue-300/35 bg-white p-3 shadow-[0_28px_90px_rgba(0,0,0,0.45)] ring-1 ring-black/5',
				className,
			)}
		>
			<div className="pointer-events-none absolute left-3 top-3 h-8 w-8 rounded-tl-[18px] border-l-2 border-t-2 border-blue-500/80" />
			<div className="pointer-events-none absolute right-3 top-3 h-8 w-8 rounded-tr-[18px] border-r-2 border-t-2 border-blue-500/80" />
			<div className="pointer-events-none absolute bottom-3 left-3 h-8 w-8 rounded-bl-[18px] border-b-2 border-l-2 border-blue-500/80" />
			<div className="pointer-events-none absolute bottom-3 right-3 h-8 w-8 rounded-br-[18px] border-b-2 border-r-2 border-blue-500/80" />
			<div className="relative rounded-[22px] bg-white p-2">{children}</div>
		</div>
	)
}
