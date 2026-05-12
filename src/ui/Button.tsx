import { forwardRef } from 'react'
import { cn } from '../lib/utils'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
	size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
	{ className, variant = 'primary', size = 'md', ...props },
	ref
) {
	const base =
		'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-gold/60 disabled:opacity-50 disabled:cursor-not-allowed'

	const variants: Record<NonNullable<Props['variant']>, string> = {
		primary:
			'bg-brand-gold text-black hover:bg-brand-gold2 shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
		secondary:
			'bg-white/10 text-white border border-white/15 hover:bg-white/15 backdrop-blur',
		ghost: 'bg-transparent text-white hover:bg-white/10',
		danger: 'bg-red-600 text-white hover:bg-red-500',
	}

	const sizes: Record<NonNullable<Props['size']>, string> = {
		sm: 'h-9 px-3 text-sm',
		md: 'h-11 px-4 text-sm',
		lg: 'h-12 px-5 text-base',
	}

	return (
		<button
			ref={ref}
			className={cn(base, variants[variant], sizes[size], className)}
			{...props}
		/>
	)
})
