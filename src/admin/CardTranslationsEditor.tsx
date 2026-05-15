import { useMemo, useState } from 'react'

import type {
	CardLanguage,
	EmployeeCardTranslation,
	EmployeeCardTranslations,
} from '../types/employee'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'

const LANG_TABS: Array<{ code: CardLanguage; label: string }> = [
	{ code: 'uz', label: 'O‘zbekcha' },
	{ code: 'ru', label: 'Русский' },
	{ code: 'en', label: 'English' },
]

function specialtiesToText(arr: string[] | undefined): string {
	if (!arr || arr.length === 0) return ''
	return arr.join('\n')
}

function textToSpecialties(text: string): string[] {
	return text
		.split('\n')
		.map((s) => s.trim())
		.filter((s) => s.length > 0)
}

export function CardTranslationsEditor({
	value,
	onChange,
	disabled,
}: {
	value: EmployeeCardTranslations
	onChange: (next: EmployeeCardTranslations) => void
	disabled?: boolean
}) {
	const [activeLang, setActiveLang] = useState<CardLanguage>('uz')

	const current: EmployeeCardTranslation = useMemo(() => {
		return value[activeLang] ?? {}
	}, [value, activeLang])

	function patch(field: keyof EmployeeCardTranslation, fieldValue: any) {
		const next: EmployeeCardTranslations = {
			...value,
			[activeLang]: {
				...current,
				[field]: fieldValue,
			},
		}
		onChange(next)
	}

	const tabBaseCls = 'rounded-md px-3 py-1.5 text-sm transition-colors'
	const tabActiveCls = 'bg-amber-400/90 text-black font-semibold shadow'
	const tabInactiveCls = 'bg-white/5 text-white/80 hover:bg-white/10'

	return (
		<Card className="p-5">
			<div className="flex flex-col gap-1">
				<div className="text-lg font-semibold">Multilingual content</div>
				<div className="text-xs text-brand-muted">
					Add translated employee information for the public card language switcher.
				</div>
			</div>

			<div className="mt-4 flex flex-wrap gap-2">
				{LANG_TABS.map((t) => {
					const active = t.code === activeLang
					const cls = tabBaseCls + ' ' + (active ? tabActiveCls : tabInactiveCls)
					return (
						<button
							key={t.code}
							type="button"
							disabled={disabled}
							onClick={() => setActiveLang(t.code)}
							className={cls}
						>
							{t.label}
						</button>
					)
				})}
			</div>

			<div className="mt-4 grid gap-3 md:grid-cols-2">
				<div>
					<div className="text-xs text-brand-muted">Full name</div>
					<Input
						value={current.full_name ?? ''}
						disabled={disabled}
						onChange={(e) => patch('full_name', e.target.value)}
					/>
				</div>
				<div>
					<div className="text-xs text-brand-muted">Position</div>
					<Input
						value={current.position ?? ''}
						disabled={disabled}
						onChange={(e) => patch('position', e.target.value)}
					/>
				</div>

				<div>
					<div className="text-xs text-brand-muted">Department</div>
					<Input
						value={current.department ?? ''}
						disabled={disabled}
						onChange={(e) => patch('department', e.target.value || null)}
					/>
				</div>
				<div>
					<div className="text-xs text-brand-muted">Organization name</div>
					<Input
						value={current.organization_name ?? ''}
						disabled={disabled}
						onChange={(e) => patch('organization_name', e.target.value || null)}
					/>
				</div>

				<div className="md:col-span-2">
					<div className="text-xs text-brand-muted">Bio</div>
					<Textarea
						value={current.bio ?? ''}
						disabled={disabled}
						onChange={(e) => patch('bio', e.target.value || null)}
					/>
				</div>

				<div className="md:col-span-2">
					<div className="text-xs text-brand-muted">Specialties</div>
					<Textarea
						value={specialtiesToText(current.specialties)}
						disabled={disabled}
						placeholder="One specialty per line."
						onChange={(e) => patch('specialties', textToSpecialties(e.target.value))}
					/>
					<div className="mt-1 text-xs text-brand-muted">One specialty per line.</div>
				</div>
			</div>
		</Card>
	)
}
