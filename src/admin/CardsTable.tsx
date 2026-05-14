import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Download, Eye, Pencil, Power, QrCode, Trash2, X } from 'lucide-react'
import QRCode from 'react-qr-code'

import {
	useDeleteCardMutation,
	useGetCardsQuery,
	useToggleCardStatusMutation,
} from '../services/employeeCardsApi'
import { downloadSvg } from '../lib/qr'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from './StatusBadge'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { useToast } from '../ui/Toast'

type QrTarget = { id: string; full_name: string; slug: string }

export function CardsTable() {
	const toast = useToast()
	const { data, isLoading, isError } = useGetCardsQuery()
	const [toggleStatus, toggleState] = useToggleCardStatusMutation()
	const [deleteCard, deleteState] = useDeleteCardMutation()

	const [deleteOpen, setDeleteOpen] = useState(false)
	const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

	const [qrOpen, setQrOpen] = useState(false)
	const [qrTarget, setQrTarget] = useState<QrTarget | null>(null)

	const rows = useMemo(() => data ?? [], [data])
	const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
	const qrUrl = qrTarget ? baseUrl + '/v/' + qrTarget.slug : ''

	if (isLoading) {
		return (
			<Card className="p-4">
				<Skeleton className="h-10 w-full" />
				<div className="mt-3 grid gap-2">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</div>
			</Card>
		)
	}

	if (isError) {
		return (
			<Card className="p-5">
				<div className="text-sm text-red-200">Failed to load cards.</div>
			</Card>
		)
	}

	if (rows.length === 0) {
		return (
			<Card className="p-6 text-center">
				<div className="text-lg font-semibold">No cards yet</div>
				<div className="mt-1 text-sm text-brand-muted">Create your first employee card.</div>
			</Card>
		)
	}

	return (
		<>
			<Card className="overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[880px] text-sm">
						<thead className="bg-black/20">
							<tr className="text-left text-brand-muted">
								<th className="px-4 py-3">Employee</th>
								<th className="px-4 py-3">Position</th>
								<th className="px-4 py-3">Slug</th>
								<th className="px-4 py-3">Status</th>
								<th className="px-4 py-3">Updated</th>
								<th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((r) => {
								const publicPath = '/v/' + r.slug
								const publicFullUrl = baseUrl + publicPath
								const publishLabel = r.is_active ? 'Unpublish' : 'Publish'
								return (
									<tr key={r.id} className="border-t border-white/10">
										<td className="px-4 py-3">
											<div className="flex items-center gap-3">
												<div className="h-9 w-9 overflow-hidden rounded-full border border-white/15 bg-white/10">
													{r.profile_photo_url ? (
														<img
															src={r.profile_photo_url}
															alt="Profile"
															className="h-full w-full object-cover"
															loading="lazy"
														/>
													) : null}
												</div>
												<div className="min-w-0">
													<div className="truncate font-medium text-white">{r.full_name}</div>
													<div className="truncate text-xs text-brand-muted">
														{r.department ?? ''}
													</div>
												</div>
											</div>
										</td>
										<td className="px-4 py-3 text-brand-muted">{r.position}</td>
										<td className="px-4 py-3">
											<span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs">
												{r.slug}
											</span>
										</td>
										<td className="px-4 py-3">
											<StatusBadge active={r.is_active} />
										</td>
										<td className="px-4 py-3 text-brand-muted">
											{new Date(r.updated_at).toLocaleString()}
										</td>
										<td className="px-4 py-3">
											<div className="flex flex-wrap justify-end gap-2 whitespace-nowrap">
												<Link to={publicPath} target="_blank">
													<Button size="sm" variant="secondary" aria-label="View">
														<Eye className="h-4 w-4" />
													</Button>
												</Link>
												<Link to={'/admin/cards/' + r.id + '/edit'}>
													<Button size="sm" variant="secondary" aria-label="Edit">
														<Pencil className="h-4 w-4" />
													</Button>
												</Link>
												<Button
													size="sm"
													variant="secondary"
													aria-label="Copy link"
													onClick={async () => {
														await navigator.clipboard.writeText(publicFullUrl)
														toast.push('Link copied')
													}}
												>
													<Copy className="h-4 w-4" />
												</Button>
												<Button
													size="sm"
													variant="secondary"
													aria-label="QR code"
													onClick={() => {
														setQrTarget({ id: r.id, full_name: r.full_name, slug: r.slug })
														setQrOpen(true)
													}}
												>
													<QrCode className="h-4 w-4" />
												</Button>
												<Button
													size="sm"
													variant={r.is_active ? 'primary' : 'secondary'}
													aria-label={publishLabel}
													disabled={toggleState.isLoading}
													onClick={() => toggleStatus({ id: r.id, is_active: !r.is_active })}
												>
													<Power className="h-4 w-4" />
												</Button>
												<Button
													size="sm"
													variant="danger"
													aria-label="Delete"
													onClick={() => {
														setDeleteTarget({ id: r.id, name: r.full_name })
														setDeleteOpen(true)
													}}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			</Card>

			<DeleteConfirmModal
				open={deleteOpen}
				onClose={() => setDeleteOpen(false)}
				name={deleteTarget?.name ?? ''}
				loading={deleteState.isLoading}
				onConfirm={async () => {
					if (!deleteTarget) return
					await deleteCard(deleteTarget.id)
					toast.push('Deleted')
					setDeleteOpen(false)
				}}
			/>

			{qrOpen && qrTarget ? (
				<div
					className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
					onClick={() => setQrOpen(false)}
					role="dialog"
					aria-modal="true"
				>
					<div
						className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0f1a] p-5 shadow-[0_50px_120px_rgba(0,0,0,0.6)]"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<div className="truncate text-base font-semibold text-white">
									{qrTarget.full_name}
								</div>
								<div className="mt-1 truncate text-xs text-brand-muted" title={qrUrl}>
									{qrUrl}
								</div>
							</div>
							<button
								type="button"
								onClick={() => setQrOpen(false)}
								aria-label="Close"
								className="rounded-xl border border-white/10 bg-white/5 p-1.5 text-white/80 hover:bg-white/10"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<div className="mt-4 grid place-items-center">
							<div className="rounded-2xl bg-white p-4">
								<QRCode
									id="admin-qr-svg"
									value={qrUrl}
						