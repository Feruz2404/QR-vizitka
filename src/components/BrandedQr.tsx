import { useEffect, useMemo, useState } from 'react'

import { renderQrSvg, type QrRenderOptions } from '../lib/qr'

export function BrandedQr({
	value,
	logoUrl,
	size,
	className,
}: {
	value: string
	logoUrl: string | null
	size: number
	className?: string
}) {
	const [svg, setSvg] = useState<string | null>(null)
	const opts: QrRenderOptions = useMemo(
		() => ({ size, margin: 2, fgColor: '#0b0f1a', bgColor: '#ffffff', errorCorrectionLevel: 'H' }),
		[size],
	)

	useEffect(() => {
		let canceled = false
		setSvg(null)
		renderQrSvg({ value, logoUrl, options: opts, logoScale: 0.19 })
			.then((s) => {
				if (!canceled) setSvg(s)
			})
			.catch(() => {
				if (!canceled) setSvg(null)
			})
		return () => {
			canceled = true
		}
	}, [value, logoUrl, opts])

	if (!svg) {
		return (
			<div className={className} style= width: size, height: size  aria-label="QR code loading" />
		)
	}

	return (
		<div
			className={className}
			dangerouslySetInnerHTML= __html: svg 
			aria-label="QR code"
		/>
	)
}
