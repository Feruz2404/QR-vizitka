import { cn } from '../lib/utils'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				'rounded-2xl border border-white/15 bg-white/5 shadow-glass backdrop-blur',
				className
			)}
			{...props}
		/>
	)
}
