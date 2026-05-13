import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAppSelector } from '../app/hooks'

function SecureLoadingScreen() {
	return (
		<div className="min-h-screen text-white">
			<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_20%_20%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(900px_circle_at_80%_20%,rgba(245,197,66,0.16),transparent_55%),linear-gradient(180deg,#050712_0%,#070A14_40%,#02030A_100%)]" />
				<div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:18px_18px]" />
			</div>

			<div className="grid min-h-screen place-items-center p-6">
				<div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur">
					<div className="flex items-center gap-3">
						<div className="relative h-10 w-10">
							<div className="absolute inset-0 rounded-full border border-white/10" />
							<div className="absolute inset-0 rounded-full border-2 border-yellow-300/70 border-t-transparent animate-spin" />
						</div>
						<div>
							<div className="text-sm font-semibold">Loading secure dashboard...</div>
							<div className="mt-1 text-xs text-white/60">Checking your session</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export function ProtectedRoute() {
	const { session, loading } = useAppSelector((s) => s.auth)
	const location = useLocation()

	if (loading) {
		return <SecureLoadingScreen />
	}

	if (!session) {
		return <Navigate to="/admin/login" replace state= from: location  />
	}

	return <Outlet />
}
