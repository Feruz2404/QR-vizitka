import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'

import { store } from './app/store'
import { App } from './App'
import { ToastProvider } from './ui/Toast'

import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<HelmetProvider>
			<Provider store={store}>
				<ToastProvider>
					<BrowserRouter>
						<App />
					</BrowserRouter>
				</ToastProvider>
			</Provider>
		</HelmetProvider>
	</React.StrictMode>
)
