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
	className?: string
	/** Background behind the QR modules (default white for scan reliability). */
	backgroundColor?: string
	/** Module color (default near-black for scan reliability). */
	dotsColor?: string
	/** Accent color (optional subtle eye accent). */
	accentColor?: string
}

export type BrandedQrCodeHandle = {
	downloadSvg: (filename: string) => Promise<void>
	downloadPng: (filename: string, opts?: { scale?: number }) => Promise<void>
}

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

type DotType = 'rounded' | 'classy-rounded' | 'dots' | 'square' | 'extra-rounded'

type CornerSquareType = 'square' | 'dot' | 'extra-rounded'

type CornerDotType = 'square' | 'dot'

// Reliability-first defaults (clean, modern, scannable).
const DEFAULT_DOT_TYPE: DotType = 'rounded'
const DEFAULT_CORNER_SQUARE_TYPE: CornerSquareType = 'extra-rounded'
const DEFAULT_CORNER_DOT_TYPE: CornerDotType = 'dot'

function pickEcLevel(hasLogo: boolean): ErrorCorrectionLevel {
	// Use H when embedding a logo.
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
		className,
		backgroundColor = '#ffffff',
		dotsColor = '#0b0f1a',
		accentColor,
	},
	ref
) {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const qrRef = useRef<unknown>(null)
	const [isReady, setIsReady] = useState(false)

	const safeLogo = safeUrl(logoUrl)
	const ecLevel = useMemo<ErrorCorrectionLevel>(() => pickEcLevel(Boolean(safeLogo)), [safeLogo])

	// Keep this as a thin wrapper: one container for qr-code-styling to render into.
	const containerStyle: CSSProperties = useMemo(
		() => ({
			width: size,
			height: size,
		}),
		[size]
	)

	useEffect(() => {
		let cancelled = false
		setIsReady(false)

		async function init() {
			if (!containerRef.current) return
			containerRef.current.innerHTML = ''

			const mod = await import('qr-code-styling')
			const QRCodeStyling = (mod as any).default ?? (mod as any)

			// Note: finder geometry is QR-spec-defined; we only style within library.
			const eyeColor = accentColor ?? dotsColor

			const qr = new QRCodeStyling({
				width: size,
				height: size,
				type: 'svg',
				data: value,
				qrOptions: {
					errorCorrectionLevel: ecLevel,
					margin: 10,
				},
				backgroundOptions: { color: backgroundColor },
				dotsOptions: { color: dotsColor, type: DEFAULT_DOT_TYPE },
				cornersSquareOptions: { color: eyeColor, type: DEFAULT_CORNER_SQUARE_TYPE },
				cornersDotOptions: { color: dotsColor, type: DEFAULT_CORNER_DOT_TYPE },
				image: safeLogo ?? undefined,
				imageOptions: {
					crossOrigin: 'anonymous',
					margin: 6,
					size: 0.2,
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

			const eyeColor = accentColor ?? dotsColor

			const tmp = new QRCodeStyling({
				width: size * scale,
				height: size * scale,
				type: 'canvas',
				data: value,
				qrOptions: {
					errorCorrectionLevel: ecLevel,
					margin: 10 * scale,
				},
				backgroundOptions: { color: backgroundColor },
				dotsOptions: { color: dotsColor, type: DEFAULT_DOT_TYPE },
				cornersSquareOptions: { color: eyeColor, type: DEFAULT_CORNER_SQUARE_TYPE },
				cornersDotOptions: { color: dotsColor, type: DEFAULT_CORNER_DOT_TYPE },
				image: safeLogo ?? undefined,
				imageOptions: {
					crossOrigin: 'anonymous',
					margin: 6 * scale,
					size: 0.2,
					hideBackgroundDots: true,
				},
			})

			const blob: Blob = await tmp.getRawData('png')
			downloadBlob(blob, filename)
		},
	}))

	return (
		<div className={className} style={containerStyle}>
			<div ref={containerRef} />
			{!isReady ? <div aria-hidden="true" /> : null}
		</div>
	)
})

export const BRANDED_QR_STYLE = {
	dotType: DEFAULT_DOT_TYPE,
	cornerSquareType: DEFAULT_CORNER_SQUARE_TYPE,
	cornerDotType: DEFAULT_CORNER_DOT_TYPE,
	imageSize: 0.2,
	imageMargin: 6,
	margin: 10,
} as const
