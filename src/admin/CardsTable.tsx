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
		await navigator.clipboard.writeText(`${publicBaseUrl()}/v/${slug}`)
		toast.push('Link copied')
	}

	function openQr(r: { id: string; slug: string; full_name: string }) {
		setQrTarget({ id: r.id, slug: r.slug, name: r.full_name, url: `${publicBaseUrl()}/v/${r.slug}` })
	}

	function closeQr() {
		setQrTarget(null)
	}

	function handleDownloadQr() {
		if (!qrTarget || !qrBoxRef.current) return
		const svg = qrBoxRef.current.querySelector('svg')
		if (svg) downloadSvg(svg as SVGSVGElement, `${qrTarget.slug}.svg`)
	}

	return (
		<>
			<Card className="overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[920px] text-sm">
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
							{rows.map((r) => (
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
									