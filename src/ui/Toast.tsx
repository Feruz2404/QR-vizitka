import { createContext, useContext, useMemo, useState } from 'react'

type ToastItem = { id: string; message: string }

const ToastCtx = createContext<{ push: (message: string) => void } | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<ToastItem[]>([])

	const api = useMemo(
		() => ({
			push(message: string) {
				const id = crypto.randomUUID()
				setItems((p) => [...p, { id, message }])
				setTimeout(() => setItems((p) => p.filter((x) => x.id !== id)), 2500)
			},
		}),
		[]
	)

	return (
		<ToastCtx.Provider value={api}>
			{children}
			<div className="fixed bottom-4 right-4 z-50 space-y-2">
				{items.map((t) => (
					<div
						key={t.id}
						className="rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm backdrop-blur"
					>
						{t.message}
					</div>
				))}
			</div>
		</ToastCtx.Provider>
	)
}

export function useToast() {
	const ctx = useContext(ToastCtx)
	if (!ctx) throw new Error('useToast must be used inside ToastProvider')
	return ctx
}
