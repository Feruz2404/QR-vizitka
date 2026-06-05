import { Copy, Download, ImageDown } from 'lucide-react'
import { useMemo, useRef } from 'react'

import { BrandedQrCode, type BrandedQrCodeHandle } from '../qr/BrandedQrCode'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { useToast } from '../../ui/Toast'

export function QRCodeBlock({
	url,
	filename,
	organizationLogoUrl,
}: {
	url: string
	filename: string
	organizationLogoUrl?: string | null
}) {
	const toast = useToast()
	const qrRef = useRef<BrandedQrCodeHandle | null>(null)

	const svgName = useMemo(() => (filename.toLowerCase().endsWith('.svg') ? filename : filename + '.svg'), [filename])
	const pngName = useMemo(() => filename.replace(/\.svg$/i, '') + '.png', [filename])

	return (
		<Card className="p-5">
			<div className="flex items-start justify-between gap-3">
				<div>
					<div className="text-sm font-semibold">QR Business Card</div>
					<div className="mt-1 text-xs text-brand-muted">Scan to open this digital card</div>
				</div>

				<div className="flex flex-wrap items-center justify-end gap-2">
					<Button
						variant="secondary"
						size="sm"
						onClick={async () => {
							await qrRef.current?.downloadSvg(svgName)
						}}
						aria-label="Download QR (SVG)"
					>
						<Download className="h-4 w-4" /> SVG
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onClick={async () => {
							await qrRef.current?.downloadPng(pngName, { scale: 4 })
						}}
						aria-label="Download QR (PNG)"
					>
						<ImageDown className="h-4 w-4" /> PNG
					</Button>
				</div>
			</div>

			<div className="mt-4 grid place-items-center">
				<div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
					<div className="rounded-2xl bg-white p-4">
						<BrandedQrCode
							ref={qrRef}
							value={url}
							size={188}
							logoUrl={organizationLogoUrl}
							watermarkUrl={organizationLogoUrl}
							accentColor="#D4AF37"
							dotsColor="#0b0f1a"
						/>
					</div>
				</div>
			</div>

			<div className="mt-4 flex flex-col gap-2">
				<div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
					<div className="text-[11px] uppercase tracking-wide text-white/50">Public URL</div>
					<div className="mt-1 truncate text-sm text-white/80" title={url}>
						{url}
					</div>
				</div>
				<div className="grid grid-cols-2 gap-2">
					<Button
						variant="secondary"
						onClick={async () => {
							await navigator.clipboard.writeText(url)
							toast.push('Link copied')
						}}
						aria-label="Copy link"
					>
						<Copy className="h-4 w-4" /> Copy Link
					</Button>
					<Button
						variant="ghost"
						onClick={() => window.open(url, '_blank', 'noreferrer')}
						aria-label="Open link"
					>
						Open
					</Button>
				</div>
			</div>
		</Card>
	)
}
