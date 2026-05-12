import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, IdCard, Settings, LogOut } from 'lucide-react'

import { supabase } from '../lib/supabase'
import { Button } from '../ui/Button'

const nav = [
	{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
	{ to: '/admin/cards', label: 'Employee Cards', icon: IdCard },
	{ to: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
	const navigate = useNavigate()
	return (
		<div className="rounded-2xl border border-white/15 bg-white/5 shadow-glass backdrop-blur p-4">
			<Link to="/admin" className="block">
				<div className="text-sm font-semibold">Premium Admin</div>
				<div className="text-xs text-brand-muted">QR Business Cards</div>
			</Link>

			<nav className="mt-4 grid gap-1">
				{nav.map((item) => (
					<NavLink
						key={item.to}
						to={item.to}
						className={({ isActive }) =>
							[
								'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition',
								isActive ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5',
							].join(' ')
						}
					>
						<item.icon className="h-4 w-4 text-brand-gold" />
						{item.label}
					</NavLink>
				))}
			</nav>

			<div className="mt-6">
				<Button
					variant="secondary"
					className="w-full"
					onClick={async () => {
						await supabase.auth.signOut()
						navigate('/admin/login')
					}}
				>
					<LogOut className="h-4 w-4" /> Logout
				</Button>
			</div>
		</div>
	)
}
