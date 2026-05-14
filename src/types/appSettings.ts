export type AppSettings = {
	id: string
	background_image_url: string | null
	organization_logo_url: string | null
	updated_at: string
}

export type AppSettingsUpdate = Partial<Omit<AppSettings, 'id' | 'updated_at'>>
