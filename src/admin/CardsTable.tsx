import { useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Download, Eye, ImageDown, Pencil, Power, QrCode, Trash2, X } from 'lucide-react'

import {
	useDeleteCardMutation,
	useGetCardsQuery,
	useToggleCardStatusMutation,
} from '../services/employeeCardsApi'
import { useGetAppSettingsQuery } from '../services/appSettingsApi'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from './StatusBadge'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { useToast } from '../ui/Toast'
import { BrandedQrCode, type BrandedQrCodeHandle } from '../components/qr/BrandedQrCode'

type QrTarget = { id: string; full_name: string; slug: string }

export function CardsTable() {
	const toast = useToast()
	const { data, isLoading, isError } = useGetCardsQuery()
	const { data: settings } = useGetAppSettingsQuery()
	const [toggleStatus, toggleState] = useToggleCardStatusMutation()
	const [deleteCard, deleteState] = useDeleteCardMutation()

	const [deleteOpen, setDeleteOpen] = useState(false)
	const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

	const [qrOpen, setQrOpen] = useState(false)
	const [qrTarget, setQrTarget] = useState<QrTarget | null>(null)
	const qrRef = useRef<BrandedQrCodeHandle | null>(null)

	const rows = useMemo(() => data ?? [], [data])
	const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
	const qrUrl = qrTarget ? baseUrl + '/v/' + qrTarget.slug : ''

	const onCopy = async (slug: string) => {
		await navigator.clipboard.writeText(baseUrl + '/v/' + slug)
		toast.push('Link copied')
	}

	const onOpenQr = (r: { id: string; full_name: string; slug: string }) => {
		setQrTarget({ id: r.id, full_name: r.full_name, slug: r.slug })
		setQrOpen(true)
	}

	const onCloseQr = () => setQrOpen(false)

	const onCopyQrLink = async () => {
		if (!qrUrl) return
		await navigator.clipboard.writeText(qrUrl)
		toast.push('Link copied')
	}

	const onDownloadQrSvg = async () => {
		if (!qrTarget) return
		await qrRef.current?.downloadSvg(qrTarget.slug + '.svg')
	}

	const onDownloadQrPng = async () => {
		if (!qrTarget) return
		await qrRef.current?.downloadPng(qrTarget.slug + '.png', { scale: 4 })
	}

	const onTogglePublish = (id: string, isActive: boolean) => {
		toggleStatus({ id, is_active: !isActive })
	}

	const onAskDelete = (id: string, name: string) => {
		setDeleteTarget({ id, name })
		setDeleteOpen(true)
	}

	const onConfirmDelete = async () => {
		if (!deleteTarget) return
		await deleteCard(deleteTarget.id)
		toast.push('Deleted')
		setDeleteOpen(false)
	}

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

	const orgLogoUrl = settings?.organization_logo_url ?? null

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
								<th className="px-4 py-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((r) => {
								const publicPath = '/v/' + r.slug
								const publishLabel = r.is_active ? 'Unpublish' : 'Publish'
								const editPath = '/admin/cards/' + r.id + '/edit'
								return (
									<tr key={r.id} className="border-t border-white/10">
										<td className="px-4 py-3">
											<div className="font-medium text-white">{r.full_name}</div>
											<div className="text-xs text-brand-muted">{r.department ?? ''}</div>
										</td>
										<td className="px-4 py-3 text-brand-muted">{r.position}</td>
										<td className="px-4 py-3">
											<span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs">{r.slug}</span>
										</td>
										<td className="px-4 py-3">
											<StatusBadge active={r.is_active} />
										</td>
										<td className="px-4 py-3">
											<div className="flex flex-wrap justify-end gap-2">
												<Link to={publicPath} target="_blank">
													<Button size="sm" variant="secondary" aria-label="View">
														<Eye className="h-4 w-4" />
													</Button>
												</Link>
												<Link to={editPath}>
													<Button size="sm" variant="secondary" aria-label="Edit">
														<Pencil className="h-4 w-4" />
													</Button>
												</Link>
												<Button size="sm" variant="secondary" aria-label="Copy link" onClick={() => onCopy(r.slug)}>
													<Copy className="h-4 w-4" />
												</Button>
												<Button size="sm" variant="secondary" aria-label="QR code" onClick={() => onOpenQr(r)}>
													<QrCode className="h-4 w-4" />
												</Button>
												<Button
													size="sm"
													variant={r.is_active ? 'primary' : 'secondary'}
													aria-label={publishLabel}
													disabled={toggleState.isLoading}
													onClick={() => onTogglePublish(r.id, r.is_active)}
												>
													<Power className="h-4 w-4" />
												</Button>
												<Button size="sm" variant="danger" aria-label="Delete" onClick={() => onAskDelete(r.id, r.full_name)}>
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
				onConfirm={onConfirmDelete}
			/>

			{qrOpen && qrTarget ? (
				<div
					className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
					onClick={onCloseQr}
					role="dialog"
					aria-modal="true"
				>
					<div
						className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0f1a] p-5"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<div className="truncate text-base font-semibold text-white">{qrTarget.full_name}</div>
								<div className="mt-1 truncate text-xs text-brand-muted" title={qrUrl}>
									{qrUrl}
								</div>
							</div>
							<button
								type="button"
								onClick={onCloseQr}
								aria-label="Close"
								className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/80 hover:bg-white/10"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<div className="mt-4 grid place-items-center">
							<div className="rounded-xl bg-white p-4">
								<BrandedQrCode
									ref={qrRef}
									value={qrUrl}
									size={200}
									logoUrl={orgLogoUrl}
									watermarkUrl={orgLogoUrl}
									accentColor="#D4AF37"
									dotsColor="#0b0f1a"
								/>
							</div>
						</div>

						<div className="mt-4 flex flex-wrap justify-end gap-2">
							<Button size="sm" variant="secondary" aria-label="Copy link" onClick={onCopyQrLink}>
								<Copy className="mr-1 h-4 w-4" /> Copy Link
							</Button>
							<Button size="sm" variant="secondary" aria-label="Download QR SVG" onClick={onDownloadQrSvg}>
								<Download className="mr-1 h-4 w-4" /> SVG
							</Button>
							<Button size="sm" variant="secondary" aria-label="Download QR PNG" onClick={onDownloadQrPng}>
								<ImageDown className="mr-1 h-4 w-4" /> PNG
							</Button>
							<Button size="sm" aria-label="Close" onClick={onCloseQr}>
								Close
							</Button>
						</div>
					</div>
				</div>
			) : null}
		</>
	)
}
