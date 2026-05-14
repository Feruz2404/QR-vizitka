import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAppSelector } from '../app/hooks'

export function ProtectedRoute() {
	const { session, loading } = useAppSelector((s) => s.auth)
	const location = useLocation()

	if (loading) {
		return (
			<div className="min-h-screen grid place-items-center text-brand-muted">
				<div className="flex flex-col items-center gap-3">
					<div
						className="h-10 w-10 rounded-full border-2 border-white/15 border-t-brand-gold animate-spin"
						aria-label="Loading"
						role="status"
					/>
					<span className="text-sm tracking-wide">Loading…</span>
				</div>
			</div>
		)
	}

	if (!session) {
		const redirectState = { from: location }
		return <Navigate to="/admin/login" replace state={redirectState} />
	}

	return <Outlet />
}
