export function cn(...classes: Array<string | false | null | undefined>) {
	return classes.filter(Boolean).join(' ')
}

export function safeUrl(url?: string | null) {
	if (!url) return null
	try {
		// allow relative? for this app we only store absolute URLs
		return new URL(url).toString()
	} catch {
		return null
	}
}
