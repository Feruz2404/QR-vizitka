import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

const allowed = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/svg+xml']

export function ImageUploader({
	label,
	value,
	disabled,
	onPick,
	onClear,
	helperText,
	maxSizeBytes,
	previewClassName,
}: {
	label: string
	value?: string | null
	disabled?: boolean
	onPick: (file: File) => void
	onClear: () => void
	helperText?: string
	maxSizeBytes?: number
	previewClassName?: string
}) {
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [error, setError] = useState<string | null>(null)

	const accept = useMemo(() => allowed.join(','), [])

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
					<div className="text-xs text-brand-muted">{helperText ?? 'PNG/JPG/JPEG/WEBP/SVG'}</div>
				</div>
				<div className="flex gap-2">
					<Button
						type="button"
						variant="secondary"
						size="sm"
						disabled={disabled}
						onClick={() => inputRef.current?.click()}
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
					>
						Remove
					</Button>
				</div>
			</div>

			<input
				ref={inputRef}
				type="file"
				accept={accept}
				hidden
				onChange={(e) => {
					const file = e.target.files?.[0]
					// allow selecting the same file again
					e.currentTarget.value = ''
					if (!file) return
					setError(null)
					if (!allowed.includes(file.type)) {
						setError('Invalid file type. Use PNG, JPG, WEBP, or SVG.')
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
						className={previewClassName ?? 'h-40 w-full object-cover'}
						loading="lazy"
					/>
				</div>
			) : (
				<div className="mt-4 grid h-40 place-items-center rounded-xl border border-white/10 bg-white/5 text-sm text-brand-muted">
					No image
				</div>
			)}

			{error ? <div className="mt-3 text-xs text-red-300">{error}</div> : null}
		</Card>
	)
}
