import { Download } from 'lucide-react'

import { downloadQrPng, downloadQrSvg } from '../../lib/qr'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { BrandedQr } from '../BrandedQr'

export function QRCodeBlock({
	url,
	filenameBase,
	logoUrl,
}: {
	url: string
	filenameBase: string
	logoUrl: string | null
}) {
	return (
		<Card className="p-5">
			<div className="flex items-start justify-between gap-3">
				<div>
					<div className="text-sm font-semibold">QR Business Card</div>
					<div className="mt-1 text-xs text-brand-muted">Scan to open this digital card</div>
					<div className="mt-1 text-[11px] text-brand-muted">Error correction: H</div>
				</div>

				<div className="flex flex-wrap gap-2">
					<Button
						variant="secondary"
						size="sm"
						onClick={() =>
							downloadQrSvg({
								value: url,
								logoUrl,
								options: { size: 240, margin: 2, errorCorrectionLevel: 'H' },
								filename: filenameBase + '.svg',
							})
						}
						aria-label="Download QR SVG"
					>
						<Download className="h-4 w-4" /> SVG
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onClick={() =>
							downloadQrPng({
								value: url,
								logoUrl,
								options: { size: 1024, margin: 2, errorCorrectionLevel: 'H' },
								filename: filenameBase + '.png',
							})
						}
						aria-label="Download QR PNG"
					>
						<Download className="h-4 w-4" /> PNG
					</Button>
				</div>
			</div>

			<div className="mt-4 grid place-items-center">
				<div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
					<div className="rounded-2xl bg-white p-4">
						<BrandedQr value={url} logoUrl={logoUrl} size={188} />
					</div>
				</div>
			</div>
		</Card>
	)
}
