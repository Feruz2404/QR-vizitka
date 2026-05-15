import { useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink } from 'lucide-react'

import type {
	CardLanguage,
	EmployeeCardInsert,
	EmployeeCardTranslation,
	EmployeeCardTranslations,
	EmployeeCardUpdate,
} from '../types/employee'
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

const LANG_TABS: Array<{ code: CardLanguage; label: string }> = [
	{ code: 'uz', label: 'O‘zbekcha' },
	{ code: 'ru', label: 'Русский' },
	{ code: 'en', label: 'English' },
]

function specialtiesToText(list?: string[]): string {
	return (list ?? []).join('\n')
}

function textToSpecialties(text: string): string[] {
	return text
		.split('\n')
		.map((s) => s.trim())
		.filter((s) => s.length > 0)
}

function safeObjectUrl(file: File) {
	return URL.createObjectURL(file)
}

function deriveInitialTranslations(values: any): EmployeeCardTranslations {
	const t: EmployeeCardTranslations = { ...((values && values.translations) ?? {}) }
	const uz = t.uz ?? {}
	const uzEmpty =
		!uz.full_name && !uz.position && !uz.department && !uz.organization_name && !uz.bio
	if (uzEmpty) {
		t.uz = {
			full_name: values?.full_name ?? '',
			position: values?.position ?? '',
			department: values?.department ?? '',
			organization_name: values?.organization_name ?? '',
			bio: values?.bio ?? '',
			specialties: uz.specialties ?? [],
		}
	}
	return t
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
	const [activeLang, setActiveLang] = useState<CardLanguage>('uz')
	const [translations, setTranslations] = useState<EmployeeCardTranslations>(
		deriveInitialTranslations(initialValues),
	)

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
		setActiveLang('uz')
		setTranslations(deriveInitialTranslations(initialValues))
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

	const current: EmployeeCardTranslation = translations[activeLang] ?? {}

	function patchTranslation(patch: Partial<EmployeeCardTranslation>) {
		setTranslations((p) => ({ ...p, [activeLang]: { ...(p[activeLang] ?? {}), ...patch } }))
	}

	return (
		<form
			className="grid gap-4"
			onSubmit={async (e) => {
				e.preventDefault()
				if (busy) return

				const uz = translations.uz ?? {}
				const effectiveFullName = (uz.full_name || values.full_name || '').trim()
				const effectivePosition = (uz.position || values.position || '').trim()

				if (!effectiveFullName || !values.slug || !effectivePosition) {
					toast.push('Please fill required fields (Uzbek name, slug, Uzbek position)')
					return
				}
				if (slugError) {
					toast.push(slugError)
					return
				}

				setSubmitting(true)
				try {
					// Mirror Uzbek translation into base columns for backward compatibility.
					let nextValues: EmployeeCardUpdate = {
						...values,
						full_name: effectiveFullName,
						position: effectivePosition,
						department: (uz.department ?? values.department ?? '') || null,
						organization_name: (uz.organization_name ?? values.organization_name ?? '') || null,
						bio: (uz.bio ?? values.bio ?? '') || null,
						translations,
					}

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
				<div className="text-lg font-semibold">Multilingual content</div>
				<div className="mt-1 text-xs text-brand-muted">
					Fill each language tab. Uzbek also populates base fields for backward compatibility.
				</div>

				<div className="mt-4 inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
					{LANG_TABS.map((t) => {
						const active = activeLang === t.code
						const btnCls =
							'rounded-lg px-3 py-1.5 text-xs font-semibold transition ' +
							(active ? 'bg-yellow-300/20 text-yellow-100' : 'text-white/65 hover:text-white')
						return (
							<button key={t.code} type="button" onClick={() => setActiveLang(t.code)} className={btnCls}>
								{t.label}
							</button>
						)
					})}
				</div>

				<div className="mt-4 grid gap-3 md:grid-cols-2">
					<div>
						<div className="text-xs text-brand-muted">Full name *</div>
						<Input
							value={current.full_name ?? ''}
							onChange={(e) => {
								const full_name = e.target.value
								patchTranslation({ full_name })
								if (activeLang === 'uz') {
									setValues((p) => ({ ...p, full_name }))
									if (!slugTouched) setValues((p) => ({ ...p, slug: slugify(full_name) }))
								}
							}}
						/>
					</div>
					<div>
						<div className="text-xs text-brand-muted">Position *</div>
						<Input
							value={current.position ?? ''}
							onChange={(e) => {
								const position = e.target.value
								patchTranslation({ position })
								if (activeLang === 'uz') setValues((p) => ({ ...p, position }))
							}}
						/>
					</div>

					<div>
						<div className="text-xs text-brand-muted">Department</div>
						<Input
							value={current.department ?? ''}
							onChange={(e) => {
								const department = e.target.value
								patchTranslation({ department })
								if (activeLang === 'uz') setValues((p) => ({ ...p, department: department || null }))
							}}
						/>
					</div>
					<div>
						<div className="text-xs text-brand-muted">Organization name</div>
						<Input
							value={current.organization_name ?? ''}
							onChange={(e) => {
								const organization_name = e.target.value
								patchTranslation({ organization_name })
								if (activeLang === 'uz')
									setValues((p) => ({ ...p, organization_name: organization_name || null }))
							}}
						/>
					</div>

					<div className="md:col-span-2">
						<div className="text-xs text-brand-muted">Bio</div>
						<Textarea
							value={current.bio ?? ''}
							onChange={(e) => {
								const bio = e.target.value
								patchTranslation({ bio })
								if (activeLang === 'uz') setValues((p) => ({ ...p, bio: bio || null }))
							}}
						/>
					</div>

					<div className="md:col-span-2">
						<div className="text-xs text-brand-muted">Specialties (one per line)</div>
						<Textarea
							value={specialtiesToText(current.specialties)}
							onChange={(e) => patchTranslation({ specialties: textToSpecialties(e.target.value) })}
						/>
					</div>
				</div>
			</Card>

			<Card className="p-5">
				<div className="text-lg font-semibold">Identity & contact</div>
				<div className="mt-4 grid gap-3 md:grid-cols-2">
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
					<div>
						<div className="text-xs text-brand-muted">Address</div>
						<Input
							value={values.address ?? ''}
							onChange={(e) => setValues((p) => ({ ...p, address: e.target.value || null }))}
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
						if (lastObjectUrlsRef.current.profile)
							URL.revokeObjectURL(lastObjectUrlsRef.current.profile)
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
						setValues((p) => ({ ...p, logo_