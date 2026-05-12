import { useGetCardsQuery } from '../services/employeeCardsApi'
import { AdminLayout } from '../admin/AdminLayout'
import { Card } from '../ui/Card'

export function AdminDashboardPage() {
	const { data } = useGetCardsQuery()
	const total = data?.length ?? 0
	const active = (data ?? []).filter((x) => x.is_active).length

	return (
		<AdminLayout>
			<div className="grid gap-4">
				<div>
					<div className="text-xl font-semibold">Dashboard</div>
					<div className="text-sm text-brand-muted">Overview</div>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<Card className="p-4">
						<div className="text-sm text-brand-muted">Total cards</div>
						<div className="mt-1 text-3xl font-semibold">{total}</div>
					</Card>
					<Card className="p-4">
						<div className="text-sm text-brand-muted">Active</div>
						<div className="mt-1 text-3xl font-semibold">{active}</div>
					</Card>
				</div>
			</div>
		</AdminLayout>
	)
}
