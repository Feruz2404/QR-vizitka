import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Download, Eye, Pencil, Power, QrCode, Trash2, X } from 'lucide-react'
import QRCode from 'react-qr-code'

import {
	useDeleteCardMutation,
	useGetCardsQuery,
	useToggleCardStatusMutation,
} from '../services/employeeCardsApi'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from './StatusBadge'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { useToast } from '../ui/Toast'
import { downloadSvg } from '../lib/qr'

function publicBaseUrl() {
	if (typeof window !== 'undefined') return window.location.origin
	return ''
}

type QrTarget = { id: string; name: string; slug: string; url: string }

export function CardsTable() {
	const toast = useToast()
	const { data, isLoading, isError } = useGetCardsQuery()
	const [toggleStatus, toggleState] = useToggleCardStatusMutation()
	const [deleteCard, deleteState] = useDeleteCardMutation()

	const [deleteOpen, setDeleteOpen] = useState(false)
	const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

	const [qrTarget, setQrTarget] = useState<QrTarget | null>(null)
	const qrBoxRef = useRef<HTMLDivElement | null>(null)

	const rows = useMemo(() => data ?? [], [data])

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

	async function copyPublicUrl(slug: string) {
		await navigator.clipboard.writeText(publicBaseUrl() + '/v/' + slug)
		toast.push('Link copied')
	}

	function openQr(r: { id: string; slug: string; full_name: string }) {
		setQrTarget({ id: r.id, slug: r.slug, name: r.full_name, url: publicBaseUrl() + '/v/' + r.slug })
	}

	function closeQr() {
		setQrTarget(null)
	}

	async function copyQrLink() {
		if (!qrTarget) return
		await navigator.clipboard.writeText(qrTarget.url)
		toast.push('Link copied')
	}

	function handleDownloadQr() {
		if (!qrTarget || !qrBoxRef.current) return
		const svg = qrBoxRef.current.querySelector('svg')
		if (svg) downloadSvg(svg as SVGSVGElement, qrTarget.slug + '.svg')
	}

	async function handleTogglePublish(r: { id: string; is_active: boolean; full_name: string }) {
		try {
			await toggleStatus({ id: r.id, is_active: !r.is_active }).unwrap()
			toast.push(r.is_active ? 'Unpublished' : 'Published')
		} catch {
			toast.push('Failed to update status')
		}
	}

	async function handleConfirmDelete() {
		if (!deleteTarget) return
		try {
			await deleteCard(deleteTarget.id).unwrap()
			toast.push('Card deleted')
			setDeleteOpen(false)
			setDeleteTarget(null)
		} catch {
			toast.push('Failed to delete card')
		}
	}

	return (
		<>
			<Card className="overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[960px] text-sm">
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
								const editPath = '/admin/cards/' + r.id + '/edit'
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
													<div className="truncate text-xs text-brand-muted">{r.department ?? ''}</div>
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
											{r.updated_at ? new Date(r.updated_at).toLocaleDateString() : ''}
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center justify-end gap-1">
												<Link
													to={publicPath}
													target="_blank"
													rel="noreferrer noopener"
													title="View public card"
													aria-label="View public card"
													className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
												>
													<Eye className="h-4 w-4" />
												</Link>
												<button
													type="button"
													onClick={() => copyPublicUrl(r.slug)}
													title="Copy public link"
													aria-label="Copy public link"
													className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
												>
													<Copy className="h-4 w-4" />
												</button>
												<button
													type="button"
													onClick={() => openQr(r)}
													title="Show QR code"
													aria-label="Show QR code"
													className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-yellow-300/40 bg-yellow-300/10 text-yellow-200 transition hover:bg-yellow-300/20"
												>
													<QrCode className="h-4 w-4" />
												</button>
												<button
													type="button"
													onClick={() => handleTogglePublish(r)}
													disabled={toggleState.isLoading}
													title={r.is_active ? 'Unpublish' : 'Publish'}
													aria-label={r.is_active ? 'Unpublish card' : 'Publish card'}
													className={
														'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-50 ' +
														(r.is_active
															? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200 hover:bg-emerald-300/20'
															: 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10')
													}
												>
													<Power className="h-4 w-4" />
												</button>
												<Link
													to={editPath}
													title="Edit card"
													aria-label="Edit card"
													className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
												>
													<Pencil className="h-4 w-4" />
												</Link>
												<button
													type="button"
													onClick={() => {
														setDeleteTarget({ id: r.id, name: r.full_name })
														setDeleteOpen(true)
													}}
													title="Delete card"
													aria-label="Delete card"
													className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/30 bg-red-400/10 text-red-200 transition hover:bg-red-400/20"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			</Card>

			{qrTarget ? (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
					role="dialog"
					aria-modal="true"
					onClick={closeQr}
				>
					<div
						className="relative w-full max-w-md overflow-hidden rounded-3xl border border-yellow-300/25 bg-[#0b0d12] p-6 shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							type="button"
							onClick={closeQr}
							aria-label="Close"
							className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
						>
							<X className="h-4 w-4" />
						</button>
						<div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-200/85">
							Employee QR
						</div>
						<div className="mt-1 text-lg font-semibold text-white">{qrTarget.name}</div>
						<div className="mt-4 flex justify-center">
							<div ref={qrBoxRef} className="rounded-2xl bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
								<QRCode value={qrTarget.url} size={208} bgColor="#ffffff" fgColor="#000000" />
							</div>
						</div>
						<div className="mt-4 break-all rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
							{qrTarget.url}
						</div>
						<div className="mt-4 grid grid-cols-2 gap-2">
							<Button variant="secondary" size="md" onClick={copyQrLink}>
								<Copy className="h-4 w-4" />
								Copy Link
							</Button>
							<Button variant="primary" size="md" onClick={handleDownloadQr}>
								<Download className="h-4 w-4" />
								Download QR
							</Button>
						</div>
					</div>
				</div>
			) : null}

			<DeleteConfirmModal
				open={deleteOpen}
				title="Delete card?"
				description={deleteTarget ? 'This will permanently delete the card for ' + deleteTarget.name + '.' : ''}
				loading={deleteState.isLoading}
				onCancel={() => {
					setDeleteOpen(false)
					setDeleteTarget(null)
				}}
				onConfirm={handleConfirmDelete}
			/>
		</>
	)
}
