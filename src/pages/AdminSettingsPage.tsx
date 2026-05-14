import { useEffect, useRef, useState } from 'react'

import { AdminLayout } from '../admin/AdminLayout'
import { ImageUploader } from '../admin/ImageUploader'
import {
	useGetAppSettingsQuery,
	useUpdateAppSettingsMutation,
	useUploadGlobalBackgroundMutation,
	useUploadGlobalLogoMutation,
} from '../services/appSettingsApi'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { useToast } from '../ui/Toast'

const MAX_BYTES = 8 * 1024 * 1024

export function AdminSettingsPage() {
	const toast = useToast()
	const { data: settings, isLoading } = useGetAppSettingsQuery()
	const [updateSettings, updateState] = useUpdateAppSettingsMutation()
	const [uploadBackground] = useUploadGlobalBackgroundMutation()
	const [uploadLogo] = useUploadGlobalLogoMutation()

	const [bgFile, setBgFile] = useState<File | null>(null)
	const [logoFile, setLogoFile] = useState<File | null>(null)
	const [bgPreview, setBgPreview] = useState<string | null>(null)
	const [logoPreview, setLogoPreview] = useState<string | null>(null)
	const [bgUrl, setBgUrl] = useState<string | null>(null)
	const [logoUrl, setLogoUrl] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	const lastObjectUrlsRef = useRef<{ background?: string; logo?: string }>({})

	useEffect(() => {
		setBgUrl(settings?.background_image_url ?? null)
		setLogoUrl(settings?.organization_logo_url ?? null)
	}, [settings?.background_image_url, settings?.organization_logo_url])

	useEffect(() => {
		return () => {
			if (lastObjectUrlsRef.current.background) URL.revokeObjectURL(lastObjectUrlsRef.current.background)
			if (lastObjectUrlsRef.current.logo) URL.revokeObjectURL(lastObjectUrlsRef.current.logo)
		}
	}, [])

	const busy = submitting || updateState.isLoading
	const dirty = bgFile !== null || logoFile !== null ||
		(bgUrl ?? null) !== (settings?.background_image_url ?? null) ||
		(logoUrl ?? null) !== (settings?.organization_logo_url ?? null)

	return (
		<AdminLayout>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<div className="text-xl font-semibold">Settings</div>
					<div className="text-sm text-brand-muted">
						Global background and organization logo for all public cards.
					</div>
				</div>
				<Button
					disabled={busy || !dirty}
					onClick={async () => {
						if (busy) return
						setSubmitting(true)
						try {
							let nextBgUrl = bgUrl
							let nextLogoUrl = logoUrl
							if (bgFile) {
								nextBgUrl = await uploadBackground({ file: bgFile }).unwrap()
							}
							if (logoFile) {
								nextLogoUrl = await uploadLogo({ file: logoFile }).unwrap()
							}
							await updateSettings({
								background_image_url: nextBgUrl,
								organization_logo_url: nextLogoUrl,
							}).unwrap()
							setBgFile(null)
							setLogoFile(null)
							setBgPreview(null)
							setLogoPreview(null)
							setBgUrl(nextBgUrl)
							setLogoUrl(nextLogoUrl)
							toast.push('Settings saved')
						} catch (err: any) {
							const message =
								err?.message ||
								err?.error?.message ||
								err?.data?.message ||
								'Save failed'
							toast.push(message)
						} finally {
							setSubmitting(false)
						}
					}}
				>
					{busy ? 'Saving…' : 'Save settings'}
				</Button>
			</div>

			<div className="mt-4 grid gap-4">
				{isLoading ? (
					<Card className="p-4 text-sm text-brand-muted">Loading settings…</Card>
				) : null}

				<ImageUploader
					label="Global background image"
					helperText="Recommended: wide image (16:9 or 21:9), WebP/JPG, dark premium look. Max 8MB."
					maxSizeBytes={MAX_BYTES}
					previewClassName="h-56 w-full object-cover"
					value={bgPreview ?? bgUrl}
					disabled={busy}
					onPick={(file) => {
						setBgFile(file)
						if (lastObjectUrlsRef.current.background) {
							URL.revokeObjectURL(lastObjectUrlsRef.current.background)
						}
						const u = URL.createObjectURL(file)
						lastObjectUrlsRef.current.background = u
						setBgPreview(u)
					}}
					onClear={() => {
						setBgFile(null)
						if (lastObjectUrlsRef.current.background) {
							URL.revokeObjectURL(lastObjectUrlsRef.current.background)
							lastObjectUrlsRef.current.background = undefined
						}
						setBgPreview(null)
						setBgUrl(null)
					}}
				/>

				<ImageUploader
					label="Global organization logo"
					helperText="Square logo recommended. PNG with transparency works best. Max 8MB."
					maxSizeBytes={MAX_BYTES}
					previewClassName="h-40 w-40 object-contain"
					value={logoPreview ?? logoUrl}
					disabled={busy}
					onPick={(file) => {
						setLogoFile(file)
						if (lastObjectUrlsRef.current.logo) {
							URL.revokeObjectURL(lastObjectUrlsRef.current.logo)
						}
						const u = URL.createObjectURL(file)
						lastObjectUrlsRef.current.logo = u
						setLogoPreview(u)
					}}
					onClear={() => {
						setLogoFile(null)
						if (lastObjectUrlsRef.current.logo) {
							URL.revokeObjectURL(lastObjectUrlsRef.current.logo)
							lastObjectUrlsRef.current.logo = undefined
						}
						setLogoPreview(null)
						setLogoUrl(null)
					}}
				/>
			</div>
		</AdminLayout>
	)
}
