import { AdminLayout } from '../admin/AdminLayout'
import { Card } from '../ui/Card'

export function AdminSettingsPage() {
	return (
		<AdminLayout>
			<Card className="p-5">
				<div className="text-lg font-semibold">Settings</div>
				<p className="mt-2 text-sm text-brand-muted">
					Optional organization settings can be added here later.
				</p>
			</Card>
		</AdminLayout>
	)
}
