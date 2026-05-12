import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

import { supabase } from '../lib/supabase'
import type { EmployeeCard, EmployeeCardInsert, EmployeeCardUpdate } from '../types/employee'

const EmployeeCardsTag = 'EmployeeCards' as const
const EmployeeCardTag = 'EmployeeCard' as const

export const employeeCardsApi = createApi({
	reducerPath: 'employeeCardsApi',
	baseQuery: fakeBaseQuery(),
	tagTypes: [EmployeeCardsTag, EmployeeCardTag],
	endpoints: (builder) => ({
		getCardBySlug: builder.query<EmployeeCard, string>({
			async queryFn(slug) {
				const { data, error } = await supabase
					.from('employee_cards')
					.select('*')
					.eq('slug', slug)
					.maybeSingle()
				if (error) return { error }
				if (!data) return { error: { message: 'Not found' } as any }
				return { data }
			},
			providesTags: (_res, _err, slug) => [{ type: EmployeeCardTag, id: slug }],
		}),

		getCards: builder.query<EmployeeCard[], void>({
			async queryFn() {
				const { data, error } = await supabase
					.from('employee_cards')
					.select('*')
					.order('updated_at', { ascending: false })
				if (error) return { error }
				return { data: data ?? [] }
			},
			providesTags: (result) =>
				result
					? [
						{ type: EmployeeCardsTag, id: 'LIST' },
						...result.map((r) => ({ type: EmployeeCardTag, id: r.id }) as const),
					]
					: [{ type: EmployeeCardsTag, id: 'LIST' }],
		}),

		getCardById: builder.query<EmployeeCard, string>({
			async queryFn(id) {
				const { data, error } = await supabase
					.from('employee_cards')
					.select('*')
					.eq('id', id)
					.single()
				if (error) return { error }
				return { data }
			},
			providesTags: (_res, _err, id) => [{ type: EmployeeCardTag, id }],
		}),

		createCard: builder.mutation<EmployeeCard, EmployeeCardInsert>({
			async queryFn(values) {
				const { data, error } = await supabase
					.from('employee_cards')
					.insert(values)
					.select('*')
					.single()
				if (error) return { error }
				return { data }
			},
			invalidatesTags: [{ type: EmployeeCardsTag, id: 'LIST' }],
		}),

		updateCard: builder.mutation<EmployeeCard, { id: string; values: EmployeeCardUpdate }>({
			async queryFn({ id, values }) {
				const { data, error } = await supabase
					.from('employee_cards')
					.update(values)
					.eq('id', id)
					.select('*')
					.single()
				if (error) return { error }
				return { data }
			},
			invalidatesTags: (_res, _err, arg) => [
				{ type: EmployeeCardsTag, id: 'LIST' },
				{ type: EmployeeCardTag, id: arg.id },
			],
		}),

		deleteCard: builder.mutation<void, string>({
			async queryFn(id) {
				const { error } = await supabase.from('employee_cards').delete().eq('id', id)
				if (error) return { error }
				return { data: undefined }
			},
			invalidatesTags: [{ type: EmployeeCardsTag, id: 'LIST' }],
		}),

		toggleCardStatus: builder.mutation<EmployeeCard, { id: string; is_active: boolean }>({
			async queryFn({ id, is_active }) {
				const { data, error } = await supabase
					.from('employee_cards')
					.update({ is_active })
					.eq('id', id)
					.select('*')
					.single()
				if (error) return { error }
				return { data }
			},
			invalidatesTags: (_res, _err, arg) => [
				{ type: EmployeeCardsTag, id: 'LIST' },
				{ type: EmployeeCardTag, id: arg.id },
			],
		}),

		uploadProfilePhoto: builder.mutation<string, { file: File; cardId: string }>({
			async queryFn({ file, cardId }) {
				const ext = file.name.split('.').pop() || 'png'
				const path = `${cardId}/${Date.now()}-profile.${ext}`
				const { error: uploadError } = await supabase.storage
					.from('employee-photos')
					.upload(path, file, { upsert: true })
				if (uploadError) return { error: uploadError }
				const { data } = supabase.storage.from('employee-photos').getPublicUrl(path)
				return { data: data.publicUrl }
			},
		}),

		uploadLogo: builder.mutation<string, { file: File; cardId: string }>({
			async queryFn({ file, cardId }) {
				const ext = file.name.split('.').pop() || 'png'
				const path = `${cardId}/${Date.now()}-logo.${ext}`
				const { error: uploadError } = await supabase.storage
					.from('organization-logos')
					.upload(path, file, { upsert: true })
				if (uploadError) return { error: uploadError }
				const { data } = supabase.storage.from('organization-logos').getPublicUrl(path)
				return { data: data.publicUrl }
			},
		}),

		checkSlugAvailability: builder.query<boolean, string>({
			async queryFn(slug) {
				const { data, error } = await supabase
					.from('employee_cards')
					.select('id')
					.eq('slug', slug)
					.limit(1)
				if (error) return { error }
				return { data: (data?.length ?? 0) === 0 }
			},
		}),
	}),
})

export const {
	useGetCardBySlugQuery,
	useGetCardsQuery,
	useGetCardByIdQuery,
	useCreateCardMutation,
	useUpdateCardMutation,
	useDeleteCardMutation,
	useToggleCardStatusMutation,
	useUploadProfilePhotoMutation,
	useUploadLogoMutation,
	useLazyCheckSlugAvailabilityQuery,
} = employeeCardsApi
