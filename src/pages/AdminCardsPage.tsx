import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'

import { AdminLayout } from '../admin/AdminLayout'
import { CardsTable } from '../admin/CardsTable'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function AdminCardsPage() {
	return (
		<AdminLayout>
			<div className="flex items-center justify-between gap-3">
				<div>
					<div className="text-xl font-semibold">Employee cards</div>
					<div className="text-sm text-brand-muted">Create, publish, and manage cards</div>
				</div>
				<Link to="/admin/cards/new">
					<Button>
						<Plus className="h-4 w-4" /> New
					</Button>
				</Link>
			</div>

			<div className="mt-4 flex items-center gap-3">
				<div className="relative w-full max-w-sm">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
					<Input className="pl-10" placeholder="Search by name or slug" />
				</div>
			</div>

			<div className="mt-4">
				<CardsTable />
			</div>
		</AdminLayout>
	)
}
