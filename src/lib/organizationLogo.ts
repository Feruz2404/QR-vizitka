import type { EmployeeCard } from '../types/employee'
import { safeUrl } from './utils'

type CardLogoSource = Pick<EmployeeCard, 'organization_logo_url' | 'logo_url'> | null | undefined

export function getEmployeeOrganizationLogoUrl(card: CardLogoSource) {
	return safeUrl(card?.organization_logo_url) ?? safeUrl(card?.logo_url)
}

export function getOrganizationLogoUrl(card: CardLogoSource, globalLogoUrl?: string | null) {
	return getEmployeeOrganizationLogoUrl(card) ?? safeUrl(globalLogoUrl)
}

