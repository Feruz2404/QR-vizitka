import { cn } from '../lib/utils'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			className={cn(
				'h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-brand-gold/50',
				className
			)}
			{...props}
		/>
	)
}
