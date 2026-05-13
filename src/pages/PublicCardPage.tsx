import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'

import { EmployeeTopHeader } from '../components/public-card/EmployeeTopHeader'
import { ContactSection } from '../components/public-card/ContactSection'
import { QRCodeBlock } from '../components/public-card/QRCodeBlock'
import { SaveContactButton } from '../components/public-card/SaveContactButton'
import { ShareButton } from '../components/public-card/ShareButton'
import { useGetCardBySlugQuery } from '../services/employeeCardsApi'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

function fullUrl(publicBaseUrl: string, slug: string) {
	return `${publicBaseUrl.replace(/\/$/, '')}/v/${slug}`
}

export function PublicCardPage() {
	const { slug } = useParams()
	const safeSlug = slug ?? ''
	const { data, isLoading, isError } = useGetCardBySlugQuery(safeSlug)

	const publicBaseUrl =
		(import.meta.env.VITE_PUBLIC_BASE_URL as string | undefined) ?? window.location.origin
	const url = safeSlug ? fullUrl(publicBaseUrl, safeSlug) : window.location.href

	if (isLoading) {
		return (
			<div className="min-h-screen">
				<div className="sticky top-0 z-40 border-b border-white/10 bg-black/35 backdrop-blur-xl">
					<div className="mx-auto max-w-5xl px-4 py-3">
						<Skeleton className="h-10 w-52" />
					</div>
				</div>
				<div className="mx-auto max-w-5xl p-4">
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

	return (
		<div className="min-h-screen">
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

			<EmployeeTopHeader
				fullName={data.full_name}
				position={data.position}
				profilePhotoUrl={data.profile_photo_url}
				organizationLogoUrl={data.logo_url}
			/>

			<div className="mx-auto max-w-5xl p-4">
				<motion.div
					initial={ { opacity: 0, y: 8 } }
					animate={ { opacity: 1, y: 0 } }
					transition={ { duration: 0.35 } }
				>
					<div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
						<Card className="p-5">
							<div className="flex flex-col items-center gap-5 text-center lg:flex-row lg:items-start lg:text-left">
								<div className="h-28 w-28 overflow-hidden rounded-2xl border border-white/15 bg-white/10">
									{data.profile_photo_url ? (
										<img
											src={data.profile_photo_url}
											alt={`${data.full_name} photo`}
											className="h-full w-full object-cover"
											loading="lazy"
										/>
									) : (
										<div className="grid h-full w-full place-items-center text-2xl font-semibold text-white/80">
											{data.full_name
												.split(' ')
												.map((p) => p[0])
												.slice(0, 2)
												.join('')
												.toUpperCase()}
										</div>
									)}
								</div>

								<div className="flex-1">
									<div className="text-2xl font-semibold">{data.full_name}</div>
									<div className="mt-1 text-sm text-brand-muted">{data.position}</div>
									{data.department ? (
										<div className="mt-1 text-sm text-white/80">{data.department}</div>
									) : null}
									{data.organization_name ? (
										<div className="mt-2 text-sm text-white/90">{data.organization_name}</div>
									) : null}
									{data.bio ? (
										<p className="mt-3 text-sm leading-relaxed text-brand-muted">{data.bio}</p>
									) : null}
									<div className="mt-4 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
										<SaveContactButton card={data} />
										<ShareButton url={url} title={`${data.full_name} | Digital Business Card`} />
									</div>
								</div>
							</div>
						</Card>

						<div className="grid gap-4">
							<ContactSection card={data} />
							<QRCodeBlock url={url} filename={`${data.slug}.svg`} />
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	)
}
