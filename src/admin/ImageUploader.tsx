import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

const DEFAULT_ALLOWED = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/svg+xml']

export function ImageUploader({
	label,
	value,
	disabled,
	onPick,
	onClear,
	helperText,
	maxSizeBytes,
	previewClassName,
	allowedTypes,
}: {
	label: string
	value?: string | null
	disabled?: boolean
	onPick: (file: File) => void
	onClear: () => void
	helperText?: string
	maxSizeBytes?: number
	previewClassName?: string
	/** Override the accepted MIME types. Defaults to PNG/JPG/JPEG/WEBP/SVG. */
	allowedTypes?: string[]
}) {
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [error, setError] = useState<string | null>(null)

	const allowed = useMemo(() => allowedTypes ?? DEFAULT_ALLOWED, [allowedTypes])

	// Accept attribute for the file input (show friendly names in native dialog)
	const acceptAttr = useMemo(() => {
		const exts = allowed.flatMap((t) => {
			if (t === 'image/jpeg' || t === 'image/jpg') return ['.jpg', '.jpeg']
			if (t === 'image/png') return ['.png']
			if (t === 'image/webp') return ['.webp']
			if (t === 'image/svg+xml') return ['.svg']
			return []
		})
		return [...new Set(exts), ...allowed].join(',')
	}, [allowed])

	useEffect(() => {
		return () => {
			// no-op (preview URL is managed by parent)
		}
	}, [])

	return (
		<Card className="p-4">
			<div className="flex items-center justify-between gap-3">
				<div>
					<div className="text-sm font-semibold">{label}</div>
					<div className="text-xs text-brand-muted">
						{helperText ?? 'PNG / JPG / WEBP / SVG'}
						{maxSizeBytes ? ` · Max ${Math.round(maxSizeBytes / (1024 * 1024))}MB` : ''}
					</div>
				</div>
				<div className="flex gap-2">
					<Button
						type="button"
						variant="secondary"
						size="sm"
						disabled={disabled}
						onClick={() => inputRef.current?.click()}
						aria-label={`Choose ${label}`}
					>
						Choose
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						disabled={disabled}
						onClick={() => {
							setError(null)
							onClear()
						}}
						aria-label={`Remove ${label}`}
					>
						Remove
					</Button>
				</div>
			</div>

			<input
				ref={inputRef}
				type="file"
				accept={acceptAttr}
				hidden
				aria-hidden="true"
				onChange={(e) => {
					const file = e.target.files?.[0]
					// allow selecting the same file again
					e.currentTarget.value = ''
					if (!file) return
					setError(null)

					// Validate MIME type (fallback check for SVG which some browsers misreport)
					const isSvg = file.name.toLowerCase().endsWith('.svg')
					const effectiveType = isSvg ? 'image/svg+xml' : file.type
					if (!allowed.includes(effectiveType)) {
						const friendly = allowed
							.map((t) => t.split('/')[1].toUpperCase())
							.join(', ')
						setError(`Invalid file type. Accepted formats: ${friendly}.`)
						return
					}
					if (maxSizeBytes && file.size > maxSizeBytes) {
						const mb = Math.round(maxSizeBytes / (1024 * 1024))
						setError(`File is too large. Max ${mb}MB.`)
						return
					}
					onPick(file)
				}}
			/>

			{value ? (
				<div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/5">
					<img
						src={value}
						alt={`${label} preview`}
						className={previewClassName ?? 'h-40 w-full object-contain p-2'}
						loading="lazy"
					/>
				</div>
			) : (
				<div className="mt-4 grid h-40 place-items-center rounded-xl border border-dashed border-white/15 bg-white/5 text-sm text-brand-muted">
					<div className="flex flex-col items-center gap-1.5">
						<svg className="h-8 w-8 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						<span>No image selected</span>
					</div>
				</div>
			)}

			{error ? <div className="mt-3 text-xs text-red-300" role="alert">{error}</div> : null}
		</Card>
	)
}
