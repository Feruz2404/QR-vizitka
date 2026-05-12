import { Share2 } from 'lucide-react'
import { Button } from '../../ui/Button'
import { useToast } from '../../ui/Toast'

export function ShareButton({ url, title }: { url: string; title: string }) {
	const toast = useToast()
	return (
		<Button
			variant="secondary"
			aria-label="Share"
			onClick={async () => {
				try {
					if (navigator.share) {
						await navigator.share({ title, url })
						return
					}
					await navigator.clipboard.writeText(url)
					toast.push('Link copied')
				} catch {
					toast.push('Unable to share')
				}
			}}
		>
			<Share2 className="h-4 w-4" /> Share
		</Button>
	)
}
