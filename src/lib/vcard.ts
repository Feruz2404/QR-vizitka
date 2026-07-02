import type { EmployeeCard } from '../types/employee'

function line(key: string, value?: string | null) {
	if (!value) return null
	return `${key}:${String(value).replace(/\n/g, '\\n')}`
}

export function generateVCard(card: EmployeeCard) {
	const lines: string[] = []
	lines.push('BEGIN:VCARD')
	lines.push('VERSION:3.0')
	lines.push(`FN:${card.full_name}`)
	lines.push(`N:${card.full_name};;;;`)

	const title = line('TITLE', card.position)
	if (title) lines.push(title)
	const org = line('ORG', card.organization_name)
	if (org) lines.push(org)

	if (card.work_email) lines.push(`EMAIL;TYPE=WORK:${card.work_email}`)
	if (card.personal_email) lines.push(`EMAIL;TYPE=HOME:${card.personal_email}`)

	if (card.phone_primary) lines.push(`TEL;TYPE=CELL:${card.phone_primary}`)
	if (card.phone_secondary) lines.push(`TEL;TYPE=WORK:${card.phone_secondary}`)
	if (card.phone_extra) lines.push(`TEL;TYPE=VOICE:${card.phone_extra}`)
	if (card.short_phone) lines.push(`TEL;TYPE=PREF:${card.short_phone}`)

	const adr = line('ADR;TYPE=WORK', card.address)
	if (adr) lines.push(adr)

	// URLs
	if (card.website_url) lines.push(`URL:${card.website_url}`)
	if (card.telegram_url) lines.push(`X-SOCIALPROFILE;type=telegram:${card.telegram_url}`)
	if (card.facebook_url) lines.push(`X-SOCIALPROFILE;type=facebook:${card.facebook_url}`)
	if (card.instagram_url) lines.push(`X-SOCIALPROFILE;type=instagram:${card.instagram_url}`)
	if (card.wechat_url) lines.push(`X-SOCIALPROFILE;type=wechat:${card.wechat_url}`)
	if (card.whatsapp_url) lines.push(`X-SOCIALPROFILE;type=whatsapp:${card.whatsapp_url}`)

	lines.push('END:VCARD')
	return lines.join('\n')
}

export function downloadVCardFile(vcard: string, filename: string) {
	const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}
