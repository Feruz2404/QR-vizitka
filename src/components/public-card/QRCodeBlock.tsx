import QRCode from 'react-qr-code'

import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { downloadSvg } from '../../lib/qr'

export function QRCodeBlock({ url, filename }: { url: string; filename: string }) {
	return (
		<Card className="p-4">
			<div className="flex items-center justify-between">
				<div>
					<div className="text-sm font-semibold">QR Code</div>
					<div className="text-xs text-brand-muted">Scan to open this card</div>
				</div>
				<Button
					variant="secondary"
					size="sm"
					onClick={() => {
						const svg = document.getElementById('employee-qr') as SVGSVGElement | null
						if (svg) downloadSvg(svg, filename)
					}}
				>
					Download
				</Button>
			</div>
			<div className="mt-4 grid place-items-center rounded-xl border border-white/10 bg-white/5 p-4">
				<QRCode id="employee-qr" value={url} size={160} bgColor="transparent" fgColor="#F5C542" />
			</div>
			<div className="mt-3 break-all text-xs text-brand-muted">{url}</div>
		</Card>
	)
}
