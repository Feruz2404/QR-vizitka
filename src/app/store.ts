import { configureStore } from '@reduxjs/toolkit'

import { employeeCardsApi } from '../services/employeeCardsApi'
import { appSettingsApi } from '../services/appSettingsApi'
import { authReducer } from '../features/auth/authSlice'

export const store = configureStore({
	reducer: {
		[employeeCardsApi.reducerPath]: employeeCardsApi.reducer,
		[appSettingsApi.reducerPath]: appSettingsApi.reducer,
		auth: authReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(employeeCardsApi.middleware, appSettingsApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
