import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

export function DeleteConfirmModal({
	open,
	onClose,
	onConfirm,
	name,
	loading,
}: {
	open: boolean
	onClose: () => void
	onConfirm: () => void
	name: string
	loading?: boolean
}) {
	return (
		<Modal open={open} onClose={onClose} title="Delete card">
			<p className="text-sm text-brand-muted">
				Delete <span className="text-white">{name}</span>? This cannot be undone.
			</p>
			<div className="mt-4 flex justify-end gap-2">
				<Button variant="ghost" onClick={onClose}>
					Cancel
				</Button>
				<Button variant="danger" disabled={loading} onClick={onConfirm}>
					{loading ? 'Deleting…' : 'Delete'}
				</Button>
			</div>
		</Modal>
	)
}
