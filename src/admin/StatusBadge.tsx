import { Badge } from '../ui/Badge'

export function StatusBadge({ active }: { active: boolean }) {
	return (
		<Badge className={active ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-white/15 bg-white/5 text-brand-muted'}>
			{active ? 'Active' : 'Inactive'}
		</Badge>
	)
}
