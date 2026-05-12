import { useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

const allowed = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']

export function ImageUploader({
	label,
	value,
	onChange,
	onUpload,
	disabled,
}: {
	label: string
	value?: string | null
	onChange: (url: string | null) => void
	onUpload: (file: File) => Promise<string>
	disabled?: boolean
}) {
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)

	return (
		<Card className="p-4">
			<div className="flex items-center justify-between gap-3">
				<div>
					<div className="text-sm font-semibold">{label}</div>
					<div className="text-xs text-brand-muted">PNG/JPG/JPEG/WEBP</div>
				</div>
				<div className="flex gap-2">
					<Button
						variant="secondary"
						size="sm"
						disabled={disabled || busy}
						onClick={() => inputRef.current?.click()}
					>
						{busy ? 'Uploading…' : 'Upload'}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						disabled={disabled || busy}
						onClick={() => onChange(null)}
					>
						Clear
					</Button>
				</div>
			</div>

			<input
				ref={inputRef}
				type="file"
				accept={allowed.join(',')}
				hidden
				onChange={async (e) => {
					const file = e.target.files?.[0]
					if (!file) return
					setError(null)
					if (!allowed.includes(file.type)) {
						setError('Invalid file type')
						return
					}
					setBusy(true)
					try {
						const url = await onUpload(file)
						onChange(url)
					} catch {
						setError('Upload failed')
					} finally {
						setBusy(false)
					}
				}}
			/>

			{value ? (
				<div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/5">
					<img src={value} alt={`${label} preview`} className="h-40 w-full object-cover" loading="lazy" />
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
