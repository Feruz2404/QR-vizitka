import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { useAppDispatch } from './app/hooks'
import { supabase } from './lib/supabase'
import { clearAuth, setAuth, setLoading } from './features/auth/authSlice'

import { PublicCardPage } from './pages/PublicCardPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminCardsPage } from './pages/AdminCardsPage'
import { AdminCardEditorPage } from './pages/AdminCardEditorPage'
import { AdminSettingsPage } from './pages/AdminSettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProtectedRoute } from './routes/ProtectedRoute'

export function App() {
	const dispatch = useAppDispatch()

	useEffect(() => {
		let active = true

		const bootstrap = async () => {
			dispatch(setLoading(true))
			try {
				const { data, error } = await supabase.auth.getSession()
				if (error) {
					// eslint-disable-next-line no-console
					console.error('supabase.auth.getSession error', error)
				}
				if (!active) return
				dispatch(setAuth({ session: data.session ?? null }))
			} catch (err) {
				// eslint-disable-next-line no-console
				console.error('supabase.auth.getSession exception', err)
				if (!active) return
				dispatch(clearAuth())
			} finally {
				if (!active) return
				dispatch(setLoading(false))
			}
		}

		bootstrap()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (!active) return
			if (session) {
				dispatch(setAuth({ session }))
			} else {
				dispatch(clearAuth())
			}
		})

		return () => {
			active = false
			subscription.unsubscribe()
		}
	}, [dispatch])

	return (
		<Routes>
			<Route path="/" element={<Navigate to="/admin/login" replace />} />

			<Route path="/v/:slug" element={<PublicCardPage />} />

			<Route path="/admin/login" element={<AdminLoginPage />} />
			<Route element={<ProtectedRoute />}>
				<Route path="/admin" element={<AdminDashboardPage />} />
				<Route path="/admin/cards" element={<AdminCardsPage />} />
				<Route path="/admin/cards/new" element={<AdminCardEditorPage mode="create" />} />
				<Route path="/admin/cards/:id/edit" element={<AdminCardEditorPage mode="edit" />} />
				<Route path="/admin/settings" element={<AdminSettingsPage />} />
			</Route>

			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	)
}
