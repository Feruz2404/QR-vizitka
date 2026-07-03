export type CardLanguage = 'uz' | 'ru' | 'en'

export type EmployeeCardTranslation = {
	full_name?: string
	position?: string
	department?: string | null
	organization_name?: string | null
	bio?: string | null
	specialties?: string[]
	address?: string | null
}

export type EmployeeCardTranslations = Partial<Record<CardLanguage, EmployeeCardTranslation>>

export type EmployeeCard = {
	id: string
	full_name: string
	slug: string
	position: string
	department: string | null
	organization_name: string | null
	profile_photo_url: string | null
	logo_url: string | null
	organization_logo_url: string | null
	background_image_url: string | null
	work_email: string | null
	personal_email: string | null
	phone_primary: string | null
	phone_secondary: string | null
	phone_extra: string | null
	short_phone: string | null
	telegram_username: string | null
	telegram_url: string | null
	facebook_url: string | null
	instagram_url: string | null
	wechat_url: string | null
	whatsapp_url: string | null
	website_url: string | null
	address: string | null
	bio: string | null
	theme: string | null
	translations?: EmployeeCardTranslations | null
	is_active: boolean
	created_at: string
	updated_at: string
}

export type EmployeeCardInsert = Omit<EmployeeCard, 'id' | 'created_at' | 'updated_at'>
export type EmployeeCardUpdate = Partial<EmployeeCardInsert>
