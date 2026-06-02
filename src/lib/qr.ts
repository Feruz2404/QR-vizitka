import QRCode from 'qrcode'

export type QrRenderOptions = {
	size: number
	margin?: number
	fgColor?: string
	bgColor?: string
	errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

const DEFAULT_FG = '#0b0f1a'
const DEFAULT_BG = '#ffffff'

function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
	const rr = Math.min(r, w / 2, h / 2)
	return (
		`M${x + rr},${y}` +
		`H${x + w - rr}` +
		`Q${x + w},${y} ${x + w},${y + rr}` +
		`V${y + h - rr}` +
		`Q${x + w},${y + h} ${x + w - rr},${y + h}` +
		`H${x + rr}` +
		`Q${x},${y + h} ${x},${y + h - rr}` +
		`V${y + rr}` +
		`Q${x},${y} ${x + rr},${y}` +
		'Z'
	)
}

export async function renderQrSvg({
	value,
	logoUrl,
	options,
	logoScale = 0.19,
}: {
	value: string
	logoUrl: string | null
	options: QrRenderOptions
	logoScale?: number
}) {
	const size = options.size
	const margin = options.margin ?? 2
	const fg = options.fgColor ?? DEFAULT_FG
	const bg = options.bgColor ?? DEFAULT_BG
	const ecc = options.errorCorrectionLevel ?? 'H'

	// Generate a standalone SVG string for the QR itself.
	const qrSvg = await QRCode.toString(value, {
		type: 'svg',
		errorCorrectionLevel: ecc,
		margin,
		color: { dark: fg, light: bg },
		width: size,
	})

	// If no logo, return the QR SVG as-is.
	if (!logoUrl) return qrSvg

	// Compose a new SVG that embeds the QR SVG paths + center logo.
	// We avoid foreignObject and stick to <image> for broad compatibility.
	// The logo is placed on top of a white rounded background.
	const logoSize = Math.round(size * logoScale)
	const bgPad = Math.round(logoSize * 0.16)
	const bgSize = logoSize + bgPad * 2
	const bgRadius = Math.round(bgSize * 0.22)
	const centerX = Math.round((size - bgSize) / 2)
	const centerY = Math.round((size - bgSize) / 2)
	const logoX = Math.round((size - logoSize) / 2)
	const logoY = Math.round((size - logoSize) / 2)

	// Strip outer <svg ...> wrapper from qrSvg so we can inline its children.
	const inner = qrSvg
		.replace(/^[\s\S]*?<svg[^>]*>/i, '')
		.replace(/<\/svg>\s*$/i, '')

	const bgPath = roundedRectPath(centerX, centerY, bgSize, bgSize, bgRadius)

	return (
		`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
		inner +
		`<path d="${bgPath}" fill="#ffffff"/>` +
		`<image href="${logoUrl}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>` +
		`</svg>`
	)
}

export async function renderQrPngBlob({
	value,
	logoUrl,
	options,
	logoScale = 0.19,
}: {
	value: string
	logoUrl: string | null
	options: QrRenderOptions
	logoScale?: number
}): Promise<Blob> {
	const size = options.size
	const margin = options.margin ?? 2
	const fg = options.fgColor ?? DEFAULT_FG
	const bg = options.bgColor ?? DEFAULT_BG
	const ecc = options.errorCorrectionLevel ?? 'H'

	const canvas = document.createElement('canvas')
	canvas.width = size
	canvas.height = size

	await QRCode.toCanvas(canvas, value, {
		errorCorrectionLevel: ecc,
		margin,
		color: { dark: fg, light: bg },
		width: size,
	})

	if (logoUrl) {
		const ctx = canvas.getContext('2d')
		if (ctx) {
			const logoSize = Math.round(size * logoScale)
			const bgPad = Math.round(logoSize * 0.16)
			const bgSize = logoSize + bgPad * 2
			const radius = Math.round(bgSize * 0.22)
			const x = Math.round((size - bgSize) / 2)
			const y = Math.round((size - bgSize) / 2)

			// White rounded rect behind logo
			ctx.save()
			ctx.fillStyle = '#ffffff'
			roundedRect(ctx, x, y, bgSize, bgSize, radius)
			ctx.fill()
			ctx.restore()

			// Draw logo
			try {
				const img = await loadImage(logoUrl)
				const lx = Math.round((size - logoSize) / 2)
				const ly = Math.round((size - logoSize) / 2)
				ctx.drawImage(img, lx, ly, logoSize, logoSize)
			} catch {
				// If logo fails to load, keep QR scannable (no logo overlay)
			}
		}
	}

	const blob: Blob = await new Promise((resolve, reject) => {
		canvas.toBlob((b) => {
			if (!b) return reject(new Error('Failed to export PNG'))
			resolve(b)
		}, 'image/png')
	})

	return blob
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
	const rr = Math.min(r, w / 2, h / 2)
	ctx.beginPath()
	ctx.moveTo(x + rr, y)
	ctx.lineTo(x + w - rr, y)
	ctx.quadraticCurveTo(x + w, y, x + w, y + rr)
	ctx.lineTo(x + w, y + h - rr)
	ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
	ctx.lineTo(x + rr, y + h)
	ctx.quadraticCurveTo(x, y + h, x, y + h - rr)
	ctx.lineTo(x, y + rr)
	ctx.quadraticCurveTo(x, y, x + rr, y)
	ctx.closePath()
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		// If Supabase bucket is public, this should work without CORS headaches,
		// but set crossOrigin defensively.
		img.crossOrigin = 'anonymous'
		img.onload = () => resolve(img)
		img.onerror = () => reject(new Error('Failed to load image'))
		img.src = src
	})
}

function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}

export function downloadSvgString(svg: string, filename: string) {
	const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
	downloadBlob(blob, filename)
}

export function downloadSvgElement(svgEl: SVGSVGElement, filename: string) {
	const serializer = new XMLSerializer()
	const svgString = serializer.serializeToString(svgEl)
	downloadSvgString(svgString, filename)
}

export async function downloadQrSvg({
	value,
	logoUrl,
	options,
	filename,
}: {
	value: string
	logoUrl: string | null
	options: QrRenderOptions
	filename: string
}) {
	const svg = await renderQrSvg({ value, logoUrl, options })
	downloadSvgString(svg, filename)
}

export async function downloadQrPng({
	value,
	logoUrl,
	options,
	filename,
}: {
	value: string
	logoUrl: string | null
	options: QrRenderOptions
	filename: string
}) {
	const blob = await renderQrPngBlob({ value, logoUrl, options })
	downloadBlob(blob, filename)
}
