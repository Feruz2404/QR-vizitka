import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	type CSSProperties,
} from 'react'
import { safeUrl } from '../../lib/utils'

type BrandedQrCodeProps = {
	value: string
	size: number
	logoUrl?: string | null
	className?: string
	/** Background behind the QR modules. White is best for scan reliability. */
	backgroundColor?: string
	/** QR module color. */
	dotsColor?: string
	/** Corner square and corner dot color. */
	accentColor?: string
}

export type BrandedQrCodeHandle = {
	downloadSvg: (filename: string) => Promise<void>
	downloadPng: (filename: string, opts?: { scale?: number }) => Promise<void>
}

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

type DotType = 'rounded' | 'classy' | 'classy-rounded' | 'dots' | 'square' | 'extra-rounded'

type CornerSquareType = 'square' | 'dot' | 'extra-rounded' | DotType

type CornerDotType = 'square' | 'dot' | DotType

const QR_BLUE = '#003B73'

// Premium rounded-dot style matching the card system while staying scannable.
const DEFAULT_DOT_TYPE: DotType = 'dots'
const DEFAULT_CORNER_SQUARE_TYPE: CornerSquareType = 'extra-rounded'
const DEFAULT_CORNER_DOT_TYPE: CornerDotType = 'dot'

// Keep these stable for scan reliability with a contained center logo.
const DEFAULT_MARGIN = 12
const DEFAULT_IMAGE_SIZE = 0.34
const DEFAULT_IMAGE_MARGIN = 0
const DEFAULT_QR_CENTER_LOGO_URL = '/qr-fallback-logo.svg'

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

export const BrandedQrCode = forwardRef<BrandedQrCodeHandle, BrandedQrCodeProps>(
	function BrandedQrCode(
		{
			value,
			size,
			logoUrl,
			className,
			backgroundColor = '#ffffff',
			dotsColor = QR_BLUE,
			accentColor = QR_BLUE,
		},
		ref,
	) {
		const containerRef = useRef<HTMLDivElement | null>(null)
		const qrRef = useRef<unknown>(null)

		const safeLogo = safeUrl(logoUrl) ?? DEFAULT_QR_CENTER_LOGO_URL

		const ecLevel = useMemo<ErrorCorrectionLevel>(
			() => pickEcLevel(Boolean(safeLogo)),
			[safeLogo],
		)

		const containerStyle: CSSProperties = useMemo(
			() => ({
				width: size,
				height: size,
			}),
			[size],
		)

		useEffect(() => {
			let cancelled = false

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
					margin: DEFAULT_MARGIN,
					qrOptions: {
						errorCorrectionLevel: ecLevel,
					},
					backgroundOptions: {
						color: backgroundColor,
					},
					dotsOptions: {
						color: dotsColor,
						type: DEFAULT_DOT_TYPE,
					},
					cornersSquareOptions: {
						color: accentColor,
						type: DEFAULT_CORNER_SQUARE_TYPE,
					},
					cornersDotOptions: {
						color: accentColor,
						type: DEFAULT_CORNER_DOT_TYPE,
					},
					image: safeLogo,
					imageOptions: {
						crossOrigin: 'anonymous',
						saveAsBlob: true,
						margin: DEFAULT_IMAGE_MARGIN,
						imageSize: DEFAULT_IMAGE_SIZE,
						hideBackgroundDots: true,
					},
				})

				if (cancelled) return

				qrRef.current = qr as unknown
				qr.append(containerRef.current)
			}

			init().catch(() => {
				// Keep component mounted if QR rendering fails.
			})

			return () => {
				cancelled = true
				if (containerRef.current) {
					containerRef.current.innerHTML = ''
				}
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
					margin: DEFAULT_MARGIN * scale,
					qrOptions: {
						errorCorrectionLevel: ecLevel,
					},
					backgroundOptions: {
						color: backgroundColor,
					},
					dotsOptions: {
						color: dotsColor,
						type: DEFAULT_DOT_TYPE,
					},
					cornersSquareOptions: {
						color: accentColor,
						type: DEFAULT_CORNER_SQUARE_TYPE,
					},
					cornersDotOptions: {
						color: accentColor,
						type: DEFAULT_CORNER_DOT_TYPE,
					},
					image: safeLogo,
					imageOptions: {
						crossOrigin: 'anonymous',
						saveAsBlob: true,
						margin: DEFAULT_IMAGE_MARGIN,
						imageSize: DEFAULT_IMAGE_SIZE,
						hideBackgroundDots: true,
					},
				})

				const blob: Blob = await tmp.getRawData('png')
				downloadBlob(blob, filename)
			},
		}))

		return <div ref={containerRef} className={className} style={containerStyle} />
	},
)

export const BRANDED_QR_STYLE = {
	dotType: DEFAULT_DOT_TYPE,
	cornerSquareType: DEFAULT_CORNER_SQUARE_TYPE,
	cornerDotType: DEFAULT_CORNER_DOT_TYPE,
	imageSize: DEFAULT_IMAGE_SIZE,
	imageMargin: DEFAULT_IMAGE_MARGIN,
	margin: DEFAULT_MARGIN,
	dotsColor: QR_BLUE,
	accentColor: QR_BLUE,
} as const
