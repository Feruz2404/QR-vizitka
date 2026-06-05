import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type CSSProperties } from 'react'
import { safeUrl } from '../../lib/utils'

type BrandedQrCodeProps = {
	value: string
	size: number
	logoUrl?: string | null
	watermarkUrl?: string | null
	className?: string
	/** Background behind the QR modules (default white for scan reliability). */
	backgroundColor?: string
	/** Module color (default near-black for scan reliability). */
	dotsColor?: string
	/** Accent color (used for finder eyes). Should come from existing theme palette. */
	accentColor?: string
}

export type BrandedQrCodeHandle = {
	downloadSvg: (filename: string) => Promise<void>
	downloadPng: (filename: string, opts?: { scale?: number }) => Promise<void>
}

function pickEcLevel(hasLogo: boolean) {
	// Force high reliability when logo is present.
	return hasLogo ? 'H' : 'M'
}

function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export const BrandedQrCode = forwardRef<BrandedQrCodeHandle, BrandedQrCodeProps>(function BrandedQrCode(
	{
		value,
		size,
		logoUrl,
		watermarkUrl,
		className,
		backgroundColor = '#ffffff',
		dotsColor = '#0b0f1a',
		accentColor = '#D4AF37',
	},
	ref
) {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const qrRef = useRef<unknown>(null)
	const [isReady, setIsReady] = useState(false)

	const safeLogo = safeUrl(logoUrl)
	const safeWatermark = safeUrl(watermarkUrl)
	const ecLevel = useMemo<ErrorCorrectionLevel>(() => pickEcLevel(Boolean(safeLogo)), [safeLogo])

	const containerStyle: CSSProperties = useMemo(
		() => ({
			position: 'relative',
			width: size,
			height: size,
			backgroundColor,
			overflow: 'hidden',
			borderRadius: 16,
		}),
		[size, backgroundColor]
	)

	const watermarkStyle: CSSProperties = useMemo(
		() => ({
			position: 'absolute',
			inset: -size * 0.15,
			width: size * 1.3,
			height: size * 1.3,
			objectFit: 'contain',
			opacity: 0.08,
			filter: 'grayscale(100%)',
			pointerEvents: 'none',
			userSelect: 'none',
			zIndex: 0,
		}),
		[size]
	)

	const qrContainerStyle: CSSProperties = useMemo(
		() => ({
			position: 'relative',
			width: '100%',
			height: '100%',
			display: 'grid',
			placeItems: 'center',
			zIndex: 1,
		}),
		[]
	)

	const loadingOverlayStyle: CSSProperties = useMemo(
		() => ({
			position: 'absolute',
			inset: 0,
			backgroundColor: 'transparent',
			zIndex: 2,
		}),
		[]
	)

	useEffect(() => {
		let cancelled = false
		setIsReady(false)

		async function init() {
			if (!containerRef.current) return
			containerRef.current.innerHTML = ''

			const mod = await import('qr-code-styling')
			const QRCodeStyling = (mod as any).default ?? (mod as any)

			const qr = new QRCodeStyling({
				width: size,
				height: size,
				type: 'svg',
				data: value,
				qrOptions: {
					errorCorrectionLevel: ecLevel,
				},
				backgroundOptions: { color: backgroundColor },
				dotsOptions: { color: dotsColor, type: 'dots' },
				cornersSquareOptions: { color: accentColor, type: 'extra-rounded' },
				cornersDotOptions: { color: accentColor, type: 'dot' },
				image: safeLogo ?? undefined,
				imageOptions: {
					crossOrigin: 'anonymous',
					margin: 8,
					size: 0.24,
					hideBackgroundDots: true,
				},
			})

			if (cancelled) return
			qrRef.current = qr as unknown
			qr.append(containerRef.current)
			if (!cancelled) setIsReady(true)
		}

		init().catch(() => {
			if (!cancelled) setIsReady(false)
		})

		return () => {
			cancelled = true
		}
	}, [value, size, safeLogo, ecLevel, backgroundColor, dotsColor, accentColor])

	useImperativeHandle(ref, () => ({
		async downloadSvg(filename: string) {
			const current = qrRef.current as any
			if (!current) return
			const blob: Blob = await current.getRawData('svg')
			downloadBlob(blob, filename)
		},
		async downloadPng(filename: string, opts?: { scale?: number }) {
			const scale = Math.max(1, Math.min(6, opts?.scale ?? 4))

			// qr-code-styling renders PNG via canvas when type is 'canvas'.
			// Create a temporary instance to avoid mutating the on-screen SVG.
			const mod = await import('qr-code-styling')
			const QRCodeStyling = (mod as any).default ?? (mod as any)

			const tmp = new QRCodeStyling({
				width: size * scale,
				height: size * scale,
				type: 'canvas',
				data: value,
				qrOptions: {
					errorCorrectionLevel: ecLevel,
				},
				backgroundOptions: { color: backgroundColor },
				dotsOptions: { color: dotsColor, type: 'dots' },
				cornersSquareOptions: { color: accentColor, type: 'extra-rounded' },
				cornersDotOptions: { color: accentColor, type: 'dot' },
				image: safeLogo ?? undefined,
				imageOptions: {
					crossOrigin: 'anonymous',
					margin: 8 * scale,
					size: 0.24,
					hideBackgroundDots: true,
				},
			})

			const blob: Blob = await tmp.getRawData('png')
			downloadBlob(blob, filename)
		},
	}))

	return (
		<div className={className} style={containerStyle}>
			{safeWatermark ? (
				<img
					src={safeWatermark}
					alt=""
					aria-hidden="true"
					loading="lazy"
					crossOrigin="anonymous"
					style={watermarkStyle}
				/>
			) : null}

			<div ref={containerRef} style={qrContainerStyle} />

			{!isReady ? <div aria-hidden="true" style={loadingOverlayStyle} /> : null}
		</div>
	)
})
