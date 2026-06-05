export function downloadSvg(svgEl: SVGSVGElement, filename: string) {
	const serializer = new XMLSerializer()
	const svgString = serializer.serializeToString(svgEl)
	const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
	downloadBlob(blob, filename)
}

export function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}
