import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAppSelector } from '../app/hooks'

export function ProtectedRoute() {
	const { session, loading } = useAppSelector((s) => s.auth)
	const location = useLocation()

	if (loading) {
		return (
			<div className="min-h-screen grid place-items-center text-brand-muted">
				Loading…
			</div>
		)
	}

	if (!session) {
		return <Navigate to="/admin/login" replace state= from: location  />
	}

	return <Outlet />
}
