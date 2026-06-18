import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = 'default' | 'success' | 'error'

type ToastItem = {
	id: string
	message: string
	variant: ToastVariant
}

type ToastApi = {
	push: (message: string, variant?: ToastVariant) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastCtx = createContext<ToastApi | null>(null)

const DURATION_MS = 3000

// ─── Single toast item ────────────────────────────────────────────────────────

function ToastItem({
	item,
	onDismiss,
}: {
	item: ToastItem
	onDismiss: (id: string) => void
}) {
	const isError = item.variant === 'error'
	const isSuccess = item.variant === 'success'

	const borderColor = isError
		? 'border-red-400/40'
		: isSuccess
			? 'border-emerald-400/40'
			: 'border-yellow-300/30'

	const progressColor = isError
		? 'bg-red-400'
		: isSuccess
			? 'bg-emerald-400'
			: 'bg-yellow-300'

	const glowColor = isError
		? 'rgba(248,113,113,0.35)'
		: isSuccess
			? 'rgba(52,211,153,0.35)'
			: 'rgba(245,197,66,0.35)'

	return (
		<motion.div
			layout
			initial={{ opacity: 0, x: 64, scale: 0.92 }}
			animate={{ opacity: 1, x: 0, scale: 1 }}
			exit={{ opacity: 0, x: 64, scale: 0.92, transition: { duration: 0.2 } }}
			transition={{ type: 'spring', stiffness: 380, damping: 30 }}
			className={`relative flex w-full min-w-[220px] max-w-xs items-start gap-3 overflow-hidden rounded-2xl border ${borderColor} bg-[#080C18]/90 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl`}
			style={{ boxShadow: `0 0 0 1px ${glowColor}, 0 8px 32px rgba(0,0,0,0.45)` }}
		>
			{/* Top shimmer line */}
			<div
				className={`pointer-events-none absolute inset-x-0 top-0 h-px ${
					isError
						? 'bg-gradient-to-r from-transparent via-red-400/70 to-transparent'
						: isSuccess
							? 'bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent'
							: 'bg-gradient-to-r from-transparent via-yellow-300/80 to-transparent'
				}`}
			/>

			{/* Icon */}
			<div className="mt-0.5 shrink-0">
				{isSuccess ? (
					<CheckCircle2 className="h-4 w-4 text-emerald-400" />
				) : isError ? (
					<X className="h-4 w-4 text-red-400" />
				) : (
					<span className="mt-1 block h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_8px_rgba(245,197,66,0.9)]" />
				)}
			</div>

			{/* Message */}
			<p className="flex-1 text-sm leading-snug text-white">{item.message}</p>

			{/* Dismiss button */}
			<button
				type="button"
				aria-label="Dismiss"
				onClick={() => onDismiss(item.id)}
				className="mt-0.5 shrink-0 rounded-md p-0.5 text-white/40 transition hover:text-white/80"
			>
				<X className="h-3.5 w-3.5" />
			</button>

			{/* Progress bar */}
			<motion.div
				className={`absolute bottom-0 left-0 h-[2px] ${progressColor}`}
				initial={{ width: '100%' }}
				animate={{ width: '0%' }}
				transition={{ duration: DURATION_MS / 1000, ease: 'linear' }}
			/>
		</motion.div>
	)
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<ToastItem[]>([])

	const dismiss = useCallback((id: string) => {
		setItems((p) => p.filter((x) => x.id !== id))
	}, [])

	const api = useMemo<ToastApi>(
		() => ({
			push(message, variant = 'default') {
				const id = crypto.randomUUID()
				setItems((p) => [...p, { id, message, variant }])
				setTimeout(() => dismiss(id), DURATION_MS)
			},
		}),
		[dismiss],
	)

	return (
		<ToastCtx.Provider value={api}>
			{children}
			<div
				aria-live="polite"
				aria-atomic="false"
				className="fixed bottom-5 right-5 z-[200] flex flex-col items-end gap-2.5"
			>
				<AnimatePresence mode="popLayout">
					{items.map((t) => (
						<ToastItem key={t.id} item={t} onDismiss={dismiss} />
					))}
				</AnimatePresence>
			</div>
		</ToastCtx.Provider>
	)
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
	const ctx = useContext(ToastCtx)
	if (!ctx) throw new Error('useToast must be used inside ToastProvider')
	return ctx
}
