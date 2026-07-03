import { Copy, Download, ImageDown } from 'lucide-react'
import { useMemo, useRef } from 'react'

import { useGetAppSettingsQuery } from '../../services/appSettingsApi'
import { BrandedQrCode, type BrandedQrCodeHandle } from '../qr/BrandedQrCode'
import { BrandedQrFrame } from '../qr/BrandedQrFrame'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { useToast } from '../../ui/Toast'
import { safeUrl } from '../../lib/utils'

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
	const { data: settings } = useGetAppSettingsQuery()
	const qrRef = useRef<BrandedQrCodeHandle | null>(null)

	const logo = safeUrl(organizationLogoUrl) ?? safeUrl(settings?.organization_logo_url)

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
				<BrandedQrFrame>
					<BrandedQrCode
						ref={qrRef}
						value={url}
						size={220}
						logoUrl={logo}
						accentColor="#003B73"
						dotsColor="#003B73"
					/>
				</BrandedQrFrame>
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
