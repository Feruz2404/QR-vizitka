import { Download } from 'lucide-react'

import type { EmployeeCard } from '../../types/employee'
import { Button } from '../../ui/Button'
import { downloadVCardFile, generateVCard } from '../../lib/vcard'

export type SaveContactOverrides = {
	full_name?: string
	position?: string
	organization_name?: string | null
}

export function SaveContactButton({
	card,
	className,
	overrides,
}: {
	card: EmployeeCard
	className?: string
	overrides?: SaveContactOverrides
}) {
	return (
		<Button
			className={className}
			aria-label="Save contact"
			onClick={() => {
				const effective: EmployeeCard = overrides
					? {
							...card,
							full_name: overrides.full_name ?? card.full_name,
							position: overrides.position ?? card.position,
							organization_name:
								overrides.organization_name !== undefined
									? overrides.organization_name
									: card.organization_name,
						}
					: card
				const vcf = generateVCard(effective)
				downloadVCardFile(vcf, `${card.slug}.vcf`)
			}}
		>
			<Download className="h-4 w-4" /> Save Contact
		</Button>
	)
}
