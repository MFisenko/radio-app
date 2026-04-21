/** @type {import('tailwindcss').Config} */
module.exports = {
	// NOTE: Update this to include the paths to all files that contain Nativewind classes.
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			fontFamily: {
				mono: ['JetBrainsMono'],
			},
			colors: {
				background: {
					DEFAULT: '#ededf1',
					dark: '#111111',
				},
				foreground: {
					DEFAULT: '#262626',
					dark: '#fff',
				},
				border: {
					DEFAULT: '#d5d5d5',
					dark: '#404040',
				},
			},
		},
	},
	plugins: [],
}
