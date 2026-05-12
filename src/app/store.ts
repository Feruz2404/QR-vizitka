import { configureStore } from '@reduxjs/toolkit'

import { employeeCardsApi } from '../services/employeeCardsApi'
import { authReducer } from '../features/auth/authSlice'

export const store = configureStore({
	reducer: {
		[employeeCardsApi.reducerPath]: employeeCardsApi.reducer,
		auth: authReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(employeeCardsApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
