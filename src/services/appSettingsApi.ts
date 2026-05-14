import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

import { supabase } from '../lib/supabase'
import type { AppSettings, AppSettingsUpdate } from '../types/appSettings'

const APP_SETTINGS_TAG = 'AppSettings' as const
const APP_SETTINGS_ROW_ID = 'global'
const APP_ASSETS_BUCKET = 'app-assets'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 8 * 1024 * 1024

function safeFileName(name: string) {
	const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
	return cleaned || 'image'
}

export const appSettingsApi = createApi({
	reducerPath: 'appSettingsApi',
	baseQuery: fakeBaseQuery(),
	tagTypes: [APP_SETTINGS_TAG],
	endpoints: (builder) => ({
		getAppSettings: builder.query<AppSettings | null, void>({
			async queryFn() {
				const { data, error } = await supabase
					.from('app_settings')
					.select('*')
					.eq('id', APP_SETTINGS_ROW_ID)
					.maybeSingle()
				if (error) return { error }
				return { data: (data as AppSettings | null) ?? null }
			},
			providesTags: [{ type: APP_SETTINGS_TAG, id: APP_SETTINGS_ROW_ID }],
		}),

		updateAppSettings: builder.mutation<AppSettings, AppSettingsUpdate>({
			async queryFn(values) {
				const { data, error } = await supabase
					.from('app_settings')
					.upsert({ id: APP_SETTINGS_ROW_ID, ...values }, { onConflict: 'id' })
					.select('*')
					.single()
				if (error) return { error }
				return { data: data as AppSettings }
			},
			invalidatesTags: [{ type: APP_SETTINGS_TAG, id: APP_SETTINGS_ROW_ID }],
		}),

		uploadGlobalBackground: builder.mutation<string, { file: File }>({
			async queryFn({ file }) {
				if (!ALLOWED_TYPES.includes(file.type)) {
					return { error: { message: 'Unsupported image type. Use JPG, PNG, or WEBP.' } as any }
				}
				if (file.size > MAX_BYTES) {
					return { error: { message: 'Image is too large (max 8MB).' } as any }
				}
				const path = `background/${Date.now()}-${safeFileName(file.name)}`
				const { error: uploadError } = await supabase.storage
					.from(APP_ASSETS_BUCKET)
					.upload(path, file, { upsert: true, contentType: file.type })
				if (uploadError) return { error: uploadError }
				// Always go through getPublicUrl so the returned URL contains the
				// /storage/v1/object/public/<bucket>/... prefix. The bucket must be
				// configured as public-read in Supabase Storage.
				const { data } = supabase.storage.from(APP_ASSETS_BUCKET).getPublicUrl(path)
				return { data: data.publicUrl }
			},
		}),

		uploadGlobalLogo: builder.mutation<string, { file: File }>({
			async queryFn({ file }) {
				if (!ALLOWED_TYPES.includes(file.type)) {
					return { error: { message: 'Unsupported image type. Use JPG, PNG, or WEBP.' } as any }
				}
				if (file.size > MAX_BYTES) {
					return { error: { message: 'Image is too large (max 8MB).' } as any }
				}
				const path = `logo/${Date.now()}-${safeFileName(file.name)}`
				const { error: uploadError } = await supabase.storage
					.from(APP_ASSETS_BUCKET)
					.upload(path, file, { upsert: true, contentType: file.type })
				if (uploadError) return { error: uploadError }
				const { data } = supabase.storage.from(APP_ASSETS_BUCKET).getPublicUrl(path)
				return { data: data.publicUrl }
			},
		}),
	}),
})

export const {
	useGetAppSettingsQuery,
	useUpdateAppSettingsMutation,
	useUploadGlobalBackgroundMutation,
	useUploadGlobalLogoMutation,
} = appSettingsApi
