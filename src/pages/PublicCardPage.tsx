import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { EmployeeTopHeader } from '../components/public-card/EmployeeTopHeader'
import { ContactSection } from '../components/public-card/ContactSection'
import { QRCodeBlock } from '../components/public-card/QRCodeBlock'
import { SaveContactButton } from '../components/public-card/SaveContactButton'
import { ShareButton } from '../components/public-card/ShareButton'
import { useGetCardBySlugQuery } from '../services/employeeCardsApi'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

function fullUrl(publicBaseUrl: string, slug: string) {
	return `${publicBaseUrl.replace(/\/$/, '')}/v/${slug}`
}

function initials(fullName: string) {
	const parts = fullName.trim().split(/\s+/).filter(Boolean)
	const a = parts[0]?.[0] ?? ''
	const b = parts[1]?.[0] ?? ''
	return (a + b).toUpperCase()
}

function telNormalize(value?: string | null) {
	if (!value) return null
	const digits = value.replace(/\D/g, '')
	if (!digits) return null
	if (digits.startsWith('998')) return `+${digits}`
	if (digits.length === 9) return `+998${digits}`
	return value.startsWith('+') ? value : `+${digits}`
}

export function PublicCardPage() {
	const { slug } = useParams()
	const safeSlug = slug ?? ''
	const { data, isLoading, isError } = useGetCardBySlugQuery(safeSlug)

	const publicBaseUrl =
		(import.meta.env.VITE_PUBLIC_BASE_URL as string | undefined) ?? window.location.origin
	const url = safeSlug ? fullUrl(publicBaseUrl, safeSlug) : window.location.href

	const quick = useMemo(() => {
		if (!data) return null
		return {
			phone: data.phone_primary ?? data.phone_secondary ?? null,
			email: data.work_email ?? data.personal_email ?? null,
			tg: data.telegram_url ?? null,
		}
	}, [data])

	if (isLoading) {
		return (
			<div className="min-h-screen">
				<div className="sticky top-0 z-40 border-b border-white/10 bg-black/35 backdrop-blur-xl">
					<div className="mx-auto max-w-6xl px-4 py-3">
						<Skeleton className="h-10 w-52" />
					</div>
				</div>
				<div className="mx-auto max-w-6xl p-4">
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		)
	}

	if (isError || !data) {
		return (
			<div className="min-h-screen grid place-items-center p-6">
				<Card className="max-w-lg p-6 text-center">
					<div className="text-xl font-semibold">Card not found</div>
					<p className="mt-2 text-sm text-brand-muted">
						This employee card does not exist or the link is invalid.
					</p>
				</Card>
			</div>
		)
	}

	if (!data.is_active) {
		return (
			<div className="min-h-screen grid place-items-center p-6">
				<Card className="max-w-lg p-6 text-center">
					<div className="text-xl font-semibold">Card unavailable</div>
					<p className="mt-2 text-sm text-brand-muted">
						This employee card is currently unpublished.
					</p>
				</Card>
			</div>
		)
	}

	const heroPhoto = data.profile_photo_url
	const org = data.organization_name

	return (
		<div className="min-h-screen text-white">
			<Helmet>
				<title>{data.full_name} | Digital Business Card</title>
				<meta name="description" content={`Contact information for ${data.full_name}, ${data.position}.`} />
				<meta property="og:title" content={`${data.full_name} | Digital Business Card`} />
				<meta property="og:description" content={`Contact information for ${data.full_name}, ${data.position}.`} />
			</Helmet>

			{/* Premium background */}
			<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_20%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(1000px_circle_at_90%_30%,rgba(245,197,66,0.20),transparent_55%),radial-gradient(800px_circle_at_40%_90%,rgba(167,139,250,0.12),transparent_55%),linear-gradient(180deg,#050712_0%,#070A14_30%,#02030A_100%)]" />
				<div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:18px_18px]" />
				<div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl" />
				<div className="absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-yellow-400/10 blur-3xl" />
				<div className="absolute left-1/3 bottom-[-240px] h-[520px] w-[520px] rounded-full bg-purple-500/10 blur-3xl" />
			</div>

			<EmployeeTopHeader
				fullName={data.full_name}
				position={data.position}
				profilePhotoUrl={data.profile_photo_url}
				organizationLogoUrl={data.logo_url}
			/>

			<div className="mx-auto max-w-[1100px] px-4 pb-10 pt-6">
				<motion.div
					initial= opacity: 0, y: 10 
					animate= opacity: 1, y: 0 
					transition= duration: 0.35 
				>
					<div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
						{/* Left column: hero */}
						<motion.div
							initial= opacity: 0, y: 14 
							animate= opacity: 1, y: 0 
							transition= duration: 0.45, delay: 0.05 
						>
							<Card className="relative overflow-hidden rounded-[32px] p-6">
								<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_20%_10%,rgba(245,197,66,0.16),transparent_55%),radial-gradient(900px_circle_at_90%_20%,rgba(59,130,246,0.14),transparent_60%)]" />
								<div className="pointer-events-none absolute inset-0 border border-white/10" />

								<div className="relative">
									<div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
										<div className="relative">
											<div className="absolute -inset-2 rounded-[28px] bg-gradient-to-b from-yellow-300/25 to-blue-400/10 blur-xl" />
											<div className="relative h-36 w-36 overflow-hidden rounded-[28px] border border-white/15 bg-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
												{heroPhoto ? (
													<img src={heroPhoto} alt={`${data.full_name} photo`} className="h-full w-full object-cover" loading="lazy" />
												) : (
													<div className="grid h-full w-full place-items-center text-4xl font-semibold text-white/90">{initials(data.full_name)}</div>
												)}
											</div>
											{data.logo_url ? (
												<div className="absolute -bottom-3 -right-3 rounded-2xl border border-white/15 bg-black/35 p-2 backdrop-blur-xl">
													<img src={data.logo_url} alt="Organization logo" className="h-8 w-8 rounded-lg object-contain" loading="lazy" />
												</div>
											) : null}
										</div>

										<div className="min-w-0 flex-1">
											<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
												<span className="h-1.5 w-1.5 rounded-full bg-yellow-300/80" />
												Premium digital card
											</div>
											<div className="mt-3 text-3xl font-semibold tracking-tight">{data.full_name}</div>
											<div className="mt-1 text-sm text-white/80">{data.position}</div>
											{org ? <div className="mt-2 text-sm text-white/90">{org}</div> : null}
											{data.department ? <div className="mt-1 text-sm text-white/70">{data.department}</div> : null}
											{data.bio ? <p className="mt-3 text-sm leading-relaxed text-white/70">{data.bio}</p> : null}

											<div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
												{quick?.phone ? (
													<a href={`tel:${telNormalize(quick.phone) ?? quick.phone}`} className="w-full sm:w-auto">
														<Button className="w-full sm:w-auto" aria-label="Call">Call</Button>
													</a>
												) : null}
												{quick?.email ? (
													<a href={`mailto:${quick.email}`} className="w-full sm:w-auto">
														<Button className="w-full sm:w-auto" variant="secondary" aria-label="Email">Email</Button>
													</a>
												) : null}
												{quick?.tg ? (
													<a href={quick.tg} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
														<Button className="w-full sm:w-auto" variant="secondary" aria-label="Telegram">Telegram</Button>
													</a>
												) : null}
												<div className="w-full sm:w-auto">
													<SaveContactButton card={data} className="w-full sm:w-auto" />
												</div>
										</div>
									</div>
								</div>
							</Card>
						</motion.div>

						{/* Right column */}
						<div className="grid gap-5">
							<ContactSection card={data} />
							<QRCodeBlock url={url} filename={`${data.slug}.svg`} />
							<Card className="p-4">
								<div className="flex items-center justify-between gap-3">
									<div>
										<div className="text-sm font-semibold">Share</div>
										<div className="mt-1 text-xs text-brand-muted">Copy or share this card link</div>
									</div>
									<ShareButton url={url} title={`${data.full_name} | Digital Business Card`} />
								</div>
								<div className="mt-3 flex flex-col gap-2 sm:flex-row">
									<Button
										variant="secondary"
										className="w-full"
										onClick={async () => {
											await navigator.clipboard.writeText(url)
										}}
										aria-label="Copy link"
									>
										Copy link
									</Button>
									<Button
										variant="ghost"
										className="w-full"
										onClick={() => window.open(url, '_blank', 'noreferrer')}
										aria-label="Open"
									>
										Open
									</Button>
								</div>
							</Card>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	)
}
