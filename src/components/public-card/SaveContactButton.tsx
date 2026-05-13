import { Download } from 'lucide-react'

import type { EmployeeCard } from '../../types/employee'
import { Button } from '../../ui/Button'
import { downloadVCardFile, generateVCard } from '../../lib/vcard'

export function SaveContactButton({ card }: { card: EmployeeCard }) {
	return (
		<Button
			aria-label="Download vCard"
			onClick={() => {
				const vcf = generateVCard(card)
				downloadVCardFile(vcf, `${card.slug}.vcf`)
			}}
		>
			<Download className="h-4 w-4" /> Download vCard
		</Button>
	)
}
