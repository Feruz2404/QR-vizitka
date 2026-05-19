import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { useAppDispatch } from './app/hooks'
import { supabase } from './lib/supabase'
import { setAuth, setLoading, clearAuth } from './features/auth/authSlice'

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
		let isMounted = true

		const initSession = async () => {
			try {
				const { data, error } = await supabase.auth.getSession()
				if (!isMounted) return
				if (error) {
					// eslint-disable-next-line no-console
					console.error('supabase.auth.getSession returned error', error)
					dispatch(clearAuth())
					return
				}
				if (data?.session) {
					dispatch(setAuth({ session: data.session }))
				} else {
					dispatch(setAuth({ session: null }))
				}
			} catch (err) {
				// eslint-disable-next-line no-console
				console.error('supabase.auth.getSession threw', err)
				if (isMounted) dispatch(clearAuth())
			} finally {
				if (isMounted) dispatch(setLoading(false))
			}
		}

		initSession()

		const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
			dispatch(setAuth({ session }))
		})

		return () => {
			isMounted = false
			authListener.subscription.unsubscribe()
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

			<Route path="/:slug" element={<PublicCardPage />} />

			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	)
}