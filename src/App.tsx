import { Navigate, Route, Routes } from 'react-router-dom'

import { PublicCardPage } from './pages/PublicCardPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminCardsPage } from './pages/AdminCardsPage'
import { AdminCardEditorPage } from './pages/AdminCardEditorPage'
import { AdminSettingsPage } from './pages/AdminSettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProtectedRoute } from './routes/ProtectedRoute'

export function App() {
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
