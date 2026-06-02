import { cn } from '../lib/utils'

// Base Card is fully transparent liquid-glass.
// Individual pages may add extra rings/gradients, but should avoid opaque fills.
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				'relative rounded-2xl border border-white/15 bg-transparent shadow-glass backdrop-blur',
				className,
			)}
			{...props}
		/>
	)
}
