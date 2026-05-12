import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setAuth, setLoading } from '../features/auth/authSlice'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { useToast } from '../ui/Toast'

export function AdminLoginPage() {
	const dispatch = useAppDispatch()
	const toast = useToast()
	const navigate = useNavigate()
	const location = useLocation() as any
	const { session } = useAppSelector((s) => s.auth)

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		let mounted = true
		dispatch(setLoading(true))
		supabase.auth.getSession().then(({ data }) => {
			if (!mounted) return
			dispatch(setAuth({ session: data.session }))
		})
		const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
			dispatch(setAuth({ session: newSession }))
		})
		return () => {
			mounted = false
			sub.subscription.unsubscribe()
		}
	}, [dispatch])

	if (session) {
		const to = location?.state?.from?.pathname || '/admin'
		return <Navigate to={to} replace />
	}

	return (
		<div className="min-h-screen grid place-items-center p-6">
			<Card className="w-full max-w-md p-6">
				<div className="text-xl font-semibold">Admin login</div>
				<p className="mt-1 text-sm text-brand-muted">
					Sign in with your Supabase Auth email/password.
				</p>

				<form
					className="mt-6 grid gap-3"
					onSubmit={async (e) => {
						e.preventDefault()
						setSubmitting(true)
						const { error } = await supabase.auth.signInWithPassword({ email, password })
						setSubmitting(false)
						if (error) {
							toast.push(error.message)
							return
						}
						toast.push('Logged in')
						navigate('/admin')
					}}
				>
					<Input
						type="email"
						autoComplete="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<Input
						type="password"
						autoComplete="current-password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
					<Button type="submit" disabled={submitting}>
						{submitting ? 'Signing in…' : 'Sign in'}
					</Button>
				</form>

				<div className="mt-6 text-xs text-brand-muted">
					No public homepage is exposed. Root route redirects here.
				</div>
			</Card>
		</div>
	)
}
