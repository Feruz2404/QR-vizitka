import { Download } from 'lucide-react'

import type { EmployeeCard } from '../../types/employee'
import { Button } from '../../ui/Button'
import { downloadVCardFile, generateVCard } from '../../lib/vcard'

export function SaveContactButton({
	card,
	className,
}: {
	card: EmployeeCard
	className?: string
}) {
	return (
		<Button
			className={className}
			aria-label="Save contact"
			onClick={() => {
				const vcf = generateVCard(card)
				downloadVCardFile(vcf, `${card.slug}.vcf`)
			}}
		>
			<Download className="h-4 w-4" /> Save Contact
		</Button>
	)
}
