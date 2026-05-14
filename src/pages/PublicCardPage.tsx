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
	return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
}

function digitsOnly(v: string) {
	return v.replace(/\D/g, '')
}

function telNormalize(value?: string | null) {
	if (!value) return null
	const raw = digitsOnly(value)
	if (!raw) return null

	if (raw.startsWith('998')) return `+${raw}`
	if (raw.length === 9) return `+998${raw}`

	return value.startsWith('+') ? value : `+${raw}`
}

const pageMotion = {
	initial: { opacity: 0, y: 12 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.35 },
}

const heroMotion = {
	initial: { opacity: 0, y: 16 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.45, delay: 0.05 },
}

const rightMotion = {
	initial: { opacity: 0, y: 18 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.5, delay: 0.09 },
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
			phone: data.phone_primary ?? data.phone_secondary ?? data.phone_extra ?? null,
			email: data.work_email ?? data.personal_email ?? null,
			tg: data.telegram_url ?? null,
		}
	}, [data])

	if (isLoading) {
		return (
			<div className="min-h-screen">
				<div className="sticky top-0 z-40 border-b border-white/10 bg-black/35 backdrop-blur-xl">
					<div className="mx-auto max-w-[1100px] px-4 py-3">
						<Skeleton className="h-10 w-52" />
					</div>
				</div>
				<div className="mx-auto max-w-[1100px] p-4">
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
	const backgroundImage = data.background_image_url

	return (
		<div className="min-h-screen text-white">
			<Helmet>
				<title>{data.full_name} | Digital Business Card</title>
				<meta
					name="description"
					content={`Contact information for ${data.full_name}, ${data.position}.`}
				/>
				<meta property="og:title" content={`${data.full_name} | Digital Business Card`} />
				<meta
					property="og:description"
					content={`Contact information for ${data.full_name}, ${data.position}.`}
				/>
			</Helmet>

			{/* Background: optional employee background image, otherwise premium gradient fallback */}
			{backgroundImage ? (
				<div
					className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
					aria-hidden="true"
				>
					<img
						src={backgroundImage}
						alt=""
						className="absolute inset-0 h-full w-full object-cover"
						loading="eager"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/70 to-black/85" />
					<div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_10%_20%,rgba(59,130,246,0.22),transparent_55%),radial-gradient(800px_circle_at_90%_30%,rgba(245,197,66,0.20),transparent_55%)]" />
				</div>
			) : (
				<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
					<div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_20%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(1000px_circle_at_90%_30%,rgba(245,197,66,0.20),transparent_55%),radial-gradient(800px_circle_at_40%_90%,rgba(167,139,250,0.12),transparent_55%),linear-gradient(180deg,#050712_0%,#070A14_30%,#02030A_100%)]" />
					<div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:18px_18px]" />
					<div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl" />
					<div className="absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-yellow-400/10 blur-3xl" />
					<div className="absolute left-1/3 bottom-[-240px] h-[520px] w-[520px] rounded-full bg-purple-500/10 blur-3xl" />
				</div>
			)}

			<EmployeeTopHeader
				fullName={data.full_name}
				position={data.position}
				profilePhotoUrl={data.profile_photo_url}
				organizationLogoUrl={data.logo_url}
			/>

			<div className="mx-auto max-w-[1100px] px-4 pb-10 pt-6">
				<motion.div {...pageMotion}>
					<div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
						{/* Left / Hero */}
						<motion.div {...heroMotion}>
							<Card className="relative overflow-hidden rounded-[32px] p-6">
								<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_20%_10%,rgba(245,197,66,0.16),transparent_55%),radial-gradient(900px_circle_at_90%_20%,rgba(59,130,246,0.14),transparent_60%)]" />
								<div className="pointer-events-none absolute inset-0 border border-white/10" />

								<div className="relative">
									<div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
										<div className="relative">
											<div className="absolute -inset-2 rounded-[28px] bg-gradient-to-b from-yellow-300/25 to-blue-400/10 blur-xl" />
											<div className="relative h-40 w-40 overflow-hidden rounded-[28px] border border-white/15 bg-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
												{heroPhoto ? (
													<img
														src={heroPhoto}
														alt={`${data.full_name} photo`}
														className="h-full w-full object-cover"
														loading="lazy"
													/>
												) : (
													<div className="grid h-full w-full place-items-center text-4xl font-semibold text-white/90">
														{initials(data.full_name)}
													</div>
												)}
											</div>
										</div>

										<div className="min-w-0 flex-1">
											<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
												<span className="h-1.5 w-1.5 rounded-full bg-yellow-300/80" />
												Digital business card
											</div>

											<div className="mt-3 text-3xl font-semibold tracking-tight">{data.full_name}</div>
											<div className="mt-1 text-sm text-white/80">{data.position}</div>
											{data.organization_name ? (
												<div className="mt-2 text-sm text-white/90">{data.organization_name}</div>
											) : null}
											{data.department ? <div className="mt-1 text-sm text-white/70">{data.department}</div> : null}
											{data.bio ? (
												<p className="mt-3 text-sm leading-relaxed text-white/70">{data.bio}</p>
											) : null}

											<div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
												{quick?.phone ? (
													<a href={`tel:${telNormalize(quick.phone) ?? quick.phone}`} className="w-full sm:w-auto">
														<Button className="w-full sm:w-auto" aria-label="Call">
															Call
														</Button>
													</a>
												) : null}

												{quick?.email ? (
													<a href={`mailto:${quick.email}`} className="w-full sm:w-auto">
														<Button className="w-full sm:w-auto" variant="secondary" aria-label="Email">
															Email
														</Button>
													</a>
												) : null}

												{quick?.tg ? (
													<a href={quick.tg} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
														<Button className="w-full sm:w-auto" variant="secondary" aria-label="Telegram">
															Telegram
														</Button>
													</a>
												) : null}

												<div className="w-full sm:w-auto">
													<SaveContactButton card={data} className="w-full sm:w-auto" />
												</div>
											</div>

											<div className="mt-4 flex items-center justify-center sm:justify-start">
												<ShareButton url={url} title={`${data.full_name} | Digital Business Card`} />
											</div>
										</div>
									</div>
								</div>
							</Card>
						</motion.div>

						{/* Right column */}
						<motion.div {...rightMotion} className="grid gap-5">
							<ContactSection card={data} />
							<QRCodeBlock url={url} filename={`${data.slug}.svg`} />
						</motion.div>
					</div>
				</motion.div>
			</div>
		</div>
	)
}
