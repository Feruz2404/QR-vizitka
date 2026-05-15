import { useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink } from 'lucide-react'

import type { EmployeeCardInsert, EmployeeCardUpdate } from '../types/employee'
import { slugify, isValidSlug } from '../lib/slug'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { useToast } from '../ui/Toast'
import {
	useLazyCheckSlugAvailabilityQuery,
	useUploadLogoMutation,
	useUploadProfilePhotoMutation,
} from '../services/employeeCardsApi'
import { ImageUploader } from './ImageUploader'

function safeObjectUrl(file: File) {
	return URL.createObjectURL(file)
}

export function CardForm({
	mode,
	initialValues,
	saving,
	onSave,
	previewUrl,
}: {
	mode: 'create' | 'edit'
	initialValues: EmployeeCardInsert | any
	saving: boolean
	onSave: (values: EmployeeCardUpdate) => Promise<void>
	previewUrl: (slug: string) => string
}) {
	const toast = useToast()
	const [values, setValues] = useState<EmployeeCardUpdate>(initialValues)
	const [slugTouched, setSlugTouched] = useState(false)

	// Selected (new) files live in local state. DB is not updated until Save.
	const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)
	const [logoFile, setLogoFile] = useState<File | null>(null)
	const [profilePreview, setProfilePreview] = useState<string | null>(null)
	const [logoPreview, setLogoPreview] = useState<string | null>(null)

	const [submitting, setSubmitting] = useState(false)
	const busy = saving || submitting

	const lastObjectUrlsRef = useRef<{ profile?: string; logo?: string }>({})

	useEffect(() => {
		setValues(initialValues)
		setSlugTouched(false)
		setProfilePhotoFile(null)
		setLogoFile(null)
		setProfilePreview(null)
		setLogoPreview(null)
	}, [initialValues])

	useEffect(() => {
		return () => {
			if (lastObjectUrlsRef.current.profile) URL.revokeObjectURL(lastObjectUrlsRef.current.profile)
			if (lastObjectUrlsRef.current.logo) URL.revokeObjectURL(lastObjectUrlsRef.current.logo)
		}
	}, [])

	const [checkSlug, slugState] = useLazyCheckSlugAvailabilityQuery()
	const [uploadProfilePhoto] = useUploadProfilePhotoMutation()
	const [uploadLogo] = useUploadLogoMutation()

	const slugError = useMemo(() => {
		if (!values.slug) return 'Slug is required'
		if (!isValidSlug(values.slug)) return 'Use lowercase latin letters, numbers, and hyphen only'
		if (slugState.isSuccess && slugState.data === false && mode === 'create') return 'Slug is already taken'
		return null
	}, [values.slug, slugState, mode])

	const cardKey = useMemo(() => {
		const existingId = (initialValues as any)?.id as string | undefined
		if (existingId) return existingId
		if (values.slug) return values.slug
		return 'draft-' + Date.now()
	}, [initialValues, values.slug])

	return (
		<form
			className="grid gap-4"
			onSubmit={async (e) => {
				e.preventDefault()
				if (busy) return

				if (!values.full_name || !values.slug || !values.position) {
					toast.push('Please fill required fields')
					return
				}
				if (slugError) {
					toast.push(slugError)
					return
				}

				setSubmitting(true)
				try {
					let nextValues: EmployeeCardUpdate = { ...values }

					if (profilePhotoFile) {
						const url = await uploadProfilePhoto({ file: profilePhotoFile, cardId: cardKey }).unwrap()
						nextValues = { ...nextValues, profile_photo_url: url }
					}
					if (logoFile) {
						const url = await uploadLogo({ file: logoFile, cardId: cardKey }).unwrap()
						nextValues = { ...nextValues, logo_url: url }
					}

					await onSave(nextValues)

					toast.push('Saved')
				} catch (err: any) {
					const message = err?.message || err?.error?.message || 'Save failed'
					toast.push(message)
				} finally {
					setSubmitting(false)
				}
			}}
		>
			<Card className="p-5">
				<div className="text-lg font-semibold">Employee details</div>
				<div className="mt-4 grid gap-3 md:grid-cols-2">
					<div>
						<div className="text-xs text-brand-muted">Full name *</div>
						<Input
							value={values.full_name ?? ''}
							onChange={(e) => {
								const full_name = e.target.value
								setValues((p) => ({ ...p, full_name }))
								if (!slugTouched) setValues((p) => ({ ...p, slug: slugify(full_name) }))
							}}
							required
						/>
					</div>
					<div>
						<div className="text-xs text-brand-muted">Slug *</div>
						<Input
							value={values.slug ?? ''}
							onChange={(e) => {
								setSlugTouched(true)
								setValues((p) => ({ ...p, slug: e.target.value }))
							}}
							onBlur={() => {
								if (values.slug) checkSlug(values.slug)
							}}
							required
						/>
						{slugError ? <div className="mt-1 text-xs text-red-300">{slugError}</div> : null}
					</div>

					<div>
						<div className="text-xs text-brand-muted">Position *</div>
						<Input
							value={values.position ?? ''}
							onChange={(e) => setValues((p) => ({ ...p, position: e.target.value }))}
							required
						/>
					</div>
					<div>
						<div className="text-xs text-brand-muted">Department</div>
						<Input
							value={values.department ?? ''}
							onChange={(e) => setValues((p) => ({ ...p, department: e.target.value || null }))}
						/>
					</div>

					<div>
						<div className="text-xs text-brand-muted">Organization name</div>
						<Input
							value={values.organization_name ?? ''}
							onChange={(e) => setValues((p) => ({ ...p, organization_name: e.target.value || null }))}
						/>
					</div>
					<div>
						<div className="text-xs text-brand-muted">Work email</div>
						<Input
							type="email"
							value={values.work_email ?? ''}
							onChange={(e) => setValues((p) => ({ ...p, work_email: e.target.value || null }))}
						/>
					</div>

					<div>
						<div className="text-xs text-brand-muted">Personal email</div>
						<Input
							type="email"
							value={values.personal_email ?? ''}
							onChange={(e) => setValues((p) => ({ ...p, personal_email: e.target.value || null }))}
						/>
					</div>

					<div>
						<div className="text-xs text-brand-muted">Primary phone</div>
						<Input
							value={values.phone_primary ?? ''}
							onChange={(e) => setValues((p) => ({ ...p, phone_primary: e.target.value || null }))}
						/>
					</div>
					<div>
						<div className="text-xs text-brand-muted">Secondary phone</div>
						<Input
							value={values.phone_secondary ?? ''}
							onChange={(e) => setValues((p) => ({ ...p, phone_secondary: e.target.value || null }))}
						/>
					</div>

					<div>
						<div className="text-xs text-brand-muted">Extra phone</div>
						<Input
							value={values.phone_extra ?? ''}
							onChange={(e) => setValues((p) => ({ ...p, phone_extra: e.target.value || null }))}
						/>
					</div>
					<div>
						<div className="text-xs text-brand-muted">Short/Internal</div>
						<Input
							value={values.short_phone ?? ''}
							onChange={(e) => setValues((p) => ({ ...p, short_phone: e.target.value || null }))}
						/>
					</div>

					<div>
						<div className="text-xs text-brand-muted">Telegram username</div>
						<Input
							value={values.telegram_username ?? ''}
							onChange={(e) => {
								const telegram_username = e.target.value || null
								const clean = telegram_username?.replace(/^@/, '')
								const tgBase = 'https://' + 't.me/'
								const telegram_url = clean ? tgBase + clean : null
								setValues((p) => ({ ...p, telegram_username, telegram_url }))
							}}
						/>
					</div>
					<div>
						<div className="text-xs text-brand-muted">Telegram URL</div>
						<Input
							value={values.telegram_url ?? ''}
							onChange={(e) => setValues((p) => ({ ...p, telegram_url: e.target.value || null }))}
						/>
					</div>

					<div>
						<div className="text-xs text-brand-muted">Facebook URL</div>
						<Input
							value={values.facebook_url ?? ''}
							onChange={(e) => setValues((p) => ({ ...p, facebook_url: e.target.value || null }))}
						/>
					</div>
					<div>
						<div className="text-xs text-brand-muted">Website URL</div>
						<Input
							value={values.website_url ?? ''}
							onChange={(e) => setValues((p) => ({ ...p, website_url: e.target.value || null }))}
						/>
					</div>

					<div className="md:col-span-2">
						<div className="text-xs text-brand-muted">Address</div>
						<Input
							value={values.address ?? ''}
							onChange={(e) => setValues((p) => ({ ...p, address: e.target.value || null }))}
						/>
					</div>

					<div className="md:col-span-2">
						<div className="text-xs text-brand-muted">Bio</div>
						<Textarea
							value={values.bio ?? ''}
							onChange={(e) => setValues((p) => ({ ...p, bio: e.target.value || null }))}
						/>
					</div>
				</div>

				<div className="mt-4 flex flex-wrap items-center justify-end gap-2">
					<a
						href={previewUrl(values.slug ?? '')}
						target="_blank"
						rel="noreferrer"
						className="inline-flex"
					>
						<Button type="button" variant="secondary" disabled={!values.slug}>
							<ExternalLink className="h-4 w-4" /> Preview
						</Button>
					</a>
					<Button type="submit" disabled={busy}>
						{busy ? 'Saving…' : 'Save'}
					</Button>
				</div>
			</Card>

			<div className="grid gap-4 md:grid-cols-2">
				<ImageUploader
					label="Profile photo"
					value={profilePreview ?? (values.profile_photo_url as any)}
					disabled={busy}
					onPick={(file) => {
						setProfilePhotoFile(file)
						if (lastObjectUrlsRef.current.profile) URL.revokeObjectURL(lastObjectUrlsRef.current.profile)
						const u = safeObjectUrl(file)
						lastObjectUrlsRef.current.profile = u
						setProfilePreview(u)
					}}
					onClear={() => {
						setProfilePhotoFile(null)
						setProfilePreview(null)
						setValues((p) => ({ ...p, profile_photo_url: null }))
					}}
				/>

				<ImageUploader
					label="Organization logo (fallback)"
					helperText="Optional. Used only when global organization logo is not set in Settings."
					value={logoPreview ?? (values.logo_url as any)}
					disabled={busy}
					onPick={(file) => {
						setLogoFile(file)
						if (lastObjectUrlsRef.current.logo) URL.revokeObjectURL(lastObjectUrlsRef.current.logo)
						const u = safeObjectUrl(file)
						lastObjectUrlsRef.current.logo = u
						setLogoPreview(u)
					}}
					onClear={() => {
						setLogoFile(null)
						setLogoPreview(null)
						setValues((p) => ({ ...p, logo_url: null }))
					}}
				/>
			</div>
		</form>
	)
}
