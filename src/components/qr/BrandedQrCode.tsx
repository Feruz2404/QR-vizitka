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
// Do NOT change these (per requirements).
const IMAGE_SIZE = 0.2
const IMAGE_MARGIN = 6
const QR_MARGIN = 10

// Modules: engineered rounded dots (reference-like).
const DOTS_OPTIONS = { type: 'rounded' as const }

// Underlying QR eyes are rendered in ink to keep them subtle.
const CORNERS_SQUARE_OPTIONS = { type: 'extra-rounded' as const }
const CORNERS_DOT_OPTIONS = { type: 'dot' as const }

function pickEcLevel(hasLogo: boolean): ErrorCorrectionLevel {
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

function clamp(n: number, min: number, max: number) {
	return Math.max(min, Math.min(max, n))
}

function mixHex(a: string, b: string, t: number) {
	const parse = (x: string) => {
		const v = x.replace('#', '')
		const n = parseInt(v.length === 3 ? v.split('').map((c) => c + c).join('') : v, 16)
		return { r: (n >> 16) & 255, g: (n >> 8) & 255, bl: n & 255 }
	}
	const A = parse(a)
	const B = parse(b)
	const lerp = (x: number, y: number) => Math.round(x + (y - x) * t)
	const r = lerp(A.r, B.r)
	const g = lerp(A.g, B.g)
	const bl = lerp(A.bl, B.bl)
	return '#' + [r, g, bl].map((c) => c.toString(16).padStart(2, '0')).join('')
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
			inset: -size * 0.12,
			width: size * 1.24,
			height: size * 1.24,
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

	const overlayLayerStyle: CSSProperties = useMemo(
		() => ({
			position: 'absolute',
			inset: 0,
			zIndex: 2,
			pointerEvents: 'none',
		}),
		[]
	)

	const loadingOverlayStyle: CSSProperties = useMemo(
		() => ({
			position: 'absolute',
			inset: 0,
			backgroundColor: 'transparent',
			zIndex: 3,
		}),
		[]
	)

	// Finder eye overlay — subtle gold ring + dark center, like the reference.
	const eyeSize = useMemo(() => clamp(Math.round(size * 0.18), 34, 56), [size])
	const eyeRing = useMemo(() => Math.max(2, Math.round(eyeSize * 0.08)), [eyeSize])
	const eyeInset = useMemo(() => QR_MARGIN + Math.round(size * 0.015), [size])

	// Use site palette: gold mixed toward ink to keep it subtle.
	const ringColor = useMemo(() => mixHex(accentColor, dotsColor, 0.55), [accentColor, dotsColor])
	const ringStroke2 = useMemo(() => mixHex(ringColor, backgroundColor, 0.45), [ringColor, backgroundColor])

	const eyeOuterStyleBase: CSSProperties = useMemo(
		() => ({
			position: 'absolute',
			width: eyeSize,
			height: eyeSize,
			borderRadius: 999,
			border: `${eyeRing}px solid ${ringColor}`,
			backgroundColor,
			boxShadow: `0 0 0 1px ${ringStroke2}`,
		}),
		[eyeSize, eyeRing, ringColor, ringStroke2, backgroundColor]
	)

	const eyeInnerStyle: CSSProperties = useMemo(
		() => ({
			position: 'absolute',
			inset: Math.round(eyeSize * 0.28),
			borderRadius: 999,
			border: `${Math.max(2, Math.round(eyeRing * 0.9))}px solid ${mixHex(ringColor, dotsColor, 0.35)}`,
			backgroundColor,
		}),
		[eyeSize, eyeRing, ringColor, dotsColor, backgroundColor]
	)

	const eyeCenterDotStyle: CSSProperties = useMemo(
		() => ({
			position: 'absolute',
			inset: Math.round(eyeSize * 0.42),
			borderRadius: 999,
			backgroundColor: dotsColor,
		}),
		[eyeSize, dotsColor]
	)

	const eyeTL: CSSProperties = useMemo(() => ({ left: eyeInset, top: eyeInset }), [eyeInset])
	const eyeTR: CSSProperties = useMemo(() => ({ right: eyeInset, top: eyeInset }), [eyeInset])
	const eyeBL: CSSProperties = useMemo(() => ({ left: eyeInset, bottom: eyeInset }), [eyeInset])

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
					margin: QR_MARGIN,
				},
				backgroundOptions: { color: backgroundColor },
				dotsOptions: { color: dotsColor, ...DOTS_OPTIONS },
				cornersSquareOptions: { color: dotsColor, ...CORNERS_SQUARE_OPTIONS },
				cornersDotOptions: { color: dotsColor, ...CORNERS_DOT_OPTIONS },
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
				cornersSquareOptions: { color: dotsColor, ...CORNERS_SQUARE_OPTIONS },
				cornersDotOptions: { color: dotsColor, ...CORNERS_DOT_OPTIONS },
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

			{/* Premium ring eyes overlay */}
			<div style={overlayLayerStyle} aria-hidden="true">
				<div style= ...eyeOuterStyleBase, ...eyeTL >
					<div style={eyeInnerStyle}>
						<div style={eyeCenterDotStyle} />
					</div>
				</div>
				<div style= ...eyeOuterStyleBase, ...eyeTR >
					<div style={eyeInnerStyle}>
						<div style={eyeCenterDotStyle} />
					</div>
				</div>
				<div style= ...eyeOuterStyleBase, ...eyeBL >
					<div style={eyeInnerStyle}>
						<div style={eyeCenterDotStyle} />
					</div>
				</div>
			</div>

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
} as const
