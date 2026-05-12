import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Session, User } from '@supabase/supabase-js'

export type AuthState = {
	user: User | null
	session: Session | null
	loading: boolean
}

const initialState: AuthState = {
	user: null,
	session: null,
	loading: true,
}

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setAuth(state, action: PayloadAction<{ session: Session | null }>) {
			state.session = action.payload.session
			state.user = action.payload.session?.user ?? null
			state.loading = false
		},
		setLoading(state, action: PayloadAction<boolean>) {
			state.loading = action.payload
		},
		clearAuth(state) {
			state.session = null
			state.user = null
			state.loading = false
		},
	},
})

export const { setAuth, setLoading, clearAuth } = authSlice.actions
export const authReducer = authSlice.reducer
