import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'

export function AdminLayout() {
	return (
		<div className="min-h-screen">
			<div className="mx-auto max-w-6xl px-4 py-4">
				<div className="grid gap-4 md:grid-cols-[240px_1fr]">
					<AdminSidebar />
					<div className="min-w-0">
						<Outlet />
					</div>
				</div>
			</div>
		</div>
	)
}
