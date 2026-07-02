import { Copy, Download, ImageDown, Loader2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import { useGetAppSettingsQuery } from '../../services/appSettingsApi'
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
	const { data: settings } = useGetAppSettingsQuery()
	const qrRef = useRef<BrandedQrCodeHandle | null>(null)

	const logo = organizationLogoUrl ?? settings?.organization_logo_url ?? null

	const [svgLoading, setSvgLoading] = useState(false)
	const [pngLoading, setPngLoading] = useState(false)
	const [copyLoading, setCopyLoading] = useState(false)

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
						disabled={svgLoading || pngLoading}
						aria-label="Download QR code as SVG"
						aria-busy={svgLoading}
						onClick={async () => {
							setSvgLoading(true)
							try {
								await qrRef.current?.downloadSvg(svgName)
							} finally {
								setSvgLoading(false)
							}
						}}
					>
						{svgLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
						SVG
					</Button>
					<Button
						variant="secondary"
						size="sm"
						disabled={svgLoading || pngLoading}
						aria-label="Download QR code as PNG"
						aria-busy={pngLoading}
						onClick={async () => {
							setPngLoading(true)
							try {
								await qrRef.current?.downloadPng(pngName, { scale: 4 })
							} finally {
								setPngLoading(false)
							}
						}}
					>
						{pngLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ImageDown className="h-4 w-4" aria-hidden="true" />}
						PNG
					</Button>
				</div>
			</div>

			<div className="mt-5 grid place-items-center">
				<div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
					<div className="rounded-2xl bg-white p-5">
						<BrandedQrCode
							ref={qrRef}
							value={url}
							size={220}
							logoUrl={logo}
							accentColor="#D4AF37"
							dotsColor="#0b0f1a"
						/>
					</div>
				</div>
			</div>

			<div className="mt-5 flex flex-col gap-2">
				<div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
					<div className="text-[11px] uppercase tracking-wide text-white/50">Public URL</div>
					<div className="mt-1 truncate text-sm text-white/80" title={url}>
						{url}
					</div>
				</div>
				<div className="grid grid-cols-2 gap-2">
					<Button
						variant="secondary"
						disabled={copyLoading}
						aria-label="Copy public link to clipboard"
						aria-busy={copyLoading}
						onClick={async () => {
							setCopyLoading(true)
							try {
								await navigator.clipboard.writeText(url)
								toast.push('Link copied')
							} finally {
								setCopyLoading(false)
							}
						}}
					>
						{copyLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
						Copy Link
					</Button>
					<Button
						variant="ghost"
						aria-label="Open public card in new tab"
						onClick={() => window.open(url, '_blank', 'noreferrer')}
					>
						Open
					</Button>
				</div>
			</div>
		</Card>
	)
}
