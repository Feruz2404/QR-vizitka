import { Card } from './Card'

export function Modal({
	open,
	onClose,
	title,
	children,
}: {
	open: boolean
	onClose: () => void
	title: string
	children: React.ReactNode
}) {
	if (!open) return null
	return (
		<div
			role="dialog"
			aria-modal="true"
			className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
			onClick={onClose}
		>
			<Card className="w-full max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
				<div className="text-lg font-semibold">{title}</div>
				<div className="mt-3">{children}</div>
			</Card>
		</div>
	)
}
