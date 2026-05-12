/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				brand: {
					bg: '#050814',
					bg2: '#08111F',
					glass: 'rgba(255,255,255,0.08)',
					border: 'rgba(255,255,255,0.12)',
					gold: '#D4AF37',
					gold2: '#F5C542',
					muted: '#CBD5E1'
				}
			},
			boxShadow: {
				glass: '0 10px 30px rgba(0,0,0,0.35)'
			}
		}
	},
	plugins: [],
}
