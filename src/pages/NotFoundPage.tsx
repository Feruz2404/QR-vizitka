import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

export function NotFoundPage() {
	return (
		<div className="min-h-screen grid place-items-center p-6">
			<div className="max-w-md text-center">
				<div className="text-6xl font-semibold text-brand-gold">404</div>
				<div className="mt-3 text-xl font-semibold">Page not found</div>
				<p className="mt-2 text-sm text-brand-muted">
					This route doesn’t exist. If you scanned a QR code, the employee card may be
					unpublished or the link is incorrect.
				</p>
				<div className="mt-6 flex justify-center gap-3">
					<Link to="/admin/login">
						<Button>Go to Admin</Button>
					</Link>
					<Link to="/v/u-umirzakov">
						<Button variant="secondary">Example Card</Button>
					</Link>
				</div>
			</div>
		</div>
	)
}
