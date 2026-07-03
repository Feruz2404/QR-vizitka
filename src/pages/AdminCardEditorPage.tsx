import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { AdminLayout } from '../admin/AdminLayout'
import { CardForm } from '../admin/CardForm'
import {
	useCreateCardMutation,
	useGetCardByIdQuery,
	useUpdateCardMutation,
} from '../services/employeeCardsApi'
import type { EmployeeCardInsert } from '../types/employee'
import { Button } from '../ui/Button'

export function AdminCardEditorPage({ mode }: { mode: 'create' | 'edit' }) {
	const navigate = useNavigate()
	const { id } = useParams()
	const cardId = id ?? ''

	const { data } = useGetCardByIdQuery(cardId, { skip: mode !== 'edit' })
	const [createCard, createState] = useCreateCardMutation()
	const [updateCard, updateState] = useUpdateCardMutation()

	const initial = useMemo(() => {
		if (mode === 'edit' && data) return data
		const empty: EmployeeCardInsert = {
			full_name: '',
			slug: '',
			position: '',
			department: null,
			organization_name: null,
			profile_photo_url: null,
			logo_url: null,
			organization_logo_url: null,
			background_image_url: null,
			work_email: null,
			personal_email: null,
			phone_primary: null,
			phone_secondary: null,
			phone_extra: null,
			short_phone: null,
			telegram_username: null,
			telegram_url: null,
			facebook_url: null,
			instagram_url: null,
			wechat_url: null,
			whatsapp_url: null,
			website_url: null,
			address: null,
			bio: null,
			theme: 'premium-dark-gold',
			is_active: true,
		}
		return empty
	}, [mode, data])

	useEffect(() => {
		if (mode === 'edit' && !cardId) navigate('/admin/cards')
	}, [mode, cardId, navigate])

	return (
		<AdminLayout>
			<div className="flex items-center justify-between gap-3">
				<div>
					<div className="text-xl font-semibold">
						{mode === 'create' ? 'Create employee card' : 'Edit employee card'}
					</div>
					<div className="text-sm text-brand-muted">
						{mode === 'create' ? 'Add a new card' : 'Update details and assets'}
					</div>
				</div>
				<Link to="/admin/cards">
					<Button variant="secondary">Back</Button>
				</Link>
			</div>

			<div className="mt-4">
				<CardForm
					mode={mode}
					initialValues={initial}
					saving={createState.isLoading || updateState.isLoading}
					onSave={async (values) => {
						if (mode === 'create') {
							await createCard(values as EmployeeCardInsert).unwrap()
							navigate('/admin/cards')
							return
						}
						await updateCard({ id: cardId, values }).unwrap()
						navigate('/admin/cards')
					}}
					previewUrl={(slug) => '/v/' + slug}
				/>
			</div>
		</AdminLayout>
	)
}
