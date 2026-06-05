import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
} from 'react'
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

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

// ---- Premium styling tuning (single source of truth) ----
// Keep logo size stable (do NOT increase further). The focus is composition.
const IMAGE_SIZE = 0.2
// Reduce the center cutout / exclusion area so the logo integrates into the pattern.
const IMAGE_MARGIN = 6
// Reduce quiet zone slightly to visually densify without risking scanability.
const QR_MARGIN = 10

// Use a tighter, less "demo" look.
const DOTS_OPTIONS = { type: 'dots' as const }
// Finder patterns must keep geometry; reduce visual weight by avoiding strong accent fill.
const CORNERS_SQUARE_OPTIONS = { type: 'extra-rounded' as const }
const CORNERS_DOT_OPTIONS = { type: 'dot' as const }

function pickEcLevel(hasLogo: boolean): ErrorCorrectionLevel {
	// Must be H when logo exists.
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
			borderRadius: 18,
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
			opacity: 0.02,
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

			const eyeColor = dotsColor
			const qr = new QRCodeStyling({
				width: size,
				height: size,
				type: 'svg',
				data: value,
				qrOptions: {
					errorCorrectionLevel: ecLevel,
					margin: QR_MARGIN,
				},
				backgroundOptions: { color: backgroundColor },
				dotsOptions: { color: dotsColor, ...DOTS_OPTIONS },
				cornersSquareOptions: { color: eyeColor, ...CORNERS_SQUARE_OPTIONS },
				cornersDotOptions: { color: eyeColor, ...CORNERS_DOT_OPTIONS },
				image: safeLogo ?? undefined,
				imageOptions: {
					crossOrigin: 'anonymous',
					margin: IMAGE_MARGIN,
					size: IMAGE_SIZE,
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

			const mod = await import('qr-code-styling')
			const QRCodeStyling = (mod as any).default ?? (mod as any)

			const eyeColor = dotsColor
			const tmp = new QRCodeStyling({
				width: size * scale,
				height: size * scale,
				type: 'canvas',
				data: value,
				qrOptions: {
					errorCorrectionLevel: ecLevel,
					margin: QR_MARGIN * scale,
				},
				backgroundOptions: { color: backgroundColor },
				dotsOptions: { color: dotsColor, ...DOTS_OPTIONS },
				cornersSquareOptions: { color: eyeColor, ...CORNERS_SQUARE_OPTIONS },
				cornersDotOptions: { color: eyeColor, ...CORNERS_DOT_OPTIONS },
				image: safeLogo ?? undefined,
				imageOptions: {
					crossOrigin: 'anonymous',
					margin: IMAGE_MARGIN * scale,
					size: IMAGE_SIZE,
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

export const BRANDED_QR_STYLE = {
	imageSize: IMAGE_SIZE,
	imageMargin: IMAGE_MARGIN,
	margin: QR_MARGIN,
	dotsOptions: DOTS_OPTIONS,
	cornersSquareOptions: CORNERS_SQUARE_OPTIONS,
	cornersDotOptions: CORNERS_DOT_OPTIONS,
	// Keep accentColor parameter for future refinement while staying in palette.
	accentColor: 'brand-gold',
} as const
